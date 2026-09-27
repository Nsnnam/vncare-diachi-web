import * as XLSX from 'xlsx-js-style';
import { ColumnMapping, ProcessedRow, ProcessingMode } from '../types';
import { normalizeText, resolveAddress, PROVINCES_LIST, COMMUNES_LIST } from './addressEngine';
import { getCustomDictRules } from './customDictService';

export interface ParsedWorkbookData {
  workbook: any;
  fileName: string;
  sheetNames: string[];
  activeSheet: string;
  headerRowIndex: number;
  headers: string[];
  dataRows: any[][];
  columnMapping: ColumnMapping;
  isVncareTemplate: boolean;
}

/** Standard Styling Constants conforming to User Specification */
const BORDER_ALL_THIN = {
  top: { style: 'thin', color: { rgb: '000000' } },
  bottom: { style: 'thin', color: { rgb: '000000' } },
  left: { style: 'thin', color: { rgb: '000000' } },
  right: { style: 'thin', color: { rgb: '000000' } },
};

const FONT_HEADER = {
  name: 'Times New Roman',
  sz: 13,
  bold: true,
  color: { rgb: '000000' },
};

const FONT_DATA = {
  name: 'Times New Roman',
  sz: 13,
  bold: false,
  color: { rgb: '000000' },
};

/** Calculate auto-fit column widths */
function autoFitColumns(sheetData: any[][]): Array<{ wch: number }> {
  if (!sheetData || sheetData.length === 0) return [];
  const colCount = Math.max(...sheetData.map((r) => (r ? r.length : 0)));
  const cols: Array<{ wch: number }> = [];

  for (let c = 0; c < colCount; c++) {
    let maxLen = 8;
    for (let r = 0; r < sheetData.length; r++) {
      const val = sheetData[r] ? sheetData[r][c] : '';
      if (val !== undefined && val !== null) {
        const str = String(val);
        const lines = str.split('\n');
        for (const l of lines) {
          const lLen = l.trim().length;
          if (lLen > maxLen) maxLen = lLen;
        }
      }
    }
    cols.push({ wch: Math.min(65, Math.max(8, maxLen + 3)) });
  }
  return cols;
}

/** Calculate auto-fit row heights ("giãn dòng theo nội dung") */
function autoFitRows(sheetData: any[][], headerRowIndex: number): Array<{ hpt: number }> {
  return sheetData.map((r, rIdx) => {
    if (rIdx === headerRowIndex) {
      return { hpt: 36 };
    }
    let lineCount = 1;
    if (r) {
      for (const cellVal of r) {
        const s = String(cellVal || '');
        const nLines = s.split('\n').length;
        if (nLines > lineCount) lineCount = nLines;
        if (s.length > 45 && lineCount < 2) lineCount = 2;
        if (s.length > 90 && lineCount < 3) lineCount = 3;
      }
    }
    return { hpt: Math.max(26, lineCount * 22) };
  });
}

/**
 * Apply Times New Roman 13pt, Borders, WrapText and General Text Format (@)
 * to all cells in Worksheet.
 */
function applyTimesNewRomanStyles(
  worksheet: any,
  sheetData: any[][],
  headerRowIndex: number,
  centerColumns: number[] = [0, 2, 3, 8, 9, 14]
): void {
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');

  for (let r = range.s.r; r <= range.e.r; r++) {
    const isHeader = r === headerRowIndex;

    for (let c = range.s.c; c <= range.e.c; c++) {
      const cellRef = XLSX.utils.encode_cell({ r, c });
      let cell = worksheet[cellRef];
      if (!cell) {
        cell = { t: 's', v: '', z: '@' };
        worksheet[cellRef] = cell;
      }

      // Strict text format as required by VNCare import specification:
      // cell.t = 's' (string) and cell.z = '@' (General Text)
      cell.t = 's';
      cell.z = '@';
      if (cell.v !== undefined && cell.v !== null) {
        cell.v = String(cell.v);
      } else {
        cell.v = '';
      }

      const shouldCenter = centerColumns.includes(c);

      cell.s = {
        font: isHeader ? FONT_HEADER : FONT_DATA,
        border: BORDER_ALL_THIN,
        alignment: {
          vertical: 'center',
          horizontal: isHeader || shouldCenter ? 'center' : 'left',
          wrapText: true,
        },
        ...(isHeader
          ? {
              fill: {
                patternType: 'solid',
                fgColor: { rgb: 'D9E1F2' }, // Standard soft hospital blue header
              },
            }
          : {}),
      };
    }
  }

  // Set auto columns & rows
  worksheet['!cols'] = autoFitColumns(sheetData);
  worksheet['!rows'] = autoFitRows(sheetData, headerRowIndex);
}

/** Detect if string matches address keywords */
function isAddressHeader(header: string): boolean {
  const norm = normalizeText(header);
  return (
    norm.includes('diachi') ||
    norm.includes('dia chi') ||
    norm.includes('noi o') ||
    norm.includes('thuong tru') ||
    norm.includes('cu tru')
  );
}

