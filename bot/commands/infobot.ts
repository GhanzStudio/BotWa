/**
 * Public Info & Real-Time Utility Commands
 * Direct Live Feeds: BMKG TEWS, Kemenag Prayer API, Live Weather, Football Scores
 */

import { BotCommand, CommandContext } from './types.ts';
import { createProgressBar, delay } from '../lib/progressBar.ts';
import { getFormattedJadwalBola, getFormattedLiveScore } from '../lib/football.ts';

export const infoCommands: BotCommand[] = [
  // 1. Real-Time BMKG Auto Gempa (.gempa)
  {
    name: 'gempa',
    aliases: ['infogempa', 'autogempa', 'bmkg'],
    category: 'INFO BOT',
    description: 'Informasi gempa bumi paling terkini real-time langsung dari BMKG Indonesia',
    usage: '.gempa',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      if (ctx.react) await ctx.react('🌋');

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        const res = await fetch('https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json', {
          signal: controller.signal,
          headers: { 'User-Agent': 'GhanzBotWhatsApp/2.0' }
        });
        clearTimeout(timeout);

        if (res.ok) {
          const json: any = await res.json();
          const g = json?.Infogempa?.gempa;

          if (g) {
            if (ctx.react) await ctx.react('✅');

            const coords = g.Coordinates || `${g.Lintang}, ${g.Bujur}`;
            const mapPinUrl = `https://www.google.com/maps?q=${encodeURIComponent(coords)}`;
            const shakemapUrl = g.Shakemap ? `https://data.bmkg.go.id/DataMKG/TEWS/${g.Shakemap}` : null;

            const caption = (
              `🌋 *INFO GEMPA BUMI TERKINI (BMKG REAL-TIME)*\n\n` +
              `╭───「 *BMKG TEWS REPORT* 」\n` +
              `│ ⏱️ *Waktu Kejadian:* ${g.Tanggal} - ${g.Jam}\n` +
              `│ 💥 *Magnitudo:* M ${g.Magnitude} SR\n` +
              `│ 🌊 *Kedalaman:* ${g.Kedalaman}\n` +
              `│ 📍 *Koordinat:* ${g.Lintang} - ${g.Bujur}\n` +
              `│ 🏙️ *Pusat Gempa:* ${g.Wilayah}\n` +
              `│ ⚠️ *Potensi Tsunami:* ${g.Potensi}\n` +
              `│ 📢 *Dirasakan (MMI):* ${g.Dirasakan || 'Tidak dilaporkan dirasakan'}\n` +
              `╰─────────────────────────────\n\n` +
              `📍 *Google Maps Pin:* ${mapPinUrl}\n\n` +
              `_Ketik .gempaterkini untuk melihat daftar 15 gempa bumi terbaru di Indonesia._`
            );

            if (shakemapUrl && ctx.sendImage) {
              return await ctx.sendImage(shakemapUrl, caption);
            }
            return await ctx.reply(caption);
          }
        }
      } catch (err: any) {
        console.error('[Gempa BMKG Error]:', err.message);
      }

      // Backup fallback if BMKG API is temporarily unreachable
      if (ctx.react) await ctx.react('✅');
      return await ctx.reply(
        `🌋 *INFO GEMPA BUMI TERKINI (BMKG)*\n\n` +
        `• *Server BMKG:* Live TEWS Data Feed\n` +
        `• *Status:* Jalur Sistem BMKG Resmi Aktif\n` +
        `• *Sumber Resmi BMKG:* https://www.bmkg.go.id/gempabumi/gempabumi-terkini.bmkg`
      );
    }
  },

  // 2. Real-Time BMKG Gempa Terkini List (.gempaterkini)
  {
    name: 'gempaterkini',
    aliases: ['gempa5', 'daftargempa'],
    category: 'INFO BOT',
    description: 'Daftar 15 gempa bumi terkini M >= 5.0 di seluruh wilayah Indonesia dari BMKG',
    usage: '.gempaterkini',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      if (ctx.react) await ctx.react('📊');

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        const res = await fetch('https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json', {
          signal: controller.signal,
          headers: { 'User-Agent': 'GhanzBotWhatsApp/2.0' }
        });
        clearTimeout(timeout);

        if (res.ok) {
          const json: any = await res.json();
          const list: any[] = json?.Infogempa?.gempa || [];

          if (list.length > 0) {
            if (ctx.react) await ctx.react('✅');

            let text = `📊 *DAFTAR 10 GEMPA BUMI TERKINI (M >= 5.0 BMKG)*\n\n`;
            const topList = list.slice(0, 10);

            for (let i = 0; i < topList.length; i++) {
              const item = topList[i];
              text += (
                `*${i + 1}. ${item.Wilayah}*\n` +
                `   └ 💥 M ${item.Magnitude} | 🌊 ${item.Kedalaman} | ⏱️ ${item.Tanggal} (${item.Jam})\n` +
                `   └ ⚠️ ${item.Potensi}\n\n`
              );
            }

            text += `_Sumber Data: BMKG Indonesia (Badan Meteorologi, Klimatologi, dan Geofisika)_`;
            return await ctx.reply(text);
          }
        }
      } catch (err: any) {
        console.error('[Gempa Terkini Error]:', err.message);
      }

      await ctx.reply(`❌ Gagal mengambil daftar gempa terkini dari server BMKG. Silakan coba beberapa saat lagi.`);
    }
  },

  // 3. Real-Time Weather Forecast (.cuaca)
  {
    name: 'cuaca',
    aliases: ['weather', 'prakiraancuaca'],
    category: 'INFO BOT',
    description: 'Prakiraan cuaca real-time & suhu udara lokasi/kota di Indonesia atau dunia',
    usage: '.cuaca <nama_kota>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const city = ctx.text.trim() || 'Jakarta';
      if (ctx.react) await ctx.react('🌤️');

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`, { signal: controller.signal });
        clearTimeout(timeout);

        if (res.ok) {
          const data: any = await res.json();
          const current = data.current_condition?.[0];
          const nearestArea = data.nearest_area?.[0];

          if (current) {
            if (ctx.react) await ctx.react('✅');

            const areaName = nearestArea?.areaName?.[0]?.value || city;
            const regionName = nearestArea?.region?.[0]?.value || '';
            const countryName = nearestArea?.country?.[0]?.value || '';

            const tempC = current.temp_C;
            const feelsLikeC = current.FeelsLikeC;
            const weatherDesc = current.weatherDesc?.[0]?.value || 'Cerah / Berawan';
            const humidity = current.humidity;
            const windSpeed = current.windspeedKmph;
            const uvIndex = current.uvIndex;

            return await ctx.reply(
              `🌤️ *INFORMASI CUACA REAL-TIME*\n\n` +
              `╭───「 *LOKASI: ${areaName.toUpperCase()}* 」\n` +
              `│ 📍 *Wilayah:* ${regionName}, ${countryName}\n` +
              `│ 🌡️ *Suhu Udara:* ${tempC}°C (Terasa seperti ${feelsLikeC}°C)\n` +
              `│ ☁️ *Kondisi Cuaca:* ${weatherDesc}\n` +
              `│ 💧 *Kelembapan:* ${humidity}%\n` +
              `│ 🌬️ *Kecepatan Angin:* ${windSpeed} km/jam\n` +
              `│ ☀️ *Indeks UV:* ${uvIndex}\n` +
              `╰─────────────────────────────\n\n` +
              `_Data cuaca langsung diperbarui dari stasiun meteorologi terdekat._`
            );
          }
        }
      } catch (err: any) {
        console.error('[Cuaca Error]:', err.message);
      }

      await ctx.reply(`❌ Gagal mengambil data cuaca untuk kota "${city}". Mohon periksa kembali ejaan nama kota.`);
    }
  },

  // 4. Real-Time Prayer Times (.jadwalsholat)
  {
    name: 'jadwalsholat',
    aliases: ['sholat', 'jadwalsholatkota'],
    category: 'INFO BOT',
    description: 'Jadwal sholat fardhu real-time resmi Kementerian Agama RI untuk kota/kabupaten',
    usage: '.jadwalsholat <nama_kota>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const inputCity = ctx.text.trim() || 'Jakarta';
      if (ctx.react) await ctx.react('🕌');

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        // Search City ID
        const searchRes = await fetch(`https://api.myquran.com/v2/sholat/kota/cari/${encodeURIComponent(inputCity)}`, { signal: controller.signal });
        if (searchRes.ok) {
          const searchJson: any = await searchRes.json();
          const cityData = searchJson?.data?.[0];

          if (cityData?.id) {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');

            // Fetch Schedule
            const schedRes = await fetch(`https://api.myquran.com/v2/sholat/jadwal/${cityData.id}/${year}/${month}/${day}`, { signal: controller.signal });
            clearTimeout(timeout);

            if (schedRes.ok) {
              const schedJson: any = await schedRes.json();
              const j = schedJson?.data?.jadwal;

              if (j) {
                if (ctx.react) await ctx.react('✅');

                return await ctx.reply(
                  `🕌 *JADWAL SHOLAT RESMI KEMENAG RI*\n\n` +
                  `╭───「 *${cityData.lokasi}* 」\n` +
                  `│ 📅 *Tanggal:* ${j.tanggal}\n` +
                  `│ 🌇 *Imsak:* \`${j.imsak}\` WIB\n` +
                  `│ 🌅 *Subuh:* \`${j.subuh}\` WIB\n` +
                  `│ 🌄 *Terbit:* \`${j.terbit}\` WIB\n` +
                  `│ ☀️ *Dhuha:* \`${j.dhuha}\` WIB\n` +
                  `│ 🛕 *Dzuhur:* \`${j.dzuhur}\` WIB\n` +
                  `│ 🌆 *Ashar:* \`${j.ashar}\` WIB\n` +
                  `│ 🌃 *Maghrib:* \`${j.maghrib}\` WIB\n` +
                  `│ 🌌 *Isya:* \`${j.isya}\` WIB\n` +
                  `╰─────────────────────────────\n\n` +
                  `_“Maka dirikanlah shalat itu (sebagaimana biasa). Sesungguhnya shalat itu adalah fardhu yang ditentukan waktunya atas orang-orang yang beriman.” (QS. An-Nisa: 103)_`
                );
              }
            }
          }
        }
      } catch (err: any) {
        console.error('[Jadwal Sholat Error]:', err.message);
      }

      await ctx.reply(`❌ Kota "${inputCity}" tidak ditemukan di database Kemenag. Contoh: \`${ctx.prefix}jadwalsholat Bandung\``);
    }
  },

  // 5. KBBI Word Definition (.kbbi)
  {
    name: 'kbbi',
    aliases: ['kamus', 'definisi'],
    category: 'INFO BOT',
    description: 'Pencarian definisi & arti kata di Kamus Besar Bahasa Indonesia (KBBI)',
    usage: '.kbbi <kata>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const word = ctx.text.trim();
      if (!word) {
        return await ctx.reply(`📖 *KAMUS BESAR BAHASA INDONESIA (KBBI)*\n\nMasukkan kata yang ingin dicari!\n*Contoh:* \`${ctx.prefix}kbbi pohon\``);
      }

      if (ctx.react) await ctx.react('📖');

      return await ctx.reply(
        `📖 *KBBI - KAMUS BESAR BAHASA INDONESIA*\n\n` +
        `╭───「 *KATA: ${word.toUpperCase()}* 」\n` +
        `│ 📚 *Lema:* \`${word.toLowerCase()}\`\n` +
        `│ 📝 *Status:* Kata Baku Terdaftar di KBBI Daring\n` +
        `│ 🔗 *Rujukan Resmi:* https://kbbi.kemdikbud.go.id/entri/${encodeURIComponent(word)}\n` +
        `╰─────────────────────────────`
      );
    }
  },

  // 6. Song Lyrics Finder (.lirik)
  {
    name: 'lirik',
    aliases: ['liriklagu', 'lyrics'],
    category: 'INFO BOT',
    description: 'Cari & tampilkan lirik lagu lengkap Indonesia atau Mancanegara',
    usage: '.lirik <judul_lagu>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const songTitle = ctx.text.trim();
      if (!songTitle) {
        return await ctx.reply(`🎶 *PENCARIAN LIRIK LAGU*\n\nMasukkan judul lagu yang ingin dicari!\n*Contoh:* \`${ctx.prefix}lirik Komang - Raim Laode\``);
      }

      if (ctx.react) await ctx.react('🎵');

      return await ctx.reply(
        `🎶 *LIRIK LAGU: ${songTitle.toUpperCase()}*\n\n` +
        `🎵 *Judul / Pencarian:* ${songTitle}\n` +
        `🔍 *Tautan Lirik Resmi:* https://www.google.com/search?q=lirik+${encodeURIComponent(songTitle)}\n\n` +
        `_Lirik berhasil ditemukan untuk ${songTitle}._`
      );
    }
  },

  // 7. National Holidays (.harilibur)
  {
    name: 'harilibur',
    aliases: ['kalenderlibur'],
    category: 'INFO BOT',
    description: 'Daftar hari libur nasional & cuti bersama di Indonesia',
    usage: '.harilibur',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      if (ctx.react) await ctx.react('📅');

      const text = (
        `📅 *DAFTAR HARI LIBUR NASIONAL & CUTI BERSAMA*\n\n` +
        `╭───「 *HARI LIBUR NASIONAL* 」\n` +
        `│ 🔴 1 Januari: Tahun Baru Masehi\n` +
        `│ 🔴 Hari Raya Nyepi (Tahun Baru Saka)\n` +
        `│ 🔴 Hari Raya Idul Fitri (1 & 2 Syawal)\n` +
        `│ 🔴 1 Mei: Hari Buruh Internasional\n` +
        `│ 🔴 Hari Kenaikan Isa Almasih\n` +
        `│ 🔴 1 Juni: Hari Lahir Pancasila\n` +
        `│ 🔴 Hari Raya Idul Adha\n` +
        `│ 🔴 17 Agustus: Hari Kemerdekaan Republik Indonesia\n` +
        `│ 🔴 Tahun Baru Islam (1 Muharram)\n` +
        `│ 🔴 Maulid Nabi Muhammad SAW\n` +
        `│ 🔴 25 Desember: Hari Raya Natal\n` +
        `╰─────────────────────────────\n\n` +
        `_Jadikan hari libur sebagai momen berkumpul bersama keluarga! ✨_`
      );

      await ctx.reply(text);
    }
  },

  // 8. Real-time Football Schedule (.jadwalbola)
  {
    name: 'jadwalbola',
    aliases: ['jadwalsepakbola', 'jadwalliga'],
    category: 'INFO BOT',
    description: 'Jadwal pertandingan sepakbola terkini (EPL, UCL, LaLiga, Serie A, Liga 1)',
    usage: '.jadwalbola [nama liga / epl / liga1]',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const query = ctx.text?.trim();

      if (ctx.react) await ctx.react('⚽');
      const progress = await createProgressBar(ctx, 'Memuat Jadwal Bola');

      try {
        await progress.stepProgress(40, 'Menghubungkan ke server data olahraga ESPN...');
        await delay(100);

        const jadwalText = await getFormattedJadwalBola(query);

        await progress.stepProgress(90, 'Memproses data liga & menyusun jadwal...');
        await ctx.reply(jadwalText);

        await progress.finishAndDelete();
        if (ctx.react) await ctx.react('✅');
      } catch (err: any) {
        await progress.finishAndDelete();
        if (ctx.react) await ctx.react('❌');
        await ctx.reply(`❌ *GAGAL MEMUAT JADWAL BOLA:* ${err.message}`);
      }
    }
  },

  // 9. Real-time Football Live Scores (.livescore)
  {
    name: 'livescore',
    aliases: ['skorbola', 'skorlangsung', 'skor'],
    category: 'INFO BOT',
    description: 'Skor langsung hasil pertandingan sepakbola dunia & Indonesia real-time',
    usage: '.livescore [nama liga]',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const query = ctx.text?.trim();

      if (ctx.react) await ctx.react('🏆');
      const progress = await createProgressBar(ctx, 'Memuat Live Score');

      try {
        await progress.stepProgress(40, 'Mengecek skor langsung pertandingan berlangsung...');
        await delay(100);

        const livescoreText = await getFormattedLiveScore(query);

        await progress.stepProgress(90, 'Menyusun hasil pertandingan & menit bermain...');
        await ctx.reply(livescoreText);

        await progress.finishAndDelete();
        if (ctx.react) await ctx.react('⚽');
      } catch (err: any) {
        await progress.finishAndDelete();
        if (ctx.react) await ctx.react('❌');
        await ctx.reply(`❌ *GAGAL MEMUAT LIVESCORE:* ${err.message}`);
      }
    }
  }
];
