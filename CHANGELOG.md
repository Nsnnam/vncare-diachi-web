# Lịch sử phiên bản (CHANGELOG)

Toàn bộ các thay đổi của dự án **VNCare Phiên Địa Chỉ 2 Cấp** được ghi nhận tại đây theo chuẩn [Keep a Changelog](https://keepachangelog.com/).

## [1.3.5] - 2026-10-31

### Chuẩn Hóa VIẾT HOA Toàn Bộ Cột Họ và Tên (Họ tên, Tên...) ở File Đầu Ra
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

## [1.3.4] - 2026-10-29

### Chuẩn Hóa Quốc Gia (Sheet QUOCGIA 250 Mã), Hỗ Trợ Người Nước Ngoài & Người Việt Nam
- **Chuẩn hóa danh mục Quốc gia chuẩn theo Sheet `QUOCGIA` phôi VNCare (`MauFileImportBenhNhan_ksktoandan.xls`):**
  - Xây dựng module chuẩn hóa `nationService` tích hợp đầy đủ 250 quốc gia chính thức theo đúng định dạng `Mã-Tên quốc gia` của cổng VNCare.
  - Tự động nhận diện và phiên chuẩn cho cả người Việt Nam (`0-Việt Nam`) và người nước ngoài (`336-Trung quốc`, `512-Đài loan`, `411-Hàn quốc`, `403-Nhật`, `517-Hoa kỳ`...).
  - Tích hợp từ điển tra cứu thông minh và từ đồng nghĩa: hỗ trợ tên tiếng Việt có dấu, không dấu, tên tiếng Anh (`China`, `Taiwan`, `Korea`, `USA`, `Japan`...), mã số trực tiếp (`336`, `512`, `411`...) và tên viết tắt.
- **Sửa lỗi thiếu ghi đè cột Quốc gia khi xuất file In-place:**
  - Bổ sung logic ghi giá trị quốc gia chuẩn hóa `pr.nationFormatted` vào cột `nationCol` trong hàm `exportInplaceFile`. Khắc phục triệt để tình trạng file xuất ra theo Chế độ 1 giữ nguyên tên quốc gia thô chưa phiên mã.
  - Ghi chuẩn xác cột 7 (`QUOCGIA`) trong mẫu chuẩn 7 sheet VNCare (`exportVncareTemplateFile`).
  - Cập nhật hàm tạo dự phòng `createVncareLookupWorkbook` xuất đầy đủ 250 dòng quốc gia vào Sheet `QUOCGIA`.
- **Giao diện cấu hình & Đối chiếu Quốc gia trực quan:**
  - Bổ sung dropdown chọn **"Cột Quốc gia (Chuẩn hóa 250 QG)"** trong phần tùy chỉnh ánh xạ cột (`showMappingConfig`).
  - Hiển thị cột **"Quốc gia đã phiên (Cột H)"** trên Bảng đối chiếu (Output) và Quốc gia gốc trong file nạp (Input).
  - Tự động phát hiện và bật cảnh báo nổi bật (màu tím) khi người nước ngoài (`99-Nước ngoài`) bị thiếu thông tin quốc gia hoặc có tên quốc gia chưa chuẩn hóa.
  - Hỗ trợ dropdown chọn nhanh 250 quốc gia khi chỉnh sửa và nhấp trực tiếp vào huy hiệu cảnh báo trên bảng để sửa 1 chạm.

## [1.3.3] - 2026-10-15

### Chuẩn hóa Số Điện Thoại 10 số (Text General @), Cảnh báo Số lạ & Sửa thủ công
- **Chuẩn hóa trường Số điện thoại định dạng Text General (`@`):**
  - Tự động chuẩn hóa toàn bộ các ô Số điện thoại (`phoneCol` / `SDTBENHNHAN`) sang định dạng chuỗi văn bản thuần (Text General `cell.t = 's'`, `cell.z = '@'`).
  - Bảo toàn tuyệt đối số `0` ở đầu khi mở trong phần mềm Microsoft Excel, ngăn chặn Excel tự động ép kiểu số làm mất số 0 (ví dụ `0912345678` không bị cắt thành `912345678`).
- **Quy chuẩn 10 số viết liền, không khoảng trắng & xử lý thông minh:**
  - Làm sạch toàn bộ các ký tự phân cách: khoảng trắng, dấu chấm, dấu gạch ngang, gạch dưới, gạch chéo, dấu ngoặc...
  - Tự động nhận diện và chuyển đổi các định dạng tiền tố quốc tế phổ biến: `+84...`, `0084...`, `84...` thành đầu số `0...`.
  - Tự động phát hiện và bù số `0` ở đầu cho các chuỗi 9 chữ số bị Excel strip mất số 0 đầu.
- **Cảnh báo Số điện thoại lạ (Unusual Phone Number):**
  - Tự động nhận diện và gắn cờ cảnh báo đối với các số điện thoại lạ: không đủ 10 chữ số (thiếu số), thừa số, không bắt đầu bằng số 0 hoặc chứa các ký tự chữ cái bất thường.
  - Bổ sung Thẻ thống kê Số ĐT lạ, Huy hiệu cảnh báo màu hổ phách trên Bảng đối chiếu và Băng cảnh báo chuyên biệt giúp nhân viên y tế rà soát tức thì.
- **Cho phép chỉnh sửa thủ công linh hoạt:**
  - Cho phép nhấp trực tiếp vào badge cảnh báo Số ĐT hoặc bấm nút **"Sửa SĐT"** ở cuối dòng để sửa thủ công trực tiếp trên bảng.
  - Hỗ trợ bộ lọc tìm kiếm tức thì theo số điện thoại và cập nhật trạng thái hợp lệ ngay sau khi lưu.

## [1.3.2] - 2026-10-15

### Chuẩn hóa Dân tộc Mặc định & Cảnh báo Tương tác Chỉnh sửa 1 chạm
- **Mặc định khi phiên là `99-Nước ngoài` cho các dân tộc không nhận diện được:**
  - Đối với các trường hợp dữ liệu thiếu/bỏ trống Dân tộc hoặc chuỗi dân tộc không nằm trong danh mục 65 dân tộc chuẩn VNCare, hệ thống sẽ tự động gán giá trị xuất file mặc định là **`99-Nước ngoài`** (nếu người dùng không chỉnh sửa).
  - Bảo toàn giá trị chuỗi gốc đọc từ file trong bảng xem trước để nhân viên y tế đối chiếu và nhận diện nhanh.
- **Hiện cảnh báo nổi bật & Cho phép chỉnh sửa linh hoạt:**
  - Tích hợp cảnh báo đa tầng: Băng cảnh báo màu hổ phách chuyên biệt, Thẻ thống kê Dân tộc thiếu/chưa khớp, Badge cảnh báo trực quan tại từng dòng dữ liệu.
  - Cho phép **nhấp trực tiếp vào huy hiệu cảnh báo Dân tộc** trên Bảng đối chiếu để mở danh mục 65 dân tộc chọn lại 1 chạm.
  - Nút thao tác ở cuối dòng tự động làm nổi bật nhãn **"Sửa DT"** (màu hổ phách) khi phát hiện dòng có cảnh báo dân tộc.
  - Khi người dùng chỉnh sửa dân tộc, cờ cảnh báo của dòng đó được tự động giải trừ ngay lập tức.

## [1.3.1] - 2026-10-14

### Khắc phục Lỗi Phiên Địa chỉ Viết tắt, Lỗi Đối soát 3 Cấp & Bảo toàn Workbook
- **Nhận diện chuẩn xác từ khóa viết tắt Cột Địa chỉ (`ĐC`, `Đ/C`, `DC`, `D/C`):**
  - Tự động nhận diện các cột địa chỉ có tiêu đề viết tắt phổ biến trong bảng lương và danh sách CBNV y tế như `ĐC`, `Đ/C`, `DC`, `D/C`, `ĐC thường trú`, `ĐC liên hệ`...
  - Loại trừ tuyệt đối các cột Nơi cấp CCCD (`NOICAP`, `Nơi cấp`, `Cơ quan cấp`) để không bao giờ bị bắt nhầm thành cột địa chỉ.
- **Sửa lỗi đối soát 3 cấp cũ & Chống gán nhầm sang `Xã Phùng Nguyên, Tỉnh Phú Thọ`:**
  - Siết chặt ngưỡng điểm số đối soát 3 cấp cũ (`score >= 45`): bắt buộc phải có thông tin Huyện cũ hoặc Tỉnh cũ đi kèm với tên Xã cũ, ngăn chặn hiện tượng cụm từ 2 chữ cái ngẫu nhiên bị khớp bừa.
  - Bổ sung bộ lọc cơ quan cấp giấy tờ (`Cục cảnh sát`, `Bộ công an`, `Công an tỉnh`, `trật tự xã hội`...), khắc phục triệt để lỗi chuỗi Nơi cấp CCCD bị gán nhầm thành `Xã Tứ Xã → Xã Phùng Nguyên, Tỉnh Phú Thọ`.
- **Khắc phục lỗi Nhân đôi / Nhân ba cột khi xuất file:**
  - Áp dụng cơ chế **Isolated Workbook Clone**: mỗi lần xuất file đều clone từ `originalBuffer` nguyên bản, không bao giờ mutate biến dạng đối tượng workbook trong React state.
  - Kiểm tra và tái sử dụng cột `TINH`, `XA`, `Địa chỉ 2 cấp` đã có trước đó trong bảng, loại bỏ hoàn toàn hiện tượng sinh thêm các cột lặp lại ở cuối bảng khi bấm xuất hoặc thao tác nhiều lần.
- **Khắc phục cảnh báo hỏng file Excel (Removed Records: Formula):**
  - Tự động phát hiện và dọn dẹp các liên kết công thức ngoài bị gãy (`broken external link formulas` chứa `[...]`) trên toàn bộ các sheet của file gốc.
  - Bảo toàn 100% giá trị dữ liệu chữ và số của các sheet liên quan, loại bỏ hoàn toàn hộp thoại cảnh báo lỗi corrupt workbook của Microsoft Excel khi mở file xuất ra.

## [1.3.0] - 2026-10-09

### Nâng cấp Tùy biến File, Địa chỉ Kèm Chi tiết & Quản lý Dân tộc VNCare
- **Tùy biến Sheet & Cột phiên cho file không theo mẫu:**
  - Tự động mở bảng cấu hình ánh xạ cột khi nạp các file hợp đồng KSK, danh sách CBNV tùy biến của đơn vị.
  - Cho phép người dùng linh hoạt chọn Sheet cần xử lý và chọn các cột tương ứng: Cột Địa chỉ nguồn, Cột Dân tộc, Cột Họ và tên, Cột Ngày/Năm sinh, Cột Giới tính, Cột CCCD, Cột Nghề nghiệp, Cột Nơi làm việc, Cột SĐT.
- **Tùy chọn Địa chỉ 2 cấp kèm chi tiết:**
  - Bổ sung tùy chọn xuất cột **"Địa chỉ 2 cấp"** kèm chi tiết số nhà, thôn, xóm, đường + Xã + Tỉnh (ví dụ: `Thôn Đông Thịnh, Xã Sơn Đông, Tỉnh Phú Thọ` thay vì chỉ có `Xã Sơn Đông, Tỉnh Phú Thọ`).
  - Đảm bảo hiển thị trực quan trên bảng đối chiếu và tích hợp vào cả file xuất trực tiếp (Chế độ 1) và file mẫu 7 sheet (Chế độ 2).
- **Cảnh báo & Chuẩn hóa Mã Dân tộc chuẩn VNCare:**
  - Tự động nhận diện và phiên mã dân tộc sang định dạng chuẩn `Mã-Dân tộc` (theo danh mục 65 dân tộc VNCare).
  - Tích hợp cờ cảnh báo `isEthnicityMissing` (thiếu dân tộc) và `isEthnicityUnresolved` (dân tộc chưa khớp chuẩn).
  - Bổ sung Thẻ thống kê Dân tộc và Băng cảnh báo màu hổ phách chuyên biệt, cho phép lọc nhanh danh sách người bệnh cần cập nhật dân tộc và sửa trực tiếp 1 chạm trên bảng.

## [1.2.0] - 2026-09-27

### Nâng cấp & Chuẩn hóa Nghiệp vụ Y tế VNCare
- **Cột STT (Số thứ tự):** Bắt buộc đánh số thứ tự liên tục từ 1 đến hết cho toàn bộ các dòng dữ liệu có nội dung.
- **Ràng buộc các cột bắt buộc:**
  - Đảm bảo bắt buộc điền đầy đủ tất cả các trường: `STT`, `Tên bệnh nhân`, `Ngày sinh`, `Giới tính`, `Nghề nghiệp`, `Dân tộc`, `Quốc gia`, `Tỉnh`, `Xã`, `Địa chỉ`, `CCCD`.
  - Toàn bộ ô dữ liệu được định dạng kiểu **Text General (`@`)**, bảo toàn tuyệt đối các số 0 đứng đầu của CCCD, mã tỉnh/xã và số điện thoại, ngăn chặn việc Excel tự động ép kiểu làm sai lệch dữ liệu.
- **Chuẩn hóa Ngày sinh & Ngày cấp CCCD:**
  - Bắt buộc đúng định dạng `DD/MM/YYYY`.
  - Xử lý triệt để mã ngày serial của Excel (ví dụ `28795` -> `01/11/1978`, `44548` -> `18/12/2021`) và loại trừ hiện tượng sai lệch mili-giây do dấu phẩy động của Excel.
- **Chuẩn hóa CCCD:**
  - Kiểm tra và chuẩn hóa định dạng CCCD: 12 chữ số hoặc 8-11 ký tự alphanumeric (CMND 9 số / Hộ chiếu).
  - Tự động bù số `0` ở đầu nếu file đầu vào bị mất do Excel lưu dạng số (ví dụ `26078001518` -> `026078001518`).
- **Chuẩn hóa Đợt khám:**
  - Bắt buộc đúng định dạng `YYYYMM` (mẫu: `202601`).
- **Giao diện & Cảnh báo:**
  - Bổ sung thanh ruy-băng kiểm tra chất lượng dữ liệu và bộ lọc "Cảnh báo bắt buộc" trên Bảng xem trước giúp nhân viên y tế rà soát nhanh các dòng còn thiếu trường bắt buộc.

## [1.1.0] - 2026-09-23

### Cải tiến & Định dạng
- **Định dạng file Excel xuất chuẩn hóa theo yêu cầu:**
  - Áp dụng font **Times New Roman**, cỡ chữ **13pt** cho toàn bộ dữ liệu.
  - Kẻ ô viền (borders) đầy đủ cho tất cả các ô trong bảng.
  - Tự động giãn dòng và căn chỉnh độ rộng cột theo nội dung (text wrap & auto column width).
  - Giữ nguyên giao diện, bố cục và toàn bộ các sheet của file mẫu nạp.
- **Giao diện & Font chữ Web:**
  - Tích hợp bộ font chữ tiếng Việt cao cấp **Be Vietnam Pro** cho toàn bộ giao diện web, cải thiện thẩm mỹ và tính chuyên nghiệp.
- **Bảo mật truy cập (Lock Screen):**
  - Tích hợp màn hình khóa bảo vệ với cơ chế mã băm bảo mật SHA-256 (hỗ trợ nhập chữ hoa, chữ thường hoặc không dấu linh hoạt).
- **Đóng gói Offline:**
  - Cập nhật bản chạy offline Single-file HTML `releases/vncare-diachi-web-v1.1.0-offline.html`.

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
