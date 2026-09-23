import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Save, X, Search, Sparkles, MapPin } from 'lucide-react';
import { ProcessedRow } from '../types';
import { PROVINCES_LIST, getCommunesForProvince } from '../services/addressEngine';

interface UnmappedDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  processedRows: ProcessedRow[];
  onApplyManualFix: (rawAddress: string, tinhCode: string, xaCode: string, saveToDict: boolean) => void;
}

export const UnmappedDrawer: React.FC<UnmappedDrawerProps> = ({
  isOpen,
  onClose,
  processedRows,
  onApplyManualFix,
}) => {
  if (!isOpen) return null;

  // Filter only unresolved or empty rows
  const unmappedRows = processedRows.filter((r) => r.status === 'unresolved' && r.rawAddress);

  // Group by unique raw address
  const uniqueAddressesMap: Map<string, { rows: ProcessedRow[]; count: number }> = new Map();
  unmappedRows.forEach((r) => {
    const key = r.rawAddress.trim();
    if (!uniqueAddressesMap.has(key)) {
      uniqueAddressesMap.set(key, { rows: [], count: 0 });
    }
    const group = uniqueAddressesMap.get(key)!;
    group.rows.push(r);
    group.count++;
  });

  const uniqueList = Array.from(uniqueAddressesMap.entries());

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">
                Địa Chỉ Chưa Khớp ({unmappedRows.length} dòng / {uniqueList.length} địa chỉ duy nhất)
              </h3>
              <p className="text-xs text-amber-100">
                Chọn Tỉnh & Xã thủ công để cập nhật toàn bộ dòng và lưu vào Thư viện dùng cho các lần sau.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {uniqueList.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h4 className="font-semibold text-slate-800 text-base">Tuyệt vời! Tất cả địa chỉ đã được phiên.</h4>
              <p className="text-xs text-slate-500 mt-1">Không còn dòng nào chưa được nhận diện.</p>
            </div>
          ) : (
            uniqueList.map(([rawAddr, info], idx) => (
              <UnmappedItemRow
                key={idx}
                rawAddress={rawAddr}
                rows={info.rows}
                count={info.count}
                onApply={(tinh, xa, saveDict) => onApplyManualFix(rawAddr, tinh, xa, saveDict)}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-between items-center shrink-0">
          <span className="text-xs text-slate-500">
            Mẹo: Khi lưu vào Thư viện, hệ thống sẽ tự động phiên chuẩn cho mọi file nạp sau này.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

interface UnmappedItemRowProps {
  rawAddress: string;
  rows: ProcessedRow[];
  count: number;
  onApply: (tinhCode: string, xaCode: string, saveDict: boolean) => void;
}

const UnmappedItemRow: React.FC<UnmappedItemRowProps> = ({ rawAddress, rows, count, onApply }) => {
  const [selectedTinh, setSelectedTinh] = useState<string>('');
  const [selectedXa, setSelectedXa] = useState<string>('');
  const [saveToDict, setSaveToDict] = useState<boolean>(true);
  const [applied, setApplied] = useState<boolean>(false);

  const communes = selectedTinh ? getCommunesForProvince(selectedTinh) : [];

  const handleApply = () => {
    if (!selectedTinh || !selectedXa) {
      alert('Vui lòng chọn cả Tỉnh/TP và Xã/Phường!');
      return;
    }
    onApply(selectedTinh, selectedXa, saveToDict);
    setApplied(true);
  };

  if (applied) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between text-emerald-800 text-sm">
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span className="font-medium">Đã cập nhật thành công cho:</span>
          <span className="font-mono text-xs font-semibold">{rawAddress}</span>
        </div>
        <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
          {count} dòng đã điền
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-start space-x-2">
          <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-800 text-sm">{rawAddress}</span>
            <div className="text-xs text-slate-500 mt-0.5">
              Áp dụng cho <strong>{count} dòng</strong> trong file (Dòng ví dụ: #{rows[0]?.rowIndex + 1} -{' '}
              {rows[0]?.name || 'Không có tên'})
            </div>
          </div>
        </div>
        <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-semibold self-start sm:self-auto">
          {count} dòng
        </span>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Province Select */}
        <div className="sm:col-span-4">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tỉnh / Thành phố (34 tỉnh):</label>
          <select
            value={selectedTinh}
            onChange={(e) => {
              setSelectedTinh(e.target.value);
              setSelectedXa('');
            }}
            className="w-full text-xs py-2 px-2.5 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
          >
            <option value="">-- Chọn Tỉnh / Thành phố --</option>
            {PROVINCES_LIST.map((p) => (
              <option key={p.code} value={p.code}>
                {p.code}
              </option>
            ))}
          </select>
        </div>

        {/* Commune Select */}
        <div className="sm:col-span-5">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Xã / Phường / Thị trấn {communes.length > 0 && `(${communes.length})`}:
          </label>
          <select
            value={selectedXa}
            disabled={!selectedTinh}
            onChange={(e) => setSelectedXa(e.target.value)}
            className="w-full text-xs py-2 px-2.5 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500 disabled:bg-slate-100 disabled:text-slate-400"
          >
            <option value="">-- Chọn Xã / Phường --</option>
            {communes.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code}
              </option>
            ))}
          </select>
        </div>

        {/* Action Button */}
        <div className="sm:col-span-3 flex flex-col justify-end">
          <div className="flex items-center space-x-1.5 mb-1.5">
            <input
              type="checkbox"
              id={`save-dict-${rawAddress}`}
              checked={saveToDict}
              onChange={(e) => setSaveToDict(e.target.checked)}
              className="rounded text-sky-600 focus:ring-sky-500 w-3.5 h-3.5"
            />
            <label htmlFor={`save-dict-${rawAddress}`} className="text-[11px] text-slate-600 cursor-pointer select-none">
              Lưu vào Thư viện
            </label>
          </div>
          <button
            onClick={handleApply}
            disabled={!selectedTinh || !selectedXa}
            className="w-full py-1.5 px-3 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center justify-center space-x-1 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Áp dụng</span>
          </button>
        </div>
      </div>
    </div>
  );
};
