import * as XLSX from 'xlsx-js-style';
import { ColumnMapping, ProcessedRow, ProcessingMode } from '../types';
import { normalizeText, resolveAddress } from './addressEngine';
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

/** Apply Times New Roman 13pt, Borders and WrapText to all cells in Worksheet */
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
        // Create empty cell so border is still drawn
        cell = { t: 's', v: '' };
        worksheet[cellRef] = cell;
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
      (rowStr.includes('stt') && (rowStr.includes('tên') || rowStr.includes('ten')))
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
  };

  headers.forEach((h, idx) => {
    const norm = normalizeText(h);
    if (mapping.addressCol === -1 && isAddressHeader(h)) mapping.addressCol = idx;
    if (mapping.tinhCol === -1 && isTinhHeader(h)) mapping.tinhCol = idx;
    if (mapping.xaCol === -1 && isXaHeader(h)) mapping.xaCol = idx;

    if (
      mapping.nameCol === -1 &&
      (norm.includes('ten') || norm.includes('ho ten') || norm.includes('ho va ten') || norm.includes('nguoi benh'))
    ) {
      mapping.nameCol = idx;
    }
    if (
      mapping.dobCol === -1 &&
      (norm.includes('ngaysinh') || norm.includes('ngay sinh') || norm.includes('nam sinh'))
    ) {
      mapping.dobCol = idx;
    }
    if (
      mapping.genderCol === -1 &&
      (norm.includes('gioitinh') || norm.includes('gioi tinh') || norm.includes('phai'))
    ) {
      mapping.genderCol = idx;
    }
    if (
      mapping.cccdCol === -1 &&
      (norm.includes('cccd') || norm.includes('cmnd') || norm.includes('can cuoc'))
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
      (norm.includes('noilamviec') || norm.includes('noi lam viec') || norm.includes('cong ty') || norm.includes('don vi'))
    ) {
      mapping.workplaceCol = idx;
    }
    if (
      mapping.phoneCol === -1 &&
      (norm.includes('sdt') || norm.includes('dien thoai') || norm.includes('phone'))
    ) {
      mapping.phoneCol = idx;
    }
  });

  const isVncare =
    headers.some((h) => h.includes('TENBENHNHAN')) &&
    headers.some((h) => h.includes('DIACHI')) &&
    headers.some((h) => h.includes('TINH'));

  if (isVncare) {
    if (headers[11] && headers[11].includes('TINH')) mapping.tinhCol = 11;
    if (headers[12] && headers[12].includes('XA')) mapping.xaCol = 12;
    if (headers[13] && headers[13].includes('DIACHI')) mapping.addressCol = 13;
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
  const activeSheet = sheetNames.includes('DANHSACH') ? 'DANHSACH' : sheetNames[0];

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

/** Process data rows to resolve addresses */
export function processAddressRows(
  dataRows: any[][],
  mapping: ColumnMapping
): ProcessedRow[] {
  const customRules = getCustomDictRules();
  const results: ProcessedRow[] = [];

  dataRows.forEach((row, idx) => {
    const rawAddress = mapping.addressCol >= 0 ? String(row[mapping.addressCol] || '').trim() : '';
    const stt = row[0] || idx + 1;
    const name = mapping.nameCol >= 0 ? String(row[mapping.nameCol] || '').trim() : '';

    if (!rawAddress) {
      results.push({
        rowIndex: idx,
        stt,
        name,
        rawAddress: '',
        resolvedTinh: '',
        resolvedXa: '',
        status: 'empty',
        method: 'Địa chỉ trống',
        originalRowData: row,
      });
      return;
    }

    const resolved = resolveAddress(rawAddress, customRules);

    results.push({
      rowIndex: idx,
      stt,
      name,
      rawAddress,
      resolvedTinh: resolved.tinhCode,
      resolvedXa: resolved.xaCode,
      status: resolved.status,
      method: resolved.method,
      originalRowData: row,
    });
  });

  return results;
}

/** Format Date object or Excel date to DD/MM/YYYY */
export function formatDate(val: any): string {
  if (!val) return '';
  if (val instanceof Date) {
    const d = String(val.getDate()).padStart(2, '0');
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const y = val.getFullYear();
    return `${d}/${m}/${y}`;
  }
  const s = String(val).trim();
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) return s;
  const m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (m) {
    return `${String(m[3]).padStart(2, '0')}/${String(m[2]).padStart(2, '0')}/${m[1]}`;
  }
  if (/^\d{4}$/.test(s)) {
    return `01/01/${s}`;
  }
  return s;
}

/** Format Gender to standard '1-NAM' or '2-NỮ' */
export function formatGender(val: any): string {
  if (!val) return '';
  const s = String(val).trim().toLowerCase();
  if (s === '1-nam' || s === 'nam' || s === '1' || s === 'm') return '1-NAM';
  if (s === '2-nu' || s === '2-nữ' || s === 'nữ' || s === 'nu' || s === '2' || s === 'f') return '2-NỮ';
  return String(val);
}

