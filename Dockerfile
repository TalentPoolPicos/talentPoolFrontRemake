# Multi-stage Dockerfile for Next.js production (npm-only)

# --- Build stage ---------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install all dependencies (including dev) for build
COPY package.json package-lock.json* ./
# Use npm ci when lockfile is present, otherwise fall back to npm install
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy project files
COPY . .

# Build the Next.js app
RUN npm run build


# --- Runner stage --------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Set production env
ENV NODE_ENV=production

# Copy only package files and install production dependencies
COPY package.json package-lock.json* ./
# Install production deps; prefer npm ci if lockfile exists
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

# Copy built output and public assets from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js

# Create non-root user and switch to it for security
RUN addgroup -S nextgroup && adduser -S nextuser -G nextgroup
USER nextuser

# Start Next.js in production
CMD ["node", "node_modules/next/dist/bin/next", "start"]
