import React from 'react';
import {
  BookOpen,
  FileSpreadsheet,
  CheckCircle2,
  Download,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Sparkles,
  MapPin,
  CreditCard,
  Hash,
  Users
} from 'lucide-react';
import { APP_META } from '../constants/meta';

export const GuideTab: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* Introduction Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
        <div className="flex items-center space-x-2.5 text-sky-700">
          <BookOpen className="w-6 h-6" />
          <h3 className="text-lg font-bold text-slate-900">
            Hướng Dẫn Sử Dụng & Quy Chuẩn Nghiệp Vụ VNCare (v{APP_META.version})
          </h3>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Ứng dụng <strong>VNCare Phiên Địa Chỉ 2 Cấp</strong> được phát triển nhằm tự động hóa quy trình phân tách, phiên mã địa chỉ hành chính (Tỉnh và Xã) từ danh sách Excel bệnh nhân hoặc CBNV khám sức khỏe (KSK), chuẩn hóa 100% theo danh mục địa danh mới nhất của Bộ Y tế và hệ thống VNCare (VNPT-HIS).
        </p>
      </div>

      {/* 5-Step Visual Workflow */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h4 className="font-bold text-slate-900 text-base flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>Quy Trình 5 Bước Sử Dụng Nhanh</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          <div className="p-3.5 bg-sky-50/70 border border-sky-200 rounded-xl space-y-1.5 flex flex-col justify-between">
            <div>
              <span className="w-6 h-6 bg-sky-600 text-white rounded-lg flex items-center justify-center font-bold mb-2">1</span>
              <strong className="text-slate-900 block text-xs">Nạp file Excel</strong>
              <p className="text-slate-600 text-[11px] mt-1">Kéo thả hoặc chọn file .xls/.xlsx (file mẫu VNCare hoặc file hợp đồng tùy biến).</p>
            </div>
            <span className="text-[10px] text-sky-700 font-medium">Hỗ trợ mọi định dạng</span>
          </div>

          <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1.5 flex flex-col justify-between">
            <div>
              <span className="w-6 h-6 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold mb-2">2</span>
              <strong className="text-slate-900 block text-xs">Cấu hình & Tùy chọn</strong>
              <p className="text-slate-600 text-[11px] mt-1">Chọn Sheet, Cột Địa chỉ, Cột Dân tộc và bật "Địa chỉ 2 cấp kèm chi tiết" nếu cần.</p>
            </div>
            <span className="text-[10px] text-indigo-700 font-medium">Linh hoạt theo từng file</span>
          </div>

          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5 flex flex-col justify-between">
            <div>
              <span className="w-6 h-6 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-bold mb-2">3</span>
              <strong className="text-slate-900 block text-xs">Bấm Phiên địa chỉ</strong>
              <p className="text-slate-600 text-[11px] mt-1">Hệ thống xử lý offline siêu tốc: bóc tách 2 cấp, quy đổi 3 cấp cũ, định dạng STT, ngày sinh, CCCD.</p>
            </div>
            <span className="text-[10px] text-emerald-700 font-medium">100% Client-side Offline</span>
          </div>

          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5 flex flex-col justify-between">
            <div>
              <span className="w-6 h-6 bg-amber-600 text-white rounded-lg flex items-center justify-center font-bold mb-2">4</span>
              <strong className="text-slate-900 block text-xs">Đối chiếu & Cảnh báo</strong>
              <p className="text-slate-600 text-[11px] mt-1">Rà soát thẻ cảnh báo CCCD thiếu, Dân tộc chưa khớp hoặc Địa chỉ chưa khớp và sửa nhanh 1 chạm.</p>
            </div>
            <span className="text-[10px] text-amber-700 font-medium">Không bỏ sót lỗi</span>
          </div>

          <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-xl space-y-1.5 flex flex-col justify-between">
            <div>
              <span className="w-6 h-6 bg-teal-600 text-white rounded-lg flex items-center justify-center font-bold mb-2">5</span>
              <strong className="text-slate-900 block text-xs">Xuất File Excel Chuẩn</strong>
              <p className="text-slate-600 text-[11px] mt-1">Tải file kết quả định dạng Times New Roman 13pt, Borders đầy đủ, sẵn sàng nạp cổng VNCare.</p>
            </div>
            <span className="text-[10px] text-teal-700 font-medium">Hoàn tất quy chuẩn</span>
          </div>
        </div>
      </div>

      {/* 2 Modes Workflow */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mode 1 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center space-x-2">
            <span className="w-7 h-7 bg-sky-100 text-sky-700 font-bold rounded-lg flex items-center justify-center text-xs">Chế độ 1</span>
            <h4 className="font-bold text-slate-900 text-sm">Điền trực tiếp vào file hiện tại</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Dành cho file mẫu nạp bệnh nhân VNCare (ví dụ <code>MauFileImportBenhNhan_ksktoandan.xls</code>) hoặc bất kỳ file Excel nào đã có sẵn các cột.
          </p>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
            <li>Đọc chuỗi địa chỉ ở cột <strong>DIACHI</strong> (hoặc cột bạn cấu hình).</li>
            <li>Tự động nhận diện Tỉnh và Xã (2 cấp hoặc 3 cấp cũ).</li>
            <li>Điền mã chuẩn vào cột <strong>TINH</strong> (Cột L) và <strong>XA</strong> (Cột M).</li>
            <li>Tự động đánh STT liên tục (1..N), chuẩn hóa Ngày sinh (DD/MM/YYYY), CCCD text general (@).</li>
            <li><strong>Giữ nguyên 100%</strong> các cột dữ liệu khác và mọi sheet khác trong file.</li>
          </ul>
        </div>

        {/* Mode 2 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center space-x-2">
            <span className="w-7 h-7 bg-emerald-100 text-emerald-700 font-bold rounded-lg flex items-center justify-center text-xs">Chế độ 2</span>
            <h4 className="font-bold text-slate-900 text-sm">Xuất Mẫu VNCare chuẩn (7 Sheets)</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Dành cho các file danh sách hợp đồng KSK tùy ý của cơ quan, nhà máy (ví dụ <code>93 Hợp đồng KSK HBM 2026.xlsx</code>).
          </p>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
            <li>Tự động nhận diện Họ tên, Ngày sinh, Giới tính, CCCD, Địa chỉ, Dân tộc, Nơi làm việc, SĐT...</li>
            <li>Phiên địa chỉ ra 2 cấp Tỉnh & Xã, chuẩn hóa Dân tộc sang dạng <code>Mã-Dân tộc</code> (ví dụ: <code>25-Kinh</code>, <code>45-Sán Dìu</code>, <code>12-Dao</code>, <code>48-Tày</code>...).</li>
            <li>Đổ toàn bộ dữ liệu vào khung mẫu chuẩn 7 sheets của VNCare (DANHSACH, TINH, XA, QUOCGIA, DANTOC, GIOITINH, NGHENGHIEP).</li>
            <li>File xuất ra sẵn sàng nạp thẳng vào cổng KSK toàn dân VNCare.</li>
          </ul>
        </div>
      </div>

      {/* New Features in v1.3.0 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h4 className="font-bold text-slate-900 text-base flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Các Tính Năng Nâng Cấp Nổi Bật Phiên Bản v1.3.0</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-sky-600" />
              <span>Tùy biến Sheet & Cột phiên cho file ngoài mẫu</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Bảng cấu hình tự động mở ra khi nạp file ngoài mẫu, cho phép bạn chọn chính xác Sheet cần phiên và gắn cột Địa chỉ, Dân tộc, Họ tên, Ngày sinh, CCCD, Nghề nghiệp, Đơn vị làm việc...
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Tùy chọn "Địa chỉ 2 cấp kèm chi tiết"</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Cho phép xuất cột Địa chỉ 2 cấp kèm chi tiết số nhà, thôn, xóm, đường + Xã + Tỉnh (ví dụ: <code>Thôn Đông Thịnh, Xã Sơn Đông, Tỉnh Phú Thọ</code>) thay vì chỉ có mỗi Xã, Tỉnh.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-amber-600" />
              <span>Cảnh báo & Chuẩn hóa 65 Dân tộc VNCare</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Tự động quy đổi tên dân tộc sang dạng <code>Mã-Dân tộc</code> (như <code>25-Kinh</code>, <code>48-Tày</code>, <code>12-Dao</code>). Nếu file thiếu hoặc không nhận diện được danh mục, hệ thống sẽ cảnh báo nổi bật, cho phép chỉnh sửa và mặc định khi phiên là <code>99-Nước ngoài</code> (nếu không chỉnh sửa).
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center space-x-1.5">
              <CreditCard className="w-4 h-4 text-rose-600" />
              <span>Xử lý CCCD & Cảnh báo người thiếu CCCD</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Tự động bù số 0 đứng đầu bị Excel nuốt, kiểm tra chuẩn 12 số. Những người thiếu CCCD sẽ được để trống ô CCCD khi xuất theo quy định và hiển thị danh sách cảnh báo để bổ sung.
            </p>
          </div>
        </div>
      </div>

      {/* Address Resolution Principles */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h4 className="font-bold text-slate-900 text-base flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-sky-600" />
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

      {/* Mandatory Standards Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h4 className="font-bold text-slate-900 text-base flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>Bảng Quy Chuẩn Định Dạng File Xuất Cổng KSK VNCare</span>
        </h4>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs border border-slate-200 rounded-xl">
            <thead className="bg-slate-100 text-slate-700 font-bold">
              <tr>
                <th className="px-3 py-2 text-left">Trường thông tin</th>
                <th className="px-3 py-2 text-left">Quy chuẩn định dạng</th>
                <th className="px-3 py-2 text-left">Ví dụ mẫu</th>
                <th className="px-3 py-2 text-left">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              <tr>
                <td className="px-3 py-2 font-semibold text-slate-800">Số thứ tự (STT)</td>
                <td className="px-3 py-2">Đánh số liên tục từ 1..N</td>
                <td className="px-3 py-2 font-mono">1, 2, 3...</td>
                <td className="px-3 py-2">Tự động điền nếu file gốc thiếu hoặc ngắt quãng</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-semibold text-slate-800">Ngày sinh & Ngày cấp</td>
                <td className="px-3 py-2">Định dạng chuẩn <code>DD/MM/YYYY</code></td>
                <td className="px-3 py-2 font-mono">15/08/1988</td>
                <td className="px-3 py-2">Tự động dịch mã ngày serial của Excel</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-semibold text-slate-800">Số CCCD / CMND</td>
                <td className="px-3 py-2">12 số hoặc 8-11 ký tự alphanumeric</td>
                <td className="px-3 py-2 font-mono">025088001234</td>
                <td className="px-3 py-2">Lưu dạng Text (@) bảo toàn số 0 đứng đầu; bỏ trống nếu thiếu</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-semibold text-slate-800">Dân tộc</td>
                <td className="px-3 py-2">Dạng <code>Mã-Dân tộc</code> (65 dân tộc)</td>
                <td className="px-3 py-2 font-mono">25-Kinh, 48-Tày</td>
                <td className="px-3 py-2">Tự động phiên từ tên viết thường hoặc mã số</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-semibold text-slate-800">Mã Đợt khám</td>
                <td className="px-3 py-2">6 chữ số định dạng <code>YYYYMM</code></td>
                <td className="px-3 py-2 font-mono">202601, 202610</td>
                <td className="px-3 py-2">Khớp với đợt khám khai báo trên cổng VNCare</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-semibold text-slate-800">Định dạng thẩm mỹ</td>
                <td className="px-3 py-2">Font Times New Roman 13pt</td>
                <td className="px-3 py-2">Borders kẻ ô toàn bộ</td>
                <td className="px-3 py-2">Tự động giãn dòng và căn chỉnh độ rộng cột theo nội dung</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Sample Templates Download Card */}
      <div className="bg-sky-50 border border-sky-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sky-950 text-base">Tải File Mẫu Về Máy Để Thử Nghiệm</h4>
          <p className="text-xs text-sky-800 mt-1">
            Bạn có thể tải trực tiếp file mẫu gốc từ hệ thống để chạy thử quy trình phiên:
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <a
            href="template/MauFileImportBenhNhan_ksktoandan.xls"
            download="MauFileImportBenhNhan_ksktoandan.xls"
            className="px-3.5 py-2 bg-white hover:bg-sky-100 text-sky-800 text-xs font-bold rounded-lg border border-sky-300 shadow-2xs inline-flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Mẫu VNCare (.xls)</span>
          </a>

          <a
            href="template/93_Hop_dong_KSK_HBM_2026.xlsx"
            download="93 Hợp đồng KSK HBM 2026.xlsx"
            className="px-3.5 py-2 bg-white hover:bg-sky-100 text-sky-800 text-xs font-bold rounded-lg border border-sky-300 shadow-2xs inline-flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Mẫu Hợp đồng (.xlsx)</span>
          </a>
        </div>
      </div>
    </div>
  );
};
