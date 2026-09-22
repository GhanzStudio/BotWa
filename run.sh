#!/bin/bash
# Runner otomatis Ghanz Bot MD untuk Termux Android
chmod +x node_modules/.bin/* 2>/dev/null
node node_modules/tsx/dist/cli.mjs server.ts
