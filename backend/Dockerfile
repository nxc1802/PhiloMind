FROM node:22-alpine

WORKDIR /app

# Install openssl for Prisma compatibility
RUN apk add --no-cache openssl curl

# Copy dependencies manifest
COPY package*.json ./

# Install packages
RUN npm ci

# Copy code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build typescript compilation
RUN npm run build

ENV PORT=7860
EXPOSE 7860

# Đồng bộ schema Prisma lên DB trước khi khởi động, rồi mới chạy API.
# Lý do: project dùng `prisma db push` (không dùng migrations), nên khi schema
# thêm cột mới mà DB production chưa có (vd: lessonFlow, activeComponentId,
# componentResults) thì mọi query sẽ lỗi P2022 và web "mất kết nối DB".
# `db push` chỉ thêm/đồng bộ cột (các cột mới đều nullable -> không mất dữ liệu);
# nếu phát hiện thay đổi phá huỷ, nó thoát lỗi và container không start (báo ồn,
# không âm thầm mất dữ liệu). `--skip-generate` vì client đã generate ở bước build.
CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/src/main"]
