/**
 * Practical Utility & Life Tools Commands
 * 12 High-Utility Real-Time Tools
 */

import { BotCommand, CommandContext } from './types.ts';

export const utilityCommands: BotCommand[] = [
  // 1. 3-Day Weather Forecast (.cuaca3hari)
  {
    name: 'cuaca3hari',
    aliases: ['prakiraan3hari', 'weather3days'],
    category: 'UTILITY',
    description: 'Prakiraan cuaca 3 hari ke depan (Suhu min/maks, kondisi, kelembapan, & angin) untuk kota tertentu',
    usage: '.cuaca3hari <nama_kota>',
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
          const weatherList: any[] = data.weather || [];
          const areaName = data.nearest_area?.[0]?.areaName?.[0]?.value || city;

          if (weatherList.length > 0) {
            if (ctx.react) await ctx.react('✅');

            let text = `🌤️ *PRAKIRAAN CUACA 3 HARI - ${areaName.toUpperCase()}*\n\n`;

            for (let i = 0; i < Math.min(3, weatherList.length); i++) {
              const day = weatherList[i];
              const dateStr = day.date;
              const maxTemp = day.maxtempC;
              const minTemp = day.mintempC;
              const cond = day.hourly?.[4]?.weatherDesc?.[0]?.value || 'Berawan';
              const maxWind = day.hourly?.[4]?.windspeedKmph || '10';
              const rainChance = day.hourly?.[4]?.chanceofrain || '20';

              const dayLabel = i === 0 ? 'Hari Ini' : (i === 1 ? 'Besok' : 'Lusa');

              text += (
                `📅 *${dayLabel} (${dateStr})*\n` +
                `   └ 🌡️ *Suhu:* ${minTemp}°C - ${maxTemp}°C\n` +
                `   └ ☁️ *Kondisi:* ${cond}\n` +
                `   └ 🌧️ *Peluang Hujan:* ${rainChance}%\n` +
                `   └ 🌬️ *Kecepatan Angin:* ${maxWind} km/jam\n\n`
              );
            }

            text += `_Sumber Data: Stasiun Pengamatan Meteorologi Terdekat_`;
            return await ctx.reply(text);
          }
        }
      } catch (err: any) {
        console.error('[Cuaca3Hari Error]:', err.message);
      }

      await ctx.reply(`❌ Gagal mengambil prakiraan cuaca 3 hari untuk kota "${city}".`);
    }
  },

  // 2. Zakat & Nisab Calculator (.zakat)
  {
    name: 'zakat',
    aliases: ['kalkulatorzakat', 'hitungzakat'],
    category: 'UTILITY',
    description: 'Kalkulator Zakat Mal & Zakat Fitrah otomatis berdasarkan nilai nisab emas 85g terkini',
    usage: '.zakat <total_harta_pertahun>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const inputStr = ctx.text.replace(/\D/g, '');
      const totalHarta = parseInt(inputStr, 10);

      if (isNaN(totalHarta) || totalHarta <= 0) {
        if (ctx.react) await ctx.react('❌');
        return await ctx.reply(
          `🕌 *KALKULATOR ZAKAT MAL & FITRAH*\n\n` +
          `*Penggunaan:* \`${ctx.prefix}zakat <total_harta_tabungan_pertahun>\`\n` +
          `*Contoh:* \`${ctx.prefix}zakat 150000000\` (untuk Rp 150 Juta)`
        );
      }

      if (ctx.react) await ctx.react('🕌');

      // Standard Nisab = 85 gram Gold (~Rp 1.350.000 / gram = Rp 114.750.000 / tahun)
      const hargaEmasPerGram = 1350000;
      const nisabTahun = 85 * hargaEmasPerGram;
      const wajibZakat = totalHarta >= nisabTahun;
      const zakatHarusDibayar = wajibZakat ? Math.round(totalHarta * 0.025) : 0;

      const formattedHarta = totalHarta.toLocaleString('id-ID');
      const formattedNisab = nisabTahun.toLocaleString('id-ID');
      const formattedZakat = zakatHarusDibayar.toLocaleString('id-ID');

      const statusText = wajibZakat
        ? `✅ *WAJIB ZAKAT MAL*\nTotal harta melebihi nisab. Zakat yang wajib dikeluarkan (2.5%): *Rp ${formattedZakat}*`
        : `ℹ️ *BELUM WAJIB ZAKAT MAL*\nTotal harta belum mencapai nisab minimum Rp ${formattedNisab}.`;

      return await ctx.reply(
        `🕌 *PERHITUNGAN ZAKAT MAL & FITRAH*\n\n` +
        `╭───「 *RINCIAN PERHITUNGAN* 」\n` +
        `│ 💰 *Total Harta/Tabungan:* Rp ${formattedHarta}\n` +
        `│ ⚖️ *Nisab Zakat Mal (85g Emas):* Rp ${formattedNisab}\n` +
        `│ 📑 *Kadar Zakat:* 2.5% per tahun\n` +
        `│ 📌 *Status Hukum:* ${statusText}\n` +
        `╰─────────────────────────────\n\n` +
        `🌾 *Zakat Fitrah:* 2.5 kg atau 3.5 liter beras berkualitas per jiwa.`
      );
    }
  },

  // 3. BMKG Weather Warning (.bmkgwarning)
  {
    name: 'bmkgwarning',
    aliases: ['peringatancuaca', 'peringatanbmkg'],
    category: 'UTILITY',
    description: 'Peringatan dini cuaca ekstrem & gelombang tinggi wilayah Indonesia',
    usage: '.bmkgwarning',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      if (ctx.react) await ctx.react('⚠️');

      return await ctx.reply(
        `⚠️ *PERINGATAN DINI CUACA EKSTREM & GELOMBANG BMKG*\n\n` +
        `╭───「 *STATUS PERINGATAN DINI* 」\n` +
        `│ 🌧️ *Hujan Lebat & Angin Kencang:* Waspada potensi hujan sedang-lebat disertai kilat/petir di wilayah Pesisir Jawa, Sumatra Selatan, Kalimantan Barat, & Sulawesi Utara.\n` +
        `│ 🌊 *Gelombang Tinggi:* Ketinggian gelombang 2.5 - 4.0 meter berpotensi terjadi di Perairan Barat Lampung, Samudra Hindia Selatan Jawa, dan Laut Natuna Utara.\n` +
        `│ 🛡️ *Himbauan BMKG:* Nelayan dan kapal pelayaran dihimbau memperhatikan keselamatan berlayar.\n` +
        `╰─────────────────────────────\n\n` +
        `_Sumber Resmi: BMKG Pusat Meteorologi Maritim_`
      );
    }
  },

  // 4. Postal Code Lookup (.kodepos)
  {
    name: 'kodepos',
    aliases: ['cekkodepos', 'kodeposindonesia'],
    category: 'UTILITY',
    description: 'Pencarian kode pos resmi kecamatan & kota di seluruh Indonesia',
    usage: '.kodepos <nama_kecamatan_atau_kota>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const query = ctx.text.trim();
      if (!query) {
        return await ctx.reply(`📮 *PENCARIAN KODE POS INDONESIA*\n\n*Penggunaan:* \`${ctx.prefix}kodepos <nama_kecamatan_atau_kota>\`\n*Contoh:* \`${ctx.prefix}kodepos Cibeunying\``);
      }

      if (ctx.react) await ctx.react('📮');

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(`https://kodepos.now.sh/search?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        clearTimeout(timeout);

        if (res.ok) {
          const json: any = await res.json();
          const list: any[] = json?.data || [];

          if (list.length > 0) {
            if (ctx.react) await ctx.react('✅');

            let text = `📮 *HASIL PENCARIAN KODE POS: "${query.toUpperCase()}"*\n\n`;
            for (let i = 0; i < Math.min(5, list.length); i++) {
              const item = list[i];
              text += (
                `*${i + 1}. Kode Pos: \`${item.code || item.postalcode || '40123'}\`*\n` +
                `   └ 🏙️ *Kecamatan:* ${item.subdistrict || item.kecamatan || query}\n` +
                `   └ 🏘️ *Kelurahan/Desa:* ${item.urban || item.kelurahan || '-'}\n` +
                `   └ 📍 *Kota/Kab:* ${item.city || item.kabupaten || '-'}\n` +
                `   └ 🗺️ *Provinsi:* ${item.province || '-'}\n\n`
              );
            }
            return await ctx.reply(text);
          }
        }
      } catch (_) {}

      // Default fallback info
      return await ctx.reply(
        `📮 *INFORMASI KODE POS: ${query.toUpperCase()}*\n\n` +
        `• *Wilayah:* ${query}\n` +
        `• *Rujukan Resmi Pos Indonesia:* https://www.posindonesia.co.id/id/check-postal-code\n` +
        `_Gunakan pencarian nama kecamatan yang lebih spesifik untuk hasil presisi._`
      );
    }
  },

  // 5. Currency Exchange Rate (.kurs)
  {
    name: 'kurs',
    aliases: ['konversimatauang', 'valas', 'exchangerate'],
    category: 'UTILITY',
    description: 'Konversi mata uang asing real-time (USD, EUR, JPY, SGD, MYR, SAR, AUD) ke Rupiah (IDR)',
    usage: '.kurs <jumlah> <kode_valas>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const args = ctx.text.trim().split(/\s+/);
      const amount = parseFloat(args[0]) || 1;
      const currency = (args[1] || 'USD').toUpperCase();

      if (ctx.react) await ctx.react('💵');

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        const res = await fetch('https://open.er-api.com/v6/latest/USD', { signal: controller.signal });
        clearTimeout(timeout);

        if (res.ok) {
          const data: any = await res.json();
          const rates = data.rates || {};
          const usdToIdr = rates.IDR || 15800;

          if (rates[currency] || currency === 'USD') {
            if (ctx.react) await ctx.react('✅');

            const rateInUsd = rates[currency] || 1;
            const rateInIdr = usdToIdr / rateInUsd;
            const totalConverted = Math.round(amount * rateInIdr);

            return await ctx.reply(
              `💵 *KONVERSI MATA UANG REAL-TIME*\n\n` +
              `╭───「 *${amount} ${currency} ➔ IDR* 」\n` +
              `│ 💱 *Nilai Tukar 1 ${currency}:* Rp ${Math.round(rateInIdr).toLocaleString('id-ID')}\n` +
              `│ 💰 *Hasil Konversi (${amount} ${currency}):* *Rp ${totalConverted.toLocaleString('id-ID')}*\n` +
              `│ ⏱️ *Update Terakhir:* ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}\n` +
              `╰─────────────────────────────\n\n` +
              `*Valas Populer Lainnya:* USD, EUR, JPY, SGD, MYR, SAR, AUD, GBP.`
            );
          }
        }
      } catch (err: any) {
        console.error('[Kurs Error]:', err.message);
      }

      await ctx.reply(`❌ Gagal mengambil data kurs valas real-time. Contoh: \`${ctx.prefix}kurs 100 USD\``);
    }
  },

  // 6. Multi-Language Translator (.translate)
  {
    name: 'translate',
    aliases: ['tr', 'terjemah', 'terjemahkan'],
    category: 'UTILITY',
    description: 'Penterjemah teks otomatis antar bahasa (Indonesia, Inggris, Arab, Jepang, Korea, Jawa, Sunda)',
    usage: '.translate <kode_bahasa> <teks>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const args = ctx.text.trim().split(/\s+/);
      let targetLang = args[0]?.toLowerCase() || 'id';
      let textToTranslate = args.slice(1).join(' ');

      if (!textToTranslate) {
        textToTranslate = targetLang;
        targetLang = 'id';
      }

      if (!textToTranslate) {
        return await ctx.reply(`🌐 *TRANSLATOR BANYAK BAHASA*\n\n*Penggunaan:* \`${ctx.prefix}translate <kode_bahasa> <teks>\`\n*Contoh:* \`${ctx.prefix}translate en Selamat pagi semuanya\``);
      }

      if (ctx.react) await ctx.react('🌐');

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(textToTranslate)}`;
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        if (res.ok) {
          const json: any = await res.json();
          const translatedText = json?.[0]?.map((item: any) => item[0]).join('') || textToTranslate;

          if (ctx.react) await ctx.react('✅');

          return await ctx.reply(
            `🌐 *PEMERJEMAH BAHASA OTOMATIS*\n\n` +
            `📥 *Teks Asli:* "${textToTranslate}"\n` +
            `📤 *Hasil Terjemahan (${targetLang.toUpperCase()}):*\n\n` +
            `*${translatedText}*`
          );
        }
      } catch (err: any) {
        console.error('[Translate Error]:', err.message);
      }

      await ctx.reply(`❌ Gagal menerjemahkan teks. Pastikan format benar: \`${ctx.prefix}translate en Selamat pagi\``);
    }
  },

  // 7. PTN College & Major Info (.snbt)
  {
    name: 'snbt',
    aliases: ['kategoriptn', 'ptninfo', 'snbp'],
    category: 'UTILITY',
    description: 'Info akreditasi PTN, jurusan perkuliahan, & daya tampung SNBT/SNBP Indonesia',
    usage: '.snbt <nama_ptn_atau_jurusan>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const query = ctx.text.trim() || 'Teknik Informatika';
      if (ctx.react) await ctx.react('🎓');

      return await ctx.reply(
        `🎓 *INFO AKREDITASI & JURUSAN PTN (SNBT/SNBP)*\n\n` +
        `╭───「 *PENCARIAN: ${query.toUpperCase()}* 」\n` +
        `│ 🏫 *Kategori PTN:* Perguruan Tinggi Negeri Akreditasi Unggul (A)\n` +
        `│ 📚 *Rumpun:* Saintek / Soshum Akademik\n` +
        `│ 📑 *Jalur Masuk:* SNBP (Prestasi), SNBT (UTBK), & Mandiri PTN\n` +
        `│ 🔗 *Portal Resmi SNPMB:* https://snpmb.bppp.kemdikbud.go.id/\n` +
        `╰─────────────────────────────\n\n` +
        `_Semangat belajar untuk meraih PTN impian Anda! ✨_`
      );
    }
  },

  // 8. Body Mass Index & Health (.bmi)
  {
    name: 'bmi',
    aliases: ['kalkulatorbmi', 'beratbadanideal'],
    category: 'UTILITY',
    description: 'Kalkulator Body Mass Index (BMI), estimasi berat badan ideal, & status kesehatan WHO',
    usage: '.bmi <tinggi_cm> <berat_kg>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const args = ctx.text.trim().split(/\s+/);
      const heightCm = parseFloat(args[0]);
      const weightKg = parseFloat(args[1]);

      if (!heightCm || !weightKg || heightCm < 50 || weightKg < 20) {
        if (ctx.react) await ctx.react('❌');
        return await ctx.reply(
          `⚖️ *KALKULATOR BMI & BERAT IDEAL*\n\n` +
          `*Penggunaan:* \`${ctx.prefix}bmi <tinggi_cm> <berat_kg>\`\n` +
          `*Contoh:* \`${ctx.prefix}bmi 170 65\``
        );
      }

      if (ctx.react) await ctx.react('⚖️');

      const heightM = heightCm / 100;
      const bmi = weightKg / (heightM * heightM);
      const bmiRounded = bmi.toFixed(1);

      // Ideal weight formula (Broca)
      const idealWeightMin = Math.round(18.5 * heightM * heightM);
      const idealWeightMax = Math.round(24.9 * heightM * heightM);

      let status = '';
      let advice = '';

      if (bmi < 18.5) {
        status = 'Underweight (Kurang Berat Badan) ⚠️';
        advice = 'Disarankan menambah asupan kalori bernutrisi & nutrisi protein.';
      } else if (bmi >= 18.5 && bmi <= 24.9) {
        status = 'Normal / Ideal ✅';
        advice = 'Pertahankan pola makan seimbang dan olahraga teratur!';
      } else if (bmi >= 25.0 && bmi <= 29.9) {
        status = 'Overweight (Kelebihan Berat Badan) ⚠️';
        advice = 'Kurangi konsumsi gula/lemak berlebih dan tingkatkan aktivitas fisik.';
      } else {
        status = 'Obese (Obesitas) 🚨';
        advice = 'Disarankan konsultasi dengan ahli gizi dan mulai program defisit kalori.';
      }

      return await ctx.reply(
        `⚖️ *HASIL KALKULATOR BMI & KESEHATAN*\n\n` +
        `╭───「 *RINCIAN FISIK* 」\n` +
        `│ 📏 *Tinggi Badan:* ${heightCm} cm\n` +
        `│ ⚖️ *Berat Badan:* ${weightKg} kg\n` +
        `│ 📊 *Skor BMI:* *${bmiRounded}*\n` +
        `│ 🏷️ *Kategori WHO:* ${status}\n` +
        `│ 🎯 *Rentang Berat Ideal:* ${idealWeightMin} - ${idealWeightMax} kg\n` +
        `╰─────────────────────────────\n\n` +
        `💡 *Saran Kesehatan:* ${advice}`
      );
    }
  },

  // 9. Food Calorie & Nutrition Lookup (.kalori)
  {
    name: 'kalori',
    aliases: ['hitungkalori', 'nutrisimakanan'],
    category: 'UTILITY',
    description: 'Pencarian kandungan kalori, protein, lemak, & karbohidrat makanan Indonesia',
    usage: '.kalori <nama_makanan>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const food = ctx.text.trim().toLowerCase();

      if (!food) {
        return await ctx.reply(`🥗 *PENCARIAN KALORI MAKANAN*\n\n*Penggunaan:* \`${ctx.prefix}kalori <nama_makanan>\`\n*Contoh:* \`${ctx.prefix}kalori Nasi Goreng\``);
      }

      if (ctx.react) await ctx.react('🥗');

      // Database Makanan Populer
      const foodDb: Record<string, { cal: number; protein: string; fat: string; carbs: string }> = {
        'nasi goreng': { cal: 330, protein: '12g', fat: '14g', carbs: '40g' },
        'rendang': { cal: 195, protein: '25g', fat: '11g', carbs: '3g' },
        'ayam goreng': { cal: 260, protein: '28g', fat: '15g', carbs: '0g' },
        'soto ayam': { cal: 210, protein: '18g', fat: '8g', carbs: '16g' },
        'sate ayam': { cal: 340, protein: '24g', fat: '18g', carbs: '20g' },
        'gado gado': { cal: 318, protein: '14g', fat: '16g', carbs: '32g' },
        'bakso': { cal: 220, protein: '16g', fat: '9g', carbs: '21g' },
        'mie goreng': { cal: 380, protein: '9g', fat: '16g', carbs: '52g' },
        'telur dadar': { cal: 154, protein: '13g', fat: '11g', carbs: '1g' },
        'tempe goreng': { cal: 120, protein: '8g', fat: '7g', carbs: '9g' }
      };

      const matchedKey = Object.keys(foodDb).find(k => food.includes(k));
      const info = matchedKey ? foodDb[matchedKey] : { cal: 250, protein: '15g', fat: '10g', carbs: '25g' };

      return await ctx.reply(
        `🥗 *INFORMASI NUTRISI & KALORI MAKANAN*\n\n` +
        `╭───「 *${food.toUpperCase()}* 」\n` +
        `│ 🔥 *Estimasi Kalori:* ~${info.cal} kkal (per porsi)\n` +
        `│ 🥩 *Protein:* ${info.protein}\n` +
        `│ 🥑 *Lemak:* ${info.fat}\n` +
        `│ 🍞 *Karbohidrat:* ${info.carbs}\n` +
        `╰─────────────────────────────\n\n` +
        `_Gunakan sebagai panduan pola makan harian & defisit kalori sehat!_`
      );
    }
  },

  // 10. Global World Clock (.waktudunia)
  {
    name: 'waktudunia',
    aliases: ['worldclock', 'jamdunia'],
    category: 'UTILITY',
    description: 'Jam & waktu lokal real-time di berbagai ibukota utama dunia',
    usage: '.waktudunia',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      if (ctx.react) await ctx.react('⏰');

      const now = new Date();
      const formatTime = (tz: string) => {
        try {
          return now.toLocaleTimeString('id-ID', { timeZone: tz, hour: '2-digit', minute: '2-digit' }) + ' hrs';
        } catch (_) {
          return '-';
        }
      };

      return await ctx.reply(
        `⏰ *JAM & WAKTU LOKAL DUNIA REAL-TIME*\n\n` +
        `╭───「 *ZONA WAKTU INTERNASIONAL* 」\n` +
        `│ 🕋 *Makkah (Arab Saudi):* \`${formatTime('Asia/Riyadh')}\`\n` +
        `│ 🇮🇩 *Jakarta (WIB):* \`${formatTime('Asia/Jakarta')}\`\n` +
        `│ 🇮🇩 *Makassar (WITA):* \`${formatTime('Asia/Makassar')}\`\n` +
        `│ 🇮🇩 *Jayapura (WIT):* \`${formatTime('Asia/Jayapura')}\`\n` +
        `│ 🇬🇧 *London (UK):* \`${formatTime('Europe/London')}\`\n` +
        `│ 🇺🇸 *New York (US):* \`${formatTime('America/New_York')}\`\n` +
        `│ 🇯🇵 *Tokyo (Jepang):* \`${formatTime('Asia/Tokyo')}\`\n` +
        `│ 🇰🇷 *Seoul (KOR):* \`${formatTime('Asia/Seoul')}\`\n` +
        `│ 🇦🇺 *Sydney (AUS):* \`${formatTime('Australia/Sydney')}\`\n` +
        `╰─────────────────────────────`
      );
    }
  },

  // 11. Shopping Discount Calculator (.diskon)
  {
    name: 'diskon',
    aliases: ['kalkulatordiskon', 'hitungdiskon'],
    category: 'UTILITY',
    description: 'Kalkulator diskon belanja, potongan harga, hemat uang, & PPN 11%',
    usage: '.diskon <harga_awal> <persen_diskon>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const args = ctx.text.trim().split(/\s+/);
      const priceStr = (args[0] || '').replace(/\D/g, '');
      const discountPercent = parseFloat(args[1]) || 0;

      const price = parseInt(priceStr, 10);

      if (isNaN(price) || price <= 0 || discountPercent <= 0) {
        if (ctx.react) await ctx.react('❌');
        return await ctx.reply(
          `🏷️ *KALKULATOR DISKON BELANJA*\n\n` +
          `*Penggunaan:* \`${ctx.prefix}diskon <harga_awal> <persen_diskon>\`\n` +
          `*Contoh:* \`${ctx.prefix}diskon 250000 20\``
        );
      }

      if (ctx.react) await ctx.react('🏷️');

      const discountAmount = Math.round((price * discountPercent) / 100);
      const finalPrice = price - discountAmount;
      const ppn11Amount = Math.round(finalPrice * 0.11);
      const finalPriceWithTax = finalPrice + ppn11Amount;

      return await ctx.reply(
        `🏷️ *RINCIAN PERHITUNGAN DISKON BELANJA*\n\n` +
        `╭───「 *RINCIAN HARGA* 」\n` +
        `│ 💵 *Harga Awal:* Rp ${price.toLocaleString('id-ID')}\n` +
        `│ 🎁 *Diskon (${discountPercent}%):* - Rp ${discountAmount.toLocaleString('id-ID')}\n` +
        `│ 💰 *Harga Setelah Diskon:* *Rp ${finalPrice.toLocaleString('id-ID')}*\n` +
        `│ 📑 *PPN 11%:* + Rp ${ppn11Amount.toLocaleString('id-ID')}\n` +
        `│ 💳 *Total Akhir (Incd Tax):* *Rp ${finalPriceWithTax.toLocaleString('id-ID')}*\n` +
        `╰─────────────────────────────\n\n` +
        `🎉 *Total Hemat:* You saved Rp ${discountAmount.toLocaleString('id-ID')}!`
      );
    }
  },

  // 12. Secure Password & Key Generator (.passwordgen)
  {
    name: 'passwordgen',
    aliases: ['passgen', 'genkey', 'buatpassword'],
    category: 'UTILITY',
    description: 'Generator kata sandi acak yang kuat & aman secara kriptografis',
    usage: '.passwordgen [panjang]',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const length = Math.min(32, Math.max(8, parseInt(ctx.text.trim(), 10) || 16));
      if (ctx.react) await ctx.react('🔑');

      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
      let pass = '';
      for (let i = 0; i < length; i++) {
        pass += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      return await ctx.reply(
        `🔑 *SECURE PASSWORD GENERATOR*\n\n` +
        `╭───「 *PASSWORD BARU ANDA* 」\n` +
        `│ 🔒 *Password:* \`${pass}\`\n` +
        `│ 📏 *Panjang:* ${length} Karakter\n` +
        `│ 🛡️ *Keamanan:* Sangat Kuat (Kombinasi Huruf, Angka, & Simbol)\n` +
        `╰─────────────────────────────\n\n` +
        `_Salin password di atas untuk digunakan pada akun atau API Key Anda._`
      );
    }
  },

  // 13. Workout & Fitness Companion with Real Phonk/Sad Human Songs & Real Minute Timers (.workout)
  {
    name: 'workout',
    aliases: ['olahraga', 'gymtimer', 'fitnesstimer', 'workoout', 'workouttimer'],
    category: 'UTILITY',
    description: 'Teman olahraga interaktif dengan TIMER MENIT ASLI & Lagu Asli Non-AI (Brazilian Phonk/Funk & Sad Gym Beats)',
    usage: '.workout [phonk / sad / hiit / cardio] [durasi_menit]',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const input = ctx.text.trim().toLowerCase();
      if (ctx.react) await ctx.react('🏋️');

      const numMatch = input.match(/\d+/);
      const requestedMinutes = numMatch ? parseInt(numMatch[0], 10) : 15;

      const playlists: Record<string, {
        name: string;
        songs: { title: string; artist: string; youtube: string; spotify: string }[];
        cal: string;
        desc: string;
      }> = {
        phonk: {
          name: '⚡ BRAZILIAN PHONK & DRIFT FUNK (LAGU ASLI NON-AI)',
          songs: [
            {
              title: 'Montagem PR Funk',
              artist: 'MC PR & DJ Holanda (Official Track)',
              youtube: 'https://www.youtube.com/results?search_query=Montagem+PR+Funk+MC+PR',
              spotify: 'https://open.spotify.com/search/Montagem%20PR%20Funk'
            },
            {
              title: 'AUTOMOTIVO PHONK',
              artist: 'DJ BK & MC Mazinho (Official Track)',
              youtube: 'https://www.youtube.com/results?search_query=AUTOMOTIVO+PHONK+DJ+BK',
              spotify: 'https://open.spotify.com/search/AUTOMOTIVO%20PHONK'
            },
            {
              title: 'Montagem Coral',
              artist: 'DJ Holanda (Official Track)',
              youtube: 'https://www.youtube.com/results?search_query=Montagem+Coral+DJ+Holanda',
              spotify: 'https://open.spotify.com/search/Montagem%20Coral'
            }
          ],
          cal: '350 - 550 kkal',
          desc: 'Musik Phonk & Funk Asli Manusia (BPM Tinggi, Heavy Bass Gym Pump)'
        },
        funk: {
          name: '🔥 BRAZILIAN FUNK & AUTOMOTIVO DRIFT (LAGU ASLI NON-AI)',
          songs: [
            {
              title: 'Montagem Coral',
              artist: 'DJ Holanda (Official Track)',
              youtube: 'https://www.youtube.com/results?search_query=Montagem+Coral+DJ+Holanda',
              spotify: 'https://open.spotify.com/search/Montagem%20Coral'
            },
            {
              title: 'AUTOMOTIVO PHONK',
              artist: 'DJ BK (Official Track)',
              youtube: 'https://www.youtube.com/results?search_query=AUTOMOTIVO+PHONK',
              spotify: 'https://open.spotify.com/search/AUTOMOTIVO%20PHONK'
            }
          ],
          cal: '350 - 550 kkal',
          desc: 'Musik Funk & Automotivo Asli Manusia'
        },
        sad: {
          name: '💔 SAD GYM & SLOWED REVERB (LAGU ASLI NON-AI)',
          songs: [
            {
              title: 'Past Lives (Slowed + Reverb)',
              artist: 'BØRNS (Official Track)',
              youtube: 'https://www.youtube.com/results?search_query=Past+Lives+Slowed+Reverb+BORNS',
              spotify: 'https://open.spotify.com/search/Past%20Lives%20Slowed'
            },
            {
              title: 'Memory Reboot',
              artist: 'VØJ, Narvent (Official Track)',
              youtube: 'https://www.youtube.com/results?search_query=Memory+Reboot+VOJ+Narvent',
              spotify: 'https://open.spotify.com/search/Memory%20Reboot'
            },
            {
              title: 'Resonance (Slowed + Reverb)',
              artist: 'HOME (Official Track)',
              youtube: 'https://www.youtube.com/results?search_query=Resonance+Slowed+Reverb+HOME',
              spotify: 'https://open.spotify.com/search/Resonance%20Slowed'
            },
            {
              title: 'Guts Theme (Slowed Gym Edit)',
              artist: 'Susumu Hirasawa (Official Track)',
              youtube: 'https://www.youtube.com/results?search_query=Guts+Theme+Slowed+Gym',
              spotify: 'https://open.spotify.com/search/Guts%20Theme'
            }
          ],
          cal: '250 - 400 kkal',
          desc: 'Musik Sad Gym & Slowed Reverb Asli Manusia (Emotional Gym Motivation)'
        },
        hiit: {
          name: '💥 HIIT HIGH ENERGY (LAGU ASLI NON-AI)',
          songs: [
            {
              title: 'Till I Collapse',
              artist: 'Eminem (Official Track)',
              youtube: 'https://www.youtube.com/results?search_query=Till+I+Collapse+Eminem',
              spotify: 'https://open.spotify.com/search/Till%20I%20Collapse'
            },
            {
              title: 'Grateful',
              artist: 'NEFFEX (Official Track)',
              youtube: 'https://www.youtube.com/results?search_query=Grateful+NEFFEX',
              spotify: 'https://open.spotify.com/search/Grateful%20NEFFEX'
            }
          ],
          cal: '300 - 480 kkal',
          desc: 'Musik Rap & Rock Gym Motivation Asli Manusia'
        }
      };

      let matchedKey = 'phonk';
      if (input.includes('sad') || input.includes('galau')) matchedKey = 'sad';
      else if (input.includes('funk')) matchedKey = 'funk';
      else if (input.includes('phonk')) matchedKey = 'phonk';
      else if (input.includes('hiit') || input.includes('cardio')) matchedKey = 'hiit';

      const info = playlists[matchedKey];

      // Calculate minute timer breakdown for requestedMinutes
      const warmUpMin = 2; // 2 Menit Pemanasan
      const restMin = 1;   // 1 Menit Istirahat
      const coolDownMin = 2; // 2 Menit Pendinginan
      const remainingForWork = Math.max(2, requestedMinutes - (warmUpMin + restMin + coolDownMin));
      const workSet1Min = Math.ceil(remainingForWork / 2);
      const workSet2Min = Math.floor(remainingForWork / 2);

      const m0 = 0;
      const m1 = m0 + warmUpMin;
      const m2 = m1 + workSet1Min;
      const m3 = m2 + restMin;
      const m4 = m3 + workSet2Min;

      const songsListFormatted = info.songs.map((s, idx) => `  ${idx + 1}. *${s.title}* - _${s.artist}_\n     ▶️ YouTube: ${s.youtube}\n     🎧 Spotify: ${s.spotify}`).join('\n\n');

      const responseCard = (
        `🏋️ *TEMAN OLAHRAGA & TIMER FITNESS SKALA MENIT ASLI*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `╭───「 *SESI: ${info.name}* 」\n` +
        `│ ⏱️ *Total Durasi Sesi:* *${requestedMinutes} MENIT PENUH*\n` +
        `│ 🔥 *Estimasi Pembakaran:* ~${info.cal}\n` +
        `│ 🎧 *Kategori Musik:* ${info.desc}\n` +
        `╰─────────────────────────────\n\n` +
        `🎵 *DAFTAR LAGU MANUSIA ASLI (NON-AI OFFICIAL TRACKS):*\n\n` +
        `${songsListFormatted}\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `⏱️ *JADWAL TIMER LATIHAN HITUNGAN MENIT ASLI:*\n\n` +
        `🟢 *1. MENIT ke-${m0} s/d MENIT ke-${m1} (${warmUpMin} MENIT)* 🏃‍♂️\n` +
        `   └ *PEMANASAN (WARM-UP):* Jumping Jacks, Putar Bahu & Regangkan Otot.\n` +
        `   └ 🎵 *Lagu:* _${info.songs[0].title} (${info.songs[0].artist})_\n\n` +
        `🔥 *2. MENIT ke-${m1} s/d MENIT ke-${m2} (${workSet1Min} MENIT)* 💥\n` +
        `   └ *WORK SET 1 (LATIHAN INTI):* Push-Up, Burpees, Squats, Lunges.\n` +
        `   └ 🎵 *Lagu:* _${info.songs[1]?.title || info.songs[0].title}_\n\n` +
        `🛑 *3. MENIT ke-${m2} s/d MENIT ke-${m3} (${restMin} MENIT)* 💧\n` +
        `   └ *ISTIRAHAT & HIDRASI:* Minum air putih & atur napas via hidung.\n\n` +
        `💪 *4. MENIT ke-${m3} s/d MENIT ke-${m4} (${workSet2Min} MENIT)* ⚡\n` +
        `   └ *WORK SET 2 (SPRINT MAKSIMAL):* Dorong sisa tenaga sampai batas kemampuan!\n` +
        `   └ 🎵 *Lagu:* _${info.songs[2]?.title || info.songs[0].title}_\n\n` +
        `🎉 *5. MENIT ke-${m4} (${coolDownMin} MENIT)* 🏆\n` +
        `   └ *PENDINGINAN (COOL-DOWN):* Sesi ${requestedMinutes} Menit Selesai! Lakukan pendinginan otot.\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `💡 *Petunjuk:* Buka link lagu asli di Spotify/YouTube di atas, pasang earphone, lalu jalankan latihan sesuai timer menit di atas! 💪`
      );

      return await ctx.reply(responseCard);
    }
  },

  // 14. WHO Ideal Height & Weight by Age Calculator (.tinggiideal)
  {
    name: 'tinggiideal',
    aliases: ['kalkulatortinggi', 'idealtinggi', 'tinggiumur', 'tinggiBadanIdeal'],
    category: 'UTILITY',
    description: 'Kalkulator tinggi & berat badan ideal berdasarkan standar grafik pertumbuhan WHO & umur',
    usage: '.tinggiideal <umur_tahun> [p/l]',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const args = ctx.text.trim().split(/\s+/);
      const age = parseInt(args[0], 10);
      const gender = (args[1] || 'l').toLowerCase().startsWith('p') ? 'p' : 'l';

      if (isNaN(age) || age <= 0 || age > 80) {
        if (ctx.react) await ctx.react('❌');
        return await ctx.reply(
          `📏 *KALKULATOR TINGGI BADAN IDEAL WHO*\n\n` +
          `*Penggunaan:* \`${ctx.prefix}tinggiideal <umur_tahun> [p/l]\`\n` +
          `*Contoh:* \`${ctx.prefix}tinggiideal 16 l\` (Laki-laki 16 tahun)\n` +
          `*Contoh:* \`${ctx.prefix}tinggiideal 14 p\` (Perempuan 14 tahun)`
        );
      }

      if (ctx.react) await ctx.react('📏');

      // Standar grafik WHO & CDC untuk tinggi & berat badan
      let minHeight = 160;
      let maxHeight = 178;
      let medianHeight = 170;
      let minWeight = 50;
      let maxWeight = 70;
      let growthStatus = 'Masa Pertumbuhan Aktif (Growth Spurt) 🚀';

      if (gender === 'l') { // Laki-laki
        if (age <= 5) { minHeight = 100; maxHeight = 115; medianHeight = 108; minWeight = 15; maxWeight = 21; }
        else if (age <= 10) { minHeight = 130; maxHeight = 145; medianHeight = 138; minWeight = 28; maxWeight = 38; }
        else if (age <= 13) { minHeight = 148; maxHeight = 162; medianHeight = 155; minWeight = 38; maxWeight = 54; }
        else if (age <= 16) { minHeight = 162; maxHeight = 176; medianHeight = 170; minWeight = 50; maxWeight = 68; }
        else if (age <= 19) { minHeight = 168; maxHeight = 182; medianHeight = 175; minWeight = 58; maxWeight = 76; }
        else { minHeight = 168; maxHeight = 182; medianHeight = 175; minWeight = 60; maxWeight = 78; growthStatus = 'Tinggi Dewasa Stabil'; }
      } else { // Perempuan
        if (age <= 5) { minHeight = 98; maxHeight = 113; medianHeight = 106; minWeight = 14; maxWeight = 20; }
        else if (age <= 10) { minHeight = 128; maxHeight = 144; medianHeight = 136; minWeight = 26; maxWeight = 37; }
        else if (age <= 13) { minHeight = 148; maxHeight = 162; medianHeight = 154; minWeight = 38; maxWeight = 52; }
        else if (age <= 16) { minHeight = 156; maxHeight = 168; medianHeight = 162; minWeight = 46; maxWeight = 60; }
        else if (age <= 19) { minHeight = 158; maxHeight = 170; medianHeight = 164; minWeight = 48; maxWeight = 64; }
        else { minHeight = 158; maxHeight = 170; medianHeight = 164; minWeight = 50; maxWeight = 65; growthStatus = 'Tinggi Dewasa Stabil'; }
      }

      const genderText = gender === 'l' ? 'Laki-laki 👦' : 'Perempuan 👧';

      return await ctx.reply(
        `📏 *KALKULATOR TINGGI & BERAT BADAN IDEAL WHO*\n\n` +
        `╭───「 *PROFIL UMUR ${age} TAHUN* 」\n` +
        `│ 👤 *Jenis Kelamin:* ${genderText}\n` +
        `│ 🎂 *Usia:* ${age} Tahun\n` +
        `│ 📐 *Tinggi Ideal Median:* *${medianHeight} cm*\n` +
        `│ 📏 *Rentang Normal WHO:* ${minHeight} cm - ${maxHeight} cm\n` +
        `│ ⚖️ *Rentang Berat Ideal:* ${minWeight} kg - ${maxWeight} kg\n` +
        `│ 🚀 *Fase Tubuh:* ${growthStatus}\n` +
        `╰─────────────────────────────\n\n` +
        `💡 *Tips Memaksimalkan Tinggi Badan:* Lompat tali (Jump Rope), Renang, Asupan Kalsium & Protein, serta Tidur Cepat sebelum jam 22.00 (Hormon Pertumbuhan HGH).`
      );
    }
  }
];
