# syntax=docker/dockerfile:1

# ============================================
# Builder Stage
# ============================================
FROM node:20.18.0-alpine AS builder

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for building)
RUN npm ci

# Copy source files and configuration
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY index.html ./
COPY src ./src
COPY public ./public

# Build the Vue app
RUN npm run build

# ============================================
# Production Stage - Nginx
# ============================================
FROM nginx:1.27-alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files from builder
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Health check using nginx health endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Nginx runs as non-root by default in this image
# Start nginx
CMD ["nginx", "-g", "daemon off;"]
