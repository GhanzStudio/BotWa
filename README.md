# 🤖 Ghanz Bot Multi-Device (MD)

> **WhatsApp Bot Multi-Fungsi yang Powerful, Modular, dan Ringan dibangun menggunakan Baileys Multi-Device & MongoDB.**  
> Repository GitHub: [https://github.com/GhanzStudio/BotWa](https://github.com/GhanzStudio/BotWa)  
> Pengembang: **GhanzStudio**

---

## 🌟 Fitur Utama

- 📱 **Multi-Device Support (MD)**: Menggunakan library modern `@whiskeysockets/baileys` dengan QR Code & 8-Digit Pairing Code.
- 🛡️ **Sistem Anti-Ban & Anti-Spam**: Proteksi jeda otomatis antar perintah (`rateLimitDelay`) dan cooldown per command.
- 🗄️ **Database MongoDB & Hybrid Fallback**: Menggunakan Mongoose untuk menyimpan data pengguna, level, koin, limit/energi, klan, inventory RPG, serta grup. Dilengkapi in-memory fallback saat MongoDB offline.
- 👑 **Sistem Autentikasi & Hak Akses Bertingkat**:
  - **Owner**: Akses penuh ke seluruh setting dan kontrol.
  - **Premium**: Akses unlimited limit energi, bypass cooldown downloader & AI.
  - **Partner**: Akses kolaborasi khusus.
  - **User Biasa**: Kuota limit energi harian yang reset setiap pukul 00:00 WIB.
  - **Sewa Bot**: Pengaturan masa aktif bot per grup dengan kedaluwarsa otomatis.
- 💬 **Auto-Typing & Auto-Read**: Status "sedang mengetik" otomatis saat bot memproses instruksi.
- 🕹️ **Lebih dari 180+ Command**: Terbagi dalam 22 kategori modular.

---

## 📂 Struktur Direktori Proyek

```text
├── bot/
│   ├── config.ts              # Konfigurasi global & env loader
│   ├── commands/              # Modul perintah per kategori
│   │   ├── types.ts           # Interface BotCommand & CommandContext
│   │   ├── main.ts            # Menu, ping, owner, stats, jadibot
│   │   ├── tools.ts           # QRCode, SSWeb, HD, OCR, Carbon, dll.
│   │   ├── game.ts            # Tebak gambar, asah otak, family100, ttt
│   │   ├── download.ts        # TikTok, IG, YT, Spotify, TeraBox
│   │   ├── search.ts          # Google, Wikipedia, Spotify, GSMarena
│   │   ├── sticker.ts         # Sticker, Brat, ATTP, QC, Emojimix
│   │   ├── ai.ts              # Gemini, AI Chat, GPT-4o, DeepSeek, Text2Img
│   │   ├── group.ts           # Hidetag, kick, promote, antilink, welcome
│   │   ├── religi.ts          # Al-Qur'an, Jadwal Sholat, Asmaul Husna
│   │   ├── infobot.ts         # Gempa BMKG, Hari Libur, Livescore
│   │   ├── cek.ts             # Fun personality check (20 varian)
│   │   ├── user.ts            # Profile, daftar, daily, buyenergi, level
│   │   ├── canvas.ts          # Buat quotes, fakecall, IG story
│   │   ├── random.ts          # Anime wholesome reactions & memes
│   │   ├── ephoto.ts          # Text effect generator EPhoto 360
│   │   ├── anime.ts           # Top anime, MyWaifu, trace anime
│   │   ├── clan.ts            # Clan guild wars, invite, treasury
│   │   ├── convert.ts         # Audio pitch filter (bass, deep, echo)
│   │   ├── berita.ts          # Headline CNN, CNBC, Antara, Sindo
│   │   ├── stalker.ts         # GitHub, IG, TikTok, YouTube stalk
│   │   ├── tts.ts             # Google Text-to-Speech
│   │   ├── rpg.ts             # MMORPG text game & economy
│   │   └── index.ts           # Command master registry
│   ├── database/
│   │   ├── mongo.ts           # Koneksi Mongoose
│   │   └── models/            # Schema User, Group, Clan, RPG, Session
│   └── lib/
│       ├── baileys.ts         # Socket connector Baileys MD
│       ├── handler.ts         # Dispatcher, permissions & anti-ban
│       ├── antiSpam.ts        # Rate limiter & cooldowns
│       └── formatter.ts       # Format tampilan chat WA yang estetik
├── src/                       # Frontend Web Dashboard (React + Tailwind)
├── server.ts                  # Backend Express controller & API
├── Dockerfile                 # Konfigurasi container Docker
├── docker-compose.yml         # Bot + MongoDB cluster
├── pm2.config.cjs             # PM2 production process manager
└── package.json
```

---

## 🚀 Panduan Instalasi & Menjalankan

### 1. Prasyarat
- Node.js versi 18+ atau 20+
- FFmpeg terinstall di sistem (untuk pemrosesan stiker dan efek audio)
- MongoDB (lokal atau cloud MongoDB Atlas)

### 2. Kloning & Install Dependencies
```bash
git clone https://github.com/GhanzStudio/bot.git
cd bot
npm install
```

### 3. Konfigurasi Environment (`.env`)
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Sesuaikan nilainya:
```env
BOT_NAME="Ghanz Bot MD"
PREFIX="."
OWNER_NUMBER="6281234567890"
OWNER_NAME="GhanzStudio"
MONGODB_URI="mongodb://localhost:27017/whatsapp_bot"
DEFAULT_LIMIT="50"
AUTO_READ="false"
AUTO_TYPING="true"
RATE_LIMIT_DELAY="1500"
GEMINI_API_KEY="YOUR_API_KEY"
```

### 4. Menjalankan Bot
- **Mode Development (dengan Live Web Dashboard):**
  ```bash
  npm run dev
  ```
  Buka browser di `http://localhost:3000` untuk memindai QR Code atau meminta Pairing Code 8-digit.

- **Mode Produksi dengan PM2:**
  ```bash
  npx pm2 start pm2.config.cjs
  ```

- **Mode Docker Compose:**
  ```bash
  docker-compose up -d --build
  ```

---

## 🛠️ Cara Menambah Command Baru

Karena arsitektur bot ini **100% modular**, kamu bisa menambahkan fitur baru dengan mudah:

1. Buka folder `bot/commands/` dan pilih file kategori yang sesuai (misalnya `tools.ts`).
2. Tambahkan objek command baru ke dalam array:
```typescript
{
  name: 'contohfitur',
  aliases: ['contoh'],
  category: 'TOOLS',
  description: 'Deskripsi singkat fungsi fitur',
  usage: '.contohfitur <teks>',
  limitCost: 1, // Pengurangan limit energi untuk user biasa
  execute: async (ctx: CommandContext) => {
    const { reply, text, user } = ctx;
    if (!text) return reply('Silakan masukkan teks!');
    await reply(`Halo ${user.name}, input kamu adalah: ${text}`);
  }
}
```
3. Perintah otomatis terdaftar di menu, handler, pencarian, dan simulator!

---

## 📋 Ringkasan Kategori Command

| Kategori | Jumlah Command | Contoh Fitur |
|---|---|---|
| **MAIN MENU** | 18 | `menu`, `allmenu`, `ping`, `owner`, `stats`, `jadibot` |
| **TOOLS** | 39 | `qrcode`, `hd`, `ssweb`, `ocr`, `removebg`, `nulis`, `hitungwrmlbb` |
| **GAME** | 27 | `tebakgambar`, `asahotak`, `family100`, `tictactoe`, `caklontong` |
| **DOWNLOAD** | 15 | `tiktok`, `instagramdl`, `ytmp3`, `ytmp4`, `spotifydl`, `terabox` |
| **SEARCH** | 19 | `google`, `wikipedia`, `spotify`, `gsmarena`, `npm`, `pddikti` |
| **STICKER** | 8 | `sticker`, `brat`, `attp`, `qc`, `emojimix`, `stickerly` |
| **AI** | 17 | `ai`, `gemini`, `gpt4o`, `deepseek`, `text2img`, `toanime` |
| **GROUP** | 44 | `hidetag`, `kick`, `promote`, `antilink`, `welcome`, `giveaway` |
| **RELIGI** | 6 | `quran`, `jadwalsholat`, `asmaulhusna`, `murrotal` |
| **INFO BOT** | 5 | `gempa`, `harilibur`, `jadwalbola`, `livescore` |
| **CEK** | 20 | `cekbaik`, `cekganteng`, `cekhoki`, `cekpintar`, `cekbucin` |
| **USER** | 14 | `profile`, `daftar`, `daily`, `energi`, `koin`, `level` |
| **CANVAS** | 9 | `buatquotes`, `fakecall`, `igstory`, `kalender`, `balogo` |
| **RANDOM** | 10 | `hug`, `kiss`, `pat`, `dance`, `wave`, `meme` (Safe SFW) |
| **EPHOTO** | 8 | `glitchtext`, `neonglitch`, `logomaker`, `galaxywallpaper` |
| **ANIME** | 3 | `topanime`, `mywaifu`, `animeapaini` |
| **CLAN** | 9 | `clancreate`, `claninfo`, `clanjoin`, `clanwar` |
| **CONVERT** | 11 | `bass`, `deep`, `echo`, `nightcore`, `reverse`, `slow` |
| **BERITA** | 5 | `berita`, `cnn`, `cnbc`, `antara`, `sindonews` |
| **STALKER** | 7 | `githubstalk`, `igstalk`, `tiktokstalk`, `ytstalk` |
| **TTS** | 1 | `tts` (Google Voice Note generator) |
| **RPG** | 42 | `adventure`, `hunt`, `mining`, `fishing`, `boss`, `shop` |

---

## 🔒 Kebijakan Keamanan & Konten
Sesuai aturan pengembangan, bot ini secara ketat **TIDAK** menyertakan konten dewasa/NSFW, konten seksual, ujaran kebencian/SARA, maupun ejekan yang merendahkan pihak mana pun. Semua fitur dirancang aman, etis, dan menyenangkan.

---

## 📜 Lisensi
Dikembangkan oleh **GhanzStudio** di bawah lisensi Apache-2.0 / MIT.
Repositori: [https://github.com/GhanzStudio/BotWa](https://github.com/GhanzStudio/BotWa)
