# Lịch sử phiên bản (CHANGELOG)

Toàn bộ các thay đổi của dự án **VNCare Phiên Địa Chỉ 2 Cấp** được ghi nhận tại đây theo chuẩn [Keep a Changelog](https://keepachangelog.com/).

## [1.0.0] - 2026-09-23

### Khởi tạo
- **Dữ liệu địa danh:**
  - Tích hợp toàn diện 34 Tỉnh/Thành phố và 3.320 Xã/Phường hành chính mới nhất từ `diadanh_tags.json`.
  - Tích hợp 10.035 quy tắc quy đổi từ địa danh 3 cấp cũ (Xã cũ, Huyện cũ, Tỉnh cũ) từ `addresses.json`.
- **Động cơ xử lý địa chỉ (`addressEngine.ts`):**
  - Xử lý nhận diện địa chỉ 2 cấp trực tiếp (khớp chính xác tiền tố và tên định danh).
  - Thuật toán bóc tách ranh giới tỉnh để loại trừ bắt nhầm tên xã trùng với tên tỉnh trong cùng chuỗi văn bản.
  - Tự động quy đổi địa chỉ 3 cấp cũ sang địa chỉ 2 cấp mới.
  - Tích hợp Thư viện danh mục thủ công (Custom Dictionary) ưu tiên cao nhất.
- **Xử lý Excel (`excelService.ts`):**
  - **Chế độ 1:** Đọc cột `DIACHI` và điền trực tiếp mã Tỉnh (cột L) và mã Xã (cột M) vào file hiện tại, bảo toàn 100% các cột khác và các sheet khác.
  - **Chế độ 2:** Tự động chuyển đổi file hợp đồng KSK tùy ý sang chuẩn Mẫu Import VNCare 7 sheets (`DANHSACH`, `TINH`, `XA`, `QUOCGIA`, `DANTOC`, `GIOITINH`, `NGHENGHIEP`).
- **Giao diện & Tiện ích:**
  - Bảng xem trước tương tác (lọc Đã phiên, Chưa khớp, Khớp thư viện, tìm kiếm nhanh).
  - Hộp thoại xử lý địa chỉ chưa khớp thông minh (Unmapped Drawer) gom nhóm các địa chỉ trùng nhau để xử lý 1 chạm.
  - Quản lý Thư viện thủ công: Thêm, Xóa, Xuất file JSON, Nhập file JSON.
  - Đóng gói bản chạy offline Single HTML độc lập (`releases/vncare-diachi-web-v1.0.0-offline.html`).
  - Hỗ trợ triển khai tự động lên GitHub Pages qua GitHub Actions.
