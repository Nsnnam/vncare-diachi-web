import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Bookmark,
  Download,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  ArrowRight,
  FileCheck,
  FileDown,
  ShieldCheck,
  Calendar,
  CreditCard,
  Hash
} from 'lucide-react';
import { ColumnMapping, ProcessedRow, ProcessingMode } from '../types';
import {
  ParsedWorkbookData,
  readWorkbook,
  switchSheet,
  processAddressRows,
  exportInplaceFile,
  exportVncareTemplateFile,
  downloadExcelFile,
  generateOutputFilename,
} from '../services/excelService';
import { addOrUpdateCustomRule } from '../services/customDictService';
import { PreviewTable } from './PreviewTable';
import { UnmappedDrawer } from './UnmappedDrawer';

interface ExcelProcessorTabProps {
  onCustomDictUpdated: () => void;
}

export const ExcelProcessorTab: React.FC<ExcelProcessorTabProps> = ({ onCustomDictUpdated }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [wbData, setWbData] = useState<ParsedWorkbookData | null>(null);

  // Settings
  const [mode, setMode] = useState<ProcessingMode>('inplace');
  const [mapping, setMapping] = useState<ColumnMapping>({ addressCol: -1 });
  const [dotKham, setDotKham] = useState<string>(() => {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}${m}`;
  });
  const [defaultJob, setDefaultJob] = useState<string>('6-Công nhân');
  const [defaultWorkplace, setDefaultWorkplace] = useState<string>('');
  const [showMappingConfig, setShowMappingConfig] = useState<boolean>(false);

  // Processed Results
  const [processedRows, setProcessedRows] = useState<ProcessedRow[]>([]);
  const [isProcessed, setIsProcessed] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  // File Upload Handlers
  const handleFile = async (file: File) => {
    setErrorMsg('');
    setLoading(true);
    setIsProcessed(false);
    setProcessedRows([]);

    try {
      const data = await readWorkbook(file);
      setWbData(data);
      setMapping(data.columnMapping);

      // Auto-choose mode
      if (data.isVncareTemplate) {
        setMode('inplace');
      } else {
        setMode('inplace');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Không thể đọc file Excel: ' + (err.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSheet = (sheetName: string) => {
    if (!wbData) return;
    const switched = switchSheet(wbData, sheetName);
    setWbData(switched);
    setMapping(switched.columnMapping);
    setIsProcessed(false);
    setProcessedRows([]);
  };

  // Load sample files
  const loadSampleFile = async (url: string, fileName: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Không thể tải file mẫu');
      const blob = await res.blob();
      const file = new File([blob], fileName);
      await handleFile(file);
    } catch (e: any) {
      setErrorMsg('Lỗi tải file mẫu: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  // Execute processing
  const handleProcess = () => {
    if (!wbData || mapping.addressCol < 0) {
      setErrorMsg('Vui lòng chọn cột chứa thông tin Địa chỉ!');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      try {
        const results = processAddressRows(wbData.dataRows, mapping, {
          defaultJob,
          defaultWorkplace,
        });
        setProcessedRows(results);
        setIsProcessed(true);
      } catch (err: any) {
        setErrorMsg('Lỗi khi phiên địa chỉ: ' + err.message);
      } finally {
        setLoading(false);
      }
    }, 50);
  };

  // Update a row manually from preview table
  const handleUpdateRow = (
    rowIndex: number,
    tinhCode: string,
    xaCode: string,
    saveToDict: boolean = false
  ) => {
    setProcessedRows((prev) => {
      const updated = [...prev];
      const target = updated.find((r) => r.rowIndex === rowIndex);
      if (target) {
        target.resolvedTinh = tinhCode;
        target.resolvedXa = xaCode;
        target.status = 'custom';
        target.method = 'Chỉnh sửa trực tiếp';
        target.isManualOverride = true;

        // Recalculate mandatory missing
        target.missingFields = target.missingFields.filter((f) => f !== 'Tỉnh' && f !== 'Xã');
        target.isMissingMandatory = target.missingFields.length > 0;

        if (saveToDict && target.rawAddress) {
          addOrUpdateCustomRule(target.rawAddress, tinhCode, xaCode, 'Sửa từ bảng');
          onCustomDictUpdated();
        }
      }
      return updated;
    });
  };

  // Bulk manual fix from Drawer
  const handleApplyManualFix = (
    rawAddress: string,
    tinhCode: string,
    xaCode: string,
    saveToDict: boolean
  ) => {
    if (saveToDict) {
      addOrUpdateCustomRule(rawAddress, tinhCode, xaCode, 'Lưu từ hộp thoại chưa khớp');
      onCustomDictUpdated();
    }

    setProcessedRows((prev) => {
      return prev.map((r) => {
        if (r.rawAddress.trim().toLowerCase() === rawAddress.trim().toLowerCase()) {
          const newMissing = r.missingFields.filter((f) => f !== 'Tỉnh' && f !== 'Xã');
          return {
            ...r,
            resolvedTinh: tinhCode,
            resolvedXa: xaCode,
            status: 'custom',
            method: 'Thư viện thủ công (Vừa lưu)',
            isManualOverride: true,
            missingFields: newMissing,
            isMissingMandatory: newMissing.length > 0,
          };
        }
        return r;
      });
    });
  };

  // Export File
  const handleExport = async () => {
    if (!wbData || processedRows.length === 0) return;
    setIsExporting(true);
    try {
      if (mode === 'inplace') {
        const fileBytes = exportInplaceFile(wbData, processedRows, { dotKham });
        const nameWithoutExt = wbData.fileName.replace(/\.[^/.]+$/, '');
        const filename = generateOutputFilename(`${nameWithoutExt}_PhienDiaChi`);
        downloadExcelFile(fileBytes, filename);
      } else {
        const fileBytes = await exportVncareTemplateFile(processedRows, mapping, {
          dotKham,
          defaultJob,
          defaultWorkplace,
        });
        const filename = generateOutputFilename('MauImportBenhNhan_VNCare');
        downloadExcelFile(fileBytes, filename);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Lỗi khi xuất file Excel: ' + (err.message || String(err)));
    } finally {
      setIsExporting(false);
    }
  };

  // Statistics
  const totalRows = processedRows.length;
  const resolvedCount = processedRows.filter((r) => r.status === 'resolved').length;
  const customCount = processedRows.filter((r) => r.status === 'custom').length;
  const unresolvedCount = processedRows.filter((r) => r.status === 'unresolved').length;
  const successCount = resolvedCount + customCount;
  const successRate = totalRows > 0 ? Math.round((successCount / totalRows) * 100) : 0;
  const compliantCount = processedRows.filter((r) => !r.isMissingMandatory).length;
  const missingMandatoryCount = totalRows - compliantCount;

  // Validate DotKham input
  const isDotKhamValid = /^\d{4}(0[1-9]|1[0-2])$/.test(dotKham.trim());

  return (
    <div className="space-y-6">
      {/* Upload Dropzone */}
      {!wbData && (
        <div className="bg-white border-2 border-dashed border-sky-300 hover:border-sky-500 rounded-2xl p-8 sm:p-12 text-center transition-all bg-sky-50/20">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
            accept=".xls,.xlsx"
            className="hidden"
          />

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs">
              <UploadCloud className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-slate-800 mb-1">
              Kéo thả file Excel vào đây, hoặc <span className="text-sky-600 underline">bấm để chọn file</span>
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
              Hỗ trợ file mẫu chuẩn VNCare (<strong>.xls / .xlsx</strong>) và các file danh sách hợp đồng KSK, CBNV tùy ý của đơn vị.
            </p>
          </div>

          {/* Quick sample files */}
          <div className="pt-4 border-t border-slate-200/80 max-w-xl mx-auto">
            <span className="text-xs text-slate-400 block mb-2 font-medium">Hoặc thử ngay với các file mẫu có sẵn:</span>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => loadSampleFile('template/MauFileImportBenhNhan_ksktoandan.xls', 'MauFileImportBenhNhan_ksktoandan.xls')}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>File Mẫu VNCare (MauFileImport...xls)</span>
              </button>

              <button
                type="button"
                onClick={() => loadSampleFile('template/93_Hop_dong_KSK_HBM_2026.xlsx', '93 Hợp đồng KSK HBM 2026.xlsx')}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-sky-600" />
                <span>File Hợp đồng (93 Hợp đồng KSK HBM...)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-red-600 hover:text-red-800 text-xs font-semibold">
            Đóng
          </button>
        </div>
      )}

      {/* Active File Management Banner */}
      {wbData && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 border border-emerald-100">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-slate-900 text-base">{wbData.fileName}</h4>
                  {wbData.isVncareTemplate ? (
                    <span className="bg-emerald-100 text-emerald-800 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                      Mẫu chuẩn VNCare
                    </span>
                  ) : (
                    <span className="bg-sky-100 text-sky-800 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                      Danh sách tuỳ biến
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tổng <strong>{wbData.dataRows.length}</strong> dòng dữ liệu · Sheet hiện tại: <strong>{wbData.activeSheet}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center space-x-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Nạp file khác</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFile(e.target.files[0]);
                  }
                }}
                accept=".xls,.xlsx"
                className="hidden"
              />
            </div>
          </div>

          {/* Sheet Selector (if multiple) */}
          {wbData.sheetNames.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium mr-1 flex items-center">
                <Layers className="w-3.5 h-3.5 mr-1" /> Chọn Sheet:
              </span>
              {wbData.sheetNames.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSelectSheet(s)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    wbData.activeSheet === s
                      ? 'bg-sky-600 text-white shadow-2xs font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Processing Mode Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div
              onClick={() => setMode('inplace')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                mode === 'inplace'
                  ? 'border-sky-500 bg-sky-50/50 shadow-2xs ring-1 ring-sky-500'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-sm text-slate-900 flex items-center space-x-1.5">
                    <span>Chế độ 1: Phiên & điền vào file hiện tại</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Điền mã Tỉnh (cột L) và Xã (cột M) trực tiếp vào file đang nạp. Chuẩn hóa STT (1..N), Ngày sinh/Ngày cấp (DD/MM/YYYY), CCCD text general và giữ nguyên các sheet khác.
                  </p>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                    mode === 'inplace' ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-300'
                  }`}
                >
                  {mode === 'inplace' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
            </div>

            <div
              onClick={() => setMode('convert_to_vncare_template')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                mode === 'convert_to_vncare_template'
                  ? 'border-sky-500 bg-sky-50/50 shadow-2xs ring-1 ring-sky-500'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-sm text-slate-900 flex items-center space-x-1.5">
                    <span>Chế độ 2: Xuất Mẫu VNCare chuẩn (7 sheets)</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Chuyển đổi dữ liệu sang đúng form mẫu cổng KSK toàn dân VNCare (đầy đủ các sheet: DANHSACH, TINH, XA, QUOCGIA, DANTOC, GIOITINH, NGHENGHIEP).
                  </p>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                    mode === 'convert_to_vncare_template' ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-300'
                  }`}
                >
                  {mode === 'convert_to_vncare_template' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Mapping & Options Accordion */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">Cột địa chỉ nhận diện:</span>
                <span className="font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
                  {mapping.addressCol >= 0
                    ? `Cột ${String.fromCharCode(65 + mapping.addressCol)}: "${wbData.headers[mapping.addressCol]}"`
                    : 'Chưa nhận diện được'}
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500">Đợt khám:</span>
                <span className={`font-mono px-2 py-0.5 rounded font-semibold ${isDotKhamValid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                  {dotKham}
                </span>
              </div>

              <button
                onClick={() => setShowMappingConfig(!showMappingConfig)}
                className="text-xs text-sky-600 hover:text-sky-800 font-semibold flex items-center space-x-1"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{showMappingConfig ? 'Thu gọn cấu hình' : 'Tùy chỉnh cột & thiết lập'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transform transition-transform ${showMappingConfig ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {showMappingConfig && (
              <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Cột STT:</label>
                    <select
                      value={mapping.sttCol ?? -1}
                      onChange={(e) => setMapping({ ...mapping, sttCol: Number(e.target.value) })}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value={-1}>-- Cột 0 (Mặc định) --</option>
                      {wbData.headers.map((h, i) => (
                        <option key={i} value={i}>
                          Cột {String.fromCharCode(65 + i)}: {h || `(Cột ${i + 1})`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Cột Địa chỉ nguồn (Bắt buộc):</label>
                    <select
                      value={mapping.addressCol}
                      onChange={(e) => setMapping({ ...mapping, addressCol: Number(e.target.value) })}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value={-1}>-- Chọn cột địa chỉ --</option>
                      {wbData.headers.map((h, i) => (
                        <option key={i} value={i}>
                          Cột {String.fromCharCode(65 + i)}: {h || `(Cột ${i + 1})`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Cột Họ và tên (Bắt buộc):</label>
                    <select
                      value={mapping.nameCol ?? -1}
                      onChange={(e) => setMapping({ ...mapping, nameCol: Number(e.target.value) })}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value={-1}>-- Tự động --</option>
                      {wbData.headers.map((h, i) => (
                        <option key={i} value={i}>
                          Cột {String.fromCharCode(65 + i)}: {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Cột Ngày/Năm sinh (Bắt buộc):</label>
                    <select
                      value={mapping.dobCol ?? -1}
                      onChange={(e) => setMapping({ ...mapping, dobCol: Number(e.target.value) })}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value={-1}>-- Tự động --</option>
                      {wbData.headers.map((h, i) => (
                        <option key={i} value={i}>
                          Cột {String.fromCharCode(65 + i)}: {h}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Cột Giới tính (Bắt buộc):</label>
                    <select
                      value={mapping.genderCol ?? -1}
                      onChange={(e) => setMapping({ ...mapping, genderCol: Number(e.target.value) })}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value={-1}>-- Tự động --</option>
                      {wbData.headers.map((h, i) => (
                        <option key={i} value={i}>
                          Cột {String.fromCharCode(65 + i)}: {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Cột CCCD / CMND (Bắt buộc):</label>
                    <select
                      value={mapping.cccdCol ?? -1}
                      onChange={(e) => setMapping({ ...mapping, cccdCol: Number(e.target.value) })}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value={-1}>-- Tự động --</option>
                      {wbData.headers.map((h, i) => (
                        <option key={i} value={i}>
                          Cột {String.fromCharCode(65 + i)}: {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Cột Ngày cấp CCCD:</label>
                    <select
                      value={mapping.cccdDateCol ?? -1}
                      onChange={(e) => setMapping({ ...mapping, cccdDateCol: Number(e.target.value) })}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value={-1}>-- Tự động --</option>
                      {wbData.headers.map((h, i) => (
                        <option key={i} value={i}>
                          Cột {String.fromCharCode(65 + i)}: {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Mã Đợt khám (YYYYMM):
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={dotKham}
                      onChange={(e) => setDotKham(e.target.value.trim())}
                      placeholder="Mẫu: 202601"
                      className={`w-full p-2 border rounded-lg bg-white font-mono ${
                        isDotKhamValid ? 'border-slate-300' : 'border-rose-400 bg-rose-50 text-rose-800'
                      }`}
                    />
                    {!isDotKhamValid && (
                      <span className="text-[10px] text-rose-600 block mt-0.5">
                        Phải đúng 6 chữ số YYYYMM (ví dụ: 202601)
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nơi làm việc mặc định:</label>
                    <input
                      type="text"
                      value={defaultWorkplace}
                      onChange={(e) => setDefaultWorkplace(e.target.value)}
                      placeholder="Ví dụ: Công ty TNHH ABC"
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nghề nghiệp mặc định:</label>
                    <input
                      type="text"
                      value={defaultJob}
                      onChange={(e) => setDefaultJob(e.target.value)}
                      placeholder="6-Công nhân"
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Trigger Button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleProcess}
              disabled={loading || mapping.addressCol < 0}
              className="px-6 py-2.5 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-md shadow-sky-600/20 flex items-center space-x-2 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang xử lý dữ liệu...</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4" />
                  <span>Bắt đầu phiên địa chỉ ({wbData.dataRows.length} dòng)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards & Results Panel */}
      {isProcessed && (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* Compliance & Standards Status Ribbon */}
          <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-sky-500/20 rounded-lg text-sky-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-sky-300">
                  Chuẩn hóa dữ liệu xuất VNCare & Hợp đồng KSK
                </h4>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-slate-300 mt-0.5 text-[11px]">
                  <span>• Cột STT tự động 1..N</span>
                  <span>• Ngày sinh & Ngày cấp: <strong>DD/MM/YYYY</strong></span>
                  <span>• CCCD: <strong>12 số / 8-11 alphanumeric</strong> (bảo toàn số 0)</span>
                  <span>• Đợt khám: <strong>{dotKham}</strong></span>
                  <span>• Toàn bộ cột bắt buộc: <strong>Text General (@)</strong></span>
                  <span>• Font <strong>Times New Roman 13pt</strong> & Giãn dòng</span>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full font-bold text-xs ${
                missingMandatoryCount === 0
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {missingMandatoryCount === 0 ? '✓ 100% Đầy đủ cột bắt buộc' : `Cần hoàn thiện ${missingMandatoryCount} dòng`}
              </span>
            </div>
          </div>

          {/* KPI Dashboard */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Tổng số dòng</span>
              <div className="text-2xl font-bold text-slate-800 mt-1">{totalRows}</div>
              <span className="text-[11px] text-slate-400 font-mono">STT: 1 đến {totalRows}</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs bg-emerald-50/20">
              <span className="text-xs text-emerald-700 font-medium flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Phiên thành công
              </span>
              <div className="text-2xl font-bold text-emerald-700 mt-1">
                {successCount}{' '}
                <span className="text-sm font-semibold text-emerald-600">({successRate}%)</span>
              </div>
              <span className="text-[11px] text-emerald-600">Đã điền Tỉnh & Xã</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs bg-amber-50/20">
              <span className="text-xs text-amber-700 font-medium flex items-center">
                <Bookmark className="w-3.5 h-3.5 mr-1" /> Khớp từ Thư viện
              </span>
              <div className="text-2xl font-bold text-amber-700 mt-1">{customCount}</div>
              <span className="text-[11px] text-amber-600">Quy tắc người dùng</span>
            </div>

            <div
              onClick={() => unresolvedCount > 0 && setDrawerOpen(true)}
              className={`p-4 rounded-xl border shadow-2xs transition-all ${
                unresolvedCount > 0
                  ? 'bg-red-50/40 border-red-200 cursor-pointer hover:border-red-300'
                  : 'bg-white border-slate-200'
              }`}
            >
              <span className="text-xs text-red-700 font-medium flex items-center">
                <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Chưa nhận diện
              </span>
              <div className="text-2xl font-bold text-red-700 mt-1">{unresolvedCount}</div>
              <span className="text-[11px] text-red-600 underline">
                {unresolvedCount > 0 ? 'Bấm để xử lý thủ công →' : 'Tất cả đã khớp'}
              </span>
            </div>
          </div>

          {/* Unmapped Alert Banner if any unresolved */}
          {unresolvedCount > 0 && (
            <div className="bg-amber-50 border border-amber-300 text-amber-900 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-lg shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">
                    Phát hiện {unresolvedCount} dòng địa chỉ chưa thể phiên tự động!
                  </h4>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Hệ thống cần bạn chọn Tỉnh và Xã tương ứng. Quy tắc sau khi chọn sẽ tự động lưu vào Thư viện cho các lần sau.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setDrawerOpen(true)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors shrink-0"
              >
                Xử lý địa chỉ chưa khớp ngay
              </button>
            </div>
          )}

          {/* Action Export Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="space-y-1 w-full md:w-auto">
              <div className="text-xs text-slate-700">
                Chế độ xuất: <strong>{mode === 'inplace' ? 'Điền vào file hiện tại' : 'Mẫu Import VNCare 7 Sheets'}</strong>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium border border-slate-200">
                  Font: Times New Roman 13pt
                </span>
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium border border-slate-200">
                  Kẻ ô toàn bộ (Borders)
                </span>
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium border border-slate-200">
                  Định dạng Text General (@)
                </span>
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium border border-slate-200">
                  Đợt khám: {dotKham}
                </span>
              </div>
            </div>

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full md:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer shrink-0"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang xuất file...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Tải file Excel kết quả (.xlsx)</span>
                </>
              )}
            </button>
          </div>

          {/* Preview Table */}
          <PreviewTable rows={processedRows} onUpdateRow={handleUpdateRow} />
        </div>
      )}

      {/* Unmapped Modal Drawer */}
      <UnmappedDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        processedRows={processedRows}
        onApplyManualFix={handleApplyManualFix}
      />
    </div>
  );
};
