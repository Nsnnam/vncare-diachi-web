import { normalizeText } from './addressEngine';

/**
 * 250 official countries in the standard VNCare template (Sheet QUOCGIA)
 * Strictly matching public/template/MauFileImportBenhNhan_ksktoandan.xls
 */
export const VNCARE_NATIONS: string[] = [
  "0-Việt Nam",
  "292-Andorra",
  "293-United arab emirates",
  "294-Antigua and barbuda",
  "295-Anguilla",
  "296-An ba ni",
  "297-Ác mê nia",
  "298-Netherlands antilles",
  "299-Ăng gô la",
  "300-Antarctica",
  "301-Ác hen ti na",
  "302-Samoa",
  "303-Áo",
  "304-Úc",
  "305-Aruba việt nam",
  "306-Azerbaijan",
  "307-Bosnia and herzegovina",
  "308-Barbados",
  "309-Bangladesh",
  "310-Bỉ",
  "311-Burkina faso",
  "312-Bungari",
  "313-Bahrain",
  "314-Burundi",
  "315-Benin",
  "316-Bermuda",
  "317-Brunei",
  "318-Bolivia",
  "319-Braxin",
  "320-Bahamas",
  "321-Bhutan",
  "322-Bouvet island",
  "323-Botswana",
  "324-Belarus",
  "325-Belize",
  "326-Canada",
  "327-Cocos (keeling) islands",
  "328-Congo, the democratic republic of the",
  "329-Central african republic",
  "330-Công gô",
  "331-Switzerland",
  "332-COTE DIVOIRE",
  "333-Cook islands",
  "334-Chi lê",
  "335-Cameroon",
  "336-Trung quốc",
  "337-Colômbia",
  "338-Costa rica",
  "339-Cu ba",
  "340-Cape verde",
  "341-Christmas island",
  "342-Cyprus",
  "343-Czech republic",
  "344-Germany",
  "345-Djibouti",
  "346-Denmark",
  "347-Dominica",
  "348-Dominican republic",
  "349-Algerie",
  "350-East timor",
  "351-Ecuador",
  "352-Estonia",
  "353-Egypt",
  "354-Western sahara",
  "355-Eritrea",
  "356-Spain",
  "357-Ethiopia",
  "358-Finland",
  "359-Fiji",
  "360-Falkland islands (malvinas)",
  "361-Micronesia, federated states of",
  "362-Faroe islands",
  "363-Pháp",
  "364-Serbia and montenegro (formerly yugoslavia)",
  "365-Gabon",
  "366-Anh",
  "367-Grenada",
  "368-Georgia",
  "369-French guiana",
  "370-Guernsey",
  "371-Ghana",
  "372-Gibraltar",
  "373-Greenland",
  "374-Gambia",
  "375-Guinea",
  "376-Guadeloupe",
  "377-Equatorial guinea",
  "378-Greece",
  "379-South georgia and the south sandwich islands",
  "380-Guatemala",
  "381-Guam",
  "382-Guyana",
  "383-Guinea-bissau",
  "384-Hong kong",
  "385-Heard and mc donald islands",
  "386-Honduras",
  "387-Croatia (local name: hrvatska)",
  "388-Haiti",
  "389-Hungary",
  "390-Indonesia",
  "391-Ireland",
  "392-Israel",
  "393-Isle of man",
  "394-India",
  "395-British indian ocean territory",
  "396-Iraq",
  "397-Iran (islamic republic of)",
  "398-Iceland",
  "399-Italy",
  "400-Jersey",
  "401-Jamaica",
  "402-Jordan",
  "403-Nhật",
  "404-Kenya",
  "405-Kyrgyzstan",
  "406-Campuchia",
  "407-Kiribati",
  "408-Comoros",
  "409-St. kitts and nevis",
  "410-Bắc Triều Tiên",
  "411-Hàn quốc",
  "412-Kuwait",
  "413-Cayman islands",
  "414-Kazakhstan",
  "415-Lào",
  "416-Lebanon",
  "417-St. lucia",
  "418-Liechtenstein",
  "419-Sri lanka",
  "420-Liberia",
  "421-Lesotho",
  "422-Lithuania",
  "423-Luxembourg",
  "424-Latvia",
  "425-Libyan arab jamahiriya",
  "426-Morocco",
  "427-Monaco",
  "428-Moldova, republic of",
  "429-Madagascar",
  "430-Marshall islands",
  "431-Macedonia, the former yugoslav republic of",
  "432-Mali",
  "433-Myanmar",
  "434-Mongolia",
  "435-Macau",
  "436-Northern mariana islands",
  "437-Martinique",
  "438-Mauritania",
  "439-Montserrat",
  "440-Malta",
  "441-Mauritius",
  "442-Maldives",
  "443-Malawi",
  "444-Mexico",
  "445-Malaisia",
  "446-Mozambique",
  "447-Namibia",
  "448-New caledonia",
  "449-Niger",
  "450-Norfolk island",
  "451-Nigeria",
  "452-Nicaragua",
  "453-Hà lan",
  "454-Norway",
  "455-Nepal",
  "456-Nauru",
  "457-Niue",
  "458-New zealand",
  "459-Oman",
  "460-Panama",
  "461-Peru",
  "462-French polynesia",
  "463-Papua new guinea",
  "464-Philippines",
  "465-Pakistan",
  "466-Poland",
  "467-St. pierre and miquelon",
  "468-Pitcairn",
  "469-Puerto rico",
  "470-Palestinian authority",
  "471-Portugal",
  "472-Palau",
  "473-Paraguay",
  "474-Qatar",
  "475-Reunion",
  "476-Romania",
  "477-Nga",
  "478-Rwanda",
  "479-Saudi arabia",
  "480-Solomon islands",
  "481-Seychelles",
  "482-Sudan",
  "483-Sweden",
  "484-Singapore",
  "485-St. helena",
  "486-Slovenia",
  "487-Svalbard and jan mayen islands",
  "488-Slovakia (slovak republic)",
  "489-Sierra leone",
  "490-San marino",
  "491-Senegal",
  "492-Somalia",
  "493-Suriname",
  "494-Sao tome and principe",
  "495-El salvador",
  "496-Syrian arab republic",
  "497-Swaziland",
  "498-Turks and caicos islands",
  "499-Chad",
  "500-French southern territories",
  "501-Togo",
  "502-Thái lan",
  "503-Tajikistan",
  "504-Tokelau",
  "505-Timor leste",
  "506-Turkmenistan",
  "507-Tunisia",
  "508-Tonga",
  "509-Turkey",
  "510-Trinidad and tobago",
  "511-Tuvalu",
  "512-Đài loan",
  "513-Tanzania, united republic of",
  "514-Ukraine",
  "515-Uganda",
  "516-United states minor outlying islands",
  "517-Hoa kỳ",
  "518-Uruguay",
  "519-Uzbekistan",
  "520-Vatican city state (holy see)",
  "521-St. vincent and the grenadines",
  "522-Venezuela",
  "523-Virgin islands (british)",
  "524-Virgin islands (u.s.)",
  "526-Vanuatu",
  "527-Wallis and futuna islands",
  "528-Samoa",
  "529-Yemen",
  "530-Mayotte",
  "531-Yugoslavia (serbia and montenegro)",
  "532-Sovereign military order of malta (smom)no iso code",
  "533-British southern and antarctic territories>",
  "534-England no iso code",
  "535-Scotlandno iso code",
  "536-Northern ireland no iso code",
  "537-Great britain see unite",
  "538-Wales no iso code",
  "539-South africa",
  "540-Zambia",
  "541-Zimbabwe"
];

