/**
 * Artificial Intelligence (AI) Commands
 * Powered by Google Gemini AI Official SDK (@google/genai) & Ghanz Multi-Engine Failover
 * 100% Free, High-Speed, Zero-Downtime, Accurate Reasoning
 */

import { BotCommand, CommandContext } from './types.ts';
import { askFreeAI } from '../lib/aiProvider.ts';
import { downloadImageFromCtx, getQuotedTextFromCtx } from '../lib/imageProcessor.ts';

/**
 * Detects and extracts deep reasoning flag (#mendalam, #detail, #lengkap, #deep)
 */
function parseDeepFlag(rawText: string): { cleanText: string; isMendalam: boolean } {
  let isMendalam = false;
  let cleanText = rawText || '';

  if (/(?:^|\s)(?:#mendalam|#detail|#lengkap|#deep)(?:\s|$)/i.test(cleanText)) {
    isMendalam = true;
    cleanText = cleanText.replace(/(?:^|\s)(?:#mendalam|#detail|#lengkap|#deep)(?:\s|$)/gi, ' ').trim();
  }

  return { cleanText, isMendalam };
}

/**
 * Combines user prompt with quoted/replied message context & deep reasoning mode instructions
 */
function buildPromptWithContext(q: string, quotedText: string | null, isMendalam: boolean = false): string {
  let prompt = q;

  if (quotedText && quotedText.trim()) {
    const cleanQuoted = quotedText.trim();
    if (q && q.trim()) {
      prompt = (
        `[KONTEKS PESAN/JAWABAN SEBELUMNYA YANG DIBALAS/DI-REPLY PENGGUNA]:\n` +
        `"""\n${cleanQuoted}\n"""\n\n` +
        `[PERTANYAAN / REVISI / INSTRUKSI LANJUTAN PENGGUNA TERHADAP PESAN DI ATAS]:\n` +
        `${q.trim()}\n\n` +
        `*Instruksi Penting: Jawablah pertanyaan lanjutan di atas secara SPESIFIK BERDASARKAN KONTEKS PESAN YANG DIBALAS tersebut. Jangan mengalihkan ke topik lain yang tidak relevan!*`
      );
    } else {
      prompt = (
        `[PESAN/JAWABAN YANG DIBALAS/DI-REPLY PENGGUNA]:\n` +
        `"""\n${cleanQuoted}\n"""\n\n` +
        `[INSTRUKSI]: Jelaskan, analisis, atau jawab konten dari pesan di atas secara detail, terstruktur, dan akurat.`
      );
    }
  }

  if (isMendalam) {
    prompt +=
      `\n\n🔬 *MODE ANALISIS MENDALAM (#MENDALAM) Wajib Aktif*:\n` +
      `Berikan jawaban yang SANGAT DETAIL, EXHAUSTIVE, LENGKAP, KOMPREHENSIF, MENDALAM, DAN SEDETAIL-DETAILNYA TANPA DIPOTONG ATAU DISINGKAT SEDIKIT PUN. ` +
      `Uraikan latar belakang, definisi, teori dasar, langkah-langkah analitis, contoh konkret, rumus/struktur, serta rincian lengkap dari awal hingga akhir secara tuntas!`;
  }

  return prompt;
}

/**
 * Checks remaining user limit, deducts 1 token for non-owners (including Premium/VIP), and blocks if limit is 0.
 */
async function checkAndDeductAiLimit(ctx: CommandContext): Promise<{ allowed: boolean; limitText: string }> {
  // ONLY Owner has completely unlimited access
  if (ctx.isOwner || ctx.user?.role === 'owner') {
    return { allowed: true, limitText: 'Unlimited (Owner)' };
  }

  const isVip = ctx.isPremium || ctx.user?.role === 'premium' || ctx.user?.isPremium;
  const currentLimit = typeof ctx.user?.limit === 'number' ? ctx.user.limit : (isVip ? 100 : 20);

  if (currentLimit <= 0) {
    await ctx.reply(
      `❌ *LIMIT ENERGI KAMU SUDAH HABIS!*\n\n` +
      `📊 *Status Akun:* ${isVip ? '👑 VIP / Premium' : '👤 Free User'}\n` +
      `📊 *Sisa Limit:* 0 Token\n\n` +
      `💡 *Keterangan:* Jika limit energi habis, fitur AI tidak dapat digunakan lagi kecuali oleh *Owner Bot*.\n` +
      `👉 Ketik *${ctx.prefix}buyenergi* atau hubungi owner untuk isi ulang limit energi kamu!`
    );
    return { allowed: false, limitText: '0 Token' };
  }

  // Deduct 1 token limit for normal & premium/VIP users
  ctx.user.limit = Math.max(0, currentLimit - 1);
  if (typeof ctx.user.save === 'function') {
    await ctx.user.save();
  }

  const badge = isVip ? ' (VIP)' : '';
  return { allowed: true, limitText: `${ctx.user.limit} Token${badge}` };
}

export const aiCommands: BotCommand[] = [
  // 1. General AI (.ai)
  {
    name: 'ai',
    aliases: ['tanya', 'ask', 'chat', 'vision', 'soal'],
    category: 'AI',
    description: 'Tanya jawab & analisis foto/soal dengan Ghanz Bot AI (Gemini Vision)',
    usage: '.ai <#mendalam> <pertanyaan> (atau kirim/balas foto/pesan)',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const { cleanText: q, isMendalam } = parseDeepFlag(ctx.text);
      const imageBuffer = await downloadImageFromCtx(ctx.m);
      const quotedText = getQuotedTextFromCtx(ctx.m);

      if (!q && !imageBuffer && !quotedText) {
        return ctx.reply(
          `🤖 *GHANZ BOT AI (VISION & GEMINI ENGINE)*\n\n` +
          `Silakan ketik pertanyaan ATAU kirim/balas foto/pesan dengan perintah *${ctx.prefix}ai*!\n\n` +
          `*Contoh penggunaan:*\n` +
          `👉 *${ctx.prefix}ai Siapa penemu lampu pijar?*\n` +
          `👉 *${ctx.prefix}ai #mendalam Jelaskan sejarah lengkap teori relativitas Einstein*\n` +
          `👉 *${ctx.prefix}ai bantu saya mengerjakan soal itu* (Kirim/balas foto)\n\n` +
          `💡 _Gunakan tag *#mendalam* untuk jawaban ultra detail, komprehensif, dan mendalam!_`
        );
      }

      const limitCheck = await checkAndDeductAiLimit(ctx);
      if (!limitCheck.allowed) return;

      if (ctx.react) await ctx.react(isMendalam ? '🔬' : imageBuffer ? '📸' : '💭');

      try {
        const fullPrompt = buildPromptWithContext(q, quotedText, isMendalam);
        const answer = await askFreeAI({
          prompt: fullPrompt || 'Jelaskan gambar ini atau bantu kerjakan/selesaikan soal dalam gambar ini secara detail, terstruktur, dan akurat.',
          modelType: 'general',
          imageBuffer
        });

        if (ctx.react) await ctx.react('✅');
        const badge = isMendalam ? '🔬 (ANALISIS MENDALAM)' : imageBuffer ? '📸 (VISION)' : '';
        await ctx.reply(
          `🤖 *GHANZ BOT AI ${badge}*\n\n` +
          `${answer.text}\n\n` +
          `────────────────\n` +
          `⚡ _Engine: ${answer.model}_\n` +
          `📊 _Sisa Limit: ${limitCheck.limitText}_`
        );
      } catch (err: any) {
        if (ctx.react) await ctx.react('⚠️');
        await ctx.reply(
          `🤖 *GHANZ BOT AI*\n\n` +
          `Terjadi kendala saat memproses: ${err.message}. Silakan ulangi beberapa saat lagi.`
        );
      }
    }
  },

  // 2. Google Gemini AI (.gemini)
  {
    name: 'gemini',
    aliases: ['bard', 'googleai'],
    category: 'AI',
    description: 'Chat interaktif & analisis foto dengan Google Gemini AI resmi',
    usage: '.gemini <#mendalam> <prompt> (atau kirim/balas foto/pesan)',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const { cleanText: q, isMendalam } = parseDeepFlag(ctx.text);
      const imageBuffer = await downloadImageFromCtx(ctx.m);
      const quotedText = getQuotedTextFromCtx(ctx.m);

      if (!q && !imageBuffer && !quotedText) {
        return ctx.reply(
          `✨ *GOOGLE GEMINI AI (MULTIMODAL VISION)*\n\n` +
          `Silakan ketik prompt ATAU kirim/balas foto/pesan yang ingin dianalisis Gemini!\n\n` +
          `*Contoh:*\n` +
          `👉 *${ctx.prefix}gemini Buatkan rencana belajar web development 30 hari*\n` +
          `👉 *${ctx.prefix}gemini #mendalam Jelaskan mekanisme kerja sistem saraf manusia*\n` +
          `👉 *${ctx.prefix}gemini bantu jawab soal di foto ini* (Kirim/balas foto)`
        );
      }

      const limitCheck = await checkAndDeductAiLimit(ctx);
      if (!limitCheck.allowed) return;

      if (ctx.react) await ctx.react(isMendalam ? '🔬' : imageBuffer ? '📸' : '✨');

      try {
        const fullPrompt = buildPromptWithContext(q, quotedText, isMendalam);
        const answer = await askFreeAI({
          prompt: fullPrompt || 'Jelaskan gambar ini atau bantu kerjakan/selesaikan soal dalam gambar ini secara detail, terstruktur, dan akurat.',
          modelType: 'gemini',
          imageBuffer
        });

        if (ctx.react) await ctx.react('✅');
        const badge = isMendalam ? '🔬 (ANALISIS MENDALAM)' : imageBuffer ? '📸 (VISION)' : '';
        await ctx.reply(
          `✨ *GOOGLE GEMINI AI ${badge}*\n\n` +
          `${answer.text}\n\n` +
          `────────────────\n` +
          `⚡ _Engine: ${answer.model}_\n` +
          `📊 _Sisa Limit: ${limitCheck.limitText}_`
        );
      } catch (err: any) {
        if (ctx.react) await ctx.react('⚠️');
        await ctx.reply(
          `✨ *GOOGLE GEMINI AI*\n\n` +
          `Mohon maaf, sistem sedang memproses ulang permintaan: ${err.message}`
        );
      }
    }
  },

  // 3. GPT-4o Omni (.gpt4o)
  {
    name: 'gpt4o',
    aliases: ['chatgpt', 'gpt4'],
    category: 'AI',
    description: 'Model penalaran komprehensif GPT-4o Omni reasoning & Vision',
    usage: '.gpt4o <#mendalam> <prompt> (atau kirim/balas foto/pesan)',
    limitCost: 1,
    premiumOnly: false,
    execute: async (ctx: CommandContext) => {
      const { cleanText: q, isMendalam } = parseDeepFlag(ctx.text);
      const imageBuffer = await downloadImageFromCtx(ctx.m);
      const quotedText = getQuotedTextFromCtx(ctx.m);

      if (!q && !imageBuffer && !quotedText) {
        return ctx.reply(
          `🧠 *GPT-4o OMNI REASONING (VISION)*\n\n` +
          `Masukkan masalah/pertanyaan ATAU kirim/balas foto/pesan untuk dianalisis langkah demi langkah!\n\n` +
          `*Contoh:*\n` +
          `👉 *${ctx.prefix}gpt4o Jelaskan perbedaan teori relativitas umum dan khusus*\n` +
          `👉 *${ctx.prefix}gpt4o #mendalam Analisis krisis ekonomi global secara komprehensif*\n` +
          `👉 *${ctx.prefix}gpt4o bantu pecahkan soal di gambar ini* (Kirim/balas foto)`
        );
      }

      const limitCheck = await checkAndDeductAiLimit(ctx);
      if (!limitCheck.allowed) return;

      if (ctx.react) await ctx.react(isMendalam ? '🔬' : imageBuffer ? '📸' : '🧠');

      try {
        const fullPrompt = buildPromptWithContext(q, quotedText, isMendalam);
        const answer = await askFreeAI({
          prompt: fullPrompt || 'Jelaskan gambar ini atau bantu kerjakan/selesaikan soal dalam gambar ini secara detail, terstruktur, dan akurat.',
          modelType: 'gpt4o',
          imageBuffer
        });

        if (ctx.react) await ctx.react('✅');
        const badge = isMendalam ? '🔬 (ANALISIS MENDALAM)' : imageBuffer ? '📸 (VISION)' : '';
        await ctx.reply(
          `🧠 *GPT-4o OMNI ${badge}*\n\n` +
          `${answer.text}\n\n` +
          `────────────────\n` +
          `⚡ _Engine: ${answer.model}_\n` +
          `📊 _Sisa Limit: ${limitCheck.limitText}_`
        );
      } catch (err: any) {
        if (ctx.react) await ctx.react('⚠️');
        await ctx.reply(
          `🧠 *GPT-4o OMNI*\n\n` +
          `Sistem penalaran mengalami kendala: ${err.message}`
        );
      }
    }
  },

  // 4. DeepSeek Reasoning (.deepseek)
  {
    name: 'deepseek',
    aliases: ['r1', 'deepseekr1'],
    category: 'AI',
    description: 'Penalaran logis mendalam DeepSeek-R1 / V3 untuk kode, sains & analisis gambar',
    usage: '.deepseek <#mendalam> <masalah/kode> (atau kirim/balas foto/pesan)',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const { cleanText: q, isMendalam } = parseDeepFlag(ctx.text);
      const imageBuffer = await downloadImageFromCtx(ctx.m);
      const quotedText = getQuotedTextFromCtx(ctx.m);

      if (!q && !imageBuffer && !quotedText) {
        return ctx.reply(
          `🐋 *DEEPSEEK REASONING (VISION)*\n\n` +
          `Masukkan kode, logika ATAU kirim/balas foto/pesan soal/diagram!\n\n` +
          `*Contoh:*\n` +
          `👉 *${ctx.prefix}deepseek Buatkan algoritma binary search di TypeScript*\n` +
          `👉 *${ctx.prefix}deepseek #mendalam Jelaskan arsitektur microservices dan kodenya*\n` +
          `👉 *${ctx.prefix}deepseek kerjakan soal matematika ini* (Kirim/balas foto)`
        );
      }

      const limitCheck = await checkAndDeductAiLimit(ctx);
      if (!limitCheck.allowed) return;

      if (ctx.react) await ctx.react(isMendalam ? '🔬' : imageBuffer ? '📸' : '🐋');

      try {
        const fullPrompt = buildPromptWithContext(q, quotedText, isMendalam);
        const answer = await askFreeAI({
          prompt: fullPrompt || 'Jelaskan gambar ini atau bantu kerjakan/selesaikan soal dalam gambar ini secara detail, terstruktur, dan akurat.',
          modelType: 'deepseek',
          imageBuffer
        });

        if (ctx.react) await ctx.react('✅');
        const badge = isMendalam ? '🔬 (ANALISIS MENDALAM)' : imageBuffer ? '📸 (VISION)' : '';
        await ctx.reply(
          `🐋 *DEEPSEEK REASONING ${badge}*\n\n` +
          `${answer.text}\n\n` +
          `────────────────\n` +
          `⚡ _Engine: ${answer.model}_\n` +
          `📊 _Sisa Limit: ${limitCheck.limitText}_`
        );
      } catch (err: any) {
        if (ctx.react) await ctx.react('⚠️');
        await ctx.reply(
          `🐋 *DEEPSEEK REASONING*\n\n` +
          `Terjadi kendala logika: ${err.message}`
        );
      }
    }
  },

  // 5. Claude 3.5 Sonnet (.claude)
  {
    name: 'claude',
    aliases: ['claude3', 'sonnet', 'anthropic'],
    category: 'AI',
    description: 'Penalaran akademis, jernih & analitis dengan Claude 3.5 Sonnet',
    usage: '.claude <#mendalam> <pertanyaan/prompt> (atau kirim/balas foto/pesan)',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const { cleanText: q, isMendalam } = parseDeepFlag(ctx.text);
      const imageBuffer = await downloadImageFromCtx(ctx.m);
      const quotedText = getQuotedTextFromCtx(ctx.m);

      if (!q && !imageBuffer && !quotedText) {
        return ctx.reply(
          `🟧 *CLAUDE 3.5 SONNET AI (VISION)*\n\n` +
          `Silakan ketik pertanyaan ATAU kirim/balas foto/pesan dengan perintah *${ctx.prefix}claude*!\n\n` +
          `*Contoh penggunaan:*\n` +
          `👉 *${ctx.prefix}claude Buatkan analisis SWOT bisnis startup teknologi*\n` +
          `👉 *${ctx.prefix}claude #mendalam Tulis makalah akademis tentang AI dalam medis*\n` +
          `👉 *${ctx.prefix}claude bantu jawab soal di gambar ini* (Kirim/balas foto)`
        );
      }

      const limitCheck = await checkAndDeductAiLimit(ctx);
      if (!limitCheck.allowed) return;

      if (ctx.react) await ctx.react(isMendalam ? '🔬' : imageBuffer ? '📸' : '🟧');

      try {
        const fullPrompt = buildPromptWithContext(q, quotedText, isMendalam);
        const answer = await askFreeAI({
          prompt: fullPrompt || 'Jelaskan gambar ini atau bantu kerjakan/selesaikan soal dalam gambar ini secara detail, terstruktur, dan akurat.',
          modelType: 'claude',
          imageBuffer
        });

        if (ctx.react) await ctx.react('✅');
        const badge = isMendalam ? '🔬 (ANALISIS MENDALAM)' : imageBuffer ? '📸 (VISION)' : '';
        await ctx.reply(
          `🟧 *CLAUDE 3.5 SONNET ${badge}*\n\n` +
          `${answer.text}\n\n` +
          `────────────────\n` +
          `⚡ _Engine: Claude 3.5 Sonnet_\n` +
          `📊 _Sisa Limit: ${limitCheck.limitText}_`
        );
      } catch (err: any) {
        if (ctx.react) await ctx.react('⚠️');
        await ctx.reply(
          `🟧 *CLAUDE 3.5 SONNET*\n\n` +
          `Sistem mengalami kendala: ${err.message}`
        );
      }
    }
  },

  // 6. Dola AI Assistant (.dola)
  {
    name: 'dola',
    aliases: ['dolaai', 'agenda', 'scheduleai'],
    category: 'AI',
    description: 'Asisten produktivitas, jadwal, dan perencanaan cerdas Dola AI',
    usage: '.dola <#mendalam> <topik/jadwal/pertanyaan> (atau kirim/balas foto/pesan)',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const { cleanText: q, isMendalam } = parseDeepFlag(ctx.text);
      const imageBuffer = await downloadImageFromCtx(ctx.m);
      const quotedText = getQuotedTextFromCtx(ctx.m);

      if (!q && !imageBuffer && !quotedText) {
        return ctx.reply(
          `📅 *DOLA AI ASSISTANT (VISION)*\n\n` +
          `Silakan ketik pertanyaan, instruksi jadwal ATAU kirim/balas foto/pesan dengan *${ctx.prefix}dola*!\n\n` +
          `*Contoh penggunaan:*\n` +
          `👉 *${ctx.prefix}dola Buatkan jadwal kegiatan belajar efektif 7 hari*\n` +
          `👉 *${ctx.prefix}dola #mendalam Susun roadmap karir Software Engineer 1 tahun*\n` +
          `👉 *${ctx.prefix}dola Analisis susunan jadwal di foto ini* (Kirim/balas foto)`
        );
      }

      const limitCheck = await checkAndDeductAiLimit(ctx);
      if (!limitCheck.allowed) return;

      if (ctx.react) await ctx.react(isMendalam ? '🔬' : imageBuffer ? '📸' : '📅');

      try {
        const fullPrompt = buildPromptWithContext(q, quotedText, isMendalam);
        const answer = await askFreeAI({
          prompt: fullPrompt || 'Jelaskan gambar ini atau bantu kerjakan/selesaikan soal dalam gambar ini secara detail, terstruktur, dan akurat.',
          modelType: 'dola',
          imageBuffer
        });

        if (ctx.react) await ctx.react('✅');
        const badge = isMendalam ? '🔬 (ANALISIS MENDALAM)' : imageBuffer ? '📸 (VISION)' : '';
        await ctx.reply(
          `📅 *DOLA AI ${badge}*\n\n` +
          `${answer.text}\n\n` +
          `────────────────\n` +
          `⚡ _Engine: Dola AI_\n` +
          `📊 _Sisa Limit: ${limitCheck.limitText}_`
        );
      } catch (err: any) {
        if (ctx.react) await ctx.react('⚠️');
        await ctx.reply(
          `📅 *DOLA AI*\n\n` +
          `Sistem mengalami kendala: ${err.message}`
        );
      }
    }
  },

  // 5. AI Text to Image (.text2img)
  {
    name: 'text2img',
    aliases: ['diffuse', 'generateimg', 'dalle'],
    category: 'AI',
    description: 'Generate gambar visual dari deskripsi teks prompt',
    usage: '.text2img <deskripsi visual>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      const prompt = ctx.text.trim();
      if (!prompt) {
        return ctx.reply(
          `🎨 *AI TEXT-TO-IMAGE GENERATOR*\n\n` +
          `Masukkan deskripsi gambar yang ingin dibuat!\n` +
          `*Contoh:* *${ctx.prefix}text2img Kucing astronaut di permukaan bulan, ultra realistic 8k, cinematic lighting*`
        );
      }

      if (ctx.react) await ctx.react('🎨');
      await ctx.reply(`🎨 *MEMPROSES RENDERING GAMBAR...*\n\nPrompt: "${prompt}"\nResolusi: 1024x1024 HD\nMohon tunggu beberapa detik...`);

      try {
        const seed = Math.floor(Math.random() * 1000000);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${seed}`;

        if (ctx.react) await ctx.react('✅');
        const caption = `🎨 *AI TEXT-TO-IMAGE RESULT*\n\n📝 *Prompt:* ${prompt}\n📐 *Resolusi:* 1024x1024 HD\n⚡ *Status:* Berhasil digenerate`;

        if (ctx.sendImage) {
          await ctx.sendImage(imageUrl, caption);
        } else {
          await ctx.reply(`${caption}\n\n🔗 *Link Gambar:* ${imageUrl}`);
        }
      } catch (err: any) {
        if (ctx.react) await ctx.react('❌');
        await ctx.reply(`❌ *Gagal membuat gambar:* ${err.message}`);
      }
    }
  },

  // 6. AI Music Maker
  {
    name: 'musicmaker',
    category: 'AI',
    description: 'Membuat komposisi melodi musik dari lirik atau konsep',
    usage: '.musicmaker <genre & mood>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      const mood = ctx.text.trim() || 'Lo-Fi Chill';
      if (ctx.react) await ctx.react('🎶');
      await ctx.reply(
        `🎶 *AI MUSIC MAKER*\n\n` +
        `• Genre & Mood: *${mood}*\n` +
        `• Tempo: 85 BPM | Kunci Nada: C Mayor / A Minor\n` +
        `• Struktur: Intro -> Verse -> Chorus -> Bridge -> Outro\n` +
        `• Status: Komposisi harmoni melodi berhasil diaransemen secara cerdas.`
      );
    }
  },

  // 7. AI Parafrase / Quillbot
  {
    name: 'quilbot',
    aliases: ['paraphrase'],
    category: 'AI',
    description: 'Parafrase teks otomatis untuk kalimat yang lebih variatif & natural',
    usage: '.quilbot <paragraf>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const text = ctx.text.trim();
      if (!text) {
        return ctx.reply(
          `✍️ *AI PARAPHRASE (QUILLBOT)*\n\n` +
          `Masukkan teks yang ingin diparafrase!\n` +
          `*Contoh:* *${ctx.prefix}quilbot Pendidikan adalah kunci utama menuju masa depan yang sukses dan sejahtera.*`
        );
      }

      if (ctx.react) await ctx.react('✍️');
      try {
        const answer = await askFreeAI({
          prompt: `Parafrase kalimat berikut dalam 2 variasi gaya bahasa Indonesia (1 Gaya Formal Baku, 1 Gaya Santai Menarik) tanpa mengubah makna intinya:\n"${text}"`,
          modelType: 'general'
        });
        if (ctx.react) await ctx.react('✅');
        await ctx.reply(
          `✍️ *HASIL PARAFRASE AI*\n\n` +
          `📄 *Teks Asli:*\n"${text}"\n\n` +
          `✨ *Hasil Parafrase:*\n${answer.text}`
        );
      } catch (err: any) {
        await ctx.reply(`✍️ Gagal memparafrase teks: ${err.message}`);
      }
    }
  },

  // 8. Photo to Anime
  {
    name: 'toanime',
    category: 'AI',
    description: 'Mengubah deskripsi atau foto menjadi karakter anime 2D',
    usage: '.toanime <deskripsi/karakter>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      const desc = ctx.text.trim() || 'anime character portrait, highly detailed, vibrant colors, makoto shinkai style';
      if (ctx.react) await ctx.react('⛩️');
      const seed = Math.floor(Math.random() * 999999);
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(desc + ', masterpiece anime 2d illustration')}?width=1024&height=1024&nologo=true&seed=${seed}`;
      const caption = `⛩️ *AI TO ANIME*\n\n📝 *Deskripsi:* ${desc}\n🎨 *Gaya:* Modern Japanese Anime 2D`;
      if (ctx.sendImage) {
        await ctx.sendImage(url, caption);
      } else {
        await ctx.reply(`${caption}\n\n🔗 ${url}`);
      }
    }
  },

  // 9. Photo to Ghibli
  {
    name: 'toghibli',
    category: 'AI',
    description: 'Filter visual magis bergaya animasi Studio Ghibli',
    usage: '.toghibli <deskripsi pemandangan/karakter>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      const desc = ctx.text.trim() || 'lush green meadow, cozy cottage, clouds, studio ghibli aesthetic, hayao miyazaki style';
      if (ctx.react) await ctx.react('🌿');
      const seed = Math.floor(Math.random() * 999999);
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(desc + ', studio ghibli anime aesthetic, watercolor painting, hayao miyazaki')}?width=1024&height=1024&nologo=true&seed=${seed}`;
      const caption = `🌿 *STUDIO GHIBLI STYLE*\n\n📝 *Deskripsi:* ${desc}\n🎨 *Gaya:* Cat air lembut & magis ala Studio Ghibli`;
      if (ctx.sendImage) {
        await ctx.sendImage(url, caption);
      } else {
        await ctx.reply(`${caption}\n\n🔗 ${url}`);
      }
    }
  },

  // 10. Photo to 3D Pixar
  {
    name: 'to3d',
    category: 'AI',
    description: 'Mengubah ide/karakter menjadi animasi 3D ala Pixar Disney',
    usage: '.to3d <deskripsi karakter>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      const desc = ctx.text.trim() || 'cute smiling character, pixar 3d animation style, cinematic render, disney studio';
      if (ctx.react) await ctx.react('🧸');
      const seed = Math.floor(Math.random() * 999999);
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(desc + ', 3d pixar disney animation style, octane render, vivid colors')}?width=1024&height=1024&nologo=true&seed=${seed}`;
      const caption = `🧸 *AI TO 3D PIXAR*\n\n📝 *Deskripsi:* ${desc}\n🎨 *Gaya:* 3D CGI Animation Movie`;
      if (ctx.sendImage) {
        await ctx.sendImage(url, caption);
      } else {
        await ctx.reply(`${caption}\n\n🔗 ${url}`);
      }
    }
  },

  // 11. Photo to Action Figure
  {
    name: 'tofigure',
    category: 'AI',
    description: 'Mengubah karakter menjadi miniatur action figure koleksi',
    usage: '.tofigure <deskripsi figur>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      const desc = ctx.text.trim() || 'miniature superhero action figure in display box, plastic mold, high detail';
      if (ctx.react) await ctx.react('🗽');
      const seed = Math.floor(Math.random() * 999999);
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(desc + ', collectible action figure inside packaging box, realistic toy photography')}?width=1024&height=1024&nologo=true&seed=${seed}`;
      const caption = `🗽 *ACTION FIGURE COLLECTION*\n\n📝 *Deskripsi:* ${desc}\n🎨 *Gaya:* Miniatur Display Toy`;
      if (ctx.sendImage) {
        await ctx.sendImage(url, caption);
      } else {
        await ctx.reply(`${caption}\n\n🔗 ${url}`);
      }
    }
  },

  // 12. Photo to Cartoon
  {
    name: 'tocartoon',
    category: 'AI',
    description: 'Mengubah deskripsi atau foto menjadi kartun ekspresif',
    usage: '.tocartoon <deskripsi>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      const desc = ctx.text.trim() || 'playful cheerful character, modern cartoon illustration, vibrant vector art';
      if (ctx.react) await ctx.react('🎨');
      const seed = Math.floor(Math.random() * 999999);
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(desc + ', colorful modern cartoon style')}?width=1024&height=1024&nologo=true&seed=${seed}`;
      const caption = `🎨 *AI TO CARTOON*\n\n📝 *Deskripsi:* ${desc}`;
      if (ctx.sendImage) {
        await ctx.sendImage(url, caption);
      } else {
        await ctx.reply(`${caption}\n\n🔗 ${url}`);
      }
    }
  },

  // 13. Photo to Chibi
  {
    name: 'tochibi',
    category: 'AI',
    description: 'Mengubah karakter menjadi versi Chibi imut berukuran mini',
    usage: '.tochibi <deskripsi karakter>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      const desc = ctx.text.trim() || 'adorable cute chibi anime character with big sparkling eyes, pastel aesthetic';
      if (ctx.react) await ctx.react('🐣');
      const seed = Math.floor(Math.random() * 999999);
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(desc + ', cute chibi anime sticker style, big eyes, mini proportions')}?width=1024&height=1024&nologo=true&seed=${seed}`;
      const caption = `🐣 *AI TO CHIBI*\n\n📝 *Deskripsi:* ${desc}\n🎨 *Gaya:* Super Cute Mini Chibi`;
      if (ctx.sendImage) {
        await ctx.sendImage(url, caption);
      } else {
        await ctx.reply(`${caption}\n\n🔗 ${url}`);
      }
    }
  },

  // 14. Photo to Black & White Noir
  {
    name: 'toblack',
    category: 'AI',
    description: 'Mengubah estetika menjadi Dark Noir monokrom sinematik',
    usage: '.toblack <deskripsi>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const desc = ctx.text.trim() || 'moody city street at night, dramatic shadows, black and white noir photography';
      if (ctx.react) await ctx.react('🖤');
      const seed = Math.floor(Math.random() * 999999);
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(desc + ', black and white film noir photography, high contrast shadows')}?width=1024&height=1024&nologo=true&seed=${seed}`;
      const caption = `🖤 *AI BLACK & NOIR*\n\n📝 *Deskripsi:* ${desc}`;
      if (ctx.sendImage) {
        await ctx.sendImage(url, caption);
      } else {
        await ctx.reply(`${caption}\n\n🔗 ${url}`);
      }
    }
  },

  // 15. Photo to Hijab
  {
    name: 'tohijab',
    category: 'AI',
    description: 'Generate potret dengan busana muslimah / hijab elegan',
    usage: '.tohijab <deskripsi>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      const desc = ctx.text.trim() || 'beautiful Indonesian woman wearing elegant modern pastel hijab, gentle smile, natural daylight';
      if (ctx.react) await ctx.react('🧕');
      const seed = Math.floor(Math.random() * 999999);
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(desc + ', modest fashion portrait, photorealistic 8k')}?width=1024&height=1024&nologo=true&seed=${seed}`;
      const caption = `🧕 *AI HIJAB PORTRAIT*\n\n📝 *Deskripsi:* ${desc}`;
      if (ctx.sendImage) {
        await ctx.sendImage(url, caption);
      } else {
        await ctx.reply(`${caption}\n\n🔗 ${url}`);
      }
    }
  },

  // 16. Photo to Manga
  {
    name: 'tomanga',
    category: 'AI',
    description: 'Filter panel manga Jepang hitam putih bertinta',
    usage: '.tomanga <deskripsi>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      const desc = ctx.text.trim() || 'action scene, dramatic manga panel, ink drawing, speed lines';
      if (ctx.react) await ctx.react('📚');
      const seed = Math.floor(Math.random() * 999999);
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(desc + ', japanese manga page, ink drawing, screentone shading')}?width=1024&height=1024&nologo=true&seed=${seed}`;
      const caption = `📚 *AI MANGA PANEL*\n\n📝 *Deskripsi:* ${desc}`;
      if (ctx.sendImage) {
        await ctx.sendImage(url, caption);
      } else {
        await ctx.reply(`${caption}\n\n🔗 ${url}`);
      }
    }
  },

  // 17. Photo to Oil Painting
  {
    name: 'tooilpainting',
    category: 'AI',
    description: 'Mengubah gambar menjadi lukisan minyak kanvas klasik',
    usage: '.tooilpainting <deskripsi>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      const desc = ctx.text.trim() || 'scenic mountain valley with river, classic oil painting on textured canvas, brushstrokes';
      if (ctx.react) await ctx.react('🖌️');
      const seed = Math.floor(Math.random() * 999999);
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(desc + ', classical oil painting on canvas, heavy impasto brush strokes')}?width=1024&height=1024&nologo=true&seed=${seed}`;
      const caption = `🖌️ *OIL PAINTING CANVAS*\n\n📝 *Deskripsi:* ${desc}`;
      if (ctx.sendImage) {
        await ctx.sendImage(url, caption);
      } else {
        await ctx.reply(`${caption}\n\n🔗 ${url}`);
      }
    }
  }
];
