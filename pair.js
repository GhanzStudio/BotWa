/**
 * Standalone WhatsApp Pairing & QR Manager untuk Termux Android & VPS
 * Menghubungkan WhatsApp Multi-Device dengan aman, stabil, dan tanpa browser.
 */

import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  Browsers
} from '@whiskeysockets/baileys';
import pino from 'pino';
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.clear();
  console.log('\x1b[1;36m=================================================================\x1b[0m');
  console.log('\x1b[1;32m       🚀 GHANZ BOT MD - PENGHUBUNG WHATSAPP MULTI-DEVICE 🚀       \x1b[0m');
  console.log('\x1b[1;36m=================================================================\x1b[0m\n');

  const sessionPath = path.resolve(process.cwd(), './sessions');
  const credsFile = path.join(sessionPath, 'creds.json');

  // Bersihkan sesi lama yang belum terdaftar agar tidak terjadi bentrok kunci enkripsi
  if (fs.existsSync(sessionPath)) {
    let shouldClean = true;
    if (fs.existsSync(credsFile)) {
      try {
        const creds = JSON.parse(fs.readFileSync(credsFile, 'utf-8'));
        if (creds.registered && creds.me) {
          shouldClean = false;
        }
      } catch (_) {}
    }
    if (shouldClean) {
      console.log('🧹 Membersihkan sisa sesi pairing sebelumnya agar kunci baru sinkron...');
      fs.rmSync(sessionPath, { recursive: true, force: true });
      fs.mkdirSync(sessionPath, { recursive: true });
    }
  } else {
    fs.mkdirSync(sessionPath, { recursive: true });
  }

  let rawPhone = process.argv[2];
  if (!rawPhone) {
    console.log('Pilih metode penautan WhatsApp:');
    console.log('1. Kode Pairing 8-Digit (Rekomendasi - Masukkan nomor HP)');
    console.log('2. Pindai QR Code di Terminal');
    const choice = await question('\nPilihan Anda [1 / 2]: ');

    if (choice.trim() === '2') {
      return runWithQR(sessionPath);
    }

    rawPhone = await question('\n📱 Masukkan Nomor WhatsApp Anda (contoh: 08123456789 atau 628123456789): ');
  }

  // Format nomor WhatsApp
  let phone = rawPhone.replace(/\D/g, '');
  if (phone.startsWith('0')) {
    phone = '62' + phone.slice(1);
  }

  if (phone.length < 10) {
    console.log('\x1b[1;31m❌ Nomor tidak valid! Masukkan nomor lengkap dengan kode negara, misal: 6281234567890\x1b[0m');
    rl.close();
    process.exit(1);
  }

  console.log(`\n⏳ Menghubungkan ke server WhatsApp untuk nomor: \x1b[1;33m+${phone}\x1b[0m...`);
  console.log('⚠️  PENTING: Jangan tutup/minimize Termux selama proses penautan!\n');

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

  let version = [2, 3000, 1015901307];
  try {
    const fetched = await fetchLatestBaileysVersion();
    if (fetched?.version) version = fetched.version;
  } catch (_) {}

  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    version,
    auth: state,
    printQRInTerminal: false,
    browser: Browsers.ubuntu('Chrome'),
    syncFullHistory: false,
    markOnlineOnConnect: false,
    connectTimeoutMs: 60000,
    keepAliveIntervalMs: 30000,
    retryRequestDelayMs: 3000
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'connecting') {
      // Sedang proses
    } else if (connection === 'open') {
      console.log('\n\x1b[1;32m=================================================================\x1b[0m');
      console.log('\x1b[1;32m🎉 SELAMAT! BOT WHATSAPP BERHASIL TAUT / TERHUBUNG! 🎉\x1b[0m');
      console.log('\x1b[1;32m=================================================================\x1b[0m');
      console.log('✅ Kredensial telah disimpan permanen di folder sessions/.');
      console.log('🚀 Sekarang jalankan bot kapan pun dengan perintah:\n');
      console.log('   \x1b[1;33mnpm run termux\x1b[0m  (atau: node node_modules/tsx/dist/cli.mjs server.ts)\n');
      rl.close();
      process.exit(0);
    } else if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (statusCode === DisconnectReason.loggedOut) {
        console.log('\x1b[1;31m❌ Sesi logout atau dibatalkan oleh WhatsApp.\x1b[0m');
      } else if (statusCode === 401 || statusCode === 408) {
        console.log('\x1b[1;31m❌ Kode pairing kedaluwarsa atau koneksi terputus. Silakan coba lagi.\x1b[0m');
      }
    }
  });

  if (!sock.authState.creds.registered) {
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(phone);
        const formatted = code ? code.match(/.{1,4}/g)?.join('-') : code;

        console.log('\x1b[1;36m┌────────────────────────────────────────────────────────┐\x1b[0m');
        console.log(`\x1b[1;36m│\x1b[0m  🔑 KODE PAIRING WHATSAPP: \x1b[1;32m${formatted}\x1b[0m                       \x1b[1;36m│\x1b[0m`);
        console.log(`\x1b[1;36m│\x1b[0m  📱 Nomor: +${phone}                                   \x1b[1;36m│\x1b[0m`);
        console.log('\x1b[1;36m├────────────────────────────────────────────────────────┤\x1b[0m');
        console.log('\x1b[1;36m│\x1b[0m  👉 Buka WhatsApp di HP Anda                           \x1b[1;36m│\x1b[0m');
        console.log('\x1b[1;36m│\x1b[0m  👉 Titik 3 (kanan atas) > \x1b[1mPerangkat Tertaut\x1b[0m            \x1b[1;36m│\x1b[0m');
        console.log('\x1b[1;36m│\x1b[0m  👉 Ketuk \x1b[1m"Tautkan Perangkat"\x1b[0m                           \x1b[1;36m│\x1b[0m');
        console.log('\x1b[1;36m│\x1b[0m  👉 Ketuk \x1b[1m"Tautkan dengan nomor telepon saja"\x1b[0m           \x1b[1;36m│\x1b[0m');
        console.log(`\x1b[1;36m│\x1b[0m  👉 Masukkan kode: \x1b[1;32m${formatted}\x1b[0m                  \x1b[1;36m│\x1b[0m`);
        console.log('\x1b[1;36m└────────────────────────────────────────────────────────┘\x1b[0m\n');
        console.log('⏳ \x1b[33mMenunggu Anda memasukkan kode di WhatsApp (waktu ~2 menit)...\x1b[0m');
      } catch (err) {
        console.log('\x1b[1;31m❌ Gagal meminta kode pairing:\x1b[0m', err.message);
        console.log('Saran: Coba gunakan opsi 2 (Pindai QR Code di Terminal).');
        rl.close();
        process.exit(1);
      }
    }, 3500);
  } else {
    console.log('✅ Akun bot sudah tersambung di folder sessions/. Langsung jalankan: npm run termux');
    rl.close();
    process.exit(0);
  }
}

async function runWithQR(sessionPath) {
  console.log('\n⏳ Menyiapkan QR Code di terminal...');
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  
  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    auth: state,
    printQRInTerminal: false,
    browser: Browsers.ubuntu('Chrome'),
    syncFullHistory: false
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, qr } = update;
    if (qr) {
      console.log('\n📷 \x1b[1;32mPINDAI QR CODE DI BAWAH INI MENGGUNAKAN WHATSAPP:\x1b[0m\n');
      QRCode.toString(qr, { type: 'terminal', small: true }, (err, str) => {
        if (!err) console.log(str);
        console.log('👉 Buka WA > Titik 3 > Perangkat Tertaut > Tautkan Perangkat > Arahkan kamera ke QR di atas!\n');
      });
    }

    if (connection === 'open') {
      console.log('\n\x1b[1;32m🎉 BOT WHATSAPP BERHASIL TERHUBUNG VIA QR CODE! 🎉\x1b[0m\n');
      rl.close();
      process.exit(0);
    }
  });
}

main();
