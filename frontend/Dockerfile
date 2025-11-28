# Stage 1: Build Quasar SPA
FROM node:20-alpine AS builder

WORKDIR /app

# Copy all project files first
COPY . .

# Install dependencies
RUN npm install

# Build for production
RUN npx quasar build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built SPA from builder
COPY --from=builder /app/dist/spa /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built SPA
COPY --from=builder /app/dist/spa /usr/share/nginx/html

# Copy static HTML (map.html)
COPY src/pages/map.html /usr/share/nginx/html/map.html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