// Map from numeric code string to standard full catalogue item ("336" -> "336-Trung quốc", "0" -> "0-Việt Nam")
const CODE_TO_NATION = new Map<string, string>();

// Map from normalized name to standard full catalogue item ("trung quoc" -> "336-Trung quốc")
const NAME_TO_NATION = new Map<string, string>();

VNCARE_NATIONS.forEach((item) => {
  const dashIdx = item.indexOf('-');
  if (dashIdx !== -1) {
    const code = item.slice(0, dashIdx).trim();
    const name = item.slice(dashIdx + 1).trim();
    CODE_TO_NATION.set(code, item);
    NAME_TO_NATION.set(normalizeNationKey(name), item);
  }
});

/** Normalize nation input string for dictionary matching */
export function normalizeNationKey(str: string): string {
  if (!str) return '';
  return normalizeText(str)
    .replace(/['’"\x60()]+/g, '')
    .trim();
}

/**
 * Common Vietnamese and English aliases for countries
 */
const NATION_ALIASES: Record<string, string> = {
  // Việt Nam
  'viet nam': '0-Việt Nam',
  'vietnam': '0-Việt Nam',
  'vn': '0-Việt Nam',
  'vnm': '0-Việt Nam',
  'viet': '0-Việt Nam',
  'kinh': '0-Việt Nam',

  // Trung Quốc
  'trung quoc': '336-Trung quốc',
  'trung hoa': '336-Trung quốc',
  'china': '336-Trung quốc',
  'chinese': '336-Trung quốc',
  'tq': '336-Trung quốc',
  'prc': '336-Trung quốc',

  // Đài Loan
  'dai loan': '512-Đài loan',
  'taiwan': '512-Đài loan',
  'taiwanese': '512-Đài loan',
  'tw': '512-Đài loan',
  'roc': '512-Đài loan',

  // Hàn Quốc
  'han quoc': '411-Hàn quốc',
  'korea': '411-Hàn quốc',
  'south korea': '411-Hàn quốc',
  'korean': '411-Hàn quốc',
  'nam trieu tien': '411-Hàn quốc',
  'rok': '411-Hàn quốc',

  // Bắc Triều Tiên
  'bac trieu tien': '410-Bắc Triều Tiên',
  'trieu tien': '410-Bắc Triều Tiên',
  'north korea': '410-Bắc Triều Tiên',
  'dprk': '410-Bắc Triều Tiên',

  // Nhật Bản
  'nhat ban': '403-Nhật',
  'nhat': '403-Nhật',
  'japan': '403-Nhật',
  'japanese': '403-Nhật',
  'jp': '403-Nhật',
  'jpn': '403-Nhật',

  // Hoa Kỳ (Mỹ)
  'hoa ky': '517-Hoa kỳ',
  'my': '517-Hoa kỳ',
  'nuoc my': '517-Hoa kỳ',
  'usa': '517-Hoa kỳ',
  'us': '517-Hoa kỳ',
  'america': '517-Hoa kỳ',
  'united states': '517-Hoa kỳ',
  'united states of america': '517-Hoa kỳ',

  // Anh (United Kingdom)
  'anh': '366-Anh',
  'nuoc anh': '366-Anh',
  'vuong quoc anh': '366-Anh',
  'uk': '366-Anh',
  'england': '366-Anh',
  'great britain': '366-Anh',
  'united kingdom': '366-Anh',
  'british': '366-Anh',

  // Pháp
  'phap': '363-Pháp',
  'nuoc phap': '363-Pháp',
  'france': '363-Pháp',
  'french': '363-Pháp',

  // Đức
  'duc': '344-Germany',
  'nuoc duc': '344-Germany',
  'germany': '344-Germany',
  'german': '344-Germany',
  'deutschland': '344-Germany',

  // Nga
  'nga': '477-Nga',
  'nuoc nga': '477-Nga',
  'lien bang nga': '477-Nga',
  'russia': '477-Nga',
  'russian': '477-Nga',

  // Hồng Kông
  'hong kong': '384-Hong kong',
  'hongkong': '384-Hong kong',
  'hk': '384-Hong kong',

  // Ma Cao
  'macau': '435-Macau',
  'macao': '435-Macau',
  'ma cao': '435-Macau',

  // Thái Lan
  'thai lan': '502-Thái lan',
  'thailand': '502-Thái lan',
  'thai': '502-Thái lan',

  // Singapore
  'singapore': '484-Singapore',
  'singapo': '484-Singapore',
  'sing': '484-Singapore',

  // Lào
  'lao': '415-Lào',
  'laos': '415-Lào',

  // Campuchia
  'campuchia': '406-Campuchia',
  'cambodia': '406-Campuchia',

  // Malaysia
  'malaysia': '445-Malaisia',
  'malaisia': '445-Malaisia',

  // Indonesia
  'indonesia': '390-Indonesia',
  'indo': '390-Indonesia',

  // Philippines
  'philippines': '464-Philippines',
  'phi lip pin': '464-Philippines',
  'philipines': '464-Philippines',

  // Ấn Độ
  'an do': '394-India',
  'india': '394-India',
  'indian': '394-India',

  // Úc
  'uc': '304-Úc',
  'nuoc uc': '304-Úc',
  'australia': '304-Úc',
  'aus': '304-Úc',

  // Canada
  'canada': '326-Canada',
  'can': '326-Canada',

  // Ý
  'y': '399-Italy',
  'nuoc y': '399-Italy',
  'italia': '399-Italy',
  'italy': '399-Italy',
  'italian': '399-Italy',

  // Tây Ban Nha
  'tay ban nha': '356-Spain',
  'spain': '356-Spain',
  'spanish': '356-Spain',

  // Hà Lan
  'ha lan': '453-Hà lan',
  'netherlands': '453-Hà lan',
  'holland': '453-Hà lan',
  'dutch': '453-Hà lan',

  // Bỉ
  'bi': '310-Bỉ',
  'belgium': '310-Bỉ',

  // Thụy Sĩ
  'thuy si': '331-Switzerland',
  'switzerland': '331-Switzerland',
  'swiss': '331-Switzerland',

  // Thụy Điển
  'thuy dien': '483-Sweden',
  'sweden': '483-Sweden',

  // Na Uy
  'na uy': '454-Norway',
  'norway': '454-Norway',

  // Phần Lan
  'phan lan': '358-Finland',
  'finland': '358-Finland',

  // Đan Mạch
  'dan mach': '346-Denmark',
  'denmark': '346-Denmark',

  // Ba Lan
  'ba lan': '466-Poland',
  'poland': '466-Poland',

  // Séc
  'sec': '343-Czech republic',
  'czech': '343-Czech republic',
  'cong hoa sec': '343-Czech republic',
  'tiep khac': '343-Czech republic',

  // Ukraine
  'ukraine': '514-Ukraine',
  'ukraina': '514-Ukraine',

  // Myanmar
  'myanmar': '433-Myanmar',
  'burma': '433-Myanmar',
  'mien dien': '433-Myanmar',

  // Cu ba
  'cuba': '339-Cu ba',
  'cu ba': '339-Cu ba',

  // Braxin
  'brazil': '319-Braxin',
  'braxin': '319-Braxin',

  // Argentina
  'argentina': '301-Ác hen ti na',
  'ac hen ti na': '301-Ác hen ti na',

  // Mexico
  'mexico': '444-Mexico',
  'me hi co': '444-Mexico',

  // New Zealand
  'new zealand': '458-New zealand',

  // Bồ Đào Nha
  'bo dao nha': '471-Portugal',
  'portugal': '471-Portugal',

  // Hy Lạp
  'hy lap': '378-Greece',
  'greece': '378-Greece',

  // Thổ Nhĩ Kỳ
  'tho nhi ky': '509-Turkey',
  'turkey': '509-Turkey',

  // Nam Phi
  'nam phi': '539-South africa',
  'south africa': '539-South africa',

  // Mông Cổ
  'mong co': '434-Mongolia',
  'mongolia': '434-Mongolia',

  // Áo
  'ao': '303-Áo',
  'nuoc ao': '303-Áo',
  'austria': '303-Áo',

  // Ai Cập
  'ai cap': '353-Egypt',
  'egypt': '353-Egypt',

  // Ả Rập Xê Út
  'a rap xe ut': '479-Saudi arabia',
  'saudi arabia': '479-Saudi arabia',

  // UAE
  'uae': '293-United arab emirates',
  'cac tieu vuong quoc a rap thong nhat': '293-United arab emirates',
};

export interface NationResolveResult {
  formatted: string;
  raw: string;
  isValid: boolean;
  isMissing: boolean;
  isUnresolved: boolean;
}

/**
 * Resolve any raw nation input (name, alias, code, English name) into official VNCare "Mã-Quốc gia"
 */
export function resolveNation(
  val: any,
  defaultNation: string = '0-Việt Nam'
): NationResolveResult {
  if (val === null || val === undefined || val === '') {
    return {
      formatted: defaultNation,
      raw: '',
      isValid: defaultNation === '0-Việt Nam',
      isMissing: true,
      isUnresolved: false,
    };
  }

  const s = String(val).trim();
  if (!s) {
    return {
      formatted: defaultNation,
      raw: '',
      isValid: defaultNation === '0-Việt Nam',
      isMissing: true,
      isUnresolved: false,
    };
  }

  // 1. Direct match with standard full string (e.g. "336-Trung quốc", "0-Việt Nam")
  const dashMatch = s.match(/^(\d+)\s*-\s*(.*)$/);
  if (dashMatch) {
    const code = dashMatch[1];
    const stdByCode = CODE_TO_NATION.get(code);
    if (stdByCode) {
      return {
        formatted: stdByCode,
        raw: s,
        isValid: true,
        isMissing: false,
        isUnresolved: false,
      };
    }
  }

  // 2. Pure numeric code (e.g. "336" or 336 or "0")
  if (/^\d+$/.test(s)) {
    const std = CODE_TO_NATION.get(s);
    if (std) {
      return {
        formatted: std,
        raw: s,
        isValid: true,
        isMissing: false,
        isUnresolved: false,
      };
    }
  }

  const norm = normalizeNationKey(s);

  // 3. Exact match with standard nation name
  if (NAME_TO_NATION.has(norm)) {
    return {
      formatted: NAME_TO_NATION.get(norm)!,
      raw: s,
      isValid: true,
      isMissing: false,
      isUnresolved: false,
    };
  }

  // 4. Exact match via aliases
  if (NATION_ALIASES[norm]) {
    return {
      formatted: NATION_ALIASES[norm],
      raw: s,
      isValid: true,
      isMissing: false,
      isUnresolved: false,
    };
  }

  // 5. Check if alias key is contained in normalized input (e.g. "quoc gia trung quoc")
  for (const [alias, canonical] of Object.entries(NATION_ALIASES)) {
    if (norm === alias || (alias.length >= 3 && (norm.startsWith(alias + ' ') || norm.endsWith(' ' + alias) || norm.includes(' ' + alias + ' ')))) {
      return {
        formatted: canonical,
        raw: s,
        isValid: true,
        isMissing: false,
        isUnresolved: false,
      };
    }
  }

  // 6. Substring match against standard names (minimum 3 characters to avoid false matches)
  for (const [stdName, canonical] of NAME_TO_NATION.entries()) {
    if (stdName.length >= 3 && (norm === stdName || norm.startsWith(stdName + ' ') || norm.endsWith(' ' + stdName) || norm.includes(' ' + stdName + ' '))) {
      return {
        formatted: canonical,
        raw: s,
        isValid: true,
        isMissing: false,
        isUnresolved: false,
      };
    }
  }

  // Fallback: unresolved
  return {
    formatted: defaultNation,
    raw: s,
    isValid: false,
    isMissing: false,
    isUnresolved: true,
  };
}

/** Standardize any raw nation string/code into official VNCare "Mã-Quốc gia" format */
export function formatNation(val: any, defaultNation: string = '0-Việt Nam'): string {
  return resolveNation(val, defaultNation).formatted;
}

/** Extract clean name from "Mã-Quốc gia" (e.g. "336-Trung quốc" -> "Trung quốc") */
export function extractCleanNationName(val: string): string {
  if (!val) return '';
  const s = String(val).trim();
  const dashIdx = s.indexOf('-');
  if (dashIdx !== -1 && /^\d+$/.test(s.slice(0, dashIdx).trim())) {
    return s.slice(dashIdx + 1).trim();
  }
  return s;
}
