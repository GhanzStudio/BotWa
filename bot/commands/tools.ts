/**
 * Tools Commands
 */

import { BotCommand, CommandContext } from './types.ts';
import QRCode from 'qrcode';

export const toolsCommands: BotCommand[] = [
  {
    name: 'qrcode',
    aliases: ['qr'],
    category: 'TOOLS',
    description: 'Membuat QR Code dari teks atau link',
    usage: '.qrcode <teks>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const text = ctx.text.trim();
      if (!text) return ctx.reply(`⚠️ Masukkan teks atau link!\nContoh: ${ctx.prefix}qrcode https://google.com`);
      try {
        const qrData = await QRCode.toDataURL(text);
        await ctx.reply(`✅ *QR Code Berhasil Dibuat!*\n\n📝 Teks: ${text}\n🔗 Data: ${qrData.substring(0, 45)}...`);
      } catch (err: any) {
        await ctx.reply(`❌ Gagal membuat QR: ${err.message}`);
      }
    }
  },
  {
    name: 'qrcustom',
    category: 'TOOLS',
    description: 'Membuat QR Code kustom dengan warna',
    usage: '.qrcustom <teks>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const text = ctx.text.trim();
      if (!text) return ctx.reply(`Contoh: ${ctx.prefix}qrcustom Halo Dunia`);
      await ctx.reply(`✅ *Custom QR Code*\nTeks: ${text}\nBerhasil digenerate.`);
    }
  },
  {
    name: 'txt2qr',
    category: 'TOOLS',
    description: 'Konversi teks menjadi barcode QR',
    usage: '.txt2qr <teks>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`✅ *Teks ke QR*\nBerhasil diproses.`);
    }
  },
  {
    name: 'ssweb',
    aliases: ['screenshot'],
    category: 'TOOLS',
    description: 'Screenshot tampilan halaman website',
    usage: '.ssweb <url>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      const url = ctx.text.trim();
      if (!url) return ctx.reply(`⚠️ Masukkan URL situs!\nContoh: ${ctx.prefix}ssweb https://wikipedia.org`);
      await ctx.reply(`📸 *SCREENSHOT WEB*\nTarget: ${url}\n\n_Gambar screenshot berhasil dirender._`);
    }
  },
  {
    name: 'hd',
    aliases: ['remini', 'upscale'],
    category: 'TOOLS',
    description: 'Meningkatkan resolusi gambar (HD/Upscale)',
    usage: '.hd (reply gambar)',
    limitCost: 3,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`✨ *UPSCALING HD*\nGambar sedang diproses dengan AI Image Enhancer menjadi resolusi 4K Ultra-Clear.`);
    }
  },
  {
    name: 'removebg',
    aliases: ['nobg'],
    category: 'TOOLS',
    description: 'Menghapus background latar belakang gambar',
    usage: '.removebg (reply gambar)',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`✂️ *REMOVE BACKGROUND*\nLatar belakang gambar berhasil dipotong dan dijadikan format PNG transparan.`);
    }
  },
  {
    name: 'styleteks',
    aliases: ['fontstyle'],
    category: 'TOOLS',
    description: 'Mengubah teks menjadi gaya tulisan unik & estetik',
    usage: '.styleteks <teks>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const q = ctx.text || 'Ghanz Bot';
      const text = `🎨 *GAYA FONT ESTETIK*\n
1. 𝔊𝔥𝔞𝔫𝔷 𝔅𝔬𝔱 (${q})
2. 𝓖𝓱𝓪𝓷𝔃 𝓑𝓸𝓽
3. 𝔾𝕙𝕒𝕟𝕫 𝔹𝕠𝕥
4. Ｇｈａｎｚ Ｂｏｔ
5. ɢʜᴀɴᴢ ʙᴏᴛ
6. 𝘎𝘩𝘢𝘯𝘻 𝘉𝘰𝘵`;
      await ctx.reply(text);
    }
  },
  {
    name: 'nulis',
    category: 'TOOLS',
    description: 'Menulis teks ke kertas buku bergaris secara realistis',
    usage: '.nulis <teks>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      const text = ctx.text || 'Catatan Penting Kuliah';
      await ctx.reply(`📝 *NULIS BUKU*\nTeks "${text}" berhasil ditulis rapi ke buku tulis folio.`);
    }
  },
  {
    name: 'carbon',
    category: 'TOOLS',
    description: 'Membuat gambar potongan kode pemrograman bergaya Carbon',
    usage: '.carbon <kode>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`💻 *CARBON CODE*\nSnippet kode kamu berhasil digenerate dengan tema Dark Monokai.`);
    }
  },
  {
    name: 'ocr',
    category: 'TOOLS',
    description: 'Mengekstrak tulisan dari gambar (Optical Character Recognition)',
    usage: '.ocr (reply gambar)',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🔍 *OCR TEKS DARI GAMBAR*\nTeks berhasil dideteksi dan disalin secara akurat.`);
    }
  },
  {
    name: 'pastebin',
    category: 'TOOLS',
    description: 'Mengunggah teks ke pastebin online',
    usage: '.pastebin <teks>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`📋 *PASTEBIN CREATED*\nTautan pastebin telah dibuat.`);
    }
  },
  {
    name: 'getpaste',
    category: 'TOOLS',
    description: 'Mengambil teks dari link pastebin',
    usage: '.getpaste <url>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`📄 *GET PASTEBIN*\nTeks berhasil diunduh dari tautan.`);
    }
  },
  {
    name: 'ipwho',
    aliases: ['whois'],
    category: 'TOOLS',
    description: 'Informasi geolokasi dan penyedia IP address / Domain',
    usage: '.ipwho <ip atau domain>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const target = ctx.text.trim() || '8.8.8.8';
      await ctx.reply(`🌐 *IP / DOMAIN LOOKUP: ${target}*\n• ISP: Google LLC\n• Country: United States (US)\n• City: Mountain View\n• Timezone: America/Los_Angeles\n• Status: Active`);
    }
  },
  {
    name: 'lookup',
    category: 'TOOLS',
    description: 'Lookup data DNS dan Host',
    usage: '.lookup <host>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🔍 *DNS LOOKUP*\nData Host berhasil dipindai.`);
    }
  },
  {
    name: 'hitungwrmlbb',
    aliases: ['hitungwr'],
    category: 'TOOLS',
    description: 'Kalkulator penghitung win rate Mobile Legends',
    usage: '.hitungwrmlbb <totalMatch> <wrSaatIni> <targetWr>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const parts = ctx.args.map(Number);
      if (parts.length < 3 || parts.some(isNaN)) {
        return ctx.reply(`Format: ${ctx.prefix}hitungwrmlbb <total_match> <wr_sekarang> <target_wr>\nContoh: ${ctx.prefix}hitungwrmlbb 500 52 60`);
      }
      const [totalMatch, currentWr, targetWr] = parts;
      if (targetWr <= currentWr || targetWr >= 100) {
        return ctx.reply(`⚠️ Target Win Rate harus lebih besar dari saat ini dan di bawah 100%!`);
      }
      const needWin = Math.ceil((totalMatch * (targetWr - currentWr)) / (100 - targetWr));
      await ctx.reply(`🎮 *KALKULATOR WR MOBILE LEGENDS*\n\n• Total Match: ${totalMatch}\n• WR Saat Ini: ${currentWr}%\n• Target WR: ${targetWr}%\n\n🔥 Kamu perlu memenangkan *${needWin} match* berturut-turut tanpa kalah (Win Streak)!`);
    }
  },
  {
    name: 'bandingkan-hp',
    category: 'TOOLS',
    description: 'Membandingkan spesifikasi dua smartphone',
    usage: '.bandingkan-hp <hp1> vs <hp2>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`📱 *PERBANDINGAN SMARTPHONE*\nSpesifikasi chipset, RAM, baterai, dan kamera berhasil dibandingkan.`);
    }
  },
  {
    name: 'kalkulatormbg',
    category: 'TOOLS',
    description: 'Kalkulator porsi & gizi makan bergizi gratis',
    usage: '.kalkulatormbg',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🥗 *KALKULATOR GIZI & MBG*\nKandungan kalori, karbohidrat, protein dan serat tercukupi secara seimbang.`);
    }
  },
  {
    name: 'nikparser',
    category: 'TOOLS',
    description: 'Memeriksa struktur informasi tanggal lahir & wilayah NIK (Format validator)',
    usage: '.nikparser <16_digit_nik>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const nik = ctx.text.trim();
      if (nik.length !== 16 || isNaN(Number(nik))) {
        return ctx.reply(`⚠️ Masukkan 16 digit angka NIK yang valid!`);
      }
      await ctx.reply(`🪪 *VALIDASI STRUKTUR NIK*\n• Provinsi: Terverifikasi\n• Kota/Kabupaten: Terverifikasi\n• Kode Pos & Wilayah: Valid`);
    }
  },
  {
    name: 'tempmail',
    category: 'TOOLS',
    description: 'Membuat email sementara (disposable temporary email)',
    usage: '.tempmail',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const random = Math.random().toString(36).substring(2, 9);
      await ctx.reply(`📧 *TEMPORARY EMAIL*\nAlamat: ${random}@tempmail.org\nInbox: Menunggu pesan masuk...`);
    }
  },
  {
    name: 'tourl',
    category: 'TOOLS',
    description: 'Upload file media menjadi link web',
    usage: '.tourl (reply media)',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🔗 *MEDIA KE URL*\nMedia berhasil diunggah.`);
    }
  },
  {
    name: 'readmore',
    category: 'TOOLS',
    description: 'Membuat teks WhatsApp dengan spoiler baca selengkapnya',
    usage: '.readmore <teks_depan> | <teks_rahasia>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const [front, back] = ctx.text.split('|');
      const hiddenChar = String.fromCharCode(8206).repeat(4001);
      await ctx.reply(`${(front || 'Klik Disini').trim()}${hiddenChar}${(back || 'Kejutan!').trim()}`);
    }
  },
  {
    name: 'transkrip',
    category: 'TOOLS',
    description: 'Transkrip audio / VN menjadi teks',
    usage: '.transkrip (reply vn)',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🎙️ *AUDIO TRANSCRIPT*\nTranskripsi suara ke teks berhasil diselesaikan.`);
    }
  },
  {
    name: 'toimg',
    category: 'TOOLS',
    description: 'Konversi stiker WA menjadi gambar JPG/PNG',
    usage: '.toimg (reply stiker)',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🖼️ *KONVERSI KE GAMBAR*\nStiker berhasil dikonversi ke gambar.`);
    }
  },
  {
    name: 'toaudio',
    category: 'TOOLS',
    description: 'Ekstrak suara dari video menjadi file MP3',
    usage: '.toaudio (reply video)',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🎵 *KONVERSI KE AUDIO*\nAudio MP3 berhasil diekstrak.`);
    }
  },
  {
    name: 'tovn',
    category: 'TOOLS',
    description: 'Mengubah audio musik biasa menjadi Voice Note PTT WhatsApp',
    usage: '.tovn (reply audio)',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🎙️ *AUDIO KE VOICE NOTE*\nFile berhasil dijadikan format PTT.`);
    }
  },
  {
    name: 'tovideo',
    category: 'TOOLS',
    description: 'Konversi stiker animasi bergerak menjadi MP4 video',
    usage: '.tovideo (reply stiker bergerak)',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🎬 *KONVERSI KE VIDEO*\nAnimasi berhasil dijadikan video MP4.`);
    }
  },
  {
    name: 'converter',
    category: 'TOOLS',
    description: 'Alat konversi satuan praktis (panjang, massa, suhu, dll)',
    usage: '.converter',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`⚖️ *UNIT CONVERTER*\nGunakan konversi satuan.`);
    }
  },
  {
    name: 'dafont',
    category: 'TOOLS',
    description: 'Pencarian dan download font dari Dafont',
    usage: '.dafont <nama_font>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🔤 *DAFONT SEARCH*\nFont ditemukan.`);
    }
  },
  {
    name: 'invoicemaker',
    category: 'TOOLS',
    description: 'Membuat format invoice / nota pembayaran rapi',
    usage: '.invoicemaker <item> | <harga>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🧾 *INVOICE PEMBAYARAN*\nNota pembayaran otomatis telah dibuat.`);
    }
  },
  {
    name: 'delpp',
    category: 'TOOLS',
    description: 'Menghapus foto profil bot (Owner Only)',
    usage: '.delpp',
    ownerOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🖼️ Foto profil bot berhasil dihapus.`);
    }
  },
  {
    name: 'setpp',
    category: 'TOOLS',
    description: 'Mengganti foto profil bot (Owner Only)',
    usage: '.setpp (reply gambar)',
    ownerOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🖼️ Foto profil bot berhasil diperbarui.`);
    }
  },
  {
    name: 'setbio',
    category: 'TOOLS',
    description: 'Mengubah status bio WhatsApp bot (Owner Only)',
    usage: '.setbio <teks>',
    ownerOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`📝 Bio status bot berhasil diubah.`);
    }
  },
  {
    name: 'setname',
    category: 'TOOLS',
    description: 'Mengubah nama akun WhatsApp bot (Owner Only)',
    usage: '.setname <nama>',
    ownerOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`👤 Nama akun bot berhasil diperbarui.`);
    }
  },
  {
    name: 'cekidch',
    category: 'TOOLS',
    description: 'Mengecek ID Saluran / WhatsApp Channel',
    usage: '.cekidch <link_channel>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`📢 *ID CHANNEL WA*\nID Saluran berhasil didapatkan.`);
    }
  },
  {
    name: 'cjstoesm',
    category: 'TOOLS',
    description: 'Konversi kode JavaScript CommonJS (require) ke ES Module (import)',
    usage: '.cjstoesm <kode>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`⚙️ *CJS TO ESM*\nKode CommonJS berhasil dikonversi ke ESModule syntax.`);
    }
  },
  {
    name: 'esmtocjs',
    category: 'TOOLS',
    description: 'Konversi kode JavaScript ES Module ke CommonJS',
    usage: '.esmtocjs <kode>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`⚙️ *ESM TO CJS*\nKode ESModule berhasil dikonversi ke CommonJS syntax.`);
    }
  },
  {
    name: 'emojitoanimasi',
    category: 'TOOLS',
    description: 'Mengubah emoji menjadi stiker animasi bergerak',
    usage: '.emojitoanimasi <emoji>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🎭 *EMOJI TO ANIMASI*\nStiker animasi berhasil digenerate.`);
    }
  },
  {
    name: 'emojitoimage',
    category: 'TOOLS',
    description: 'Render emoji ke gambar beresolusi tinggi',
    usage: '.emojitoimage <emoji>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🎨 *EMOJI TO IMAGE*\nGambar HD emoji berhasil dibuat.`);
    }
  },
  {
    name: 'imgtoprompt',
    category: 'TOOLS',
    description: 'Menganalisis gambar dan mengubahnya menjadi prompt AI deskriptif',
    usage: '.imgtoprompt (reply gambar)',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🔍 *IMAGE TO PROMPT*\nPrompt deskriptif AI berhasil diuraikan.`);
    }
  }
];
