import { CustomDictRule } from '../types';
import { normalizeText, PROVINCES_MAP, COMMUNES_KEY_MAP } from './addressEngine';

const STORAGE_KEY = 'nsn-vncare-diachi-custom-dict';

export function getCustomDictRules(): CustomDictRule[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load custom dictionary from localStorage:', e);
  }
  return [];
}

export function saveCustomDictRules(rules: CustomDictRule[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
  } catch (e) {
    console.error('Failed to save custom dictionary to localStorage:', e);
  }
}

export function addOrUpdateCustomRule(
  rawAddress: string,
  targetTinhCode: string,
  targetXaCode: string,
  note: string = ''
): CustomDictRule {
  const rules = getCustomDictRules();
  const trimmed = rawAddress.trim();
  const normalized = normalizeText(trimmed);

  // Extract human-readable names from codes (e.g. "25-Tỉnh Phú Thọ" -> "Tỉnh Phú Thọ")
  const tinhName = targetTinhCode.includes('-')
    ? targetTinhCode.split('-').slice(1).join('-').trim()
    : targetTinhCode;
  const xaName = targetXaCode.includes('-')
    ? targetXaCode.split('-').slice(1).join('-').trim()
    : targetXaCode;

  const now = new Date().toISOString();

  // Check if existing rule for this exact address exists
  const existingIdx = rules.findIndex(
    (r) => r.rawAddress.toLowerCase() === trimmed.toLowerCase() || r.normalizedAddress === normalized
  );

  let newRule: CustomDictRule;

  if (existingIdx >= 0) {
    newRule = {
      ...rules[existingIdx],
      targetTinhCode,
      targetXaCode,
      targetTinhName: tinhName,
      targetXaName: xaName,
      note: note || rules[existingIdx].note || '',
      updatedAt: now,
    };
    rules[existingIdx] = newRule;
  } else {
    newRule = {
      id: 'rule_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      rawAddress: trimmed,
      normalizedAddress: normalized,
      targetTinhCode,
      targetXaCode,
      targetTinhName: tinhName,
      targetXaName: xaName,
      note,
      createdAt: now,
      updatedAt: now,
    };
    rules.unshift(newRule);
  }

  saveCustomDictRules(rules);
  return newRule;
}

export function deleteCustomRule(id: string): void {
  const rules = getCustomDictRules();
  const filtered = rules.filter((r) => r.id !== id);
  saveCustomDictRules(filtered);
}

export function clearCustomDict(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/** Export custom dictionary as JSON download */
export function exportCustomDictFile(): void {
  const rules = getCustomDictRules();
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(
    now.getHours()
  )}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

  const payload = {
    version: '1.0.0',
    exportedAt: now.toISOString(),
    itemCount: rules.length,
    description: 'Thư viện quy tắc chuyển đổi địa chỉ thủ công VNCare — Nguyễn Sơn Nam',
    rules,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `VNCare_ThuVien_DiaChi_${timestamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Import custom dictionary from JSON string */
export function importCustomDictFromJson(jsonContent: string): {
  success: boolean;
  addedCount: number;
  message: string;
} {
  try {
    const data = JSON.parse(jsonContent);
    const incomingRules: CustomDictRule[] = Array.isArray(data)
      ? data
      : Array.isArray(data.rules)
      ? data.rules
      : [];

    if (incomingRules.length === 0) {
      return { success: false, addedCount: 0, message: 'Không tìm thấy danh sách quy tắc hợp lệ trong file JSON.' };
    }

    const currentRules = getCustomDictRules();
    let count = 0;

    for (const rule of incomingRules) {
      if (!rule.rawAddress || !rule.targetTinhCode || !rule.targetXaCode) continue;

      const norm = rule.normalizedAddress || normalizeText(rule.rawAddress);
      const idx = currentRules.findIndex(
        (r) => r.rawAddress.toLowerCase() === rule.rawAddress.toLowerCase() || r.normalizedAddress === norm
      );

      const formattedRule: CustomDictRule = {
        id: rule.id || 'rule_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        rawAddress: rule.rawAddress.trim(),
        normalizedAddress: norm,
        targetTinhCode: rule.targetTinhCode,
        targetXaCode: rule.targetXaCode,
        targetTinhName:
          rule.targetTinhName ||
          (rule.targetTinhCode.includes('-')
            ? rule.targetTinhCode.split('-').slice(1).join('-').trim()
            : rule.targetTinhCode),
        targetXaName:
          rule.targetXaName ||
          (rule.targetXaCode.includes('-')
            ? rule.targetXaCode.split('-').slice(1).join('-').trim()
            : rule.targetXaCode),
        note: rule.note || 'Nhập từ file JSON',
        createdAt: rule.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (idx >= 0) {
        currentRules[idx] = formattedRule;
      } else {
        currentRules.push(formattedRule);
        count++;
      }
    }

    saveCustomDictRules(currentRules);
    return {
      success: true,
      addedCount: count,
      message: `Đã nhập thành công ${incomingRules.length} quy tắc (${count} quy tắc mới).`,
    };
  } catch (err: any) {
    return {
      success: false,
      addedCount: 0,
      message: 'Lỗi định dạng file JSON: ' + (err.message || String(err)),
    };
  }
}
