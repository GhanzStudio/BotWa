# Multi-stage Dockerfile for WhatsApp Multi-Device Bot
FROM node:20-slim

# Install ffmpeg and build dependencies for audio/media processing
RUN apt-get update && apt-get install -y \
    ffmpeg \
    graphicsmagick \
    imagemagick \
    webp \
    git \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install npm packages
RUN npm install

# Copy application source code
COPY . .

# Build Vite frontend and esbuild server
RUN npm run build

# Expose web controller port
EXPOSE 3000

# Start compiled server
CMD ["node", "dist/server.cjs"]
