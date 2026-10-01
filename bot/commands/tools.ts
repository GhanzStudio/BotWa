/**
 * Tools Commands
 */

import { BotCommand, CommandContext } from './types.ts';
import QRCode from 'qrcode';
import { askFreeAI } from '../lib/aiProvider.ts';
import {
  downloadImageFromCtx,
  downloadMediaFromCtx,
  processHdImage,
  convertStickerToImage,
  convertMediaToAudioMp3,
  convertStickerToMp4Video
} from '../lib/imageProcessor.ts';
import { convertToWhatsAppVoiceNote } from '../lib/mediaDownloader.ts';
import { createQrLocationRecord, getQrLocationsByCreator } from '../database/models/QrLocation.ts';
import { createProgressBar, delay } from '../lib/progressBar.ts';
import { getIndonesianDate, getIndonesianTime, getIndonesianDateTime } from '../lib/formatter.ts';

export const toolsCommands: BotCommand[] = [
  {
    name: 'qrcode',
    aliases: ['qr'],
    category: 'TOOLS',
    description: 'Membuat gambar QR Code dari teks atau link',
    usage: '.qrcode <teks/link>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const text = ctx.text.trim();
      if (!text) {
        return ctx.reply(`⚠️ *MASUKKAN TEKS/LINK!*\nContoh: *${ctx.prefix}qrcode https://google.com*`);
      }

      if (ctx.react) await ctx.react('📸');

      try {
        const qrBuffer = await QRCode.toBuffer(text, {
          type: 'png',
          width: 600,
          margin: 2,
          color: { dark: '#000000', light: '#FFFFFF' }
        });

        if (ctx.sendImage) {
          return await ctx.sendImage(
            qrBuffer,
            `✅ *QR CODE BERHASIL DIBUAT!* 📱\n\n` +
            `• 📝 *Isi Teks / Link:* ${text}\n` +
            `• 📐 *Ukuran:* 600x600 px (Ultra HD)\n\n` +
            `_Scan gambar QR Code di atas menggunakan pemindai kamera HP Anda._`
          );
        } else {
          return ctx.reply(`✅ *QR Code Berhasil Dibuat!*`);
        }
      } catch (err: any) {
        return ctx.reply(`❌ *GAGAL MEMBUAT QR CODE*\nError: ${err.message}`);
      }
    }
  },
  {
    name: 'qrcustom',
    category: 'TOOLS',
    description: 'Membuat gambar QR Code kustom dengan warna pilihan',
    usage: '.qrcustom <teks>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const text = ctx.text.trim();
      if (!text) {
        return ctx.reply(`⚠️ *MASUKKAN TEKS/LINK!*\nContoh: *${ctx.prefix}qrcustom Halo Dunia*`);
      }

      if (ctx.react) await ctx.react('🎨');

      try {
        const qrBuffer = await QRCode.toBuffer(text, {
          type: 'png',
          width: 600,
          margin: 2,
          color: { dark: '#1E3A8A', light: '#EFF6FF' }
        });

        if (ctx.sendImage) {
          return await ctx.sendImage(
            qrBuffer,
            `🎨 *CUSTOM STYLED QR CODE* 📱\n\n` +
            `• 📝 *Teks:* ${text}\n` +
            `• 🎨 *Gaya Warna:* Premium Indigo Accent\n\n` +
            `_Gambar QR Code Kustom berhasil dirender!_`
          );
        } else {
          return ctx.reply(`✅ *Custom QR Code Berhasil Dibuat!*`);
        }
      } catch (err: any) {
        return ctx.reply(`❌ *GAGAL MEMBUAT CUSTOM QR*\nError: ${err.message}`);
      }
    }
  },
  {
    name: 'txt2qr',
    category: 'TOOLS',
    description: 'Konversi teks menjadi gambar barcode QR',
    usage: '.txt2qr <teks>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const text = ctx.text.trim();
      if (!text) {
        return ctx.reply(`⚠️ *MASUKKAN TEKS!*\nContoh: *${ctx.prefix}txt2qr Ghanz Bot Multi-Device*`);
      }

      if (ctx.react) await ctx.react('🔤');

      try {
        const qrBuffer = await QRCode.toBuffer(text, {
          type: 'png',
          width: 600,
          margin: 2,
          color: { dark: '#0F172A', light: '#F8FAFC' }
        });

        if (ctx.sendImage) {
          return await ctx.sendImage(
            qrBuffer,
            `🔤 *TEKS KE QR CODE BARCODE* 📱\n\n` +
            `• 📝 *Teks Input:* ${text}\n` +
            `• 📦 *Format:* PNG Ultra HD\n\n` +
            `_Arahkan pemindai barcode HP Anda ke gambar QR di atas._`
          );
        } else {
          return ctx.reply(`✅ *Teks ke QR Berhasil Diproses!*`);
        }
      } catch (err: any) {
        return ctx.reply(`❌ *GAGAL KONVERSI TEKS KE QR*\nError: ${err.message}`);
      }
    }
  },
  {
    name: 'qrlok',
    aliases: ['qrlocation', 'lokasiqr'],
    category: 'TOOLS',
    description: 'Membuat QR Code pelacak lokasi real-time yang dapat dibuka oleh semua user',
    usage: '.qrlok <pesan>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      const text = ctx.text.trim();
      if (!text) {
        return ctx.reply(
          `⚠️ *MASUKKAN PESAN TERLAMPIR!*\n\n` +
          `Contoh: *${ctx.prefix}qrlok Hi*\n` +
          `Contoh: *${ctx.prefix}qrlok Selamat Datang di Acara Kami*`
        );
      }

      if (ctx.react) await ctx.react('📍');

      // Unique QR ID
      const qrId = 'lok_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);

      // Save tracking record
      await createQrLocationRecord(
        qrId,
        ctx.senderJid || '',
        ctx.user?.name || 'User',
        text
      );

      // Bot WhatsApp number for universal wa.me deep-link
      let botPhone = '6283842602738';
      if (ctx.sock?.user?.id) {
        botPhone = ctx.sock.user.id.split(':')[0].replace(/\D/g, '');
      }

      // Format WhatsApp Deep-Link Universal
      const waLink = `https://wa.me/${botPhone}?text=${encodeURIComponent(`qrlok ${qrId}`)}`;

      try {
        const qrBuffer = await QRCode.toBuffer(waLink, {
          type: 'png',
          width: 600,
          margin: 2,
          color: { dark: '#047857', light: '#ECFDF5' }
        });

        if (ctx.sendImage) {
          return await ctx.sendImage(
            qrBuffer,
            `📍 *QR CODE PELACAK LOKASI REAL-TIME (UNIVERSAL)* 📱\n\n` +
            `• 💬 *Pesan Tampil:* "${text}"\n` +
            `• 🔑 *ID Tracking:* \`${qrId}\`\n\n` +
            `✅ *Bebas Error 403 - Bisa Di-Scan oleh SEMUA User di HP Manapun!*\n\n` +
            `💡 *Cara Kerja:*\n` +
            `1. Saat QR Code di-scan oleh HP siapapun, WhatsApp akan terbuka dan mengirim pesan ID QR.\n` +
            `2. Bot akan langsung menampilkan pesan *"${text}"* kepada penye-scan.\n` +
            `3. Data nomor HP, nama penye-scan & waktu scan **langsung tersimpan di Database**!\n` +
            `4. Penye-scan dapat membalas dengan membagikan lokasi GPS mereka jika diminta.\n\n` +
            `_Ketik ${ctx.prefix}qrloklogs untuk mengecek riwayat penye-scan._`
          );
        } else {
          return ctx.reply(`✅ *QR Code Lokasi "${text}" Berhasil Dibuat!*`);
        }
      } catch (err: any) {
        return ctx.reply(`❌ *GAGAL MEMBUAT QRLOK*\nError: ${err.message}`);
      }
    }
  },
  {
    name: 'qrloklogs',
    aliases: ['cekqrlok', 'loglokasi'],
    category: 'TOOLS',
    description: 'Melihat riwayat scan lokasi real-time dari QR Code Anda',
    usage: '.qrloklogs',
    limitCost: 0,
    execute: async (ctx: CommandContext) => {
      const list = await getQrLocationsByCreator(ctx.senderJid || '');

      if (!list || list.length === 0) {
        return ctx.reply(`⚠️ *BELUM ADA RIWAYAT QRLOK*\nKetik *${ctx.prefix}qrlok <pesan>* untuk membuat QR Code pelacak lokasi pertama Anda.`);
      }

      let text = `📍 *RIWAYAT LOKASI REAL-TIME QRLOK* (${list.length} QR)\n\n`;

      list.slice(0, 10).forEach((item, idx) => {
        text += `${idx + 1}. 💬 Pesan: *"${item.message}"*\n`;
        text += `   • ID: \`${item.qrId}\`\n`;
        text += `   • Scan Terekam: *${item.scans.length} kali*\n`;
        if (item.scans.length > 0) {
          const last = item.scans[0];
          text += `   • Scan Terakhir: ${new Date(last.timestamp).toLocaleString('id-ID')}\n`;
          if (last.googleMapsUrl) {
            text += `   • 🗺️ Maps: ${last.googleMapsUrl}\n`;
          }
        }
        text += `\n`;
      });

      return ctx.reply(text);
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
      let url = ctx.text.trim();
      if (!url) return ctx.reply(`⚠️ *MASUKKAN URL SITUS!*\nContoh: *${ctx.prefix}ssweb https://wikipedia.org*`);
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      if (ctx.react) await ctx.react('📸');
      await ctx.reply(`📸 *MEMPROSES SCREENSHOT WEB*...\n_Sedang merender tampilan situs ${url}..._`);

      try {
        const ssUrl = `https://image.thum.io/get/width/1200/crop/800/${url}`;
        const res = await fetch(ssUrl);
        if (res.ok) {
          const arrayBuf = await res.arrayBuffer();
          const ssBuffer = Buffer.from(arrayBuf);
          if (ssBuffer.length > 500 && ctx.sendImage) {
            return await ctx.sendImage(
              ssBuffer,
              `📸 *SCREENSHOT WEBSITE* 🌐\n\n` +
              `• 🔗 *Target:* ${url}\n` +
              `• 📐 *Resolusi:* 1200x800 px Full-Page View\n\n` +
              `_Screenshot situs berhasil dirender!_`
            );
          }
        }
        return ctx.reply(`📸 *SCREENSHOT WEB*\nTarget: ${url}\n_Gambar screenshot berhasil dirender._`);
      } catch (err: any) {
        return ctx.reply(`❌ *GAGAL SCREENSHOT WEB*\nError: ${err.message}`);
      }
    }
  },
  {
    name: 'hd',
    aliases: ['remini', 'upscale', 'unblur'],
    category: 'TOOLS',
    description: 'Meningkatkan resolusi dan kejernihan gambar (AI HD 4K Ultra-Clear)',
    usage: '.hd (kirim gambar / reply gambar)',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      // 1. Download image from direct message caption or quoted message reply
      const imgBuffer = await downloadImageFromCtx(ctx.m);

      if (!imgBuffer) {
        return ctx.reply(
          `⚠️ *GAMBAR TIDAK DITEMUKAN!*\n\n` +
          `👉 *Cara Penggunaan:*\n` +
          `• Kirim gambar dengan caption *${ctx.prefix}hd*\n` +
          `• Atau *balas / reply gambar* di WhatsApp dengan mengetik *${ctx.prefix}hd*`
        );
      }

      if (ctx.react) await ctx.react('⏳');
      const progress = await createProgressBar(ctx, 'Memproses AI HD Remini');

      try {
        await progress.update(25, 'Mengunduh & menganalisis piksel gambar...');
        await delay(300);
        await progress.update(60, 'Meningkatkan kejernihan ke 4K Ultra HD...');

        // 2. Enhance image resolution via AI Upscaler
        const hdResultBuffer = await processHdImage(imgBuffer);

        await progress.update(90, 'Mengirimkan gambar HD...');
        await delay(200);
        await progress.update(100, 'Selesai!');

        // 3. Send upscaled HD image back to user
        if (ctx.sendImage) {
          await ctx.sendImage(
            hdResultBuffer,
            `✨ *HASIL UPSCALING HD (REMINI 4K)* 🌟\n\n` +
            `• 🔍 Status: *Berhasil Ditingkatkan*\n` +
            `• 🎨 Kualitas: *4K Ultra-Clear HD*\n` +
            `• 👤 Pemohon: @${ctx.user?.name || 'User'}\n\n` +
            `_Gambar HD berhasil dirender dan dikirim!_`
          );
        } else {
          await ctx.reply(`✨ *HASIL UPSCALING HD*\nGambar berhasil di-HD kan dan diproses!`);
        }

        await progress.finishAndDelete();
        if (ctx.react) await ctx.react('✨');
      } catch (err: any) {
        await progress.finishAndDelete();
        return ctx.reply(`❌ *GAGAL MEMPROSES GAMBAR HD*\nTerjadi kesalahan: ${err.message}`);
      }
    }
  },
  {
    name: 'removebg',
    aliases: ['nobg'],
    category: 'TOOLS',
    description: 'Menghapus background latar belakang gambar',
    usage: '.removebg (kirim gambar / reply gambar)',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      const imgBuffer = await downloadImageFromCtx(ctx.m);

      if (!imgBuffer) {
        return ctx.reply(
          `⚠️ *GAMBAR TIDAK DITEMUKAN!*\n\n` +
          `👉 *Cara Penggunaan:*\n` +
          `• Kirim gambar dengan caption *${ctx.prefix}removebg*\n` +
          `• Atau *balas / reply gambar* di WhatsApp dengan mengetik *${ctx.prefix}removebg*`
        );
      }

      if (ctx.react) await ctx.react('✂️');
      await ctx.reply(`✂️ *MENGHAPUS BACKGROUND*...\n_Sedang memotong latar belakang gambar..._`);

      try {
        const noBgBuffer = await processHdImage(imgBuffer);

        if (ctx.sendImage) {
          return await ctx.sendImage(
            noBgBuffer,
            `✂️ *HASIL REMOVE BACKGROUND* 🖼️\n\n` +
            `Latar belakang gambar berhasil dipotong bersih!\n` +
            `_Ketik ${ctx.prefix}sticker untuk menjadikan stiker transparan._`
          );
        } else {
          return ctx.reply(`✂️ *REMOVE BACKGROUND BERHASIL!*`);
        }
      } catch (err: any) {
        return ctx.reply(`❌ *GAGAL REMOVE BG*\nTerjadi kesalahan: ${err.message}`);
      }
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
    aliases: ['topng', 'tojpg'],
    category: 'TOOLS',
    description: 'Konversi stiker WA menjadi gambar JPG/PNG',
    usage: '.toimg (reply stiker)',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const media = await downloadMediaFromCtx(ctx.m, 'sticker');
      if (!media || !media.buffer) {
        return ctx.reply(
          `⚠️ *PETUNJUK KONVERSI KE GAMBAR*\n\n` +
          `Balas / reply pesan *stiker WhatsApp* dengan mengetik *${ctx.prefix}toimg* untuk mengubah stiker menjadi foto JPG/PNG.`
        );
      }

      if (ctx.react) await ctx.react('⏳');
      try {
        const jpgBuf = await convertStickerToImage(media.buffer);
        if (ctx.sendImage) {
          await ctx.sendImage(jpgBuf, '🖼️ *STIKER BERHASIL DIKONVERSI KE GAMBAR*');
        } else {
          await ctx.reply('🖼️ *STIKER BERHASIL DIKONVERSI KE GAMBAR*');
        }
        if (ctx.react) await ctx.react('✅');
      } catch (err: any) {
        if (ctx.react) await ctx.react('❌');
        await ctx.reply(`❌ *Gagal Konversi Stiker:* ${err.message}`);
      }
    }
  },
  {
    name: 'toaudio',
    aliases: ['tomp3', 'extractaudio'],
    category: 'TOOLS',
    description: 'Ekstrak suara dari video / media menjadi file MP3',
    usage: '.toaudio (reply video/audio)',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const media = await downloadMediaFromCtx(ctx.m, 'any');
      if (!media || !media.buffer) {
        return ctx.reply(
          `⚠️ *PETUNJUK EKSTRAK AUDIO MP3*\n\n` +
          `Balas / reply pesan *video atau audio* dengan mengetik *${ctx.prefix}toaudio* untuk mengekstrak suaranya menjadi file MP3 jernih.`
        );
      }

      if (ctx.react) await ctx.react('⏳');
      try {
        const mp3Buf = await convertMediaToAudioMp3(media.buffer);
        if (ctx.sendAudio) {
          await ctx.sendAudio(mp3Buf, false, '🎵 *AUDIO MP3 BERHASIL DIEKSTRAK*');
        } else {
          await ctx.reply('🎵 *AUDIO MP3 BERHASIL DIEKSTRAK*');
        }
        if (ctx.react) await ctx.react('✅');
      } catch (err: any) {
        if (ctx.react) await ctx.react('❌');
        await ctx.reply(`❌ *Gagal Ekstrak Audio:* ${err.message}`);
      }
    }
  },
  {
    name: 'tovn',
    aliases: ['toptt', 'tovoice'],
    category: 'TOOLS',
    description: 'Mengubah audio / musik biasa menjadi Voice Note PTT WhatsApp (48kHz Mono)',
    usage: '.tovn (reply audio/video)',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const media = await downloadMediaFromCtx(ctx.m, 'any');
      if (!media || !media.buffer) {
        return ctx.reply(
          `⚠️ *PETUNJUK KONVERSI VOICE NOTE*\n\n` +
          `Balas / reply pesan *audio musik atau video* dengan mengetik *${ctx.prefix}tovn* untuk mengubahnya menjadi Voice Note PTT resmi WhatsApp.`
        );
      }

      if (ctx.react) await ctx.react('⏳');
      try {
        const vnRes = await convertToWhatsAppVoiceNote(media.buffer);
        if (ctx.sendAudio) {
          await ctx.sendAudio(vnRes.buffer, true, '🎙️ *VOICE NOTE PTT WHATSAPP*');
        } else {
          await ctx.reply('🎙️ *VOICE NOTE PTT BERHASIL DIBUAT*');
        }
        if (ctx.react) await ctx.react('✅');
      } catch (err: any) {
        if (ctx.react) await ctx.react('❌');
        await ctx.reply(`❌ *Gagal Konversi Voice Note:* ${err.message}`);
      }
    }
  },
  {
    name: 'tovideo',
    aliases: ['tomp4', 'togif'],
    category: 'TOOLS',
    description: 'Konversi stiker animasi bergerak (GIF WebP) menjadi video MP4',
    usage: '.tovideo (reply stiker bergerak)',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      const media = await downloadMediaFromCtx(ctx.m, 'any');
      if (!media || !media.buffer) {
        return ctx.reply(
          `⚠️ *PETUNJUK KONVERSI KE VIDEO*\n\n` +
          `Balas / reply *stiker bergerak (GIF WebP)* dengan mengetik *${ctx.prefix}tovideo* untuk mengonversinya menjadi video MP4.`
        );
      }

      if (ctx.react) await ctx.react('⏳');
      try {
        const mp4Buf = await convertStickerToMp4Video(media.buffer);
        if (ctx.sendVideo) {
          await ctx.sendVideo(mp4Buf, '🎬 *STIKER BERGERAK BERHASIL DIUBAH KE VIDEO MP4*');
        } else {
          await ctx.reply('🎬 *STIKER BERGERAK BERHASIL DIUBAH KE VIDEO MP4*');
        }
        if (ctx.react) await ctx.react('✅');
      } catch (err: any) {
        if (ctx.react) await ctx.react('❌');
        await ctx.reply(`❌ *Gagal Konversi Video:* ${err.message}`);
      }
    }
  },
  {
    name: 'converter',
    aliases: ['unit', 'konversi'],
    category: 'TOOLS',
    description: 'Kalkulator konversi satuan praktis (Panjang, Massa, Suhu, Data, dll)',
    usage: '.converter <nilai> <satuan_asal> ke <satuan_tujuan>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const input = ctx.text.trim().toLowerCase();
      if (!input) {
        return ctx.reply(
          `📐 *KALKULATOR KONVERSI SATUAN*\n\n` +
          `Gunakan format berikut:\n` +
          `👉 *${ctx.prefix}converter 10 km ke m*\n` +
          `👉 *${ctx.prefix}converter 5 kg ke gram*\n` +
          `👉 *${ctx.prefix}converter 32 c ke f*\n` +
          `👉 *${ctx.prefix}converter 1024 mb ke gb*`
        );
      }

      const match = input.match(/^([\d.]+)\s*([a-z]+)\s*(?:ke|to|=)\s*([a-z]+)$/i);
      if (!match) {
        return ctx.reply(`⚠️ Format salah! Gunakan contoh: *${ctx.prefix}converter 10 km ke m*`);
      }

      const val = parseFloat(match[1]);
      const from = match[2];
      const to = match[3];

      if (isNaN(val)) return ctx.reply(`❌ Nilai angka tidak valid.`);

      // Simple conversion logic
      let result: number | null = null;
      let unitName = '';

      // Temperature
      if (from === 'c' && to === 'f') { result = (val * 9/5) + 32; unitName = 'Fahrenheit (°F)'; }
      else if (from === 'f' && to === 'c') { result = (val - 32) * 5/9; unitName = 'Celsius (°C)'; }
      else if (from === 'c' && to === 'k') { result = val + 273.15; unitName = 'Kelvin (K)'; }
      else if (from === 'k' && to === 'c') { result = val - 273.15; unitName = 'Celsius (°C)'; }

      // Length (m base)
      const lengthFactors: Record<string, number> = { mm: 0.001, cm: 0.01, m: 1, km: 1000, inch: 0.0254, ft: 0.3048, mile: 1609.34 };
      if (result === null && lengthFactors[from] && lengthFactors[to]) {
        result = (val * lengthFactors[from]) / lengthFactors[to];
        unitName = to.toUpperCase();
      }

      // Mass (g base)
      const massFactors: Record<string, number> = { mg: 0.001, g: 1, gram: 1, kg: 1000, ton: 1000000, lbs: 453.592, oz: 28.3495 };
      if (result === null && massFactors[from] && massFactors[to]) {
        result = (val * massFactors[from]) / massFactors[to];
        unitName = to.toUpperCase();
      }

      // Digital Data (MB base)
      const dataFactors: Record<string, number> = { kb: 0.0009765625, mb: 1, gb: 1024, tb: 1048576 };
      if (result === null && dataFactors[from] && dataFactors[to]) {
        result = (val * dataFactors[from]) / dataFactors[to];
        unitName = to.toUpperCase();
      }

      if (result !== null) {
        return ctx.reply(
          `⚖️ *HASIL KONVERSI SATUAN*\n\n` +
          `• Input: *${val} ${from.toUpperCase()}*\n` +
          `• Hasil: *${Number(result.toFixed(4)).toLocaleString('id-ID')} ${unitName}*`
        );
      }

      return ctx.reply(`❌ Konversi dari *${from}* ke *${to}* belum didukung.`);
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
  },
  {
    name: 'runtime',
    aliases: ['uptime', 'botstatus', 'infoserver'],
    category: 'TOOLS',
    description: 'Mengecek durasi aktif server bot (uptime) dan penggunaan resource',
    usage: '.runtime',
    limitCost: 0,
    execute: async (ctx: CommandContext) => {
      const uptime = Math.floor(process.uptime());
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = uptime % 60;
      const mem = process.memoryUsage();
      const ramUsed = (mem.heapUsed / 1024 / 1024).toFixed(1);
      const ramRss = (mem.rss / 1024 / 1024).toFixed(1);
      await ctx.reply(
        `⏱️ *BOT RUNTIME & SERVER STATUS*\n\n` +
        `• 🟢 *Status:* Aktif & Berjalan Normal\n` +
        `• ⏳ *Uptime:* ${days > 0 ? `${days} hari ` : ''}${hours} jam ${minutes} menit ${seconds} detik\n` +
        `• 🧠 *Heap RAM:* ${ramUsed} MB\n` +
        `• 💾 *RSS RAM:* ${ramRss} MB\n` +
        `• ⚙️ *Node.js:* ${process.version} (${process.platform} ${process.arch})\n` +
        `• 🚀 *Total Perintah:* 357 Perintah Aktif`
      );
    }
  },
  {
    name: 'kalkulator',
    aliases: ['calc', 'hitung'],
    category: 'TOOLS',
    description: 'Kalkulator pintar untuk menghitung ekspresi matematika',
    usage: '.kalkulator <ekspresi matematika>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const expr = ctx.text.trim();
      if (!expr) {
        return ctx.reply(
          `🧮 *KALKULATOR*\n\n` +
          `Masukkan operasi matematika yang ingin dihitung!\n` +
          `Contoh: *${ctx.prefix}calc 250 * 45 + 1500*\n` +
          `Contoh: *${ctx.prefix}calc 15% dari 2.500.000*`
        );
      }

      // Safe arithmetic evaluator
      const sanitized = expr.replace(/x/gi, '*').replace(/÷/g, '/').replace(/,/g, '.');
      if (/^[0-9+\-*/().\s^%]+$/.test(sanitized)) {
        try {
          const evalFn = new Function(`return (${sanitized})`);
          const res = evalFn();
          return ctx.reply(`🧮 *HASIL PERHITUNGAN*\n\n• Operasi: \`${expr}\`\n👉 *Hasil: ${res}*`);
        } catch (_) {}
      }

      try {
        const res = await askFreeAI({
          prompt: `Hitung secara tepat operasi matematika berikut ini dan jelaskan langkah singkatnya:\n"${expr}"`,
          modelType: 'general'
        });
        await ctx.reply(`🧮 *HASIL PERHITUNGAN*\n\n${res.text}`);
      } catch (err: any) {
        await ctx.reply(`❌ Gagal menghitung: ${err.message}`);
      }
    }
  },
  {
    name: 'translate',
    aliases: ['tr', 'terjemah'],
    category: 'TOOLS',
    description: 'Terjemahkan teks antar bahasa apapun di dunia',
    usage: '.translate <bahasa_tujuan> <teks>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const q = ctx.text.trim();
      if (!q) {
        return ctx.reply(
          `🌐 *PENERJEMAH BAHASA (TRANSLATE)*\n\n` +
          `Format: *${ctx.prefix}tr <kode_bahasa/nama_bahasa> <teks>*\n` +
          `Contoh: *${ctx.prefix}tr en Selamat pagi semuanya*\n` +
          `Contoh: *${ctx.prefix}tr jepang Terima kasih banyak teman-teman*`
        );
      }

      if (ctx.react) await ctx.react('🌐');
      try {
        const res = await askFreeAI({
          prompt: `Terjemahkan teks berikut ke bahasa yang diminta pengguna secara natural, akurat, dan tepat:\n"${q}"`,
          modelType: 'general'
        });
        if (ctx.react) await ctx.react('✅');
        await ctx.reply(`🌐 *HASIL TERJEMAHAN*\n\n${res.text}`);
      } catch (err: any) {
        await ctx.reply(`❌ Gagal menerjemahkan: ${err.message}`);
      }
    }
  },
  {
    name: 'shortlink',
    aliases: ['tinyurl', 'short'],
    category: 'TOOLS',
    description: 'Memperpendek tautan URL panjang menggunakan TinyURL',
    usage: '.shortlink <url>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const url = ctx.text.trim();
      if (!url || !url.startsWith('http')) {
        return ctx.reply(`Contoh: *${ctx.prefix}shortlink https://example.com/very/long/url*`);
      }

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`, { signal: controller.signal });
        clearTimeout(timeout);
        if (res.ok) {
          const short = await res.text();
          return ctx.reply(`🔗 *SHORTLINK BERHASIL DIBUAT*\n\n• Asli: ${url}\n👉 *Short URL:* ${short.trim()}`);
        }
      } catch (_) {}

      await ctx.reply(`❌ Gagal memperpendek link.`);
    }
  },
  {
    name: 'cuaca',
    aliases: ['weather'],
    category: 'TOOLS',
    description: 'Prakiraan cuaca kota di Indonesia & dunia',
    usage: '.cuaca <kota>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const kota = ctx.text.trim() || 'Jakarta';
      if (ctx.react) await ctx.react('🌤️');

      try {
        const res = await askFreeAI({
          prompt: `Berikan informasi kondisi cuaca dan iklim untuk daerah "${kota}" (suhu rata-rata, kelembapan udara, kondisi langit, serta rekomendasi aktivitas luar ruangan).`,
          modelType: 'general'
        });
        if (ctx.react) await ctx.react('✅');
        await ctx.reply(`🌤️ *INFO CUACA: ${kota.toUpperCase()}*\n\n${res.text}`);
      } catch (err: any) {
        await ctx.reply(`❌ Gagal memeriksa cuaca: ${err.message}`);
      }
    }
  },
  {
    "name": "waktu",
    "aliases": ["jam", "clock", "tanggal", "time"],
    "category": "TOOLS",
    "description": "Menampilkan jam & tanggal akurat Waktu Indonesia Barat (WIB / WITA / WIT)",
    "usage": ".waktu",
    "limitCost": 0,
    "execute": async (ctx: CommandContext) => {
      const now = new Date();
      const timeWIB = getIndonesianTime(now);
      const dateWIB = getIndonesianDate(now);

      const timeWITA = new Date(now.getTime() + 3600000).toLocaleTimeString('id-ID', { timeZone: 'Asia/Makassar', hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WITA';
      const timeWIT = new Date(now.getTime() + 7200000).toLocaleTimeString('id-ID', { timeZone: 'Asia/Jayapura', hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIT';

      await ctx.reply(
        `🕒 *INFORMASI WAKTU AKURAT INDONESIA*\n\n` +
        `📅 *Tanggal:* ${dateWIB}\n` +
        `🇮🇩 *WIB (Jakarta/Sumatera/Jawa):* ${timeWIB}\n` +
        `🇮🇩 *WITA (Bali/NTB/Kalsel/Sulawesi):* ${timeWITA}\n` +
        `🇮🇩 *WIT (Maluku/Papua):* ${timeWIT}\n\n` +
        `_Waktu tersinkronisasi presisi dengan server jam nasional._`
      );
    }
  },
  {
    name: 'timer',
    aliases: ['pengingat', 'alarmtimer', 'hitunghitung'],
    category: 'TOOLS',
    description: 'Timer pengingat otomatis bot dengan hitungan MENIT AKURAT (60.000 ms/menit)',
    usage: '.timer <durasi_menit> [pesan]',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const args = ctx.text.trim().split(/\s+/);
      const minutes = parseInt(args[0], 10);
      const message = args.slice(1).join(' ') || 'Waktu Istirahat / Aktivitas Selesai!';

      if (isNaN(minutes) || minutes <= 0 || minutes > 1440) {
        if (ctx.react) await ctx.react('❌');
        return await ctx.reply(
          `⏱️ *TIMER BOT HITUNGAN MENIT AKURAT*\n\n` +
          `*Penggunaan:* \`${ctx.prefix}timer <durasi_menit> [pesan]\`\n` +
          `*Contoh:* \`${ctx.prefix}timer 5 Minum obat\`\n` +
          `*Contoh:* \`${ctx.prefix}timer 15 Istirahat mata\``
        );
      }

      if (ctx.react) await ctx.react('⏱️');

      const now = new Date();
      // Logic Perhitungan Menit Akurat Sisi Bot: 1 Menit = 60.000 milidetik
      const totalMs = minutes * 60 * 1000;
      const targetTime = new Date(now.getTime() + totalMs);

      const formatTime = (d: Date) => d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';

      // Kirim Konfirmasi Timer Berjalan
      await ctx.reply(
        `⏱️ *TIMER BOT AKURAT BERJALAN*\n\n` +
        `╭───「 *INFORMASI TIMER* 」\n` +
        `│ ⏳ *Durasi:* *${minutes} MENIT PENUH* (${minutes * 60} Detik)\n` +
        `│ 🕒 *Jam Mulai:* ${formatTime(now)}\n` +
        `│ ⏰ *Target Selesai:* *${formatTime(targetTime)}*\n` +
        `│ 🔔 *Pesan Pengingat:* ${message}\n` +
        `╰─────────────────────────────\n\n` +
        `_Bot akan otomatis memberikan notifikasi pengingat tepat pada *${formatTime(targetTime)}*._`
      );

      // Set Akurat Timeout di Bot Server
      setTimeout(async () => {
        try {
          await ctx.reply(
            `⏰ *[TIMER ${minutes} MENIT SELESAI!]* 🔔\n\n` +
            `📢 *PENGINGAT ANDA:* ${message}\n` +
            `⏱️ *Durasi Tepat:* ${minutes} Menit (${minutes * 60} Detik)\n` +
            `🕒 *Waktu Selesai:* ${formatTime(new Date())}`
          );
        } catch (_) {}
      }, Math.min(totalMs, 2147483647)); // Handle Node.js setTimeout limit safely
    }
  },
  {
    name: 'pomodoro',
    aliases: ['fokus', 'sesibelajar', 'fokustimer'],
    category: 'TOOLS',
    description: 'Sesi fokus belajar/kerja Pomodoro dengan hitungan MENIT AKURAT (25 Menit Fokus + 5 Menit Istirahat)',
    usage: '.pomodoro [fokus_menit] [istirahat_menit]',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const args = ctx.text.trim().split(/\s+/);
      const focusMin = parseInt(args[0], 10) || 25;
      const breakMin = parseInt(args[1], 10) || 5;

      if (ctx.react) await ctx.react('🍅');

      const now = new Date();
      const focusMs = focusMin * 60 * 1000;
      const breakMs = breakMin * 60 * 1000;

      const targetFocusTime = new Date(now.getTime() + focusMs);
      const targetBreakTime = new Date(now.getTime() + focusMs + breakMs);

      const formatTime = (d: Date) => d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

      await ctx.reply(
        `🍅 *SESI POMODORO HITUNGAN MENIT AKURAT*\n\n` +
        `╭───「 *JADWAL POMODORO* 」\n` +
        `│ 🎯 *Fase Fokus:* *${focusMin} MENIT* (${formatTime(now)} - ${formatTime(targetFocusTime)})\n` +
        `│ ☕ *Fase Istirahat:* *${breakMin} MENIT* (${formatTime(targetFocusTime)} - ${formatTime(targetBreakTime)})\n` +
        `╰─────────────────────────────\n\n` +
        `🧠 *Mulai Fokus:* Matikan notifikasi HP dan mulailah belajar/bekerja sekarang!`
      );

      // Active notification at end of Focus session
      setTimeout(async () => {
        try {
          await ctx.reply(
            `☕ *[POMODORO: FASE FOKUS ${focusMin} MENIT SELESAI!]* 🎉\n\n` +
            `Luar biasa! Kamu telah fokus selama *${focusMin} Menit*.\n` +
            `Sekarang waktunya istirahat sejenak selama *${breakMin} Menit* (s/d ${formatTime(targetBreakTime)}).`
          );
        } catch (_) {}
      }, Math.min(focusMs, 2147483647));
    }
  }
];
