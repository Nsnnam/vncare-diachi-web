import { normalizeText } from './addressEngine';

/**
 * 65 official ethnic groups in the standard VNCare template (Sheet DANTOC)
 * Strictly matching public/template/MauFileImportBenhNhan_ksktoandan.xls
 */
export const VNCARE_ETHNICITIES: string[] = [
  '1-Ba na',
  '2-Bố Y',
  '3-Brâu',
  '4-Chăm',
  '5-Chơ-ro',
  '6-Chu ru',
  '7-Chứt',
  '8-Co',
  '9-Cống',
  '10-Cơ-ho',
  '11-Cờ lao',
  '12-Dao',
  '13-Ê-đê',
  '14-Gia-rai',
  '15-Giáy',
  '16-Gié Triêng',
  '17-H mông',
  '18-Hrê',
  '19-Hà Nhì',
  '20-Hoa',
  '21-K tu',
  '22-Kháng',
  '23-Khơ me',
  '24-Khơ mú',
  '25-Kinh',
  '26-La chí',
  '27-La ha',
  '28-La Hủ',
  '29-Lào',
  '30-Lô Lô',
  '31-Lự',
  '32-Mnông',
  '33-Mạ',
  '34-Mảng',
  '35-Mường',
  '36-Ngái',
  '37-Nùng',
  '38-Ơ Đu',
  '39-Pà Thẻn',
  '40-Phù lá',
  '41-Pu Péo',
  '42-Ra-glai',
  '43-Rơ măm',
  '44-Sán Chay',
  '45-Sán Dìu',
  '46-Si La',
  '47-Tà-ôi',
  '48-Tày',
  '49-Thái',
  '50-Thổ',
  '51-Bru-Vân Kiều',
  '52-Xtiêng',
  '53-Xinh-mun',
  '54-Xơ-Đăng',
  '60-Pa-co',
  '99-Nước ngoài',
  '100-Hroi',
  '101-Tu Dí',
  '103-Cao Lan',
  '104-Jrai',
  '105-Chàm',
  '106-Xa Phó',
  '107-Mông.',
  '108-Sán Chỉ',
  '109-Cil',
];

// Map from numeric code string to standard full catalogue item ("45" -> "45-Sán Dìu")
const CODE_TO_ETHNICITY = new Map<string, string>();

// Map from normalized name to standard full catalogue item ("san diu" -> "45-Sán Dìu")
const NAME_TO_ETHNICITY = new Map<string, string>();

VNCARE_ETHNICITIES.forEach((item) => {
  const dashIdx = item.indexOf('-');
  if (dashIdx !== -1) {
    const code = item.slice(0, dashIdx).trim();
    const name = item.slice(dashIdx + 1).trim();
    CODE_TO_ETHNICITY.set(code, item);
    NAME_TO_ETHNICITY.set(normalizeEthnicityKey(name), item);
  }
});