function isTinhHeader(header: string): boolean {
  const norm = normalizeText(header);
  return (
    norm.startsWith('tinh') ||
    norm === 'tinh' ||
    norm.includes('tinh tp') ||
    norm.includes('ma tinh') ||
    norm.includes('thanh pho')
  );
}

function isXaHeader(header: string): boolean {
  const norm = normalizeText(header);
  return (
    norm.startsWith('xa') ||
    norm === 'xa' ||
    norm.includes('phuong') ||
    norm.includes('ma xa') ||
    norm.includes('xa phuong')
  );
}

/** Auto-detect header row and column mapping */
export function detectColumns(rows: any[][]): {
  headerRowIndex: number;
  headers: string[];
  mapping: ColumnMapping;
  isVncare: boolean;
} {
  let headerRowIndex = 0;
  let headers: string[] = [];

  for (let r = 0; r < Math.min(10, rows.length); r++) {
    const row = rows[r];
    if (!row) continue;
    const rowStr = row.map((c) => String(c || '').toLowerCase()).join(' ');
    if (
      rowStr.includes('diachi') ||
      rowStr.includes('địa chỉ') ||
      (rowStr.includes('stt') && (rowStr.includes('tên') || rowStr.includes('ten') || rowStr.includes('họ và tên')))
    ) {
      headerRowIndex = r;
      headers = row.map((c) => String(c || '').trim());
      break;
    }
  }

  if (headers.length === 0 && rows.length > 0) {
    headers = (rows[0] || []).map((c) => String(c || '').trim());
  }

  const mapping: ColumnMapping = {
    sttCol: -1,
    addressCol: -1,
    tinhCol: -1,
    xaCol: -1,
    nameCol: -1,
    dobCol: -1,
    genderCol: -1,
    cccdCol: -1,
    cccdDateCol: -1,
    cccdPlaceCol: -1,
    workplaceCol: -1,
    phoneCol: -1,
    jobCol: -1,
    ethnicityCol: -1,
    nationCol: -1,
    dotKhamCol: -1,
  };

  headers.forEach((h, idx) => {
    const norm = normalizeText(h);

    if (mapping.sttCol === -1 && (norm === 'stt' || norm.startsWith('stt') || norm.includes('so tt') || norm.includes('so thu tu'))) {
      mapping.sttCol = idx;
    }
    if (mapping.addressCol === -1 && isAddressHeader(h)) {
      mapping.addressCol = idx;
    }
    if (mapping.tinhCol === -1 && isTinhHeader(h)) {
      mapping.tinhCol = idx;
    }
    if (mapping.xaCol === -1 && isXaHeader(h)) {
      mapping.xaCol = idx;
    }
    if (
      mapping.nameCol === -1 &&
      (norm.includes('ten') || norm.includes('ho ten') || norm.includes('ho va ten') || norm.includes('nguoi benh') || norm.includes('benh nhan'))
    ) {
      mapping.nameCol = idx;
    }
    if (
      mapping.dobCol === -1 &&
      (norm.includes('ngaysinh') || norm.includes('ngay sinh') || norm.includes('nam sinh') || norm.includes('sinh nam') || norm === 'ns')
    ) {
      mapping.dobCol = idx;
    }
    if (
      mapping.genderCol === -1 &&
      (norm.includes('gioitinh') || norm.includes('gioi tinh') || norm.includes('phai') || norm.includes('gender') || norm.includes('sex'))
    ) {
      mapping.genderCol = idx;
    }
    if (
      mapping.cccdCol === -1 &&
      (norm.includes('cccd') || norm.includes('cmnd') || norm.includes('can cuoc') || norm.includes('so the') || norm.includes('dinh danh'))
    ) {
      mapping.cccdCol = idx;
    }
    if (mapping.cccdDateCol === -1 && (norm.includes('ngaycap') || norm.includes('ngay cap'))) {
      mapping.cccdDateCol = idx;
    }
    if (mapping.cccdPlaceCol === -1 && (norm.includes('noicap') || norm.includes('noi cap'))) {
      mapping.cccdPlaceCol = idx;
    }
    if (
      mapping.workplaceCol === -1 &&
      (norm.includes('noilamviec') || norm.includes('noi lam viec') || norm.includes('cong ty') || norm.includes('don vi') || norm.includes('phong ban'))
    ) {
      mapping.workplaceCol = idx;
    }
    if (
      mapping.phoneCol === -1 &&
      (norm.includes('sdt') || norm.includes('dien thoai') || norm.includes('phone') || norm.includes('di dong'))
    ) {
      mapping.phoneCol = idx;
    }
    if (
      mapping.jobCol === -1 &&
      (norm.includes('nghenghiep') || norm.includes('nghe nghiep') || norm.includes('chuc vu') || norm.includes('cong viec'))
    ) {
      mapping.jobCol = idx;
    }
    if (
      mapping.ethnicityCol === -1 &&
      (norm.includes('dantoc') || norm.includes('dan toc') || norm.includes('ethnic'))
    ) {
      mapping.ethnicityCol = idx;
    }
    if (
      mapping.nationCol === -1 &&
      (norm.includes('quocgia') || norm.includes('quoc gia') || norm.includes('quoc tich'))
    ) {
      mapping.nationCol = idx;
    }
    if (
      mapping.dotKhamCol === -1 &&
      (norm.includes('dotkham') || norm.includes('dot kham') || norm.includes('dot'))
    ) {
      mapping.dotKhamCol = idx;
    }
  });

  // Default sttCol to 0 if not labeled
  if (mapping.sttCol === -1) {
    mapping.sttCol = 0;
  }

  const isVncare =
    headers.some((h) => h.includes('TENBENHNHAN')) &&
    headers.some((h) => h.includes('DIACHI')) &&
    headers.some((h) => h.includes('TINH'));

  if (isVncare) {
    mapping.sttCol = 0;
    mapping.nameCol = 1;
    mapping.dobCol = 2;
    mapping.genderCol = 3;
    mapping.jobCol = 4;
    mapping.workplaceCol = 5;
    mapping.ethnicityCol = 6;
    mapping.nationCol = 7;
    mapping.cccdCol = 8;
    mapping.cccdDateCol = 9;
    mapping.cccdPlaceCol = 10;
    mapping.tinhCol = 11;
    mapping.xaCol = 12;
    mapping.addressCol = 13;
    mapping.dotKhamCol = 14;
    mapping.phoneCol = 15;
  }

  if (mapping.addressCol === -1 && rows.length > headerRowIndex + 1) {
    const sampleRow = rows[headerRowIndex + 1] || [];
    for (let c = 0; c < sampleRow.length; c++) {
      const val = String(sampleRow[c] || '');
      if (
        val.length > 10 &&
        (val.includes(',') ||
          val.includes('tỉnh') ||
          val.includes('xã') ||
          val.includes('phường') ||
          val.includes('Phú Thọ') ||
          val.includes('Hà Nội'))
      ) {
        mapping.addressCol = c;
        break;
      }
    }
  }

  return { headerRowIndex, headers, mapping, isVncare };
}

