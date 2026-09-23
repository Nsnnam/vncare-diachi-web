import diadanhData from '../data/diadanh_tags.json';
import addressMappingData from '../data/addresses.json';
import { ProvinceItem, CommuneItem, AddressOldRecord, CustomDictRule, ResolveResult } from '../types';

/** Remove Vietnamese diacritics and lowercase */
export function removeDiacritics(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/** Normalize string: remove diacritics, strip punctuation, single space */
export function normalizeText(str: string): string {
  if (!str) return '';
  const s = removeDiacritics(str)
    .replace(/[\,\.\-\;\:\/\|\(\)\[\]\{\}\<\>\_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return s;
}

/** Strip common administrative prefixes */
export function stripAdminPrefix(str: string): string {
  if (!str) return '';
  const tokens = str.split(' ');
  const prefixes = [
    'thanh pho', 'tinh', 'tp', 't',
    'quan', 'huyen', 'thi xa', 'tx', 'q', 'h',
    'phuong', 'xa', 'thi tran', 'p', 'x', 'tt'
  ];
  for (const p of prefixes) {
    const pTokens = p.split(' ');
    if (tokens.length >= pTokens.length) {
      let match = true;
      for (let i = 0; i < pTokens.length; i++) {
        if (tokens[i] !== pTokens[i]) {
          match = false;
          break;
        }
      }
      if (match) {
        return tokens.slice(pTokens.length).join(' ');
      }
    }
  }
  return str;
}

// 1. Process 34 Provinces
export const PROVINCES_MAP: Map<string, ProvinceItem> = new Map();
export const PROVINCES_LIST: ProvinceItem[] = [];

// 2. Process 3,320 Communes
export const COMMUNES_LIST: CommuneItem[] = [];
export const COMMUNES_BY_PROV: Map<string, CommuneItem[]> = new Map();
// Key: "tinh_name|xa_name" -> CommuneItem
export const COMMUNES_KEY_MAP: Map<string, CommuneItem> = new Map();

// Initialize data structures
(function initDatabase() {
  const items = (diadanhData as any).items || [];

  for (const item of items) {
    // Standardize 2-digit province code with leading zeros
    const rawTId = String(item.tinh_id || '');
    const tIdPadded = rawTId.padStart(5, '0');
    const provId = tIdPadded.substring(0, 2);
    const provName = String(item.tinh || '').trim();
    const provCode = `${provId}-${provName}`;

    if (!PROVINCES_MAP.has(provName)) {
      const provNorm = normalizeText(provName);
      const provCore = stripAdminPrefix(provNorm);
      const pItem: ProvinceItem = {
        code: provCode,
        id: provId,
        name: provName,
        normName: provNorm,
        coreName: provCore,
      };
      PROVINCES_MAP.set(provName, pItem);
      PROVINCES_MAP.set(provCode, pItem);
      PROVINCES_LIST.push(pItem);
    }

    // Standardize 5-digit commune code with leading zeros
    const rawMdd = String(item.ma_dia_danh || '');
    const mddPadded = rawMdd.padStart(5, '0');
    const communeName = String(item.xa || '').trim();
    const communeCode = `${mddPadded}-${communeName}`;
    const xNorm = normalizeText(communeName);
    const xCore = stripAdminPrefix(xNorm);

    const cItem: CommuneItem = {
      code: communeCode,
      id: mddPadded,
      name: communeName,
      tinhName: provName,
      tinhCode: provCode,
      tags: String(item.tags || ''),
      placeId: String(item.place_id || ''),
      normName: xNorm,
      coreName: xCore,
    };

    COMMUNES_LIST.push(cItem);
    COMMUNES_KEY_MAP.set(`${provName}|${communeName}`, cItem);
    COMMUNES_KEY_MAP.set(`${normalizeText(provName)}|${xNorm}`, cItem);

    if (!COMMUNES_BY_PROV.has(provName)) {
      COMMUNES_BY_PROV.set(provName, []);
    }
    COMMUNES_BY_PROV.get(provName)!.push(cItem);
  }

  // Sort provinces alphabetically
  PROVINCES_LIST.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  // Sort commune lists
  COMMUNES_BY_PROV.forEach((list) => {
    list.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  });
})();

// Sort index by core name length descending to avoid substring conflicts
const SORTED_PROVINCES = [...PROVINCES_LIST].sort((a, b) => b.coreName.length - a.coreName.length);
const SORTED_COMMUNES = [...COMMUNES_LIST].sort((a, b) => b.coreName.length - a.coreName.length);

// 3. Process Old 3-level mappings (10,035 items)
interface IndexedOldMapping {
  xaCu: string;
  huyenCu: string;
  tinhCu: string;
  xaCuCore: string;
  xaCuNorm: string;
  huyenCuCore: string;
  tinhCuCore: string;
  tinhMoiCore: string;
  targetTinhCode: string;
  targetXaCode: string;
  targetTinhName: string;
  targetXaName: string;
}

const OLD_MAPPINGS_INDEX: IndexedOldMapping[] = [];

(function initOldMappings() {
  const list = (addressMappingData as any) || [];
  for (const a of list) {
    const xaM = String(a.xa_moi || '').trim();
    const tinhM = String(a.tinh_moi || '').trim();
    const cItem = COMMUNES_KEY_MAP.get(`${tinhM}|${xaM}`) || COMMUNES_KEY_MAP.get(`${normalizeText(tinhM)}|${normalizeText(xaM)}`);
    if (!cItem) continue;

    const xaC = String(a.xa_cu || '').trim();
    const huyenC = String(a.huyen_cu || '').trim();
    const tinhC = String(a.tinh_cu || '').trim();

    const xaCuNorm = normalizeText(xaC);
    const xaCuCore = stripAdminPrefix(xaCuNorm);
    const huyenCuNorm = normalizeText(huyenC);
    const huyenCuCore = stripAdminPrefix(huyenCuNorm);
    const tinhCuNorm = normalizeText(tinhC);
    const tinhCuCore = stripAdminPrefix(tinhCuNorm);
    const tinhMoiCore = stripAdminPrefix(normalizeText(tinhM));

    OLD_MAPPINGS_INDEX.push({
      xaCu: xaC,
      huyenCu: huyenC,
      tinhCu: tinhC,
      xaCuCore,
      xaCuNorm,
      huyenCuCore,
      tinhCuCore,
      tinhMoiCore,
      targetTinhCode: cItem.tinhCode,
      targetXaCode: cItem.code,
      targetTinhName: cItem.tinhName,
      targetXaName: cItem.name,
    });
  }
})();

/** Word boundary regex check */
function matchWord(pattern: string, text: string): boolean {
  if (!pattern || !text) return false;
  // escaped pattern
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(^|\\s)${escaped}(\\s|$)`, 'i');
  return regex.test(text);
}

/** Find start and end position of pattern in text with word boundary */
function findWordSpan(pattern: string, text: string): { start: number; end: number } | null {
  if (!pattern || !text) return null;
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(?:^|\\s)(${escaped})(?:\\s|$)`, 'i');
  const m = regex.exec(text);
  if (!m) return null;
  const start = m.index + (m[0].startsWith(' ') ? 1 : 0);
  const end = start + m[1].length;
  return { start, end };
}

/**
 * Main Address Resolution Engine
 * Concurrently evaluates Custom Dictionary, 2-Level Direct Match, and 3-Level Mapping.
 */
export function resolveAddress(
  rawAddress: string,
  customRules: CustomDictRule[] = []
): ResolveResult {
  if (!rawAddress || !rawAddress.trim()) {
    return {
      status: 'empty',
      tinhCode: '',
      xaCode: '',
      tinhName: '',
      xaName: '',
      method: 'Địa chỉ trống',
      confidence: 0,
    };
  }

  const rawTrimmed = rawAddress.trim();
  const norm = normalizeText(rawTrimmed);

  // 0. Check Custom Dictionary Rules
  if (customRules && customRules.length > 0) {
    for (const rule of customRules) {
      if (!rule.targetTinhCode || !rule.targetXaCode) continue;

      // Exact match
      if (rule.rawAddress && rule.rawAddress.trim().toLowerCase() === rawTrimmed.toLowerCase()) {
        return {
          status: 'custom',
          tinhCode: rule.targetTinhCode,
          xaCode: rule.targetXaCode,
          tinhName: rule.targetTinhName,
          xaName: rule.targetXaName,
          method: 'Thư viện thủ công (Khớp chính xác)',
          confidence: 100,
        };
      }

      // Normalized match
      const ruleNorm = rule.normalizedAddress || normalizeText(rule.rawAddress);
      if (ruleNorm && norm === ruleNorm) {
        return {
          status: 'custom',
          tinhCode: rule.targetTinhCode,
          xaCode: rule.targetXaCode,
          tinhName: rule.targetTinhName,
          xaName: rule.targetXaName,
          method: 'Thư viện thủ công (Khớp chuẩn hóa)',
          confidence: 98,
        };
      }

      // Keyword / Substring match
      if (ruleNorm && ruleNorm.length >= 4 && matchWord(ruleNorm, norm)) {
        return {
          status: 'custom',
          tinhCode: rule.targetTinhCode,
          xaCode: rule.targetXaCode,
          tinhName: rule.targetTinhName,
          xaName: rule.targetXaName,
          method: 'Thư viện thủ công (Khớp từ khóa)',
          confidence: 95,
        };
      }
    }
  }

  // 1. Detect Province in raw text
  // We identify matches of 34 provinces, prioritizing rightmost (end of address) & longest core name
  const matchedProvinces: Array<{
    province: ProvinceItem;
    start: number;
    end: number;
  }> = [];

  for (const prov of SORTED_PROVINCES) {
    // Check if full norm or core matches with word boundary
    let span = findWordSpan(prov.normName, norm);
    if (!span) {
      span = findWordSpan(prov.coreName, norm);
    }
    if (span) {
      matchedProvinces.push({
        province: prov,
        start: span.start,
        end: span.end,
      });
    }
  }

  // 2. Direct 2-level match with Boundary Exclusion
  if (matchedProvinces.length > 0) {
    // Sort primarily by rightmost position (end index), then core name length
    matchedProvinces.sort((a, b) => {
      if (b.end !== a.end) return b.end - a.end;
      return b.province.coreName.length - a.province.coreName.length;
    });

    const topProv = matchedProvinces[0];
    const provItem = topProv.province;

    // Isolate address text OUTSIDE the province span to prevent false commune matches
    const textOutsideProv = (norm.substring(0, topProv.start) + ' ' + norm.substring(topProv.end))
      .replace(/\s+/g, ' ')
      .trim();

    const provCommunes = COMMUNES_BY_PROV.get(provItem.name) || [];

    // Search for commune in this province
    interface Candidate {
      score: number;
      commune: CommuneItem;
      type: string;
    }
    const candidates: Candidate[] = [];

    for (const c of provCommunes) {
      // Priority A: Exact match with administrative prefix in remaining text (e.g. "phuong yen bai", "xa ban nguyen")
      if (matchWord(c.normName, textOutsideProv)) {
        candidates.push({
          score: 100 + c.normName.length,
          commune: c,
          type: 'Đúng tiền tố xã/phường',
        });
        continue;
      }

      // Priority B: Core commune name match with word boundary
      if (c.coreName.length >= 3 && matchWord(c.coreName, textOutsideProv)) {
        candidates.push({
          score: 60 + c.coreName.length,
          commune: c,
          type: 'Khớp tên xã/phường',
        });
      }
    }

    if (candidates.length > 0) {
      candidates.sort((a, b) => b.score - a.score);
      const best = candidates[0];
      return {
        status: 'resolved',
        tinhCode: best.commune.tinhCode,
        xaCode: best.commune.code,
        tinhName: best.commune.tinhName,
        xaName: best.commune.name,
        method: `2 cấp (${best.commune.name}, ${provItem.name} — ${best.type})`,
        confidence: best.score >= 100 ? 95 : 85,
      };
    }
  }

  // 3. Check Old 3-Level Address Database (10,035 records)
  // E.g. "Phường Đồng Tâm, Thành phố Yên Bái, Tỉnh Yên Bái" -> "Phường Yên Bái, Tỉnh Lào Cai"
  // E.g. "Gia Cẩm, Việt Trì, Phú Thọ" -> "Phường Việt Trì, Tỉnh Phú Thọ"
  interface OldCandidate {
    score: number;
    record: IndexedOldMapping;
  }
  const oldCandidates: OldCandidate[] = [];

  for (const old of OLD_MAPPINGS_INDEX) {
    if (old.xaCuCore.length < 3) continue;

    if (matchWord(old.xaCuCore, norm)) {
      let score = 15;

      // Exact prefix match (e.g. "phuong gia cam")
      if (matchWord(old.xaCuNorm, norm)) {
        score += 20;
      }
      // Old district match (e.g. "viet tri", "nam sach", "thanh pho yen bai")
      if (old.huyenCuCore && matchWord(old.huyenCuCore, norm)) {
        score += 35;
      }
      // Old province match (e.g. "hai duong", "yen bai", "ha tay")
      if (old.tinhCuCore && matchWord(old.tinhCuCore, norm)) {
        score += 40;
      }
      // New province match (e.g. "hai phong", "lao cai")
      if (old.tinhMoiCore && matchWord(old.tinhMoiCore, norm)) {
        score += 30;
      }

      oldCandidates.push({ score, record: old });
    }
  }

  if (oldCandidates.length > 0) {
    oldCandidates.sort((a, b) => b.score - a.score);
    const top = oldCandidates[0];
    if (top.score >= 35 || (oldCandidates.length === 1 && top.score >= 15)) {
      return {
        status: 'resolved',
        tinhCode: top.record.targetTinhCode,
        xaCode: top.record.targetXaCode,
        tinhName: top.record.targetTinhName,
        xaName: top.record.targetXaName,
        method: `3 cấp chuyển đổi (${top.record.xaCu} → ${top.record.targetXaName}, ${top.record.targetTinhName})`,
        confidence: Math.min(95, top.score),
      };
    }
  }

  // 4. Fallback Nationwide Search
  const nationwide: Array<{ score: number; commune: CommuneItem }> = [];
  for (const c of SORTED_COMMUNES) {
    if (c.coreName.length < 3) continue;
    if (matchWord(c.normName, norm)) {
      nationwide.push({ score: 90 + c.normName.length, commune: c });
    } else if (matchWord(c.coreName, norm)) {
      nationwide.push({ score: 50 + c.coreName.length, commune: c });
    }
  }

  if (nationwide.length > 0) {
    nationwide.sort((a, b) => b.score - a.score);

    // If province core is found in address string, pick that candidate
    for (const item of nationwide) {
      if (matchWord(item.commune.coreName, norm)) {
        const provCore = stripAdminPrefix(normalizeText(item.commune.tinhName));
        if (matchWord(provCore, norm)) {
          return {
            status: 'resolved',
            tinhCode: item.commune.tinhCode,
            xaCode: item.commune.code,
            tinhName: item.commune.tinhName,
            xaName: item.commune.name,
            method: `Toàn quốc đối soát (${item.commune.name}, ${item.commune.tinhName})`,
            confidence: 75,
          };
        }
      }
    }

    // If unique nationwide match with high score
    if (nationwide.length === 1 && nationwide[0].score >= 90) {
      const best = nationwide[0].commune;
      return {
        status: 'resolved',
        tinhCode: best.tinhCode,
        xaCode: best.code,
        tinhName: best.tinhName,
        xaName: best.name,
        method: `Khớp duy nhất (${best.name}, ${best.tinhName})`,
        confidence: 70,
      };
    }
  }

  // 5. Unresolved
  return {
    status: 'unresolved',
    tinhCode: '',
    xaCode: '',
    tinhName: '',
    xaName: '',
    method: 'Chưa nhận diện được',
    confidence: 0,
  };
}

/** Get list of communes for dropdown given a province name or code */
export function getCommunesForProvince(tinhNameOrCode: string): CommuneItem[] {
  if (!tinhNameOrCode) return [];
  // Extract province name if in "25-Tỉnh Phú Thọ" format
  let name = tinhNameOrCode;
  if (tinhNameOrCode.includes('-')) {
    name = tinhNameOrCode.split('-').slice(1).join('-').trim();
  }
  return COMMUNES_BY_PROV.get(name) || [];
}
