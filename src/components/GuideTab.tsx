import React from 'react';
import { BookOpen, FileSpreadsheet, CheckCircle2, Download, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

export const GuideTab: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Introduction Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
        <div className="flex items-center space-x-2 text-sky-700">
          <BookOpen className="w-6 h-6" />
          <h3 className="text-lg font-bold text-slate-900">Hướng Dẫn Sử Dụng & Quy Chuẩn Nghiệp Vụ</h3>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Ứng dụng <strong>VNCare Phiên Địa Chỉ 2 Cấp</strong> được phát triển nhằm tự động hóa quy trình phân tách, phiên mã địa chỉ hành chính (Tỉnh và Xã) từ danh sách Excel bệnh nhân hoặc CBNV khám sức khỏe, chuẩn hóa 100% theo danh mục địa danh mới nhất của Bộ Y tế và hệ thống VNCare (VNPT-HIS).
        </p>
      </div>

      {/* 2 Modes Workflow */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mode 1 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center space-x-2">
            <span className="w-7 h-7 bg-sky-100 text-sky-700 font-bold rounded-lg flex items-center justify-center text-xs">1</span>
            <h4 className="font-bold text-slate-900 text-sm">Chế độ 1: Phiên trực tiếp vào file hiện tại</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Dành cho file mẫu nạp bệnh nhân VNCare (ví dụ <code>MauFileImportBenhNhan_ksktoandan.xls</code>) hoặc bất kỳ file Excel nào đã có sẵn các cột.
          </p>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
            <li>Tool đọc chuỗi địa chỉ ở cột <strong>DIACHI</strong> (hoặc cột bạn chọn).</li>
            <li>Tự động nhận diện Tỉnh và Xã (2 cấp hoặc 3 cấp).</li>
            <li>Điền mã chuẩn vào cột <strong>TINH</strong> (Cột L) và <strong>XA</strong> (Cột M).</li>
            <li><strong>Giữ nguyên 100%</strong> các cột dữ liệu khác và mọi sheet khác.</li>
          </ul>
        </div>

        {/* Mode 2 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center space-x-2">
            <span className="w-7 h-7 bg-emerald-100 text-emerald-700 font-bold rounded-lg flex items-center justify-center text-xs">2</span>
            <h4 className="font-bold text-slate-900 text-sm">Chế độ 2: Xuất Mẫu VNCare chuẩn (7 Sheets)</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Dành cho các file danh sách hợp đồng KSK tùy ý của cơ quan, nhà máy (ví dụ <code>93 Hợp đồng KSK HBM 2026.xlsx</code>).
          </p>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
            <li>Tự động nhận diện Họ tên, Ngày sinh, Giới tính, CCCD, Địa chỉ...</li>
            <li>Phiên địa chỉ ra 2 cấp Tỉnh & Xã.</li>
            <li>Đổ toàn bộ dữ liệu vào khung mẫu chuẩn 7 sheets của VNCare (DANHSACH, TINH, XA, QUOCGIA, DANTOC, GIOITINH, NGHENGHIEP).</li>
            <li>File xuất ra sẵn sàng nạp thẳng vào cổng KSK toàn dân VNCare.</li>
          </ul>
        </div>
      </div>

      {/* Address Resolution Principles */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h4 className="font-bold text-slate-900 text-base flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Nguyên Tắc Phân Cấp & Chuyển Đổi Địa Chỉ</span>
        </h4>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <strong className="text-slate-800">1. Nếu là địa chỉ 2 cấp mới (sau sáp nhập):</strong>
            <p className="mt-1">
              Ví dụ: <em>"TDP Nam Đầm Vạc, phường Vĩnh Phúc, tỉnh Phú Thọ"</em><br />
              → Hệ thống nhận diện Tỉnh: <code>25-Tỉnh Phú Thọ</code>, Xã: <code>08716-Phường Vĩnh Phúc</code> và điền trực tiếp.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <strong className="text-slate-800">2. Nếu là địa chỉ 3 cấp cũ (trước sáp nhập):</strong>
            <p className="mt-1">
              Ví dụ: <em>"Phường Đồng Tâm, Thành phố Yên Bái, Tỉnh Yên Bái"</em><br />
              → Căn cứ vào thư viện 10.035 liên kết sáp nhập, hệ thống tự động quy đổi về địa chỉ 2 cấp mới: Tỉnh <code>15-Tỉnh Lào Cai</code>, Xã: <code>04252-Phường Yên Bái</code>.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <strong className="text-slate-800">3. Nếu gặp địa chỉ viết tắt, không có tiền tố hoặc địa phương hóa:</strong>
            <p className="mt-1">
              Ví dụ: <em>"Nông Trang, Việt Trì, Phú Thọ"</em> hoặc <em>"Tổ 16b TDP Gia Cẩm, P Việt Trì, T. Phú Thọ"</em><br />
              → Thuật toán xử lý tách ranh giới và chuẩn hóa từ khóa sẽ tìm đúng mã xã và mã tỉnh.
            </p>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
            <strong className="text-amber-950">4. Thư viện danh mục thủ công (Custom Dictionary):</strong>
            <p className="mt-1">
              Đối với những trường hợp ghi địa chỉ đặc thù mà máy chưa tự động nhận diện được, hệ thống sẽ gom danh sách lại và cảnh báo. Bạn chỉ cần chọn thủ công Tỉnh & Xã <strong>một lần duy nhất</strong>, bấm "Lưu vào Thư viện" — từ các lần sau, địa chỉ đó sẽ được nhận diện tự động 100%.
            </p>
          </div>
        </div>
      </div>

      {/* Sample Templates Download Card */}
      <div className="bg-sky-50 border border-sky-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sky-950 text-base">Tải File Mẫu Về Máy Để Thử Nghiệm</h4>
          <p className="text-xs text-sky-800 mt-1">
            Bạn có thể tải trực tiếp file mẫu gốc từ hệ thống để kiểm tra:
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <a
            href="template/MauFileImportBenhNhan_ksktoandan.xls"
            download="MauFileImportBenhNhan_ksktoandan.xls"
            className="px-3 py-2 bg-white hover:bg-sky-100 text-sky-800 text-xs font-bold rounded-lg border border-sky-300 shadow-2xs inline-flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Mẫu VNCare (.xls)</span>
          </a>

          <a
            href="template/93_Hop_dong_KSK_HBM_2026.xlsx"
            download="93 Hợp đồng KSK HBM 2026.xlsx"
            className="px-3 py-2 bg-white hover:bg-sky-100 text-sky-800 text-xs font-bold rounded-lg border border-sky-300 shadow-2xs inline-flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Mẫu Hợp đồng (.xlsx)</span>
          </a>
        </div>
      </div>
    </div>
  );
};
