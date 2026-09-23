# Quy định phát triển cho Agent & AI (AGENTS.md)

Khi phát triển, sửa lỗi hoặc bảo trì repo **vncare-diachi-web**, Agent bắt buộc tuân thủ:

1. **Chuẩn NSN App Standard:**
   - Múi giờ mặc định: `Asia/Ho_Chi_Minh` (GMT+7).
   - Tác giả: Nguyễn Sơn Nam (Nsnnam / NamNS).
   - Đảm bảo tính toán toàn vẹn, exact match dữ liệu địa danh và mã địa bàn y tế. Không dùng fuzzy match lỏng lẻo làm sai lệch mã tỉnh/xã.
2. **Bảo mật dữ liệu:**
   - Ứng dụng phải hoạt động 100% offline tại client, không thêm API bên ngoài làm rò rỉ dữ liệu người bệnh hoặc thông tin KSK của đơn vị.
3. **Quy trình build:**
   - `pnpm run build`: Tạo bundle cho GitHub Pages (`dist/`).
   - `pnpm run build:single`: Đóng gói Single-file HTML offline (`releases/vncare-diachi-web-v1.0.0-offline.html`).
