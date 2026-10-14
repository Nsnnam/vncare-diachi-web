export const APP_META = {
  name: "VNCare Phiên Địa Chỉ 2 Cấp",
  appCode: "DIACHI",
  version: "1.3.1",
  releaseDate: "2026-10-14",
  author: "Nguyễn Sơn Nam (Nsnnam / NamNS)",
  githubUrl: "https://github.com/Nsnnam/vncare-diachi-web",
  homeRepo: "Nsnnam/vncare-diachi-web",
  timezone: "Asia/Ho_Chi_Minh",
  coffee: {
    title: "Mời cà phê tác giả ☕",
    blurb: "Nếu bạn thấy ứng dụng phiên địa chỉ hữu ích, hãy ủng hộ tác giả một tách cà phê nhé!",
    accountName: "NGUYEN SON NAM",
    accountNumber: "8855989777",
    bank: "BIDV — PGD Nguyễn Tất Thành",
    method: "Quét mã VietQR bên dưới để chuyển khoản nhanh",
    thanks: "Cảm ơn bạn đã luôn ủng hộ các dự án mã nguồn mở!",
    qrAlt: "QR VietQR ủng hộ - BIDV 8855989777",
    qrPath: "coffee-qr.jpg",
  },
  changelog: [
    {
      version: "1.3.1",
      date: "2026-10-14",
      highlights: [
        "Khắc phục triệt để lỗi nhận diện cột Địa chỉ: Tự động nhận diện chuẩn xác các từ viết tắt phổ biến 'ĐC', 'Đ/C', 'DC', 'D/C'; đồng thời loại trừ triệt để các cột Nơi cấp CCCD (NOICAP) tránh chọn nhầm.",
        "Sửa lỗi đối soát 3 cấp cũ: Siết chặt ngưỡng điểm số đối soát (bắt buộc có Huyện hoặc Tỉnh đi kèm) và bổ sung bộ lọc cơ quan cấp giấy tờ, khắc phục hoàn toàn lỗi cụm từ 'trật tự xã hội' bị phiên nhầm thành 'Xã Phùng Nguyên, Tỉnh Phú Thọ'.",
        "Khắc phục lỗi nhân đôi / nhân ba cột khi xuất file: Cơ chế Isolated Workbook Clone và nhận diện cột đã tồn tại giúp file xuất ra chỉ chứa đúng 1 bộ cột TINH, XA, Địa chỉ 2 cấp kể cả khi phiên nhiều lần.",
        "Khắc phục lỗi hỏng công thức Excel (Corrupt Workbook): Tự động dọn dẹp các liên kết ngoài bị gãy (broken external link formulas) trên toàn bộ các sheet, giữ nguyên 100% dữ liệu hiển thị và loại bỏ hoàn toàn cảnh báo 'Removed Records: Formula' của Microsoft Excel."
      ]
    },
    {
      version: "1.3.0",
      date: "2026-10-09",
      highlights: [
        "Tùy biến Sheet & Cột phiên cho file không theo mẫu: Tự động mở bảng cấu hình ánh xạ cột khi nạp file hợp đồng KSK, danh sách CBNV ngoài mẫu VNCare; cho phép chọn Sheet và tùy chỉnh cột Địa chỉ, Dân tộc, Họ tên, Ngày sinh, CCCD, Nghề nghiệp, Nơi làm việc, SĐT.",
        "Tùy chọn Địa chỉ 2 cấp kèm chi tiết: Cho phép xuất cột 'Địa chỉ 2 cấp' kèm chi tiết số nhà, thôn, xóm, đường + Xã + Tỉnh (ví dụ: 'Thôn Đông Thịnh, Xã Sơn Đông, Tỉnh Phú Thọ') thay vì chỉ có mỗi 'Xã Sơn Đông, Tỉnh Phú Thọ'.",
        "Chuẩn hóa và Cảnh báo Mã Dân tộc: Tự động phiên mã dân tộc sang định dạng chuẩn 'Mã-Dân tộc' (65 dân tộc VNCare); gắn cờ cảnh báo người thiếu hoặc chưa khớp mã dân tộc; bổ sung thẻ thống kê, băng cảnh báo hổ phách và hỗ trợ sửa nhanh 1 chạm.",
        "Giao diện trực quan cao cấp: Tối ưu typography font tiếng Việt Be Vietnam Pro, bảng đối chiếu 2 phần Input/Output rõ ràng, các bộ lọc chuyên biệt cho kiểm soát chất lượng dữ liệu KSK."
      ]
    },
    {
      version: "1.2.0",
      date: "2026-09-27",
      highlights: [
        "Cột STT bắt buộc: tự động đánh số thứ tự liên tục từ 1 đến hết cho toàn bộ dòng dữ liệu có nội dung.",
        "Đảm bảo bắt buộc điền đầy đủ và đúng định dạng Text General (@) cho tất cả các cột: STT, Tên bệnh nhân, Ngày sinh, Giới tính, Nghề nghiệp, Dân tộc, Quốc gia, Tỉnh, Xã, Địa chỉ, CCCD.",
        "Cột Ngày sinh và Ngày cấp CCCD bắt buộc chuẩn hóa theo định dạng DD/MM/YYYY (xử lý chính xác mã ngày serial Excel và làm tròn hạn chế sai số float).",
        "Cột CCCD chuẩn hóa theo định dạng 12 chữ số hoặc 8-11 ký tự alphanumeric (tự động khôi phục số 0 đứng đầu khi đọc dữ liệu dạng số).",
        "Cột Đợt khám chuẩn hóa và xác thực nghiêm ngặt theo định dạng YYYYMM (mẫu: 202601).",
        "Bổ sung thanh trạng thái kiểm tra tính hợp lệ dữ liệu và bộ lọc 'Cảnh báo bắt buộc' trực tiếp trên bảng xem trước."
      ]
    },
    {
      version: "1.1.0",
      date: "2026-09-23",
      highlights: [
        "Chuẩn hóa toàn diện định dạng file Excel đầu ra: Font Times New Roman 13pt, kẻ ô viền (borders) toàn bộ bảng, tự động giãn dòng và căn chỉnh độ rộng cột theo nội dung.",
        "Thiết kế lại giao diện web với bộ font tiếng Việt chuyên nghiệp Be Vietnam Pro.",
        "Tích hợp màn hình khóa bảo mật (Lock Screen) xác thực mã băm SHA-256 nội bộ, hỗ trợ nhập linh hoạt chữ hoa/thường/không dấu.",
        "Nâng cấp bộ engine xuất Excel bằng xlsx-js-style giữ nguyên 100% định dạng, cấu trúc và các sheet mẫu VNCare.",
        "Cập nhật bản đóng gói chạy offline Single HTML độc lập."
      ]
    },
    {
      version: "1.0.0",
      date: "2026-09-23",
      highlights: [
        "Khởi tạo dự án Web tự động phiên địa chỉ 2 cấp & 3 cấp sang chuẩn VNCare từ file Excel.",
        "Tích hợp cơ sở dữ liệu địa chỉ 2 cấp mới (34 tỉnh, 3.320 xã/phường) và 10.035 liên kết địa chỉ 3 cấp cũ.",
        "Hỗ trợ Chế độ 1: Phiên & điền trực tiếp vào file mẫu VNCare / file dữ liệu hiện tại, giữ nguyên mọi cột khác.",
        "Hỗ trợ Chế độ 2: Tự động chuyển đổi từ danh sách hợp đồng / KSK tùy ý sang file Mẫu Import VNCare chuẩn (7 sheets).",
        "Tự động nhận diện ranh giới địa danh, loại trừ nhầm lẫn tên tỉnh/xã, độ chính xác cao.",
        "Hỗ trợ Thư viện danh mục thủ công (Custom Dictionary) lưu cục bộ, có tính năng Xuất/Nhập file JSON.",
        "Cảnh báo trực quan các trường địa chỉ chưa phiên được, cho phép sửa nhanh tại chỗ.",
        "Hỗ trợ hoạt động 100% offline không cần mạng, bảo mật tối đa dữ liệu bệnh nhân/khách hàng."
      ]
    }
  ]
};
