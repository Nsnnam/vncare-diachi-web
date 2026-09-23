export const APP_META = {
  name: "VNCare Phiên Địa Chỉ 2 Cấp",
  appCode: "DIACHI",
  version: "1.1.0",
  releaseDate: "2026-09-23",
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