/** Parse uploaded file */
export async function readWorkbook(file: File): Promise<ParsedWorkbookData> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });

  const sheetNames = workbook.SheetNames || [];
  const activeSheet = sheetNames.includes('DANHSACH')
    ? 'DANHSACH'
    : sheetNames.includes('DANH SÁCH')
    ? 'DANH SÁCH'
    : sheetNames[0];

  const worksheet = workbook.Sheets[activeSheet];
  const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  const { headerRowIndex, headers, mapping, isVncare } = detectColumns(rows);
  const dataRows = rows
    .slice(headerRowIndex + 1)
    .filter((r) => r && r.some((c) => c !== '' && c !== null && c !== undefined));

  return {
    workbook,
    fileName: file.name,
    sheetNames,
    activeSheet,
    headerRowIndex,
    headers,
    dataRows,
    columnMapping: mapping,
    isVncareTemplate: isVncare,
  };
}

/** Switch active sheet in workbook */
export function switchSheet(wbData: ParsedWorkbookData, newSheetName: string): ParsedWorkbookData {
  const worksheet = wbData.workbook.Sheets[newSheetName];
  const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  const { headerRowIndex, headers, mapping, isVncare } = detectColumns(rows);
  const dataRows = rows
    .slice(headerRowIndex + 1)
    .filter((r) => r && r.some((c) => c !== '' && c !== null && c !== undefined));

  return {
    ...wbData,
    activeSheet: newSheetName,
    headerRowIndex,
    headers,
    dataRows,
    columnMapping: mapping,
    isVncareTemplate: isVncare,
  };
}

/**
 * Format Date object, Excel serial number, or date string to strict DD/MM/YYYY.
 * Adheres to NSN App Standard (Asia/Ho_Chi_Minh timezone GMT+7).
 */
export function formatDate(val: any, fallback: string = ''): string {
  if (val === null || val === undefined || val === '') return fallback;

  // JS Date instance (e.g. from cellDates: true)
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return fallback;
    // Round to nearest minute to eliminate Excel float serial inaccuracy (e.g. 16:59:56 -> 17:00:00 UTC)
    const roundedDate = new Date(Math.round(val.getTime() / 60000) * 60000);
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Ho_Chi_Minh',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(roundedDate);
  }


  // Numeric input (Excel serial date code or 4-digit year)
  if (typeof val === 'number') {
    if (val >= 1900 && val <= 2099 && Number.isInteger(val)) {
      return `01/01/${val}`;
    }
    if (val > 2099) {
      const p = XLSX.SSF.parse_date_code(val);
      if (p && p.y && p.m && p.d) {
        const dd = String(p.d).padStart(2, '0');
        const mm = String(p.m).padStart(2, '0');
        return `${dd}/${mm}/${p.y}`;
      }
    }
    return fallback;
  }

  const s = String(val).trim();
  if (!s) return fallback;

  // 4 digits year: e.g. "1985"
  if (/^\d{4}$/.test(s)) {
    const y = parseInt(s, 10);
    if (y >= 1900 && y <= 2099) return `01/01/${s}`;
  }

  // 5 digits Excel serial stored as string: e.g. "28795"
  if (/^\d{5}$/.test(s)) {
    const num = parseInt(s, 10);
    const p = XLSX.SSF.parse_date_code(num);
    if (p && p.y && p.m && p.d) {
      const dd = String(p.d).padStart(2, '0');
      const mm = String(p.m).padStart(2, '0');
      return `${dd}/${mm}/${p.y}`;
    }
  }

  // DD/MM/YYYY or D/M/YYYY with delimiters / - .
  const mDmy = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (mDmy) {
    const dd = String(mDmy[1]).padStart(2, '0');
    const mm = String(mDmy[2]).padStart(2, '0');
    return `${dd}/${mm}/${mDmy[3]}`;
  }

  // YYYY-MM-DD or YYYY/MM/DD
  const mYmd = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (mYmd) {
    const dd = String(mYmd[3]).padStart(2, '0');
    const mm = String(mYmd[2]).padStart(2, '0');
    return `${dd}/${mm}/${mYmd[1]}`;
  }

  // Fallback attempt to parse with new Date(s)
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Ho_Chi_Minh',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(parsed);
  }

  return fallback || s;
}

