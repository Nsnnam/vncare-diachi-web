export interface ProvinceItem {
  code: string; // e.g. "25-Tỉnh Phú Thọ"
  id: string; // "25"
  name: string; // "Tỉnh Phú Thọ"
  normName: string;
  coreName: string;
}

export interface CommuneItem {
  code: string; // e.g. "07900-Phường Việt Trì"
  id: string; // "07900"
  name: string; // "Phường Việt Trì"
  tinhName: string; // "Tỉnh Phú Thọ"
  tinhCode: string; // "25-Tỉnh Phú Thọ"
  tags: string; // "ptvt"
  placeId: string;
  normName: string;
  coreName: string;
}

export interface AddressOldRecord {
  xa_cu: string;
  huyen_cu: string;
  tinh_cu: string;
  xa_moi: string;
  tinh_moi: string;
  tags?: string;
  place_id?: string;
}

export interface CustomDictRule {
  id: string;
  rawAddress: string;
  normalizedAddress: string;
  targetTinhCode: string;
  targetXaCode: string;
  targetTinhName: string;
  targetXaName: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export type ResolveStatus = 'resolved' | 'custom' | 'unresolved' | 'empty';

export interface ResolveResult {
  status: ResolveStatus;
  tinhCode: string;
  xaCode: string;
  tinhName: string;
  xaName: string;
  method: string;
  confidence: number;
}

export interface ProcessedRow {
  rowIndex: number; // 0-based index in data
  stt?: number | string;
  name?: string;
  rawAddress: string;
  resolvedTinh: string;
  resolvedXa: string;
  status: ResolveStatus;
  method: string;
  originalRowData: any[];
  isManualOverride?: boolean;
}

export type ProcessingMode = 'inplace' | 'convert_to_vncare_template';

export interface ColumnMapping {
  addressCol: number;
  tinhCol?: number;
  xaCol?: number;
  nameCol?: number;
  dobCol?: number;
  genderCol?: number;
  cccdCol?: number;
  cccdDateCol?: number;
  cccdPlaceCol?: number;
  workplaceCol?: number;
  phoneCol?: number;
  jobCol?: number;
  ethnicityCol?: number;
  nationCol?: number;
}
