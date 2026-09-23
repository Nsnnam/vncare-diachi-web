import React, { useState, useRef } from 'react';
import {
  Library,
  Plus,
  Trash2,
  Download,
  Upload,
  Search,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MapPin
} from 'lucide-react';
import { CustomDictRule } from '../types';
import {
  getCustomDictRules,
  addOrUpdateCustomRule,
  deleteCustomRule,
  clearCustomDict,
  exportCustomDictFile,
  importCustomDictFromJson,
} from '../services/customDictService';
import { PROVINCES_LIST, getCommunesForProvince } from '../services/addressEngine';

interface CustomDictionaryTabProps {
  onRulesChanged: () => void;
}

export const CustomDictionaryTab: React.FC<CustomDictionaryTabProps> = ({ onRulesChanged }) => {
  const [rules, setRules] = useState<CustomDictRule[]>(() => getCustomDictRules());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formAddress, setFormAddress] = useState<string>('');
  const [formTinh, setFormTinh] = useState<string>('');
  const [formXa, setFormXa] = useState<string>('');
  const [formNote, setFormNote] = useState<string>('');
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const communes = formTinh ? getCommunesForProvince(formTinh) : [];

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAddress.trim() || !formTinh || !formXa) {
      setMsg({ type: 'error', text: 'Vui lòng nhập địa chỉ gốc, chọn Tỉnh/TP và Xã/Phường!' });
      return;
    }

    addOrUpdateCustomRule(formAddress, formTinh, formXa, formNote);
    const updated = getCustomDictRules();
    setRules(updated);
    onRulesChanged();

    setFormAddress('');
    setFormTinh('');
    setFormXa('');
    setFormNote('');
    setMsg({ type: 'success', text: 'Đã lưu quy tắc mới vào Thư viện thành công!' });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa quy tắc này khỏi thư viện?')) {
      deleteCustomRule(id);
      const updated = getCustomDictRules();
      setRules(updated);
      onRulesChanged();
    }
  };

  const handleClearAll = () => {
    if (confirm('CẢNH BÁO: Thao tác này sẽ xóa toàn bộ quy tắc địa chỉ đã lưu trong thư viện. Bạn có chắc chắn không?')) {
      clearCustomDict();
      setRules([]);
      onRulesChanged();
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importCustomDictFromJson(content);
      if (res.success) {
        setRules(getCustomDictRules());
        onRulesChanged();
        setMsg({ type: 'success', text: res.message });
      } else {
        setMsg({ type: 'error', text: res.message });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Filtered rules
  const filteredRules = rules.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.rawAddress.toLowerCase().includes(q) ||
      r.targetTinhName.toLowerCase().includes(q) ||
      r.targetXaName.toLowerCase().includes(q) ||
      (r.note || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Library className="w-6 h-6 text-sky-600" />
            <h3 className="text-lg font-bold text-slate-900">Thư Viện Địa Chỉ Tùy Biến (Custom Dictionary)</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Nơi lưu trữ các quy tắc phiên địa chỉ do bạn chỉ định thủ công. Khi gặp lại các địa chỉ này trong bất kỳ file Excel nào, hệ thống sẽ ưu tiên áp dụng ngay quy tắc trong Thư viện để không bao giờ bị sót.
          </p>
        </div>

        {/* Global JSON Actions */}
        <div className="flex items-center space-x-2 shrink-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileImport}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-2xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="Nạp quy tắc từ file JSON đã sao lưu"
          >
            <Upload className="w-4 h-4 text-sky-600" />
            <span>Nhập JSON</span>
          </button>

          <button
            onClick={exportCustomDictFile}
            disabled={rules.length === 0}
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="Tải toàn bộ quy tắc ra file JSON để sao lưu hoặc gửi đồng nghiệp"
          >
            <Download className="w-4 h-4" />
            <span>Xuất JSON ({rules.length})</span>
          </button>

          {rules.length > 0 && (
            <button
              onClick={handleClearAll}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-200"
              title="Xóa toàn bộ thư viện"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Alert Notification */}
      {msg && (
        <div
          className={`p-4 rounded-xl text-xs font-medium flex items-center justify-between border ${
            msg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {msg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span>{msg.text}</span>
          </div>
          <button onClick={() => setMsg(null)} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>
      )}

      {/* Add New Rule Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center space-x-1.5">
          <Plus className="w-4 h-4 text-sky-600" />
          <span>Thêm Quy Tắc Phiên Địa Chỉ Mới</span>
        </h4>

        <form onSubmit={handleAddRule} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-4">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Chuỗi Địa chỉ gốc / Từ khóa trong file:
            </label>
            <input
              type="text"
              value={formAddress}
              onChange={(e) => setFormAddress(e.target.value)}
              placeholder="VD: TDP Nam Đầm Vạc, Vĩnh Phúc..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tỉnh / TP đích (34 tỉnh):</label>
            <select
              value={formTinh}
              onChange={(e) => {
                setFormTinh(e.target.value);
                setFormXa('');
              }}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            >
              <option value="">-- Chọn Tỉnh / TP --</option>
              {PROVINCES_LIST.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.code}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Xã / Phường đích:</label>
            <select
              value={formXa}
              disabled={!formTinh}
              onChange={(e) => setFormXa(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500 disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="">-- Chọn Xã / Phường --</option>
              {communes.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Lưu quy tắc</span>
            </button>
          </div>
        </form>
      </div>

      {/* Rules Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm text-slate-800">Danh sách quy tắc đã lưu</span>
            <span className="bg-sky-100 text-sky-800 text-xs font-semibold px-2 py-0.5 rounded-full">
              {rules.length} quy tắc
            </span>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm quy tắc..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-100/75 text-slate-700 font-semibold">
              <tr>
                <th className="px-4 py-2.5 text-left w-12">#</th>
                <th className="px-4 py-2.5 text-left min-w-[200px]">Địa chỉ gốc / Từ khóa</th>
                <th className="px-4 py-2.5 text-left w-48">Mã Tỉnh đích</th>
                <th className="px-4 py-2.5 text-left w-52">Mã Xã đích</th>
                <th className="px-4 py-2.5 text-left w-36">Ghi chú</th>
                <th className="px-4 py-2.5 text-center w-20">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredRules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400 italic">
                    {rules.length === 0
                      ? 'Thư viện tùy biến hiện đang trống. Hãy thêm các quy tắc mới hoặc nạp từ file JSON.'
                      : 'Không tìm thấy quy tắc nào khớp với từ khóa tìm kiếm.'}
                  </td>
                </tr>
              ) : (
                filteredRules.map((rule, idx) => (
                  <tr key={rule.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2.5 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-800">
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span>{rule.rawAddress}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        {rule.targetTinhCode}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {rule.targetXaCode}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-500 italic">{rule.note || '—'}</td>
                    <td className="px-4 py-2.5 text-center">
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa quy tắc này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
