# VNCare Phiên Địa Chỉ 2 Cấp (Web & Offline)

Ứng dụng web tự động nhận diện, phân tích và phiên mã địa chỉ hành chính 2 cấp (Tỉnh/TP và Xã/Phường) và chuyển đổi từ địa chỉ 3 cấp cũ sang chuẩn VNCare / VNPT-HIS từ file Excel. Hỗ trợ hoạt động offline 100%, bảo vệ tuyệt đối dữ liệu y tế, tích hợp Thư viện danh mục thủ công (Custom Dictionary) chống bỏ sót.

| | |
|---|---|
| **Phiên bản** | `1.0.0` |
| **Ngày phát hành** | 2026-09-23 |
| **Tác giả** | [Nguyễn Sơn Nam (Nsnnam)](https://github.com/Nsnnam) |
| **Múi giờ** | GMT+7 (`Asia/Ho_Chi_Minh`) |
| **Kho mã nguồn** | [https://github.com/Nsnnam/vncare-diachi-web](https://github.com/Nsnnam/vncare-diachi-web) |
| **Trang trực tuyến (Live)** | [https://nsnnam.github.io/vncare-diachi-web/](https://nsnnam.github.io/vncare-diachi-web/) |
| **Bản chạy Offline 100%** | `releases/vncare-diachi-web-v1.0.0-offline.html` (Mở trực tiếp trên mọi trình duyệt) |
| **Giấy phép** | MIT (Public Open-Source) |

---

## Tính năng nổi bật

1. **Tự động nhận diện & Phiên địa chỉ 2 cấp chuẩn xác**:
   - Sử dụng cơ sở dữ liệu địa danh hành chính 2 cấp mới nhất (34 Tỉnh/Thành phố và 3.320 Xã/Phường).
   - Tự động nhận diện ranh giới địa danh và loại trừ trùng lặp tên tỉnh/xã trong chuỗi văn bản (ví dụ: chuỗi chứa *"phường Yên Bái, tỉnh Lào Cai"* sẽ không bị bắt nhầm thành *"Phường Lào Cai"*).

2. **Chuyển đổi tự động từ địa chỉ 3 cấp cũ (10.035 liên kết sáp nhập)**:
   - Tự động nhận diện địa chỉ ghi theo 3 cấp cũ (Xã cũ, Huyện cũ, Tỉnh cũ) để chuyển đổi về đúng Xã mới và Tỉnh mới (ví dụ: *Xã An Bình, Huyện Nam Sách, Tỉnh Hải Dương* → *Xã An Phú, Thành phố Hải Phòng*; *Phường Đồng Tâm, TP Yên Bái, Tỉnh Yên Bái* → *Phường Yên Bái, Tỉnh Lào Cai*).
   - Nếu địa chỉ đã là 2 cấp sẵn thì điền trực tiếp.

3. **Hai chế độ xử lý linh hoạt**:
   - **Chế độ 1: Phiên trực tiếp vào file hiện tại**:
     Dành cho file mẫu nạp bệnh nhân KSK toàn dân VNCare (`MauFileImportBenhNhan_ksktoandan.xls`) hoặc bất kỳ file Excel nào. Đọc cột `DIACHI` (Cột N) → Điền mã chuẩn vào cột `TINH` (Cột L) và `XA` (Cột M). **Bảo toàn 100% dữ liệu ở các cột và các sheet khác**.
   - **Chế độ 2: Xuất Mẫu VNCare chuẩn (7 Sheets)**:
     Dành cho các file danh sách hợp đồng KSK tùy ý của cơ quan, nhà máy (ví dụ `93 Hợp đồng KSK HBM 2026.xlsx`). Tự động ánh xạ Họ tên, Ngày sinh, Giới tính, CCCD, Nơi làm việc, SĐT... và đổ vào file mẫu chuẩn 7 sheet của VNCare (`DANHSACH`, `TINH`, `XA`, `QUOCGIA`, `DANTOC`, `GIOITINH`, `NGHENGHIEP`).

4. **Thư viện danh mục thủ công (Custom Dictionary)**:
   - Cảnh báo trực quan danh sách các dòng địa chỉ chưa nhận diện được hoặc viết tắt đặc thù.
   - Cho phép người dùng chọn Tỉnh & Xã thủ công trực tiếp từ dropdown, gom nhóm địa chỉ giống nhau để xử lý 1 chạm.
   - Nút **"Lưu vào Thư viện"** lưu cấu hình vào `localStorage` của trình duyệt. Các lần import sau gặp địa chỉ tương tự sẽ tự động phiên chuẩn 100%.
   - Hỗ trợ **Xuất file JSON thư viện** để sao lưu hoặc **Nhập file JSON** để đồng bộ giữa các máy tính trong khoa/phòng.

5. **An toàn & Hoạt động Offline 100%**:
   - Xử lý hoàn toàn tại trình duyệt máy khách (Client-side), không truyền file hay thông tin người bệnh lên bất kỳ máy chủ nào.
   - Có thể tải file `vncare-diachi-web-v1.0.0-offline.html` về máy để chạy độc lập không cần mạng Internet.

---

## Cài đặt & Khởi chạy

### Cách 1: Sử dụng trực tuyến qua GitHub Pages
Truy cập: [https://nsnnam.github.io/vncare-diachi-web/](https://nsnnam.github.io/vncare-diachi-web/)

### Cách 2: Sử dụng bản Offline Single HTML (Khuyên dùng trong nội bộ bệnh viện)
Tải file [`releases/vncare-diachi-web-v1.0.0-offline.html`](./releases/vncare-diachi-web-v1.0.0-offline.html) về máy tính và nhấp đúp chuột để mở bằng Chrome / Edge / Cốc Cốc.

### Cách 3: Chạy từ mã nguồn
```bash
git clone https://github.com/Nsnnam/vncare-diachi-web.git
cd vncare-diachi-web
pnpm install
pnpm run dev
```

### Đóng gói Single File Offline
```bash
pnpm run build:single
# File kết quả: releases/vncare-diachi-web-v1.0.0-offline.html
```

---

## Cấu trúc thư mục

```
vncare-diachi-web/
├── .github/workflows/deploy.yml # Tự động deploy GitHub Pages
├── public/
│   ├── coffee-qr.jpg            # Ảnh VietQR tác giả chuẩn NSN
│   └── template/                # File mẫu VNCare & file hợp đồng KSK
├── releases/
│   └── vncare-diachi-web-v1.0.0-offline.html # Bản offline độc lập
├── src/
│   ├── components/              # Các thành phần UI (Navbar, Preview, Drawer...)
│   ├── constants/               # APP_META (Tác giả, version, múi giờ GMT+7)
│   ├── data/
│   │   ├── addresses.json       # 10.035 liên kết sáp nhập 3 cấp cũ
│   │   └── diadanh_tags.json    # 34 tỉnh và 3.320 xã/phường 2 cấp mới
│   ├── services/
│   │   ├── addressEngine.ts     # Thuật toán phân tích & phiên địa chỉ
│   │   ├── customDictService.ts # Quản lý Thư viện thủ công (LocalStorage / JSON)
│   │   └── excelService.ts      # Xử lý đọc & xuất file Excel XLSX/XLS
│   ├── types/                   # Định nghĩa TypeScript
│   ├── App.tsx
│   └── main.tsx
├── AUTHORS.md
├── CHANGELOG.md
├── SUPPORT.md
├── package.json
└── README.md
```

---

## Thông tin tác giả & Ủng hộ

- **Tác giả:** Nguyễn Sơn Nam (Nsnnam / NamNS)
- **Email:** akahimachi@gmail.com
- **GitHub:** [https://github.com/Nsnnam](https://github.com/Nsnnam)
- **Mời cà phê tác giả:**
  - Ngân hàng: **BIDV — PGD Nguyễn Tất Thành**
  - Số tài khoản: **8855989777**
  - Chủ tài khoản: **NGUYEN SON NAM**

Xem thêm chi tiết tại [SUPPORT.md](./SUPPORT.md).