/** Check if date formatted string matches strict DD/MM/YYYY */
export function isDateFormatValid(formatted: string): boolean {
  return /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/.test(formatted);
}

/**
 * Format and validate CCCD / CMND / Hộ chiếu.
 * Rule: 8-11 alphanumeric characters or exactly 12 digits.
 * Automatically restores stripped leading zero for 11-digit numbers.
 */
export function formatCccd(
  val: any,
  fallback: string = '000000000000'
): { formatted: string; isValid: boolean; isPlaceholder: boolean } {
  if (val === null || val === undefined || val === '') {
    return { formatted: fallback, isValid: false, isPlaceholder: true };
  }
  let s = String(val).trim().replace(/[-\s.]/g, '');
  if (!s) {
    return { formatted: fallback, isValid: false, isPlaceholder: true };
  }
  // If exactly 11 digits, it is almost certainly a 12-digit CCCD with the leading '0' stripped by Excel numeric coercion
  if (/^\d{11}$/.test(s)) {
    s = '0' + s;
  }
  // 12 digits CCCD
  if (/^\d{12}$/.test(s)) {
    return { formatted: s, isValid: true, isPlaceholder: false };
  }
  // 8-11 alphanumeric (e.g. 9 digits CMND or 8-char Passport)
  if (/^[A-Za-z0-9]{8,11}$/.test(s)) {
    return { formatted: s.toUpperCase(), isValid: true, isPlaceholder: false };
  }
  return { formatted: s, isValid: false, isPlaceholder: false };
}

/**
 * Format Đợt khám: strict YYYYMM (6 digits, e.g. 202601)
 */
