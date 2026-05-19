# ====================================================
# STAGE 1: Build, Lint, and Test
# ====================================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install all dependencies (including devDependencies for tests)
RUN npm ci

# Copy source code and tests
COPY . .

# Run automated tests to guarantee zero regressions are packaged
RUN npm test

# ====================================================
# STAGE 2: Production Execution
# ====================================================
FROM node:18-alpine

WORKDIR /app

# Copy manifests
COPY package*.json ./

# Install only essential production dependencies
RUN npm ci --only=production

# Copy source files from builder stage
COPY --from=builder /app/server.js ./server.js

# Expose microservice port
EXPOSE 5001

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=5001

# Run container as a non-privileged system user for optimal security
USER node

# Start service
CMD ["node", "server.js"]
