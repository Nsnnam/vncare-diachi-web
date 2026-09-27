import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Bookmark,
  Search,
  Edit3,
  Check,
  X,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  ArrowRightLeft,
  Sparkles,
  Layers,
  MapPin,
  CheckCheck
} from 'lucide-react';
import { ProcessedRow } from '../types';
import { PROVINCES_LIST, getCommunesForProvince } from '../services/addressEngine';

interface PreviewTableProps {
  rows: ProcessedRow[];
  onUpdateRow: (rowIndex: number, tinhCode: string, xaCode: string, saveDict?: boolean) => void;
  selectedFilter?: string;
  onFilterChange?: (filter: string) => void;
}

export const PreviewTable: React.FC<PreviewTableProps> = ({
  rows,
  onUpdateRow,
  selectedFilter,
  onFilterChange
}) => {
  const [internalFilter, setInternalFilter] = useState<'all' | '3_tier' | '2_tier' | 'custom' | 'unresolved' | 'warning'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  const activeFilter = (selectedFilter as any) || internalFilter;

  const handleSetFilter = (f: 'all' | '3_tier' | '2_tier' | 'custom' | 'unresolved' | 'warning') => {
    if (onFilterChange) {
      onFilterChange(f);
    } else {
      setInternalFilter(f);
    }
    setPage(1);
  };

  // In-line editing state
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [editTinh, setEditTinh] = useState<string>('');
  const [editXa, setEditXa] = useState<string>('');
  const [editSaveToDict, setEditSaveToDict] = useState<boolean>(true);

  // Statistics for filters
  const count3Cap = rows.filter((r) => r.resolutionType === '3_tier_conversion').length;
  const count2Cap = rows.filter((r) => r.resolutionType === '2_tier_exact').length;
  const countCustom = rows.filter((r) => r.status === 'custom').length;
  const countUnresolved = rows.filter((r) => r.status === 'unresolved').length;
  const countWarning = rows.filter((r) => r.isMissingMandatory).length;

  // Filtered rows
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      // Comparison / Status filter
      if (activeFilter === '3_tier' && r.resolutionType !== '3_tier_conversion') return false;
      if (activeFilter === '2_tier' && r.resolutionType !== '2_tier_exact') return false;
      if (activeFilter === 'custom' && r.status !== 'custom') return false;
      if (activeFilter === 'unresolved' && r.status !== 'unresolved') return false;
      if (activeFilter === 'warning' && !r.isMissingMandatory) return false;

      // Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const inAddr = r.rawAddress.toLowerCase().includes(q);
        const inName = (r.name || '').toLowerCase().includes(q);
        const inTinh = r.resolvedTinh.toLowerCase().includes(q);
        const inXa = r.resolvedXa.toLowerCase().includes(q);
        const inCccd = (r.cccdFormatted || '').toLowerCase().includes(q);
        const inMethod = (r.method || '').toLowerCase().includes(q);
        if (!inAddr && !inName && !inTinh && !inXa && !inCccd && !inMethod) return false;
      }

      return true;
    });
  }, [rows, activeFilter, searchTerm]);

  // Paginated rows
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  const startEdit = (row: ProcessedRow) => {
    setEditingRowIndex(row.rowIndex);
    setEditTinh(row.resolvedTinh || '');
    setEditXa(row.resolvedXa || '');
    setEditSaveToDict(true);
  };

  const cancelEdit = () => {
    setEditingRowIndex(null);
    setEditTinh('');
    setEditXa('');
  };

  const saveEdit = (row: ProcessedRow) => {
    if (!editTinh || !editXa) {
      alert('Vui lòng chọn cả Tỉnh và Xã!');
      return;
    }
    onUpdateRow(row.rowIndex, editTinh, editXa, editSaveToDict);
    setEditingRowIndex(null);
  };

  const communesForEdit = editTinh ? getCommunesForProvince(editTinh) : [];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Reconciliation Title & Controls Bar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>BẢNG ĐỐI CHIẾU DỮ LIỆU ĐẦU VÀO VÀ ĐẦU RA CHUẨN VNCARE</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              So sánh trực quan giữa dữ liệu gốc trong file nạp và các trường dữ liệu đã được phiên mã & chuẩn hóa.
            </p>
          </div>

          {/* Search & page size input */}
          <div className="flex items-center space-x-2 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                placeholder="Tìm tên, CCCD, địa chỉ..."
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white w-48 sm:w-60 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="text-xs py-1.5 px-2 border border-slate-300 rounded-lg bg-white"
            >
              <option value={25}>25 dòng/trang</option>
              <option value={50}>50 dòng/trang</option>
              <option value={100}>100 dòng/trang</option>
            </select>
          </div>
        </div>

        {/* Comparison Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <button
            onClick={() => handleSetFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'all'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Tất cả ({rows.length})
          </button>

          <button
            onClick={() => handleSetFilter('3_tier')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${
              activeFilter === '3_tier'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Chuyển đổi 3 cấp ➔ 2 cấp ({count3Cap})</span>
          </button>

          <button
            onClick={() => handleSetFilter('2_tier')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${
              activeFilter === '2_tier'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Khớp 2 cấp ({count2Cap})</span>
          </button>

          <button
            onClick={() => handleSetFilter('custom')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${
              activeFilter === 'custom'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Từ Thư viện ({countCustom})</span>
          </button>

          <button
            onClick={() => handleSetFilter('unresolved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${
              activeFilter === 'unresolved'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Chưa khớp ({countUnresolved})</span>
          </button>

          {countWarning > 0 && (
            <button
              onClick={() => handleSetFilter('warning')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${
                activeFilter === 'warning'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'bg-white text-red-700 hover:bg-red-50 border border-red-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              <span>Cảnh báo dữ liệu ({countWarning})</span>
            </button>
          )}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-xs border-collapse">
          {/* Header Row 1: Section Grouping */}
          <thead>
            <tr>
              <th
                colSpan={4}
                className="bg-slate-200/90 text-slate-800 text-center font-bold py-2 border-r-2 border-slate-300 text-[11px] uppercase tracking-wider"
              >
                1. Dữ liệu gốc đầu vào (Input)
              </th>
              <th
                colSpan={6}
                className="bg-emerald-100/90 text-emerald-900 text-center font-bold py-2 text-[11px] uppercase tracking-wider"
              >
                2. Kết quả đối chiếu & Chuẩn hóa VNCare (Output)
              </th>
            </tr>
            {/* Header Row 2: Columns */}
            <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 text-[11px]">
              {/* Input Group */}
              <th scope="col" className="px-2.5 py-2 text-center w-12 border-r border-slate-200">STT</th>
              <th scope="col" className="px-3 py-2 text-left w-36 border-r border-slate-200">Họ và tên</th>
              <th scope="col" className="px-2.5 py-2 text-center w-28 border-r border-slate-200">Ngày sinh / CCCD</th>
              <th scope="col" className="px-3 py-2 text-left min-w-[200px] border-r-2 border-slate-300">
                Địa chỉ gốc (Cột N)
              </th>

              {/* Output Group */}
              <th scope="col" className="px-3 py-2 text-left w-40 bg-emerald-50/50 border-r border-slate-200">
                Tỉnh đã phiên (Cột L)
              </th>
              <th scope="col" className="px-3 py-2 text-left w-44 bg-emerald-50/50 border-r border-slate-200">
                Xã đã phiên (Cột M)
              </th>
              <th scope="col" className="px-2.5 py-2 text-center w-28 bg-emerald-50/50 border-r border-slate-200">
                CCCD chuẩn (12 số)
              </th>
              <th scope="col" className="px-2.5 py-2 text-center w-24 bg-emerald-50/50 border-r border-slate-200">
                Ngày sinh (DD/MM/YYYY)
              </th>
              <th scope="col" className="px-3 py-2 text-left min-w-[170px] bg-emerald-50/50 border-r border-slate-200">
                Quy tắc đối chiếu
              </th>
              <th scope="col" className="px-2.5 py-2 text-center w-16 bg-emerald-50/50">
                Thao tác
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-10 text-center text-slate-400 italic">
                  Không tìm thấy dòng dữ liệu nào phù hợp với bộ lọc đối chiếu hiện tại.
                </td>
              </tr>
            ) : (
              paginatedRows.map((row) => {
                const isEditing = editingRowIndex === row.rowIndex;

                return (
                  <tr
                    key={row.rowIndex}
                    className={`hover:bg-sky-50/40 transition-colors ${
                      row.isMissingMandatory
                        ? 'bg-rose-50/30'
                        : row.status === 'unresolved'
                        ? 'bg-red-50/40'
                        : row.status === 'custom'
                        ? 'bg-amber-50/20'
                        : row.resolutionType === '3_tier_conversion'
                        ? 'bg-indigo-50/15'
                        : ''
                    }`}
                  >
                    {/* INPUT 1: STT (Auto-sequenced 1..N) */}
                    <td className="px-2.5 py-2 text-center font-mono font-bold text-slate-700 bg-slate-50/60 border-r border-slate-200">
                      {row.stt}
                    </td>

                    {/* INPUT 2: Họ và tên */}
                    <td className="px-3 py-2 font-medium text-slate-900 border-r border-slate-200">
                      <div>{row.name || <span className="text-amber-600 italic">Bệnh nhân {row.stt}</span>}</div>
                      <div className="text-[10px] text-slate-400">{row.genderFormatted}</div>
                    </td>

                    {/* INPUT 3: Ngày sinh & CCCD gốc */}
                    <td className="px-2.5 py-2 text-center text-[11px] font-mono border-r border-slate-200 text-slate-600">
                      <div title="Ngày sinh đọc từ file">{row.rawDob || <span className="text-slate-300 italic">—</span>}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[100px] mx-auto" title="CCCD đọc từ file">
                        {row.rawCccd || <span className="text-slate-300 italic">—</span>}
                      </div>
                    </td>

                    {/* INPUT 4: Địa chỉ gốc */}
                    <td className="px-3 py-2 text-slate-700 border-r-2 border-slate-300 max-w-xs">
                      <div className="text-xs break-words" title={row.rawAddress}>
                        {row.rawAddress || <span className="text-slate-300 italic">(Địa chỉ trống)</span>}
                      </div>
                    </td>

                    {/* OUTPUT 1: Tỉnh (Cột L) */}
                    <td className="px-3 py-2 bg-emerald-50/20 border-r border-slate-200">
                      {isEditing ? (
                        <select
                          value={editTinh}
                          onChange={(e) => {
                            setEditTinh(e.target.value);
                            setEditXa('');
                          }}
                          className="w-full text-xs py-1 px-1.5 border border-sky-400 rounded bg-white font-medium"
                        >
                          <option value="">-- Chọn Tỉnh --</option>
                          {PROVINCES_LIST.map((p) => (
                            <option key={p.code} value={p.code}>
                              {p.code}
                            </option>
                          ))}
                        </select>
                      ) : row.resolvedTinh ? (
                        <span className="font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 block truncate" title={row.resolvedTinh}>
                          {row.resolvedTinh}
                        </span>
                      ) : (
                        <span className="text-rose-500 font-medium italic">Chưa có</span>
                      )}
                    </td>

                    {/* OUTPUT 2: Xã (Cột M) */}
                    <td className="px-3 py-2 bg-emerald-50/20 border-r border-slate-200">
                      {isEditing ? (
                        <select
                          value={editXa}
                          disabled={!editTinh}
                          onChange={(e) => setEditXa(e.target.value)}
                          className="w-full text-xs py-1 px-1.5 border border-sky-400 rounded bg-white disabled:bg-slate-100 font-medium"
                        >
                          <option value="">-- Chọn Xã --</option>
                          {communesForEdit.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.code}
                            </option>
                          ))}
                        </select>
                      ) : row.resolvedXa ? (
                        <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 block truncate" title={row.resolvedXa}>
                          {row.resolvedXa}
                        </span>
                      ) : (
                        <span className="text-rose-500 font-medium italic">Chưa có</span>
                      )}
                    </td>

                    {/* OUTPUT 3: CCCD chuẩn VNCare (12 số / 8-11 alphanumeric) */}
                    <td className="px-2.5 py-2 text-center font-mono bg-emerald-50/20 border-r border-slate-200">
                      {row.isCccdValid ? (
                        <span className="font-bold text-slate-800" title={row.cccdFormatted.length === 12 ? 'CCCD 12 chữ số' : 'CMND / Hộ chiếu'}>
                          {row.cccdFormatted}
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-rose-200" title="Chưa đúng chuẩn 12 số hoặc 8-11 alphanumeric">
                          {row.cccdFormatted || 'Thiếu'}
                        </span>
                      )}
                    </td>

                    {/* OUTPUT 4: Ngày sinh chuẩn DD/MM/YYYY */}
                    <td className="px-2.5 py-2 text-center font-mono bg-emerald-50/20 border-r border-slate-200">
                      {row.isDobValid ? (
                        <span className="font-semibold text-slate-800">{row.dobFormatted}</span>
                      ) : (
                        <span className="inline-flex items-center text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded text-[10px] font-semibold" title="Chưa đúng chuẩn DD/MM/YYYY">
                          {row.dobFormatted || 'Thiếu'}
                        </span>
                      )}
                    </td>

                    {/* OUTPUT 5: Quy tắc đối chiếu & Trạng thái */}
                    <td className="px-3 py-2 bg-emerald-50/20 border-r border-slate-200">
                      <div className="space-y-1">
                        {row.resolutionType === '3_tier_conversion' && (
                          <span className="inline-flex items-center text-[10px] text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded-full font-bold shadow-2xs" title={row.method}>
                            <ArrowRightLeft className="w-3 h-3 mr-1 text-indigo-600" />
                            3 cấp ➔ 2 cấp mới
                          </span>
                        )}

                        {row.resolutionType === '2_tier_exact' && (
                          <span className="inline-flex items-center text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold shadow-2xs" title={row.method}>
                            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                            Khớp 2 cấp chuẩn
                          </span>
                        )}

                        {row.status === 'custom' && (
                          <span className="inline-flex items-center text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-bold shadow-2xs" title={row.method}>
                            <Bookmark className="w-3 h-3 mr-1 text-amber-600" />
                            Thư viện thủ công
                          </span>
                        )}

                        {row.status === 'unresolved' && (
                          <span className="inline-flex items-center text-[10px] text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full font-bold shadow-2xs" title="Chưa thể nhận diện">
                            <AlertCircle className="w-3 h-3 mr-1 text-rose-600" />
                            Chưa khớp
                          </span>
                        )}

                        {row.status === 'empty' && (
                          <span className="text-[10px] text-slate-400 italic">Địa chỉ trống</span>
                        )}

                        {row.isMissingMandatory && row.missingFields.length > 0 && (
                          <div className="text-[10px] text-rose-600 font-medium truncate" title={`Thiếu trường: ${row.missingFields.join(', ')}`}>
                            ⚠ Cần bổ sung: {row.missingFields.slice(0, 2).join(', ')}{row.missingFields.length > 2 ? '...' : ''}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* OUTPUT 6: Thao tác sửa nhanh */}
                    <td className="px-2.5 py-2 text-center bg-emerald-50/20">
                      {isEditing ? (
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => saveEdit(row)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            title="Lưu sửa đổi"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                            title="Hủy"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(row)}
                          className="px-2 py-1 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded text-[11px] font-medium flex items-center space-x-0.5 mx-auto transition-colors"
                          title="Sửa Tỉnh/Xã cho dòng này"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Sửa</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 bg-slate-50/50">
        <div>
          Đang xem <strong>{filteredRows.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> -{' '}
          <strong>{Math.min(currentPage * pageSize, filteredRows.length)}</strong> trên tổng số{' '}
          <strong>{filteredRows.length}</strong> dòng đối chiếu
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setPage(1)}
            disabled={currentPage <= 1}
            className="px-2 py-1 border border-slate-200 rounded bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Đầu
          </button>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="px-2.5 py-1 border border-slate-200 rounded bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Trước
          </button>
          <span className="px-2 font-medium text-slate-700">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="px-2.5 py-1 border border-slate-200 rounded bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Sau
          </button>
          <button
            onClick={() => setPage(totalPages)}
            disabled={currentPage >= totalPages}
            className="px-2 py-1 border border-slate-200 rounded bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Cuối
          </button>
        </div>
      </div>
    </div>
  );
};
