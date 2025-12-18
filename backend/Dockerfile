# backend/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (including devDependencies for build)
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# --- Runtime Stage ---
FROM node:20-alpine
WORKDIR /app

# Copy package files and install production dependencies only
COPY package*.json ./
COPY prisma ./prisma/

# Install production deps
RUN npm ci --production

# Generate Prisma Client again for production environment (Alpine to Alpine should be fine, but good practice)
RUN npx prisma generate

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Create logs directory
RUN mkdir -p /app/logs

# Install curl for healthcheck
RUN apk add --no-cache curl

ENV NODE_ENV=production
ENV PORT=3000

# Healthcheck on port 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -fsS http://localhost:3000/api/demo || curl -fsS http://localhost:3000/ || exit 1

EXPOSE 3000

# Start the compiled server
CMD ["node", "dist/server.js"]