export function formatDotKham(val: any, fallback?: string): string {
  const now = new Date();
  const defaultDotKham =
    fallback || `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  if (val === null || val === undefined || val === '') return defaultDotKham;

  const s = String(val).trim().replace(/[-/.]/g, '');
  if (/^\d{4}(0[1-9]|1[0-2])$/.test(s)) {
    return s;
  }
  const m = String(val).trim().match(/^(0[1-9]|1[0-2])[-/.](\d{4})$/);
  if (m) {
    return `${m[2]}${m[1]}`;
  }
  if (/^\d{4}$/.test(s)) {
    return `${s}01`;
  }
  return defaultDotKham;
}

/** Format Gender to standard '1-NAM' or '2-NỮ' */
export function formatGender(val: any): string {
  if (!val) return '1-NAM';
  const s = String(val).trim().toLowerCase();
  if (s === '1-nam' || s === 'nam' || s === '1' || s === 'm' || s === 'male') return '1-NAM';
  if (s === '2-nu' || s === '2-nữ' || s === 'nữ' || s === 'nu' || s === '2' || s === 'f' || s === 'female') return '2-NỮ';
  if (s.includes('nữ') || s.includes('nu')) return '2-NỮ';
  if (s.includes('nam')) return '1-NAM';
  return '1-NAM';
}

/** Format Job to VNCare standard catalogue */
export function formatJob(val: any, defaultJob: string = '6-Công nhân'): string {
  if (!val) return defaultJob;
  const s = String(val).trim();
  if (/^\d+-/.test(s)) return s;
  const norm = normalizeText(s);
  if (norm.includes('nong dan')) return '1-Nông dân';
  if (norm.includes('duoi 6') || norm.includes('tre em')) return '3-Trẻ dưới 6 tuổi';
  if (norm.includes('hoc sinh') || norm.includes('sinh vien')) return '4-Sinh viên, học sinh';
  if (norm.includes('huu')) return '5-Hưu Trí';
  if (
    norm.includes('cong nhan') ||
    norm.includes('nhan vien') ||
    norm.includes('can bo') ||
    norm.includes('lao dong') ||
    norm.includes('chuyen vien') ||
    norm.includes('ky su')
  ) {
    return '6-Công nhân';
  }
  return defaultJob;
}

/** Format Ethnicity to VNCare standard catalogue */
export function formatEthnicity(val: any, defaultEthnicity: string = '25-Kinh'): string {
  if (!val) return defaultEthnicity;
  const s = String(val).trim();
  if (/^\d+-/.test(s)) return s;
  const norm = normalizeText(s);
  if (norm === 'kinh' || norm.includes('kinh')) return '25-Kinh';
  if (norm.includes('tay')) return '50-Tày';
  if (norm.includes('thai')) return '49-Thái';
  if (norm.includes('muong')) return '39-Mường';
  if (norm.includes('hmong') || norm.includes('h mong') || norm.includes('meo')) return '20-H Mông';
  if (norm.includes('dao')) return '7-Dao';
  if (norm.includes('nung')) return '42-Nùng';
  return defaultEthnicity;
}

/** Format Nation to VNCare standard catalogue */
export function formatNation(val: any): string {
  if (!val) return '0-Việt Nam';
  const s = String(val).trim();
  if (/^\d+-/.test(s)) return s;
  return '0-Việt Nam';
}

/** Process data rows to resolve addresses and standardize mandatory fields */
export function processAddressRows(
  dataRows: any[][],
  mapping: ColumnMapping,
  options: {
    defaultJob?: string;
    defaultWorkplace?: string;
    defaultEthnicity?: string;
  } = {}
): ProcessedRow[] {
  const customRules = getCustomDictRules();
  const results: ProcessedRow[] = [];

  const defaultJob = options.defaultJob || '6-Công nhân';
  const defaultEthnicity = options.defaultEthnicity || '25-Kinh';

  dataRows.forEach((row, idx) => {
    // Sequential STT is numbered consecutively from 1 to N
    const seqNumber = idx + 1;
    const stt = String(seqNumber);

    const name = mapping.nameCol !== undefined && mapping.nameCol >= 0 ? String(row[mapping.nameCol] || '').trim() : '';
    const rawDob = mapping.dobCol !== undefined && mapping.dobCol >= 0 ? row[mapping.dobCol] : '';
    const dobFormatted = formatDate(rawDob, '01/01/1990');
    const isDobValid = isDateFormatValid(dobFormatted);

    const rawGender = mapping.genderCol !== undefined && mapping.genderCol >= 0 ? row[mapping.genderCol] : '';
    const genderFormatted = formatGender(rawGender);

    const rawCccd = mapping.cccdCol !== undefined && mapping.cccdCol >= 0 ? row[mapping.cccdCol] : '';
    const cccdResult = formatCccd(rawCccd, '000000000000');
    const cccdFormatted = cccdResult.formatted;
    const isCccdValid = cccdResult.isValid;

    const rawCccdDate = mapping.cccdDateCol !== undefined && mapping.cccdDateCol >= 0 ? row[mapping.cccdDateCol] : '';
    const cccdDateFormatted = formatDate(rawCccdDate, '01/01/2021');
    const isCccdDateValid = isDateFormatValid(cccdDateFormatted);

    const cccdPlaceFormatted =
      mapping.cccdPlaceCol !== undefined && mapping.cccdPlaceCol >= 0 && row[mapping.cccdPlaceCol]
        ? String(row[mapping.cccdPlaceCol]).trim()
        : 'Cục cảnh sát';

    const rawJob = mapping.jobCol !== undefined && mapping.jobCol >= 0 ? row[mapping.jobCol] : '';
    const jobFormatted = formatJob(rawJob, defaultJob);

    const workplaceFormatted =
      mapping.workplaceCol !== undefined && mapping.workplaceCol >= 0 && row[mapping.workplaceCol]
        ? String(row[mapping.workplaceCol]).trim()
        : options.defaultWorkplace || '';

    const rawEthnicity = mapping.ethnicityCol !== undefined && mapping.ethnicityCol >= 0 ? row[mapping.ethnicityCol] : '';
    const ethnicityFormatted = formatEthnicity(rawEthnicity, defaultEthnicity);

    const rawNation = mapping.nationCol !== undefined && mapping.nationCol >= 0 ? row[mapping.nationCol] : '';
    const nationFormatted = formatNation(rawNation);

    const rawAddress = mapping.addressCol >= 0 ? String(row[mapping.addressCol] || '').trim() : '';

    // Check mandatory fields: STT, Tên BN, Ngày sinh, Giới tính, Nghề nghiệp, Dân tộc, Quốc gia, Tỉnh, Xã, Địa chỉ, CCCD
    const missingFields: string[] = [];
    if (!name) missingFields.push('Tên bệnh nhân');
    if (!dobFormatted || !isDobValid) missingFields.push('Ngày sinh');
    if (!genderFormatted) missingFields.push('Giới tính');
    if (!jobFormatted) missingFields.push('Nghề nghiệp');
    if (!ethnicityFormatted) missingFields.push('Dân tộc');
    if (!nationFormatted) missingFields.push('Quốc gia');
    if (!rawAddress) missingFields.push('Địa chỉ');
    if (!cccdFormatted || !isCccdValid) missingFields.push('CCCD');

    if (!rawAddress) {
      missingFields.push('Tỉnh', 'Xã');
      results.push({
        rowIndex: idx,
        stt,
        name: name || `Bệnh nhân ${seqNumber}`,
        dobFormatted,
        isDobValid,
        genderFormatted,
        cccdFormatted,
        isCccdValid,
        cccdDateFormatted,
        isCccdDateValid,
        cccdPlaceFormatted,
        jobFormatted,
        workplaceFormatted,
        ethnicityFormatted,
        nationFormatted,
        rawAddress: '',
        resolvedTinh: '',
        resolvedXa: '',
        status: 'empty',
        method: 'Địa chỉ trống',
        originalRowData: row,
        isMissingMandatory: true,
        missingFields,
      });
      return;
    }

    const resolved = resolveAddress(rawAddress, customRules);
    if (!resolved.tinhCode) missingFields.push('Tỉnh');
    if (!resolved.xaCode) missingFields.push('Xã');

    results.push({
      rowIndex: idx,
      stt,
      name: name || `Bệnh nhân ${seqNumber}`,
      dobFormatted,
      isDobValid,
      genderFormatted,
      cccdFormatted,
      isCccdValid,
      cccdDateFormatted,
      isCccdDateValid,
      cccdPlaceFormatted,
      jobFormatted,
      workplaceFormatted,
      ethnicityFormatted,
      nationFormatted,
      rawAddress,
      resolvedTinh: resolved.tinhCode,
      resolvedXa: resolved.xaCode,
      status: resolved.status,
      method: resolved.method,
      originalRowData: row,
      isMissingMandatory: missingFields.length > 0,
      missingFields,
    });
  });

  return results;
}

/** Generate Export File for Mode 1 (In-place fill with Times New Roman 13, Borders, Auto-fit) */
export function exportInplaceFile(
  wbData: ParsedWorkbookData,
  processedRows: ProcessedRow[],
  options: {
    dotKham?: string;
  } = {}
): Uint8Array {
  const originalWb = wbData.workbook;
  const sheet = originalWb.Sheets[wbData.activeSheet];
  const sheetData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  let tinhCol = wbData.columnMapping.tinhCol;
  let xaCol = wbData.columnMapping.xaCol;
  let sttCol = wbData.columnMapping.sttCol ?? 0;

  if (tinhCol === undefined || tinhCol === -1 || xaCol === undefined || xaCol === -1) {
    const headerRow = sheetData[wbData.headerRowIndex] || [];
    tinhCol = headerRow.length;
    xaCol = headerRow.length + 1;
    headerRow[tinhCol] = 'TINH\n(Đã phiên)';
    headerRow[xaCol] = 'XA\n(Đã phiên)';
    sheetData[wbData.headerRowIndex] = headerRow;
  }

  const dotKham = formatDotKham(options.dotKham);

  // Populate resolved values and auto-fill mandatory columns
  processedRows.forEach((pr) => {
    const targetRowIdx = wbData.headerRowIndex + 1 + pr.rowIndex;
    if (!sheetData[targetRowIdx]) {
      sheetData[targetRowIdx] = [];
    }

    // Auto-fill STT consecutively from 1 to N
    if (sttCol >= 0) {
      sheetData[targetRowIdx][sttCol] = String(pr.stt);
    }

    // Tinh and Xa
    if (pr.resolvedTinh) {
      sheetData[targetRowIdx][tinhCol!] = pr.resolvedTinh;
    }
    if (pr.resolvedXa) {
      sheetData[targetRowIdx][xaCol!] = pr.resolvedXa;
    }

    // DOB formatting
    if (wbData.columnMapping.dobCol !== undefined && wbData.columnMapping.dobCol >= 0) {
      sheetData[targetRowIdx][wbData.columnMapping.dobCol] = pr.dobFormatted;
    }

    // Gender formatting
    if (wbData.columnMapping.genderCol !== undefined && wbData.columnMapping.genderCol >= 0) {
      sheetData[targetRowIdx][wbData.columnMapping.genderCol] = pr.genderFormatted;
    }

    // CCCD formatting (preserving text format)
    if (wbData.columnMapping.cccdCol !== undefined && wbData.columnMapping.cccdCol >= 0) {
      sheetData[targetRowIdx][wbData.columnMapping.cccdCol] = pr.cccdFormatted;
    }

    // CCCD Date formatting
    if (wbData.columnMapping.cccdDateCol !== undefined && wbData.columnMapping.cccdDateCol >= 0) {
      sheetData[targetRowIdx][wbData.columnMapping.cccdDateCol] = pr.cccdDateFormatted;
    }

    // DotKham if column exists
    if (wbData.columnMapping.dotKhamCol !== undefined && wbData.columnMapping.dotKhamCol >= 0) {
      sheetData[targetRowIdx][wbData.columnMapping.dotKhamCol] = dotKham;
    }

    // Job formatting
    if (wbData.columnMapping.jobCol !== undefined && wbData.columnMapping.jobCol >= 0) {
      sheetData[targetRowIdx][wbData.columnMapping.jobCol] = pr.jobFormatted;
    }

    // Ethnicity formatting
    if (wbData.columnMapping.ethnicityCol !== undefined && wbData.columnMapping.ethnicityCol >= 0) {
      sheetData[targetRowIdx][wbData.columnMapping.ethnicityCol] = pr.ethnicityFormatted;
    }
  });

  // Re-encode worksheet
  const newSheet = XLSX.utils.aoa_to_sheet(sheetData);

  // Apply Times New Roman 13, Borders, Auto-fit rows and columns, Text general format
  applyTimesNewRomanStyles(newSheet, sheetData, wbData.headerRowIndex, [
    sttCol,
    wbData.columnMapping.dobCol ?? -1,
    wbData.columnMapping.genderCol ?? -1,
    wbData.columnMapping.cccdCol ?? -1,
    wbData.columnMapping.cccdDateCol ?? -1,
    wbData.columnMapping.dotKhamCol ?? -1,
  ]);

  originalWb.Sheets[wbData.activeSheet] = newSheet;

  const out = XLSX.write(originalWb, { bookType: 'xlsx', type: 'array' });
  return new Uint8Array(out);
}

/** Fallback generator for VNCare lookup sheets in case template file is offline */
function createVncareLookupWorkbook(): any {
  const wb = XLSX.utils.book_new();

  // Sheet TINH
  const tinhRows: any[][] = [['TINH']];
  PROVINCES_LIST.forEach((p) => tinhRows.push([p.code]));
  const wsTinh = XLSX.utils.aoa_to_sheet(tinhRows);
  applyTimesNewRomanStyles(wsTinh, tinhRows, 0, []);
  XLSX.utils.book_append_sheet(wb, wsTinh, 'TINH');

  // Sheet XA
  const xaRows: any[][] = [['XA']];
  COMMUNES_LIST.forEach((c) => xaRows.push([c.code]));
  const wsXa = XLSX.utils.aoa_to_sheet(xaRows);
  applyTimesNewRomanStyles(wsXa, xaRows, 0, []);
  XLSX.utils.book_append_sheet(wb, wsXa, 'XA');

  // Sheet QUOCGIA
  const qgRows: any[][] = [
    ['QUOCGIA'],
    ['0-Việt Nam'],
    ['292-Andorra'],
    ['293-United arab emirates'],
    ['294-Antigua and barbuda'],
  ];
  const wsQg = XLSX.utils.aoa_to_sheet(qgRows);
  applyTimesNewRomanStyles(wsQg, qgRows, 0, []);
  XLSX.utils.book_append_sheet(wb, wsQg, 'QUOCGIA');

  // Sheet DANTOC
  const dtRows: any[][] = [
    ['DANTOC'],
    ['25-Kinh'],
    ['1-Ba na'],
    ['2-Bố Y'],
    ['3-Brâu'],
    ['4-Chăm'],
    ['7-Dao'],
    ['20-H Mông'],
    ['39-Mường'],
    ['42-Nùng'],
    ['49-Thái'],
    ['50-Tày'],
  ];
  const wsDt = XLSX.utils.aoa_to_sheet(dtRows);
  applyTimesNewRomanStyles(wsDt, dtRows, 0, []);
  XLSX.utils.book_append_sheet(wb, wsDt, 'DANTOC');

  // Sheet GIOITINH
  const gtRows: any[][] = [['GIOITINH'], ['1-NAM'], ['2-NỮ']];
  const wsGt = XLSX.utils.aoa_to_sheet(gtRows);
  applyTimesNewRomanStyles(wsGt, gtRows, 0, [0]);
  XLSX.utils.book_append_sheet(wb, wsGt, 'GIOITINH');

  // Sheet NGHENGHIEP
  const nnRows: any[][] = [
    ['NGHENGHIEPID', 'TENNGHENGHIEP'],
    ['1', '1-Nông dân'],
    ['3', '3-Trẻ dưới 6 tuổi'],
    ['4', '4-Sinh viên, học sinh'],
    ['5', '5-Hưu Trí'],
    ['6', '6-Công nhân'],
  ];
  const wsNn = XLSX.utils.aoa_to_sheet(nnRows);
  applyTimesNewRomanStyles(wsNn, nnRows, 0, [0]);
  XLSX.utils.book_append_sheet(wb, wsNn, 'NGHENGHIEP');

  return wb;
}

/** Generate Export File for Mode 2 (Convert to VNCare 7-Sheet Template with Times New Roman 13, Borders) */
export async function exportVncareTemplateFile(
  processedRows: ProcessedRow[],
  mapping: ColumnMapping,
  options: {
    dotKham?: string;
    defaultJob?: string;
    defaultWorkplace?: string;
    defaultEthnicity?: string;
  } = {}
): Promise<Uint8Array> {
  const dotKham = formatDotKham(options.dotKham);
  const defaultJob = options.defaultJob || '6-Công nhân';
  const defaultEthnicity = options.defaultEthnicity || '25-Kinh';

  let templateWb: any;
  try {
    const res = await fetch('template/MauFileImportBenhNhan_ksktoandan.xls');
    if (!res.ok) throw new Error('Fetch template failed');
    const buf = await res.arrayBuffer();
    templateWb = XLSX.read(buf, { type: 'array' });
  } catch (e) {
    templateWb = createVncareLookupWorkbook();
  }

  // Headers for DANHSACH sheet conforming strictly to VNCare specification
  const headers = [
    'STT',
    'TENBENHNHAN\n(Bắt buộc)',
    'NGAYSINH\n(Bắt buộc)',
    'GIOITINH\n(Bắt buộc)',
    'NGHENGHIEP\n(Bắt buộc)',
    'NOILAMVIEC',
    'DANTOC\n(Bắt buộc)',
    'QUOCGIA\n(Bắt buộc)',
    'CCCD\n(Bắt buộc)',
    'NGAYCAPCCCD\n(Bắt buộc)',
    'NOICAPCCCD\n(Bắt buộc)',
    'TINH\n(Bắt buộc)',
    'XA\n(Bắt buộc)',
    'DIACHI\n(Bắt buộc)',
    'DOTKHAM\n(Bắt buộc)',
    'SDTBENHNHAN',
    'TENNGUOITHAN',
    'MA_BHYT',
    'BHYT_BD',
    'BHYT_KT',
    'MA_KCBBD',
    'DIACHI_BHYT',
  ];

  const rowsAoa: any[][] = [headers];

  processedRows.forEach((pr, i) => {
    const orig = pr.originalRowData || [];
    const seq = i + 1;

    // All mandatory fields guaranteed populated
    const stt = String(seq);
    const name = pr.name || (mapping.nameCol !== undefined && mapping.nameCol >= 0 ? String(orig[mapping.nameCol] || '').trim() : '') || `Bệnh nhân ${seq}`;
    const dob = pr.dobFormatted || '01/01/1990';
    const gender = pr.genderFormatted || '1-NAM';
    const job = pr.jobFormatted || defaultJob;
    const workplace = pr.workplaceFormatted || options.defaultWorkplace || '';
    const ethnicity = pr.ethnicityFormatted || defaultEthnicity;
    const nation = pr.nationFormatted || '0-Việt Nam';
    const cccd = pr.cccdFormatted || '000000000000';
    const cccdDate = pr.cccdDateFormatted || '01/01/2021';
    const cccdPlace = pr.cccdPlaceFormatted || 'Cục cảnh sát';
    const tinh = pr.resolvedTinh || '';
    const xa = pr.resolvedXa || '';
    const diachi = pr.rawAddress || '';
    const phone = mapping.phoneCol !== undefined && mapping.phoneCol >= 0 ? String(orig[mapping.phoneCol] || '').trim() : '';

    rowsAoa.push([
      stt, // 0: STT
      name, // 1: TENBENHNHAN
      dob, // 2: NGAYSINH (DD/MM/YYYY)
      gender, // 3: GIOITINH (1-NAM / 2-NỮ)
      job, // 4: NGHENGHIEP
      workplace, // 5: NOILAMVIEC
      ethnicity, // 6: DANTOC
      nation, // 7: QUOCGIA
      cccd, // 8: CCCD (8-11 alphanumeric or 12 digits)
      cccdDate, // 9: NGAYCAPCCCD (DD/MM/YYYY)
      cccdPlace, // 10: NOICAPCCCD
      tinh, // 11: TINH (L)
      xa, // 12: XA (M)
      diachi, // 13: DIACHI (N)
      dotKham, // 14: DOTKHAM (YYYYMM)
      phone, // 15: SDTBENHNHAN
      '', // 16: TENNGUOITHAN
      '', // 17: MA_BHYT
      '', // 18: BHYT_BD
      '', // 19: BHYT_KT
      '', // 20: MA_KCBBD
      '', // 21: DIACHI_BHYT
    ]);
  });

  const newDsSheet = XLSX.utils.aoa_to_sheet(rowsAoa);

  // Apply Times New Roman 13, Borders, Auto-fit rows and columns, Text general format
  applyTimesNewRomanStyles(newDsSheet, rowsAoa, 0, [0, 2, 3, 8, 9, 14]);

  templateWb.Sheets['DANHSACH'] = newDsSheet;
  if (!templateWb.SheetNames.includes('DANHSACH')) {
    templateWb.SheetNames.unshift('DANHSACH');
  }

  const out = XLSX.write(templateWb, { bookType: 'xlsx', type: 'array' });
  return new Uint8Array(out);
}

/** Trigger download of Excel file in browser */
export function downloadExcelFile(data: Uint8Array, filename: string): void {
  const blob = new Blob([data as any], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Generate filename conforming to NSN Standard: HHmmss_<Kind>_yyyyMMdd.xlsx */
export function generateOutputFilename(prefix: string = 'VNCare_DiaChi'): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const hhmmss = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const yyyyMMdd = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  return `${hhmmss}_${prefix}_${yyyyMMdd}.xlsx`;
}
