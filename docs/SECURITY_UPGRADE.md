# HƯỚNG DẪN NÂNG CẤP BẢO MẬT & CẤU HÌNH HỆ THỐNG PHILOMIND

Tài liệu này tổng hợp toàn bộ các thay đổi bảo mật đã được áp dụng và hướng dẫn các bước đồng chí cần thực hiện để hoàn tất việc chuyển giao hệ thống một cách an toàn.

---

## I. CÁC THAY ĐỔI ĐÃ THỰC HIỆN (SECURITY CHANGESET)

### 1. DevOps & CI/CD
- **Hạn chế lộ lọt Token:** Loại bỏ mã nguồn cứng Token `$HF_TOKEN` trong URL nhân bản git (`git clone`) tại các file `.github/workflows/deploy_backend.yml` và `deploy_tts.yml`. Hệ thống hiện sử dụng cơ chế lưu trữ đệm `credential.helper store` và tự động xóa sau khi đẩy mã nguồn.
- **Tham số hóa mật khẩu:** Mật khẩu DB thô trong `docker-compose.yml` đã được thay thế bằng biến môi trường động `${POSTGRES_PASSWORD:-postgrespassword}`.

### 2. TTS Worker (FastAPI)
- **An toàn luồng (Concurrency Safety):** Trình tạo giọng đọc Kokoro ONNX trong `tts_worker/main.py` đã được bọc trong cơ chế `Lock` của Python để ngăn chặn tranh chấp tài nguyên luồng khi có nhiều yêu cầu đồng thời.
- **Giới hạn đầu vào:** Áp dụng giới hạn độ dài ký tự tối đa 2000 chữ để tránh lỗi tràn bộ nhớ (OOM) của máy chủ TTS.
- **Cải tiến Container:** Dockerfile của TTS được chuyển đổi từ chạy quyền `root` sang chạy quyền người dùng hạn chế (`appuser`). Cấu hình thêm tệp phiên bản phụ thuộc `requirements.txt` và tệp loại trừ `.dockerignore`.

### 3. Backend & Database (NestJS & Prisma)
- **Loại bỏ File lộ credentials:** Xóa hoàn toàn file thử nghiệm kết nối `backend/test-db.ts` chứa thông tin tài khoản Supabase Production.
- **Hệ thống Auth JWT:** Tích hợp `passport-jwt` cùng hệ thống Guard kiểm soát người dùng (`JwtAuthGuard`) và phân quyền quản trị viên (`RolesGuard`) sử dụng `@Roles('admin')`.
- **Mật mã hóa mật khẩu:** Tích hợp thư viện `bcryptjs` để băm mật khẩu của sinh viên và admin khi đăng ký/đăng nhập.
- **Gia cố Header:** Tích hợp middleware bảo mật `helmet` và cấu hình giới hạn CORS động qua danh sách tên miền thay vì mở dấu sao tự do (`'*'`).
- **Tối ưu hóa Database:** Thêm trường `password` và `role` trong Prisma schema, thiết lập ràng buộc khóa ngoại tường minh giữa bảng `User` và `Course`, đồng thời bổ sung chỉ mục (`@@index`) cho toàn bộ các khóa ngoại để tăng tốc độ truy vấn.

### 4. Admin Portal & Frontend UI
- **Chặn truy cập trái phép:** Thiết lập bộ điều phối Router bảo vệ (`ProtectedRoute`) tại Admin Panel để tự động đẩy người dùng chưa đăng nhập về màn hình Login.
- **Giao diện đăng nhập mới:** Thiết kế màn hình Login phong cách Dark Mode chuyên nghiệp.
- **Truyền Token tự động:** Cập nhật helper kết nối mạng để tự động nạp mã JWT Bearer token vào tiêu đề truy vấn (`Authorization`) ở cả Frontend chính lẫn Admin Panel.
- **Tích hợp AI thật:** Kết nối khung chat AI ở trang Dashboard trực tiếp với API Socratic AI debates để phản hồi thời gian thực và đồng bộ lịch sử.

---

## II. CÁC CÔNG VIỆC CẦN LÀM TIẾP THEO (ACTION ITEMS REQUIRED)

Sau khi kéo mã nguồn mới về, đồng chí **bắt buộc** phải hoàn tất các tác vụ sau để hệ thống chạy ổn định và an toàn:

### 1. Đổi mật khẩu database Supabase (Rotate Database Password)
Vì mật khẩu cũ đã bị cam kết ở dạng thô lên lịch sử git, đồng chí cần:
1. Truy cập vào trang Dashboard quản trị **Supabase** của dự án.
2. Đi tới cài đặt Database và thực hiện **Reset/Change Database Password**.
3. Cập nhật lại mật khẩu mới này vào biến `DATABASE_URL` trong file `.env` của backend.

### 2. Sinh mới Hugging Face Token & cập nhật GitHub Secrets
1. Đăng nhập vào tài khoản Hugging Face, truy cập **Settings > Access Tokens**.
2. Xóa Token cũ và tạo mới một token có quyền **`Write`**.
3. Truy cập kho lưu trữ GitHub của dự án, vào mục **Settings > Secrets and variables > Actions**.
4. Chọn chỉnh sửa biến bí mật **`HF_TOKEN`** và dán token mới vào.

### 3. Cập nhật cấu hình môi trường trong file `.env`
Bổ sung các dòng sau vào file cấu hình môi trường `.env` ở local và production:

```env
# Khóa bí mật dùng để ký và giải mã JWT token (Hãy đổi thành chuỗi ký tự ngẫu nhiên phức tạp)
JWT_SECRET="mot_chuoi_bi_mat_rat_dai_va_an_toan_cuc_ky_kho_doan_12345!"

# Danh sách các nguồn gốc frontend được phép gọi API (phân cách bằng dấu phẩy)
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001,https://ten-mien-frontend-cua-ban.com"

# Mật khẩu database local cho Docker (nếu có dùng)
POSTGRES_PASSWORD="mat_khau_database_docker_tu_chon"
```

### 4. Chạy Seed dữ liệu để nạp mật khẩu mặc định
Nếu chạy trên cơ sở dữ liệu mới hoặc muốn đặt lại các tài khoản thử nghiệm có mật khẩu băm, hãy chạy lệnh sau tại thư mục `backend`:
```bash
npm run prisma:db-push
npm run prisma:seed
```
*Tài khoản mặc định sau khi seed:*
- **Sinh viên:** `student@philomind.local` / Mật khẩu: `studentpassword`
- **Quản trị viên:** `admin@philomind.local` / Mật khẩu: `adminpassword`
