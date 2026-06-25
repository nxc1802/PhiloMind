# Post-push Production Checklist

Checklist này dùng sau khi push code để đưa PhiloMind lên môi trường production hoặc staging giống production.

## 1. CI và chất lượng code

- [ ] CI chạy xanh cho backend, frontend user và frontend admin.
- [ ] Backend build thành công: `cd backend && npm run build`.
- [ ] Frontend user build thành công: `cd frontend && npm run build`.
- [ ] Frontend admin build thành công: `cd admin && npm run build`.
- [ ] Test smoke tối thiểu chạy xanh cho cả 3 app.
- [ ] Không commit các artifact sinh ra cục bộ như `backend/dist`, `frontend/build`, `admin/build`, `.DS_Store`.

## 2. Biến môi trường

- [ ] Backend production có đủ `DATABASE_URL`, `JWT_SECRET`, `ALLOWED_ORIGINS`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- [ ] Backend production có đủ biến AI/TTS đang dùng: `OPENAI_API_KEY`, `OPENAI_API_BASE_URL`, `LLM_MODEL`, `TTS_WORKER_URL`.
- [ ] Frontend user production có `REACT_APP_API_URL`, `REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY`.
- [ ] Frontend admin production có `REACT_APP_API_URL`.
- [ ] `JWT_SECRET` là secret mạnh, khác hoàn toàn dev/local.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` chỉ tồn tại ở backend hoặc job server-side, không xuất hiện trong frontend.
- [ ] `ALLOWED_ORIGINS` chỉ gồm domain thật của user frontend và admin frontend.

## 3. Supabase và database

- [ ] Chạy migration/schema sync theo quy trình production trước khi deploy app mới.
- [ ] Kiểm tra các bảng Prisma đang cần đều tồn tại và được expose API đúng chủ đích.
- [ ] Seed chỉ chạy khi database thiếu dữ liệu nền, không chạy đè tùy tiện lên dữ liệu production.
- [ ] Sau seed, kiểm tra tối thiểu: user admin, course chính, chapters, nodes, flashcards, quizzes, debates, warmups, podcasts, documents.
- [ ] Đổi hoặc vô hiệu hóa password mặc định của các user seed trước khi public.
- [ ] Kiểm tra bucket Storage cho tài liệu/audio nếu production dùng Supabase Storage.
- [ ] Kiểm tra RLS, policy và quyền Data API theo thay đổi Supabase hiện tại.
- [ ] Bật backup định kỳ và xác nhận restore procedure.

## 4. Deploy backend

- [ ] Deploy backend trước frontend để API mới sẵn sàng.
- [ ] Kiểm tra `/api/health` hoặc endpoint health tương đương trả về OK.
- [ ] Kiểm tra CORS từ domain user frontend và admin frontend.
- [ ] Kiểm tra auth login, refresh/session behavior, và role guard admin.
- [ ] Kiểm tra upload tài liệu, podcast/TTS, quiz, flashcard review và debate message.
- [ ] Kiểm tra log không lộ secret, token, service role key hoặc password hash.

## 5. Deploy frontend user

- [ ] Build frontend bằng đúng production `REACT_APP_API_URL`.
- [ ] Smoke test trang Home, course journey, node detail, practice, debate, document.
- [ ] Kiểm tra light mode và dark mode trên desktop/mobile.
- [ ] Kiểm tra màu chủ đạo chỉ dùng như accent/action, không phủ toàn trang.
- [ ] Kiểm tra lỗi console, route fallback và trạng thái unauthenticated.

## 6. Deploy frontend admin

- [ ] Build admin bằng đúng production `REACT_APP_API_URL`.
- [ ] Smoke test login admin bằng tài khoản production đã đổi mật khẩu.
- [ ] Kiểm tra dashboard, users, courses, nodes, practice, debates, philosofun.
- [ ] Xác nhận user thường không vào được admin route.
- [ ] Kiểm tra thao tác CRUD quan trọng tạo log backend hợp lệ.

## 7. Sau deploy

- [ ] Chạy smoke test thủ công theo luồng user mới: đăng ký/đăng nhập, học node, làm quiz, ôn flashcard.
- [ ] Chạy smoke test thủ công theo luồng admin: đăng nhập, chỉnh course/node, xem dữ liệu user.
- [ ] Theo dõi log backend trong 30-60 phút đầu sau deploy.
- [ ] Theo dõi lỗi frontend qua console/monitoring.
- [ ] Ghi lại version/commit hash đang deploy.
- [ ] Có kế hoạch rollback rõ ràng nếu auth, course journey hoặc database gặp lỗi.
