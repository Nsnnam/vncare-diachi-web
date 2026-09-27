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
  User,
  Calendar,
  CreditCard,
  Building
} from 'lucide-react';
import { ProcessedRow } from '../types';
import { PROVINCES_LIST, getCommunesForProvince } from '../services/addressEngine';

interface PreviewTableProps {
  rows: ProcessedRow[];
  onUpdateRow: (rowIndex: number, tinhCode: string, xaCode: string, saveDict?: boolean) => void;
}

export const PreviewTable: React.FC<PreviewTableProps> = ({ rows, onUpdateRow }) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'resolved' | 'unresolved' | 'custom' | 'warning'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // In-line editing state
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [editTinh, setEditTinh] = useState<string>('');
  const [editXa, setEditXa] = useState<string>('');
  const [editSaveToDict, setEditSaveToDict] = useState<boolean>(true);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      // Status filter
      if (filterStatus === 'resolved' && r.status !== 'resolved') return false;
      if (filterStatus === 'unresolved' && r.status !== 'unresolved') return false;
      if (filterStatus === 'custom' && r.status !== 'custom') return false;
      if (filterStatus === 'warning' && !r.isMissingMandatory) return false;

      // Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const inAddr = r.rawAddress.toLowerCase().includes(q);
        const inName = (r.name || '').toLowerCase().includes(q);
        const inTinh = r.resolvedTinh.toLowerCase().includes(q);
        const inXa = r.resolvedXa.toLowerCase().includes(q);
        const inCccd = (r.cccdFormatted || '').toLowerCase().includes(q);
        if (!inAddr && !inName && !inTinh && !inXa && !inCccd) return false;
      }

      return true;
    });
  }, [rows, filterStatus, searchTerm]);

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

  const warningCount = rows.filter((r) => r.isMissingMandatory).length;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Controls Bar */}
      <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => { setFilterStatus('all'); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterStatus === 'all'
                ? 'bg-slate-800 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Tất cả ({rows.length})
          </button>

          <button
            onClick={() => { setFilterStatus('resolved'); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1 ${
              filterStatus === 'resolved'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Đã phiên ({rows.filter((r) => r.status === 'resolved').length})</span>
          </button>

          <button
            onClick={() => { setFilterStatus('unresolved'); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1 ${
              filterStatus === 'unresolved'
                ? 'bg-red-600 text-white'
                : 'bg-white text-red-700 hover:bg-red-50 border border-red-200'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Chưa khớp ({rows.filter((r) => r.status === 'unresolved').length})</span>
          </button>

          <button
            onClick={() => { setFilterStatus('custom'); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1 ${
              filterStatus === 'custom'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Thư viện ({rows.filter((r) => r.status === 'custom').length})</span>
          </button>

          {warningCount > 0 && (
            <button
              onClick={() => { setFilterStatus('warning'); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1 ${
                filterStatus === 'warning'
                  ? 'bg-rose-600 text-white'
                  : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>Cảnh báo bắt buộc ({warningCount})</span>
            </button>
          )}
        </div>

        {/* Search input */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              placeholder="Tìm theo tên, CCCD hoặc địa chỉ..."
              className="pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white w-48 sm:w-64 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-xs">
          <thead className="bg-slate-100/75 text-slate-700 font-semibold">
            <tr>
              <th scope="col" className="px-2.5 py-2.5 text-center w-12" title="Số thứ tự bắt buộc (1..N)">STT</th>
              <th scope="col" className="px-3 py-2.5 text-left w-36">Họ tên BN</th>
              <th scope="col" className="px-3 py-2.5 text-center w-28" title="Định dạng DD/MM/YYYY">Ngày sinh</th>
              <th scope="col" className="px-2.5 py-2.5 text-center w-20">Giới tính</th>
              <th scope="col" className="px-3 py-2.5 text-left w-36" title="12 chữ số hoặc 8-11 ký tự alphanumeric">CCCD</th>
              <th scope="col" className="px-3 py-2.5 text-left min-w-[180px]">Địa chỉ gốc</th>
              <th scope="col" className="px-3 py-2.5 text-left w-40">Tỉnh (Cột L)</th>
              <th scope="col" className="px-3 py-2.5 text-left w-44">Xã (Cột M)</th>
              <th scope="col" className="px-3 py-2.5 text-left w-36">Trạng thái</th>
              <th scope="col" className="px-3 py-2.5 text-center w-20">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-slate-400 italic">
                  Không tìm thấy dòng dữ liệu nào phù hợp điều kiện lọc.
                </td>
              </tr>
            ) : (
              paginatedRows.map((row) => {
                const isEditing = editingRowIndex === row.rowIndex;

                return (
                  <tr
                    key={row.rowIndex}
                    className={`hover:bg-slate-50 transition-colors ${
                      row.isMissingMandatory
                        ? 'bg-rose-50/20'
                        : row.status === 'unresolved'
                        ? 'bg-red-50/30'
                        : row.status === 'custom'
                        ? 'bg-amber-50/20'
                        : ''
                    }`}
                  >
                    {/* STT (1..N auto-filled) */}
                    <td className="px-2.5 py-2 text-center text-slate-700 font-mono font-bold bg-slate-50/50">
                      {row.stt}
                    </td>

                    {/* Họ và tên */}
                    <td className="px-3 py-2 font-medium text-slate-900">
                      {row.name ? (
                        <span>{row.name}</span>
                      ) : (
                        <span className="text-amber-600 italic">Bệnh nhân {row.stt}</span>
                      )}
                    </td>

                    {/* Ngày sinh (DD/MM/YYYY) */}
                    <td className="px-3 py-2 text-center font-mono">
                      {row.isDobValid ? (
                        <span className="text-slate-800 font-medium">{row.dobFormatted}</span>
                      ) : (
                        <span className="inline-flex items-center text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded text-[11px] font-semibold" title="Chưa đúng chuẩn DD/MM/YYYY">
                          {row.dobFormatted || 'Thiếu'}
                        </span>
                      )}
                    </td>

                    {/* Giới tính */}
                    <td className="px-2.5 py-2 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                        row.genderFormatted === '2-NỮ'
                          ? 'bg-pink-50 text-pink-700 border border-pink-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {row.genderFormatted}
                      </span>
                    </td>

                    {/* CCCD (8-11 alphanumeric or 12 digits) */}
                    <td className="px-3 py-2 font-mono">
                      {row.isCccdValid ? (
                        <span className="font-semibold text-slate-800" title={row.cccdFormatted.length === 12 ? 'CCCD 12 chữ số' : 'CMND / Hộ chiếu'}>
                          {row.cccdFormatted}
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded text-[11px] font-semibold border border-rose-200" title="Chưa đúng chuẩn 12 chữ số hoặc 8-11 ký tự alphanumeric">
                          {row.cccdFormatted || 'Thiếu'}
                        </span>
                      )}
                    </td>

                    {/* Địa chỉ gốc */}
                    <td className="px-3 py-2 text-slate-700">
                      <div className="max-w-xs truncate" title={row.rawAddress}>
                        {row.rawAddress || <span className="text-slate-300 italic">(Trống)</span>}
                      </div>
                    </td>

                    {/* Column L: Tinh */}
                    <td className="px-3 py-2">
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
                        <span className="font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                          {row.resolvedTinh}
                        </span>
                      ) : (
                        <span className="text-rose-500 font-medium italic">Chưa có</span>
                      )}
                    </td>

                    {/* Column M: Xa */}
                    <td className="px-3 py-2">
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
                        <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {row.resolvedXa}
                        </span>
                      ) : (
                        <span className="text-rose-500 font-medium italic">Chưa có</span>
                      )}
                    </td>

                    {/* Method / Status */}
                    <td className="px-3 py-2">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-1.5">
                          {row.status === 'resolved' && (
                            <span className="inline-flex items-center text-[11px] text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full font-medium">
                              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                              {row.method}
                            </span>
                          )}
                          {row.status === 'custom' && (
                            <span className="inline-flex items-center text-[11px] text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full font-medium">
                              <Bookmark className="w-3 h-3 mr-1 text-amber-600" />
                              {row.method}
                            </span>
                          )}
                          {row.status === 'unresolved' && (
                            <span className="inline-flex items-center text-[11px] text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded-full font-semibold">
                              <AlertCircle className="w-3 h-3 mr-1 text-rose-600" />
                              Chưa khớp
                            </span>
                          )}
                          {row.status === 'empty' && (
                            <span className="text-[11px] text-slate-400 italic">Trống</span>
                          )}
                        </div>

                        {row.isMissingMandatory && row.missingFields.length > 0 && (
                          <div className="text-[10px] text-rose-600 font-medium truncate" title={`Thiếu hoặc chưa chuẩn: ${row.missingFields.join(', ')}`}>
                            ⚠ Thiếu: {row.missingFields.slice(0, 2).join(', ')}{row.missingFields.length > 2 ? '...' : ''}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-2 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => saveEdit(row)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            title="Lưu sửa đổi"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                            title="Hủy"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(row)}
                          className="px-2 py-1 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded text-[11px] font-medium flex items-center space-x-1 mx-auto transition-colors"
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
          Hiển thị <strong>{filteredRows.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> -{' '}
          <strong>{Math.min(currentPage * pageSize, filteredRows.length)}</strong> trên tổng số{' '}
          <strong>{filteredRows.length}</strong> dòng
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
