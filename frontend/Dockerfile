# Multi-stage Dockerfile for building Quasar SPA and serving with nginx (production-ready)

# ---------- Builder stage: ใช้ Node เพื่อติดตั้ง deps และ build Quasar ----------
FROM node:20-alpine AS builder

WORKDIR /app

# ติดตั้ง build tools เผื่อบาง dependency ต้องใช้
RUN apk add --no-cache python3 make g++

# ✅ ต้อง copy โปรเจกต์ทั้งหมดก่อน เพราะมี postinstall: quasar prepare
COPY . .

# ติดตั้ง dependencies (จะรัน quasar prepare ให้ด้วยจาก postinstall)
RUN npm ci --legacy-peer-deps

# Build Quasar SPA (script ใน package.json ควรเป็น "build": "quasar build")
RUN npm run build

# ---------- Runtime stage: nginx เสิร์ฟไฟล์ static ----------
FROM nginx:stable-alpine

# ใช้ nginx.conf ที่เรากำหนดเอง (ถ้ามี)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ก็อปไฟล์ build จาก Quasar SPA ไปใส่ใน root ของ nginx
COPY --from=builder /app/dist/spa/ /usr/share/nginx/html/

# ถ้ามีหน้า index_name.html แยกต่างหากให้เสิร์ฟตรง ๆ
# ⚠️ ถ้าในโปรเจกต์ไม่มีไฟล์นี้ ให้ลบบรรทัดนี้ทิ้ง ไม่งั้น Docker build จะ error
COPY ./src/pages/index_name.html /usr/share/nginx/html/index_name.html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