/** Normalize ethnicity input string for dictionary matching */
export function normalizeEthnicityKey(str: string): string {
  if (!str) return '';
  return normalizeText(str)
    .replace(/['’"`]+/g, '')
    .trim();
}

/**
 * Common Vietnamese aliases and historical/regional variant spellings
 */
const ETHNICITY_ALIASES: Record<string, string> = {
  // Kinh / Việt
  viet: '25-Kinh',
  kinh: '25-Kinh',
  'nguoi kinh': '25-Kinh',
  'dan toc kinh': '25-Kinh',

  // Sán Dìu (San Diu, Trại, Mán Quần Cộc, Sán Dẹo)
  'san diu': '45-Sán Dìu',
  'san deu': '45-Sán Dìu',
  'san deo': '45-Sán Dìu',
  trai: '45-Sán Dìu',

  // Tày
  tay: '48-Tày',
  'dan toc tay': '48-Tày',

  // Thái
  thai: '49-Thái',
  'thai den': '49-Thái',
  'thai trang': '49-Thái',

  // Mường
  muong: '35-Mường',

  // Dao
  dao: '12-Dao',
  'dao do': '12-Dao',
  'dao tien': '12-Dao',
  'dao quan chet': '12-Dao',
  'riu mien': '12-Dao',

  // H Mông (Mông, Hmông, H'Mông, Mèo)
  'h mong': '17-H mông',
  hmong: '17-H mông',
  mong: '17-H mông',
  meo: '17-H mông',
  mieu: '17-H mông',

  // Nùng
  nung: '37-Nùng',

  // Hoa
  hoa: '20-Hoa',
  tau: '20-Hoa',
  'trieu chau': '20-Hoa',
  'phuc kien': '20-Hoa',
  'quang dong': '20-Hoa',

  // Khơ me
  'kho me': '23-Khơ me',
  khmer: '23-Khơ me',
  'kho-me': '23-Khơ me',

  // Gia-rai
  'gia rai': '14-Gia-rai',
  'gia-rai': '14-Gia-rai',
  jrai: '104-Jrai',

  // Ê-đê
  'e de': '13-Ê-đê',
  'e-de': '13-Ê-đê',
  ede: '13-Ê-đê',

  // Ba na
  'ba na': '1-Ba na',
  bana: '1-Ba na',

  // Sán Chay / Cao Lan / Sán Chỉ
  'san chay': '44-Sán Chay',
  'cao lan': '103-Cao Lan',
  'san chi': '108-Sán Chỉ',

  // Thổ
  tho: '50-Thổ',

  // Cơ-ho
  'co ho': '10-Cơ-ho',
  'co-ho': '10-Cơ-ho',
  'k ho': '10-Cơ-ho',
  koho: '10-Cơ-ho',

  // Chăm
  cham: '4-Chăm',
  champa: '4-Chăm',

  // Khơ mú
  'kho mu': '24-Khơ mú',
  khomu: '24-Khơ mú',

  // Giáy
  giay: '15-Giáy',

  // Bru - Vân Kiều
  'bru van kieu': '51-Bru-Vân Kiều',
  'van kieu': '51-Bru-Vân Kiều',
  bru: '51-Bru-Vân Kiều',

  // Xơ-Đăng
  'xo dang': '54-Xơ-Đăng',
  'xo-dang': '54-Xơ-Đăng',
  sedang: '54-Xơ-Đăng',

  // Chơ-ro
  'cho ro': '5-Chơ-ro',
  'cho-ro': '5-Chơ-ro',

  // Hà Nhì
  'ha nhi': '19-Hà Nhì',

  // Tà-ôi
  'ta oi': '47-Tà-ôi',
  'ta-oi': '47-Tà-ôi',

  // Xtiêng
  xtieng: '52-Xtiêng',
  stieng: '52-Xtiêng',

  // Co
  co: '8-Co',

  // Xinh-mun
  'xinh mun': '53-Xinh-mun',
  'xinh-mun': '53-Xinh-mun',

  // Chu ru
  'chu ru': '6-Chu ru',
  churu: '6-Chu ru',

  // Lào
  lao: '29-Lào',

  // La chí
  'la chi': '26-La chí',

  // Kháng
  khang: '22-Kháng',

  // Phù lá
  'phu la': '40-Phù lá',

  // La ha
  'la ha': '27-La ha',

  // La Hủ
  'la hu': '28-La Hủ',

  // Lự
  lu: '31-Lự',

  // Lô Lô
  'lo lo': '30-Lô Lô',

  // Chứt
  chut: '7-Chứt',

  // Mảng
  mang: '34-Mảng',

  // Pà Thẻn
  'pa then': '39-Pà Thẻn',

  // Cờ lao
  'co lao': '11-Cờ lao',

  // Cống
  cong: '9-Cống',

  // Bố Y
  'bo y': '2-Bố Y',

  // Si La
  'si la': '46-Si La',

  // Pu Péo
  'pu peo': '41-Pu Péo',

  // Brâu
  brau: '3-Brâu',

  // Ơ Đu
  'o du': '38-Ơ Đu',

  // Rơ măm
  'ro mam': '43-Rơ măm',

  // Ngái
  ngai: '36-Ngái',

  // Mnông
  mnong: '32-Mnông',
  'm nong': '32-Mnông',

  // Mạ
  ma: '33-Mạ',

  // Ra-glai
  'ra glai': '42-Ra-glai',
  'ra-glai': '42-Ra-glai',
  raglai: '42-Ra-glai',

  // Gié Triêng
  'gie trieng': '16-Gié Triêng',

  // Hrê
  hre: '18-Hrê',

  // K tu
  'k tu': '21-K tu',
  'co tu': '21-K tu',

  // Pa-co
  'pa co': '60-Pa-co',
  'pa-co': '60-Pa-co',

  // Nước ngoài
  'nuoc ngoai': '99-Nước ngoài',
  foreigner: '99-Nước ngoài',
  foreign: '99-Nước ngoài',

  // Hroi, Tu Dí, Xa Phó, Cil
  hroi: '100-Hroi',
  'tu di': '101-Tu Dí',
  'xa pho': '106-Xa Phó',
  cil: '109-Cil',
};

export interface EthnicityResolveResult {
  formatted: string;
  raw: string;
  isValid: boolean;
  isMissing: boolean;
  isUnresolved: boolean;
}

/**
 * Standardize raw ethnicity string/code and return detailed validity status.
 */
export function resolveEthnicity(val: any, defaultEthnicity: string = '25-Kinh'): EthnicityResolveResult {
  if (val === undefined || val === null) {
    return {
      formatted: defaultEthnicity,
      raw: '',
      isValid: false,
      isMissing: true,
      isUnresolved: false,
    };
  }
  const s = String(val).trim();
  if (!s) {
    return {
      formatted: defaultEthnicity,
      raw: '',
      isValid: false,
      isMissing: true,
      isUnresolved: false,
    };
  }

  // 1. Check if input is already formatted as "Code-Name" or "Code - Name"
  const dashMatch = s.match(/^(\d+)\s*[-_.]\s*(.*)$/);
  if (dashMatch) {
    const code = dashMatch[1];
    if (CODE_TO_ETHNICITY.has(code)) {
      return {
        formatted: CODE_TO_ETHNICITY.get(code)!,
        raw: s,
        isValid: true,
        isMissing: false,
        isUnresolved: false,
      };
    }
    return {
      formatted: s,
      raw: s,
      isValid: false,
      isMissing: false,
      isUnresolved: true,
    };
  }

  // 2. Check if input is solely a numeric code (e.g. 25, 45, "25", "45")
  if (/^\d+$/.test(s)) {
    if (CODE_TO_ETHNICITY.has(s)) {
      return {
        formatted: CODE_TO_ETHNICITY.get(s)!,
        raw: s,
        isValid: true,
        isMissing: false,
        isUnresolved: false,
      };
    }
  }

  // 3. Exact match via normalized name (e.g. "san diu" -> "45-Sán Dìu")
  const norm = normalizeEthnicityKey(s);
  if (NAME_TO_ETHNICITY.has(norm)) {
    return {
      formatted: NAME_TO_ETHNICITY.get(norm)!,
      raw: s,
      isValid: true,
      isMissing: false,
      isUnresolved: false,
    };
  }

  // 4. Exact match via aliases
  if (ETHNICITY_ALIASES[norm]) {
    return {
      formatted: ETHNICITY_ALIASES[norm],
      raw: s,
      isValid: true,
      isMissing: false,
      isUnresolved: false,
    };
  }

  // 5. Check if alias key is contained in normalized input (e.g. "dan toc san diu")
  for (const [alias, canonical] of Object.entries(ETHNICITY_ALIASES)) {
    if (norm.includes(alias)) {
      return {
        formatted: canonical,
        raw: s,
        isValid: true,
        isMissing: false,
        isUnresolved: false,
      };
    }
  }

  // 6. Substring match against standard names (minimum 3 characters to avoid collisions)
  for (const [stdName, canonical] of NAME_TO_ETHNICITY.entries()) {
    if (stdName.length >= 3 && norm.includes(stdName)) {
      return {
        formatted: canonical,
        raw: s,
        isValid: true,
        isMissing: false,
        isUnresolved: false,
      };
    }
  }

  return {
    formatted: defaultEthnicity,
    raw: s,
    isValid: false,
    isMissing: false,
    isUnresolved: true,
  };
}

/**
 * Standardize any raw ethnicity string/code into official VNCare "Mã-Dân tộc" format
 */
export function formatEthnicity(val: any, defaultEthnicity: string = '25-Kinh'): string {
  return resolveEthnicity(val, defaultEthnicity).formatted;
}

/** Extract clean name from "Mã-Dân tộc" (e.g. "45-Sán Dìu" -> "Sán Dìu") */
export function extractCleanEthnicityName(val: string): string {
  if (!val) return '';
  const s = String(val).trim();
  const dashIdx = s.indexOf('-');
  if (dashIdx !== -1 && /^\d+$/.test(s.slice(0, dashIdx).trim())) {
    return s.slice(dashIdx + 1).trim();
  }
  return s;
}
