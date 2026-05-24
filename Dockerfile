# Multi-stage build for production-ready full-stack Node/Vite app
FROM node:20-alpine AS builder
WORKDIR /app

# Install all dependencies (including build tools)
COPY package*.json ./
RUN npm ci

# Copy code and compile assets
COPY . .
RUN npm run build

# Production-only runner stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Install only runtime dependencies to keep the image slim
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled files from the builder
COPY --from=builder /app/dist ./dist

# Expose the designated port
EXPOSE 3000

# Start the bundled server
CMD ["node", "dist/server.cjs"]
