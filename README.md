# VNCare Phiên Địa Chỉ 2 Cấp (Web & Offline v1.3.5)

> **Công cụ tự động nhận diện, phân tích và phiên mã địa chỉ hành chính 2 cấp (Tỉnh/TP và Xã/Phường), chuyển đổi địa chỉ 3 cấp cũ sang chuẩn VNCare / VNPT-HIS từ file Excel. Hoạt động 100% Offline bảo mật dữ liệu y tế, chuẩn hóa định dạng Times New Roman 13pt, chuẩn hóa viết hoa toàn bộ Họ và Tên, chuẩn hóa số điện thoại 10 số (Text General @), quản lý 65 dân tộc, phiên chuẩn 250 quốc gia VNCare và tùy biến cột linh hoạt.**

[![Version](https://img.shields.io/badge/version-1.3.5-blue.svg)](https://github.com/Nsnnam/vncare-diachi-web)
[![Offline First](https://img.shields.io/badge/offline--first-100%25-emerald.svg)](https://nsnnam.github.io/vncare-diachi-web/)
[![Standard](https://img.shields.io/badge/standard-NSN_App_Standard-indigo.svg)](https://github.com/Nsnnam)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Timezone](https://img.shields.io/badge/timezone-GMT%2B7_Asia%2FHo__Chi__Minh-orange.svg)](https://github.com/Nsnnam/vncare-diachi-web)

---

## Bảng Thông Tin Phát Hành (v1.3.5)

| Thông tin | Chi tiết |
|---|---|
| **Phiên bản hiện tại** | `v1.3.5` |
| **Ngày cập nhật** | 31/10/2026 |
| **Tác giả** | [Nguyễn Sơn Nam (Nsnnam / NamNS)](https://github.com/Nsnnam) |
| **Múi giờ chuẩn** | GMT+7 (`Asia/Ho_Chi_Minh`) |
| **Kho mã nguồn** | [https://github.com/Nsnnam/vncare-diachi-web](https://github.com/Nsnnam/vncare-diachi-web) |
| **Trang trực tuyến (Live)** | [https://nsnnam.github.io/vncare-diachi-web/](https://nsnnam.github.io/vncare-diachi-web/) |
| **Bản chạy Offline Single-file HTML** | [`releases/vncare-diachi-web-v1.3.5-offline.html`](./releases/vncare-diachi-web-v1.3.5-offline.html) *(Mở trực tiếp trên Chrome, Edge, Cốc Cốc không cần mạng)* |
| **Font giao diện** | **Be Vietnam Pro** (Thiết kế tối ưu tiếng Việt) |
| **Font file Excel xuất ra** | **Times New Roman 13pt**, kẻ ô viền (borders), giãn dòng theo nội dung |
| **Mật mã mở khóa mặc định** | `namns` (mã băm SHA-256 an toàn) |

---

## Các Tính Năng Mới & Sửa Đổi Nổi Bật của Phiên Bản v1.3.5

### 1. Chuẩn hóa VIẾT HOA Toàn Bộ Cột Họ và Tên (Họ tên, Tên...) ở File Đầu Ra
- **Chuẩn hóa chữ in hoa (UPPERCASE) toàn bộ cột Họ và Tên:**
  - Tự động chuẩn hóa toàn bộ tên người bệnh/cán bộ nhân viên sang chữ in hoa (`val.toUpperCase()`) và làm sạch các khoảng trắng thừa giữa các từ.
  - Áp dụng chuẩn hóa cho mọi cách đặt tiêu đề cột: "Họ và tên", "Họ tên", "Họ và Tên", "Tên", "TENBENHNHAN", "Họ và tên bệnh nhân"...
  - Đảm bảo 100% tuân thủ quy chuẩn định dạng hồ sơ bệnh án điện tử và cổng tiếp nhận dữ liệu KSK của VNCare / VNPT-HIS.
- **Đồng bộ ghi đè cột Họ và tên ở cả 2 chế độ xuất file:**
  - **Chế độ 1 (Điền trực tiếp):** Tự động ghi đè tên đã chuẩn hóa viết hoa vào cột Họ và tên gốc trong file Excel xuất ra.
  - **Chế độ 2 (Mẫu 7 sheet VNCare):** Ghi tên viết hoa toàn bộ vào Cột 1 (`TENBENHNHAN`) trong sheet `DANHSACH`.
- **Giao diện đối chiếu Họ và tên trực quan:**
  - Bảng đối chiếu hiển thị nổi bật tên in hoa đã chuẩn hóa (`NGUYỄN VĂN A`, `XIAO YONG LIANG`...).
  - Tự động hiển thị chú thích tên gốc trong file nạp nếu có sự khác biệt về kiểu chữ hoa/thường (`Gốc: nguyễn văn a`), giúp nhân viên y tế đối chiếu tức thì mà không cần mở lại file gốc.
  - Bổ sung thông tin chuẩn hóa viết hoa vào Băng hành động xuất file (Hero Banner).

---

## Các Tính Năng & Sửa Đổi của Phiên Bản v1.3.4

### 1. Chuẩn hóa Quốc Gia 250 Mã theo Sheet `QUOCGIA` phôi VNCare
- **Phiên chuẩn cho người Việt Nam và Người nước ngoài:** Tự động tra cứu và phiên đúng mã chuẩn VNCare (`0-Việt Nam`, `336-Trung quốc`, `512-Đài loan`, `411-Hàn quốc`, `403-Nhật`, `517-Hoa kỳ`...).
- **Từ điển thông minh & Mã nhận diện:** Nhận diện cả tên tiếng Việt có dấu/không dấu, tên quốc tế tiếng Anh (`China`, `Taiwan`, `Korea`, `USA`...), tên viết tắt và mã số trực tiếp (`336`, `512`, `411`...).
- **Đồng bộ xuất file ở cả 2 chế độ:** Ghi đè chính xác mã quốc gia đã phiên vào cột Quốc gia của file gốc (Chế độ 1: Điền trực tiếp) và Cột 7 (`QUOCGIA`) trong mẫu chuẩn 7 sheet VNCare (Chế độ 2).
- **Cảnh báo & Chỉnh sửa trực quan:** Thêm cấu hình chọn "Cột Quốc gia" trong bảng tùy chọn cột; hiển thị cột Quốc gia trên Bảng đối chiếu; tự động phát hiện và bật cảnh báo màu tím cho dòng người nước ngoài thiếu hoặc chưa khớp quốc gia; cho phép chọn 1 chạm từ danh mục 250 quốc gia VNCare.

---

## Các Tính Năng & Sửa Đổi của Phiên Bản v1.3.3

### 1. Chuẩn hóa Số Điện Thoại 10 số (Định dạng Text General `@`)
- **Bảo toàn số 0 ở đầu:** Tự động thiết lập định dạng Text General (`cell.t = 's'`, `cell.z = '@'`) cho cột Số điện thoại (`SDTBENHNHAN` / `phoneCol`) trong file Excel xuất ra, loại bỏ hoàn toàn hiện tượng Excel tự động chuyển thành Number làm mất số `0` ở đầu.
- **Quy chuẩn 10 chữ số viết liền:** Làm sạch toàn bộ khoảng trắng, dấu chấm, dấu gạch nối...; tự động chuyển đổi các tiền tố quốc tế `+84`, `0084`, `84` thành `0`; tự động bù số `0` ở đầu cho các chuỗi 9 chữ số bị mất số 0 đầu.
- **Cảnh báo Số điện thoại lạ & Cho phép sửa thủ công:** Phát hiện các số điện thoại không hợp lệ (không đủ 10 số, thừa số, chứa chữ/ký tự lạ) với huy hiệu cảnh báo hổ phách, thẻ thống kê và băng cảnh báo; hỗ trợ nhấp trực tiếp vào badge cảnh báo hoặc nút "Sửa SĐT" để chỉnh sửa thủ công nhanh chóng.

---

## Các Tính Năng & Sửa Đổi của Phiên Bản v1.3.2

### 1. Chuẩn hóa Dân tộc không nhận diện được & Mặc định `99-Nước ngoài`
- **Mặc định phiên ra file là `99-Nước ngoài`:** Nếu dòng dữ liệu bị thiếu hoặc chuỗi dân tộc không khớp với bất kỳ dân tộc nào trong danh mục 65 dân tộc chuẩn VNCare, hệ thống sẽ tự động gán giá trị xuất file là **`99-Nước ngoài`** (nếu người dùng không chủ động chỉnh sửa).
- **Cảnh báo đa tầng:** Bật cờ cảnh báo hổ phách/đỏ trên Thẻ thống kê, Băng cảnh báo và từng dòng trên Bảng đối chiếu.
- **Tương tác sửa 1 chạm:** Cho phép nhấp trực tiếp vào huy hiệu cảnh báo dân tộc để mở danh mục 65 dân tộc chọn lại ngay lập tức; nút ở cuối dòng tự động làm nổi bật `Sửa DT` giúp thao tác thuận tiện.

---

## Các Tính Năng & Sửa Lỗi của Phiên Bản v1.3.1

### 1. Nhận diện tự động cột Địa chỉ viết tắt (`ĐC`, `Đ/C`, `DC`, `D/C`)
- Tự động nhận diện chính xác các cột địa chỉ có tiêu đề viết tắt như `ĐC`, `Đ/C`, `DC`, `D/C`, `ĐC thường trú` trong các bảng danh sách CBNV, hợp đồng KSK.
- Tự động loại trừ triệt để các cột Nơi cấp CCCD (`NOICAP`, `Nơi cấp`, `Cơ quan cấp`), chống hiện tượng chọn nhầm làm địa chỉ.

### 2. Khắc phục triệt để lỗi đối soát 3 cấp cũ và lỗi gán nhầm sang `Xã Phùng Nguyên, Tỉnh Phú Thọ`
- Siết chặt điều kiện khớp 3 cấp cũ (`score >= 45`): bắt buộc phải có thông tin Huyện cũ hoặc Tỉnh cũ đi kèm tên Xã cũ, ngăn chặn hiện tượng cụm từ ngẫu nhiên bị khớp bừa.
- Tích hợp bộ lọc cơ quan cấp giấy tờ (`Cục cảnh sát quản lý hành chính về trật tự xã hội`, `Bộ công an`...), không để cụm từ "trật tự xã hội" bị bắt nhầm thành "Xã Tứ Xã -> Xã Phùng Nguyên".

### 3. Cơ chế Isolated Workbook Clone chống nhân đôi / nhân ba cột
- Mỗi lần xuất file đều clone từ `originalBuffer` nguyên bản, không làm biến đổi (mutate) workbook đang giữ trong React state.
- Tự động kiểm tra và tái sử dụng cột `TINH`, `XA`, `Địa chỉ 2 cấp` đã có sẵn trong bảng, xóa bỏ hoàn toàn lỗi lặp cột ở cuối bảng khi bấm xuất nhiều lần.

### 4. Loại bỏ hoàn toàn lỗi hỏng file Excel (Removed Records: Formula)
- Tự động dọn dẹp các liên kết công thức ngoài bị gãy (`broken external formulas`) trên toàn bộ các sheet của file Excel gốc khi xuất.
- Giữ nguyên 100% dữ liệu hiển thị, bảo đảm mở file mượt mà trên Microsoft Excel mà không gặp bất kỳ thông báo lỗi sửa chữa file nào.

### 1. Tùy biến Sheet & Cột phiên cho file ngoài mẫu (Hợp đồng KSK, CBNV)
- Khi nạp các file hợp đồng KSK của đơn vị, nhà máy, cơ quan (không phải phôi mẫu VNCare chuẩn), bảng cấu hình ánh xạ cột **tự động mở ra**.
- Cho phép người dùng linh hoạt:
  - Chọn **Sheet cần xử lý** khi file Excel có nhiều sheet.
  - Chọn **Cột Địa chỉ nguồn** (bắt buộc).
  - Chọn **Cột Dân tộc** (tự động nhận diện hoặc chọn tay).
  - Chọn **Cột Họ và tên**, **Cột Ngày/Năm sinh**, **Cột Giới tính**, **Cột CCCD**, **Cột Nghề nghiệp**, **Cột Nơi làm việc**, **Cột Số ĐT**.
  - Nhập giá trị mặc định cho **Nghề nghiệp** và **Nơi làm việc** khi file đầu vào bỏ trống.

### 2. Tùy chọn "Địa chỉ 2 cấp kèm chi tiết" (Số nhà / Thôn / Xóm / Đường)
- Bổ sung tùy chọn linh hoạt cho cột "Địa chỉ 2 cấp":
  - **Tắt chi tiết:** Chỉ xuất Xã và Tỉnh sạch không mã (Ví dụ: `Xã Sơn Đông, Tỉnh Phú Thọ`).
  - **Bật chi tiết:** Tự động bóc tách và giữ lại chi tiết số nhà, thôn, xóm, đường phía trước ghép cùng Xã và Tỉnh (Ví dụ: `Thôn Đông Thịnh, Xã Sơn Đông, Tỉnh Phú Thọ` hoặc `Số 12 đường Hùng Vương, Phường Gia Cẩm, Tỉnh Phú Thọ`).
- Áp dụng đồng bộ cho cả **Chế độ 1 (Điền trực tiếp)** và **Chế độ 2 (Mẫu VNCare 7 sheets)**.

### 3. Cảnh báo và Chuẩn hóa Mã Dân tộc (Danh mục 65 dân tộc chuẩn VNCare)
- Nhận diện và quy đổi tự động tên dân tộc viết thường, viết tắt hoặc số thứ tự sang chuẩn `Mã-Dân tộc` (Ví dụ: `kinh` → `25-Kinh`, `tày` → `48-Tày`, `dao` → `12-Dao`...).
- Gắn cờ cảnh báo:
  - `isEthnicityMissing`: Bệnh nhân bỏ trống trường dân tộc.
  - `isEthnicityUnresolved`: Dân tộc không nằm trong danh mục 65 dân tộc của Bộ Y tế.
- Bổ sung **Thẻ thống kê Dân tộc** và **Băng cảnh báo màu hổ phách** kèm danh sách nhanh người bệnh cần bổ sung.
- Tab lọc riêng **"Thiếu/chưa khớp DT"** và tính năng **Sửa nhanh 1 chạm** từ menu thả xuống 65 dân tộc trực tiếp trên bảng xem trước.

### 4. Chuẩn hóa Nghiệp vụ Y tế Bắt buộc Cổng KSK VNCare
- **Cột STT (Số thứ tự):** Bắt buộc đánh số thứ tự liên tục từ 1 đến hết (1..N). Tự động bù STT nếu file gốc bị thiếu hoặc nhảy cóc.
- **Bắt buộc đầy đủ trường:** `STT`, `Tên bệnh nhân`, `Ngày sinh`, `Giới tính`, `Nghề nghiệp`, `Dân tộc`, `Quốc gia`, `Tỉnh`, `Xã`, `Địa chỉ`, `CCCD`.
- **Định dạng Text General (`@`):** Bảo toàn 100% các số `0` ở đầu của mã CCCD, số điện thoại, mã tỉnh/xã, triệt tiêu lỗi Excel tự ý đổi thành dạng số làm mất số `0`.
- **Ngày sinh & Ngày cấp CCCD:** Bắt buộc chuẩn hóa định dạng `DD/MM/YYYY`. Tự động giải mã ngày serial của Excel (như `28795` → `01/11/1978`).
- **CCCD:** Chuẩn hóa 12 chữ số hoặc 8-11 ký tự alphanumeric (CMND 9 số / Hộ chiếu). Cột CCCD để trống theo quy định đối với người chưa có và bật cảnh báo để nhân viên cập nhật.
- **Mã Đợt khám:** Bắt buộc chuẩn 6 chữ số `YYYYMM` (Ví dụ: `202601`).

### 5. Thư viện danh mục thủ công (Custom Dictionary) & Unmapped Drawer
- Tự động nhận diện 34 Tỉnh/TP và 3.320 Xã/Phường mới nhất.
- Tích hợp 10.035 quy tắc quy đổi từ địa chỉ 3 cấp cũ (Xã cũ, Huyện cũ, Tỉnh cũ) sang địa chỉ 2 cấp mới.
- Hộp thoại **Unmapped Drawer** thông minh gom nhóm các địa chỉ chưa nhận diện được để người dùng chọn Tỉnh/Xã 1 lần duy nhất cho toàn bộ các dòng giống nhau.
- Quy tắc được lưu vào LocalStorage, hỗ trợ **Xuất file JSON** và **Nhập file JSON** để đồng bộ giữa các máy tính trong viện.

### 6. Giao diện trực quan Be Vietnam Pro & Bảo mật Offline 100%
- Giao diện sử dụng toàn diện font chữ **Be Vietnam Pro** chuẩn typography tiếng Việt.
- Bảng đối chiếu 2 phần rõ rệt: **1. Dữ liệu gốc đầu vào (Input)** và **2. Kết quả đối chiếu & Chuẩn hóa VNCare (Output)**.
- Màn hình khóa bảo vệ với cơ chế mã băm SHA-256 (mật mã mặc định `namns`).
- Chạy 100% tại máy khách (Client-side), không truyền dữ liệu ra Internet, tuân thủ nghiêm ngặt bảo mật thông tin người bệnh.

---

## Hướng Dẫn Sử Dụng Chi Tiết (Từng Bước)

```
┌─────────────────┐      ┌─────────────────────────┐      ┌───────────────────────┐      ┌─────────────────────────┐
│ 1. NẠP FILE     │ ───► │ 2. CẤU HÌNH & TÙY CHỌN  │ ───► │ 3. ĐỐI CHIẾU DỮ LIỆU  │ ───► │ 4. XUẤT FILE KẾT QUẢ    │
│ Kéo thả Excel   │      │ Chọn Sheet, Cột & Đợt   │      │ Xem CCCD, Dân tộc, Đ/C│      │ Excel chuẩn TNR 13pt    │
└─────────────────┘      └─────────────────────────┘      └───────────────────────┘      └─────────────────────────┘
```

### Bước 1: Nạp file Excel đầu vào
1. Truy cập trang web trực tuyến hoặc mở file offline `vncare-diachi-web-v1.3.0-offline.html`.
2. Kéo thả file Excel (`.xls` hoặc `.xlsx`) vào khung tải lên, hoặc bấm **"chọn file"**.
3. Bạn cũng có thể bấm vào các nút dùng thử có sẵn:
   - *File Mẫu VNCare (MauFileImportBenhNhan_ksktoandan.xls)*
   - *File Hợp đồng (93 Hợp đồng KSK HBM 2026.xlsx)*

### Bước 2: Chọn Chế độ & Cấu hình Cột
- **Chọn Chế độ xử lý:**
  - **Chế độ 1:** Phiên và điền trực tiếp vào file hiện tại (giữ nguyên cấu trúc file).
  - **Chế độ 2:** Xuất form Mẫu Import VNCare chuẩn (đầy đủ 7 sheets).
- **Tùy chọn Địa chỉ 2 cấp:**
  - Tích chọn **"Thêm cột Địa chỉ 2 cấp vào file Excel xuất ra"**.
  - Nếu muốn có cả số nhà, thôn, xóm, đường: Tích chọn **"Kèm chi tiết số nhà / thôn / xóm / đường"**.
- **Cấu hình Cột (đối với file tùy biến ngoài mẫu):**
  - Bảng cấu hình sẽ tự mở ra. Kiểm tra và chọn:
    - Sheet cần phiên (nếu file có nhiều sheet).
    - Cột Địa chỉ nguồn (bắt buộc).
    - Cột Dân tộc (chuẩn hóa 65 DT).
    - Cột CCCD, Họ tên, Ngày sinh, Giới tính, Mã Đợt khám (`YYYYMM`).

### Bước 3: Bấm Bắt đầu & Xem Bảng Đối Chiếu
1. Bấm nút **"Bắt đầu phiên địa chỉ"**.
2. Sau khi xử lý xong, hệ thống hiển thị:
   - **Thanh Banner Hero:** Báo tỷ lệ khớp thành công, các tiêu chuẩn đã áp dụng.
   - **Dashboard Đối Chiếu:** 7 thẻ thống kê tương tác:
     1. Chuyển đổi 3 cấp cũ ➔ 2 cấp mới
     2. Khớp 2 cấp chuẩn
     3. Khớp từ Thư viện riêng
     4. Địa chỉ chưa khớp (cần xử lý)
     5. Thiếu CCCD (cần bổ sung)
     6. Dân tộc (thiếu hoặc chưa khớp)
     7. Tỷ lệ khớp địa chỉ tổng thể (%)

### Bước 4: Kiểm tra Cảnh báo & Sửa nhanh
- **Nếu có người thiếu CCCD:** Xem banner cảnh báo màu đỏ hoặc bấm thẻ "Thiếu CCCD" để lọc danh sách. Bấm nút **"Nhập CCCD"** tại dòng để điền bổ sung nếu có.
- **Nếu có người thiếu hoặc chưa khớp Dân tộc:** Xem banner màu hổ phách, bấm **"Sửa"** tại dòng để chọn mã dân tộc đúng từ menu 65 dân tộc.
- **Nếu có địa chỉ chưa khớp:** Bấm nút **"Xử lý địa chỉ chưa khớp ngay"** để mở hộp thoại Drawer, chọn Tỉnh và Xã tương ứng rồi lưu vào Thư viện.

### Bước 5: Xuất File Excel Chuẩn
- Bấm nút **"TẢI FILE EXCEL KẾT QUẢ NGAY"** (ở Banner Hero trên cùng hoặc thanh cố định phía dưới màn hình).
- File tải về có định dạng `.xlsx` với đầy đủ:
  - Font chữ **Times New Roman 13pt**.
  - Kẻ ô viền toàn bộ bảng (thin borders).
  - Định dạng kiểu Text General `@` bảo toàn số 0.
  - Cột Tỉnh (L), Xã (M), STT, Ngày sinh DD/MM/YYYY, CCCD chuẩn hóa.
  - Cột **"Địa chỉ 2 cấp"** (hoặc kèm chi tiết) nếu đã bật tùy chọn.

---

## Bảng Quy Chuẩn Định Dạng Dữ Liệu Đầu Ra Cổng VNCare

| STT | Cột dữ liệu | Quy chuẩn bắt buộc | Ví dụ mẫu |
|:---:|---|---|---|
| 1 | **STT** | Đánh số tự động liên tục từ 1..N | `1`, `2`, `3`... |
| 2 | **Họ và tên** | Chữ in hoa hoặc chữ thường sạch, không ký tự lạ | `NGUYỄN VĂN AN` |
| 3 | **Ngày sinh** | Đúng chuẩn `DD/MM/YYYY` | `15/08/1990` |
| 4 | **Giới tính** | Chuẩn cổng: `1-NAM` hoặc `2-NỮ` | `1-NAM`, `2-NỮ` |
| 5 | **Nghề nghiệp** | Mã-Nghề nghiệp chuẩn | `6-Công nhân`, `1-Nông dân` |
| 6 | **Nơi làm việc** | Tên đơn vị / doanh nghiệp | `Công ty TNHH MTV ABC` |
| 7 | **Dân tộc** | Đúng 1 trong 65 dân tộc: `Mã-Dân tộc` | `25-Kinh`, `48-Tày`, `12-Dao` |
| 8 | **Quốc gia** | Mã-Quốc gia | `0-Việt Nam` |
| 9 | **CCCD** | 12 chữ số hoặc 8-11 ký tự alphanumeric | `025088001234` |
| 10 | **Ngày cấp CCCD** | Đúng chuẩn `DD/MM/YYYY` | `10/05/2021` |
| 11 | **Nơi cấp CCCD** | Cơ quan cấp | `Cục Cảnh sát QLHC về TTXH` |
| 12 | **Tỉnh** (Cột L) | Mã tỉnh kèm tên chuẩn VNCare | `25-Tỉnh Phú Thọ` |
| 13 | **Xã** (Cột M) | Mã xã kèm tên chuẩn VNCare | `08716-Phường Vĩnh Phúc` |
| 14 | **Địa chỉ** (Cột N) | Chuỗi địa chỉ gốc đầy đủ | `Tổ 3, P. Vĩnh Phúc, Phú Thọ` |
| 15 | **Địa chỉ 2 cấp** | Tên xã và tỉnh sạch (tùy chọn kèm chi tiết) | `Phường Vĩnh Phúc, Tỉnh Phú Thọ` |
| 16 | **Đợt khám** | 6 chữ số định dạng `YYYYMM` | `202601` |

---

## Danh Mục 65 Dân Tộc Chuẩn VNCare

Ứng dụng tích hợp sẵn danh mục toàn văn 65 dân tộc chuẩn cổng y tế quốc gia:

```
01-Ba Na      14-Gia Rai    27-Lào        40-Pà Thẻn    53-Xinh Mun
02-Bơ Y       15-Giáy       28-Lô Lô      41-Phù Lá     54-Xơ Đăng
03-Brau       16-Giẻ Triêng 29-Lự         42-Pu Péo     55-Xtiêng
04-Bru-Vân Kiều 17-H'Rê     30-M'Nông     43-Rơ Măm     56-Chơ Ro
05-Cờ Lao     18-Hà Nhì     31-Mạ         44-Ra Glai    57-Kháng
06-Chăm       19-Hoa        32-Mảng       45-Sán Dìu    58-Xơ-tiêng
07-Chơ-ro     20-Hrê        33-Mnông      46-Sán Chay   59-Người Nước Ngoài
08-Chu-ru     21-Khơ Me     34-Mường      47-Si La      60-Ơ Đu
09-Chứt       22-Khơ-mú     35-Mông       48-Tày        61-Kinh (khác)
10-Co         23-Kơ-ho      36-Ngái       49-Tà Ôi      62-Thái (khác)
11-Cống       24-Khang      37-Nùng       50-Thái       63-Mường (khác)
12-Dao        25-Kinh       38-Ô Đu       51-Thổ        64-Tày (khác)
13-Ê Đê       26-La Ha      39-Ơ-đu       52-Thu Lao    65-Không xác định
```

---

## Hướng Dẫn Khởi Chạy & Đóng Gói (Dành Cho Lập Trình Viên)

### Yêu cầu môi trường
- Node.js >= 18.0
- PNPM >= 8.0 (hoặc NPM / Yarn)

### Khởi chạy môi trường Dev
```bash
# Clone repo
git clone https://github.com/Nsnnam/vncare-diachi-web.git
cd vncare-diachi-web

# Cài đặt thư viện
pnpm install

# Khởi chạy máy chủ phát triển
pnpm run dev
```

### Build cho GitHub Pages
```bash
pnpm run build
# Bundle được xuất ra thư mục dist/
```

### Đóng gói Single-file HTML Offline
```bash
pnpm run build:single
# File kết quả: releases/vncare-diachi-web-v1.3.0-offline.html
```

---

## Cấu Trúc Mã Nguồn

```
vncare-diachi-web/
├── .github/workflows/deploy.yml # Tự động deploy GitHub Pages
├── public/
│   ├── coffee-qr.jpg            # Ảnh VietQR tác giả chuẩn NSN
│   └── template/                # File mẫu VNCare & file hợp đồng KSK
├── releases/
│   └── vncare-diachi-web-v1.3.0-offline.html # Bản offline độc lập v1.3.0
├── src/
│   ├── components/
│   │   ├── AboutModal.tsx       # Thông tin tác giả & lịch sử cập nhật
│   │   ├── CustomDictionaryTab.tsx # Quản lý Thư viện riêng (JSON / LocalStorage)
│   │   ├── ExcelProcessorTab.tsx   # Xử lý Excel, tùy biến cột, dashboard
│   │   ├── Footer.tsx           # Footer bản quyền & link GitHub
│   │   ├── GuideTab.tsx         # Hướng dẫn sử dụng & quy chuẩn y tế
│   │   ├── LockScreenModal.tsx  # Khóa màn hình bảo mật SHA-256
│   │   ├── Navbar.tsx           # Thanh điều hướng trên cùng
│   │   ├── PreviewTable.tsx     # Bảng đối chiếu Input/Output chi tiết
│   │   └── UnmappedDrawer.tsx   # Hộp thoại xử lý địa chỉ chưa khớp
│   ├── constants/
│   │   └── meta.ts              # Thông tin phiên bản, tác giả, changelog
│   ├── data/
│   │   ├── addresses.json       # 10.035 liên kết sáp nhập địa chỉ 3 cấp cũ
│   │   └── diadanh_tags.json    # 34 tỉnh và 3.320 xã/phường 2 cấp mới
│   ├── services/
│   │   ├── addressEngine.ts     # Thuật toán bóc tách 2 cấp & chi tiết
│   │   ├── customDictService.ts # Thư viện địa chỉ thủ công
│   │   ├── ethnicityService.ts  # Chuẩn hóa & kiểm tra 65 dân tộc VNCare
│   │   └── excelService.ts      # Đọc & xuất Excel (Times New Roman 13pt)
│   ├── types/
│   │   └── index.ts             # Kiểu dữ liệu TypeScript
│   ├── App.tsx
│   ├── index.css                # CSS cấu hình Be Vietnam Pro
│   └── main.tsx
├── AGENTS.md                    # Quy định phát triển cho Agent & AI
├── AUTHORS.md                   # Danh sách tác giả & đóng góp
├── CHANGELOG.md                 # Lịch sử cập nhật chi tiết các phiên bản
├── SUPPORT.md                   # Thông tin hỗ trợ & ủng hộ
├── package.json                 # Phiên bản 1.3.0 & scripts
├── tailwind.config.js           # Cấu hình TailwindCSS
└── README.md                    # Tài liệu hướng dẫn sử dụng chính thức
```

---

## Thông Tin Tác Giả & Ủng Hộ Dự Án

- **Tác giả:** Nguyễn Sơn Nam (Nsnnam / NamNS)
- **Email:** akahimachi@gmail.com
- **GitHub:** [https://github.com/Nsnnam](https://github.com/Nsnnam)
- **Mời cà phê tác giả:**
  - Ngân hàng: **BIDV — PGD Nguyễn Tất Thành**
  - Số tài khoản: **8855989777**
  - Chủ tài khoản: **NGUYEN SON NAM**
  - Quét mã VietQR trên giao diện web hoặc xem tại [SUPPORT.md](./SUPPORT.md).

---

*Phát triển với sự tận tâm theo chuẩn **NSN App Standard** phục vụ cộng đồng y tế Việt Nam.*
