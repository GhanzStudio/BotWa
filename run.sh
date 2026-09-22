#!/bin/bash
# Runner otomatis Ghanz Bot MD untuk Termux Android
export NODE_ENV=production
export SERVE_STATIC=true

# Bersihkan proses lama yang menempel di port 3000
pkill -9 -f "server.ts" 2>/dev/null
pkill -9 -f "server.cjs" 2>/dev/null
pkill -9 -f "pair.js" 2>/dev/null
sleep 1

chmod +x node_modules/.bin/* 2>/dev/null

if [ -f "dist/server.cjs" ]; then
  echo "🚀 Menjalankan Ghanz Bot MD (Mode Cepat & Ringan)..."
  node dist/server.cjs
else
  node node_modules/tsx/dist/cli.mjs server.ts
fi

