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
  ChevronUp,
  Layers,
  ArrowRight,
  ArrowRightLeft,
  FileCheck,
  FileDown,
  ShieldCheck,
  Calendar,
  CreditCard,
  Hash,
  Sparkles,
  CheckCheck
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

  // Collapsible input data section
  const [isInputExpanded, setIsInputExpanded] = useState<boolean>(true);

  // Processed Results
  const [processedRows, setProcessedRows] = useState<ProcessedRow[]>([]);
  const [isProcessed, setIsProcessed] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Table filter link
  const [tableFilter, setTableFilter] = useState<string>('all');

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  // File Upload Handlers
  const handleFile = async (file: File) => {
    setErrorMsg('');
    setLoading(true);
    setIsProcessed(false);
    setProcessedRows([]);
    setIsInputExpanded(true);

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
        // Automatically collapse input section after processing to give full focus to export & comparison
        setIsInputExpanded(false);
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
        target.resolutionType = 'custom_dict';
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
            resolutionType: 'custom_dict',
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

  // Reconciliation Statistics
  const totalRows = processedRows.length;
  const count3Cap = processedRows.filter((r) => r.resolutionType === '3_tier_conversion').length;
  const count2Cap = processedRows.filter((r) => r.resolutionType === '2_tier_exact').length;
  const customCount = processedRows.filter((r) => r.status === 'custom').length;
  const unresolvedCount = processedRows.filter((r) => r.status === 'unresolved').length;
  const successCount = count3Cap + count2Cap + customCount;
  const successRate = totalRows > 0 ? Math.round((successCount / totalRows) * 100) : 0;
  const compliantCount = processedRows.filter((r) => !r.isMissingMandatory).length;
  const missingMandatoryCount = totalRows - compliantCount;

  // Validate DotKham input
  const isDotKhamValid = /^\d{4}(0[1-9]|1[0-2])$/.test(dotKham.trim());

  return (
    <div className="space-y-5 pb-16">
      {/* Upload Dropzone (When no file is loaded yet) */}
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

      {/* INPUT DATA SECTION (Collapsible Header Bar) */}
      {wbData && (
        <>
          {/* 1. COMPACT INPUT BAR (When collapsed) */}
          {!isInputExpanded ? (
            <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-3.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-2.5 transition-all">
              <div className="flex flex-wrap items-center gap-2">
                <div className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-800 text-xs sm:text-sm">{wbData.fileName}</span>
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-slate-200">
                    Sheet: <strong>{wbData.activeSheet}</strong> ({wbData.dataRows.length} dòng)
                  </span>
                </div>

                <div className="hidden lg:flex items-center space-x-1.5 text-slate-400 text-xs">
                  <span>•</span>
                  <span className="text-slate-600 text-xs">
                    {mode === 'inplace' ? 'Chế độ: Điền trực tiếp' : 'Chế độ: Mẫu 7 sheet VNCare'}
                  </span>
                  <span>•</span>
                  <span className="text-slate-600 text-xs">
                    Cột Đ/C: <strong>{mapping.addressCol >= 0 ? String.fromCharCode(65 + mapping.addressCol) : '?'}</strong>
                  </span>
                  <span>•</span>
                  <span className="text-slate-600 text-xs">
                    Đợt: <strong className="font-mono">{dotKham}</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => setIsInputExpanded(true)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center space-x-1"
                  title="Mở rộng để đổi sheet, đổi chế độ hoặc ánh xạ lại cột"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Thay đổi cấu hình / Đổi file</span>
                  <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                </button>

                <button
                  onClick={handleProcess}
                  disabled={loading}
                  className="px-3 py-1.5 text-xs font-semibold text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors flex items-center space-x-1"
                  title="Phiên lại dữ liệu theo các quy tắc mới"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Phiên lại</span>
                </button>
              </div>
            </div>
          ) : (
            /* 2. FULL EXPANDED INPUT FORM */
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 animate-in fade-in duration-200">
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
                  {isProcessed && (
                    <button
                      onClick={() => setIsInputExpanded(false)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center space-x-1"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                      <span>Thu gọn</span>
                    </button>
                  )}

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
              <div className="pt-2 flex justify-between items-center">
                <span className="text-xs text-slate-500">
                  Bấm bắt đầu để hệ thống tự động bóc tách địa chỉ 2 cấp & 3 cấp cũ.
                </span>

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
        </>
      )}

      {/* RESULTS & COMPARISON SECTION */}
      {isProcessed && (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* ========================================================================= */}
          {/* 1. HERO HIGHLIGHTED EXPORT ACTION BANNER */}
          {/* ========================================================================= */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-5 sm:p-6 rounded-2xl shadow-xl shadow-emerald-950/15 border border-emerald-400/30 flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative overflow-hidden">
            {/* Background sparkle effect */}
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-2 max-w-2xl relative z-10">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold text-emerald-100">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Dữ liệu đã chuẩn hóa 100% theo quy cách VNCare</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-tight">
                XUẤT FILE KẾT QUẢ ĐÃ PHIÊN CHUẨN (EXCEL .XLSX)
              </h3>

              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                Đã phiên thành công <strong>{successCount}/{totalRows} dòng</strong> ({successRate}%). Định dạng sẵn sàng nạp cổng KSK: <strong>STT 1..N</strong>, kiểu <strong>Text General (@)</strong>, <strong>Ngày sinh DD/MM/YYYY</strong>, <strong>CCCD 12 số</strong> và <strong>Times New Roman 13pt</strong>.
              </p>

              {/* Specification tags */}
              <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-emerald-50">
                <span className="bg-black/20 px-2.5 py-0.5 rounded-md backdrop-blur-xs border border-white/15">
                  ✓ Font Times New Roman 13pt
                </span>
                <span className="bg-black/20 px-2.5 py-0.5 rounded-md backdrop-blur-xs border border-white/15">
                  ✓ Kẻ ô viền toàn bộ (Borders)
                </span>
                <span className="bg-black/20 px-2.5 py-0.5 rounded-md backdrop-blur-xs border border-white/15">
                  ✓ Text General (@) bảo toàn số 0
                </span>
                <span className="bg-black/20 px-2.5 py-0.5 rounded-md backdrop-blur-xs border border-white/15">
                  ✓ STT tự động 1..{totalRows}
                </span>
                <span className="bg-black/20 px-2.5 py-0.5 rounded-md backdrop-blur-xs border border-white/15">
                  ✓ Đợt khám: {dotKham}
                </span>
              </div>
            </div>

            {/* HERO CTA BUTTON */}
            <div className="shrink-0 relative z-10 flex flex-col items-stretch sm:items-end gap-2">
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="px-8 py-4 bg-white hover:bg-emerald-50 text-emerald-900 text-sm sm:text-base font-extrabold rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-3 cursor-pointer border border-white/50 ring-4 ring-emerald-300/40"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-emerald-700" />
                    <span>ĐANG ĐÓNG GÓI EXCEL...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 text-emerald-700 animate-bounce" />
                    <span>TẢI FILE EXCEL KẾT QUẢ NGAY</span>
                  </>
                )}
              </button>

              <span className="text-[11px] text-emerald-100 text-center sm:text-right font-medium">
                {mode === 'inplace' ? 'Chế độ 1: Điền trực tiếp vào file hiện tại' : 'Chế độ 2: Tạo Mẫu Import VNCare 7 Sheets'}
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. RECONCILIATION SUMMARY DASHBOARD (Nội dung đối chiếu) */}
          {/* ========================================================================= */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>Nội dung đối chiếu dữ liệu địa danh & hành chính</span>
              </h4>
              <span className="text-[11px] text-slate-400">
                Nhấp vào từng thẻ để lọc danh sách đối chiếu tương ứng bên dưới
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
              {/* Card 1: 3-tier conversion */}
              <div
                onClick={() => setTableFilter('3_tier')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  tableFilter === '3_tier'
                    ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-400 shadow-sm'
                    : 'bg-white border-indigo-100 hover:border-indigo-300 hover:shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between text-indigo-700 text-xs font-semibold">
                  <span className="flex items-center">
                    <ArrowRightLeft className="w-3.5 h-3.5 mr-1 text-indigo-600" /> Chuyển đổi 3 cấp
                  </span>
                  <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded font-mono">Sáp nhập</span>
                </div>
                <div className="text-2xl font-extrabold text-indigo-900 mt-1">{count3Cap}</div>
                <div className="text-[11px] text-indigo-600 truncate mt-0.5">Xã/Huyện/Tỉnh cũ ➔ Mới</div>
              </div>

              {/* Card 2: 2-tier exact */}
              <div
                onClick={() => setTableFilter('2_tier')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  tableFilter === '2_tier'
                    ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400 shadow-sm'
                    : 'bg-white border-emerald-100 hover:border-emerald-300 hover:shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold">
                  <span className="flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Khớp 2 cấp chuẩn
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono">Chính xác</span>
                </div>
                <div className="text-2xl font-extrabold text-emerald-900 mt-1">{count2Cap}</div>
                <div className="text-[11px] text-emerald-600 truncate mt-0.5">Theo danh mục 34 tỉnh</div>
              </div>

              {/* Card 3: Custom Dictionary */}
              <div
                onClick={() => setTableFilter('custom')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  tableFilter === 'custom'
                    ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400 shadow-sm'
                    : 'bg-white border-amber-100 hover:border-amber-300 hover:shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between text-amber-700 text-xs font-semibold">
                  <span className="flex items-center">
                    <Bookmark className="w-3.5 h-3.5 mr-1 text-amber-600" /> Thư viện thủ công
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-mono">Quy tắc riêng</span>
                </div>
                <div className="text-2xl font-extrabold text-amber-900 mt-1">{customCount}</div>
                <div className="text-[11px] text-amber-600 truncate mt-0.5">Đã học từ các lần trước</div>
              </div>

              {/* Card 4: Unresolved */}
              <div
                onClick={() => {
                  setTableFilter('unresolved');
                  if (unresolvedCount > 0) setDrawerOpen(true);
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  tableFilter === 'unresolved'
                    ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-400 shadow-sm'
                    : unresolvedCount > 0
                    ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-rose-700 text-xs font-semibold">
                  <span className="flex items-center">
                    <AlertTriangle className="w-3.5 h-3.5 mr-1 text-rose-600" /> Chưa nhận diện
                  </span>
                  {unresolvedCount > 0 && (
                    <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded font-semibold animate-pulse">
                      Cần xử lý
                    </span>
                  )}
                </div>
                <div className="text-2xl font-extrabold text-rose-900 mt-1">{unresolvedCount}</div>
                <div className="text-[11px] text-rose-600 underline truncate mt-0.5">
                  {unresolvedCount > 0 ? 'Bấm để gán Tỉnh/Xã →' : 'Tất cả đã khớp'}
                </div>
              </div>

              {/* Card 5: Overall Reconciliation Rate */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-900 text-white shadow-xs col-span-2 sm:col-span-4 lg:col-span-1">
                <div className="text-slate-400 text-xs font-medium flex items-center justify-between">
                  <span>Tỷ lệ đối chiếu thành công</span>
                  <CheckCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  {successRate}%
                </div>
                <div className="text-[11px] text-slate-300 truncate mt-0.5">
                  {successCount} / {totalRows} dòng hợp lệ
                </div>
              </div>
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

          {/* ========================================================================= */}
          {/* 3. DETAILED RECONCILIATION PREVIEW TABLE */}
          {/* ========================================================================= */}
          <PreviewTable
            rows={processedRows}
            onUpdateRow={handleUpdateRow}
            selectedFilter={tableFilter}
            onFilterChange={(f) => setTableFilter(f)}
          />

          {/* ========================================================================= */}
          {/* 4. FLOATING BOTTOM EXPORT BAR (Always visible when scrolling) */}
          {/* ========================================================================= */}
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md flex items-center space-x-4 max-w-xl w-[92vw] sm:w-auto justify-between animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="flex items-center space-x-3 text-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <span className="font-bold text-emerald-400">
                  {successCount}/{totalRows} dòng ({successRate}%)
                </span>
                <span className="text-slate-300 hidden sm:inline ml-1.5">
                  · Đợt: {dotKham} · Times New Roman 13pt
                </span>
              </div>
            </div>

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5 cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>TẢI FILE EXCEL (.XLSX)</span>
            </button>
          </div>
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