/** Generate Export File for Mode 1 (In-place fill with Times New Roman 13, Borders, Auto-fit) */
export function exportInplaceFile(
  wbData: ParsedWorkbookData,
  processedRows: ProcessedRow[]
): Uint8Array {
  const originalWb = wbData.workbook;
  const sheet = originalWb.Sheets[wbData.activeSheet];
  const sheetData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  let tinhCol = wbData.columnMapping.tinhCol;
  let xaCol = wbData.columnMapping.xaCol;

  if (tinhCol === undefined || tinhCol === -1 || xaCol === undefined || xaCol === -1) {
    const headerRow = sheetData[wbData.headerRowIndex] || [];
    tinhCol = headerRow.length;
    xaCol = headerRow.length + 1;
    headerRow[tinhCol] = 'TINH\n(Đã phiên)';
    headerRow[xaCol] = 'XA\n(Đã phiên)';
    sheetData[wbData.headerRowIndex] = headerRow;
  }

  // Populate resolved values
  processedRows.forEach((pr) => {
    const targetRowIdx = wbData.headerRowIndex + 1 + pr.rowIndex;
    if (!sheetData[targetRowIdx]) {
      sheetData[targetRowIdx] = [];
    }
    if (pr.resolvedTinh) {
      sheetData[targetRowIdx][tinhCol!] = pr.resolvedTinh;
    }
    if (pr.resolvedXa) {
      sheetData[targetRowIdx][xaCol!] = pr.resolvedXa;
    }
  });

  // Re-encode worksheet
  const newSheet = XLSX.utils.aoa_to_sheet(sheetData);

  // Apply Times New Roman 13, Borders, Auto-fit rows and columns
  applyTimesNewRomanStyles(newSheet, sheetData, wbData.headerRowIndex, [
    0,
    wbData.columnMapping.dobCol ?? -1,
    wbData.columnMapping.genderCol ?? -1,
    wbData.columnMapping.cccdCol ?? -1,
  ]);

  originalWb.Sheets[wbData.activeSheet] = newSheet;

  const out = XLSX.write(originalWb, { bookType: 'xlsx', type: 'array' });
  return new Uint8Array(out);
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
  const dotKham = options.dotKham || `${new Date().getFullYear()}01`;
  const defaultJob = options.defaultJob || '6-Công nhân';
  const defaultEthnicity = options.defaultEthnicity || '25-Kinh';

  let templateWb: any;
  try {
    const res = await fetch('template/MauFileImportBenhNhan_ksktoandan.xls');
    if (!res.ok) throw new Error('Fetch template failed');
    const buf = await res.arrayBuffer();
    templateWb = XLSX.read(buf, { type: 'array' });
  } catch (e) {
    templateWb = XLSX.utils.book_new();
  }

  // Headers for DANHSACH sheet
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
    const stt = pr.stt || i + 1;
    const name = pr.name || (mapping.nameCol >= 0 ? orig[mapping.nameCol] : '') || '';
    const rawDob = mapping.dobCol >= 0 ? orig[mapping.dobCol] : '';
    const dob = formatDate(rawDob);
    const rawGender = mapping.genderCol >= 0 ? orig[mapping.genderCol] : '';
    const gender = formatGender(rawGender) || '1-NAM';
    const job = mapping.jobCol !== undefined && mapping.jobCol >= 0 ? orig[mapping.jobCol] : defaultJob;
    const workplace =
      mapping.workplaceCol !== undefined && mapping.workplaceCol >= 0
        ? orig[mapping.workplaceCol]
        : options.defaultWorkplace || '';
    const ethnicity =
      mapping.ethnicityCol !== undefined && mapping.ethnicityCol >= 0
        ? orig[mapping.ethnicityCol]
        : defaultEthnicity;
    const nation = '0-Việt Nam';
    const cccd = mapping.cccdCol !== undefined && mapping.cccdCol >= 0 ? String(orig[mapping.cccdCol] || '').trim() : '';
    const cccdDate =
      mapping.cccdDateCol !== undefined && mapping.cccdDateCol >= 0 ? formatDate(orig[mapping.cccdDateCol]) : '';
    const cccdPlace =
      mapping.cccdPlaceCol !== undefined && mapping.cccdPlaceCol >= 0
        ? String(orig[mapping.cccdPlaceCol] || '').trim()
        : 'Cục cảnh sát';
    const phone = mapping.phoneCol !== undefined && mapping.phoneCol >= 0 ? String(orig[mapping.phoneCol] || '').trim() : '';

    rowsAoa.push([
      stt, // 0: STT
      name, // 1: TENBENHNHAN
      dob, // 2: NGAYSINH
      gender, // 3: GIOITINH
      job, // 4: NGHENGHIEP
      workplace, // 5: NOILAMVIEC
      ethnicity, // 6: DANTOC
      nation, // 7: QUOCGIA
      cccd, // 8: CCCD
      cccdDate, // 9: NGAYCAPCCCD
      cccdPlace, // 10: NOICAPCCCD
      pr.resolvedTinh, // 11: TINH (L)
      pr.resolvedXa, // 12: XA (M)
      pr.rawAddress, // 13: DIACHI (N)
      dotKham, // 14: DOTKHAM (O)
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

  // Apply Times New Roman 13, Borders, Auto-fit rows and columns
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
