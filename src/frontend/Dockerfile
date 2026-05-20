# ====================================================
# STAGE 1: Static Asset Compilation
# ====================================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install all development and runtime dependencies
RUN npm install

# Copy React code and build configurations
COPY . .

# Build production static artifacts
RUN npm run build

# ====================================================
# STAGE 2: Lightweight Production Web Server
# ====================================================
FROM nginx:alpine

# Copy custom SPA Nginx gateway configurations
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static HTML/JS/CSS assets from compiler stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose web application port
EXPOSE 3000

# Start server
CMD ["nginx", "-g", "daemon off;"]
