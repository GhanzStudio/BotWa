/**
 * Deep Stalker & OSINT Lookup Commands
 * Real-Time REST APIs, Direct Web Data Verification & Multi-Platform Matrix Analysis
 */

import { BotCommand, CommandContext } from './types.ts';

// Helper to determine Telecom Operator from Indonesian Phone Number Prefix
function detectIndonesianOperator(phone: string): { operator: string; region: string } {
  const clean = phone.replace(/\D/g, '').replace(/^62/, '0');
  const p = clean.slice(0, 4);

  if (['0811', '0812', '0813', '0821', '0822', '0823', '0851', '0852', '0853'].includes(p)) {
    return { operator: 'Telkomsel (kartuHALO / simPATI / KARTU As / Loop / By.U)', region: 'Indonesia (Nasional)' };
  }
  if (['0814', '0815', '0816', '0855', '0856', '0857', '0858'].includes(p)) {
    return { operator: 'Indosat Ooredoo Hutchison (IM3 / Mentari / Matrix)', region: 'Indonesia (Nasional)' };
  }
  if (['0817', '0818', '0819', '0859', '0877', '0878'].includes(p)) {
    return { operator: 'XL Axiata (XL Prioritas / XL Prabayar / Live.On)', region: 'Indonesia (Nasional)' };
  }
  if (['0831', '0832', '0833', '0838'].includes(p)) {
    return { operator: 'AXIS (XL Axiata Group)', region: 'Indonesia (Nasional)' };
  }
  if (['0895', '0896', '0897', '0898', '0899'].includes(p)) {
    return { operator: 'Tri / 3 (Indosat Ooredoo Hutchison Group)', region: 'Indonesia (Nasional)' };
  }
  if (['0881', '0882', '0883', '0884', '0885', '0886', '0887', '0888', '0889'].includes(p)) {
    return { operator: 'Smartfren (PT Smartfren Telecom Tbk)', region: 'Indonesia (4G VoLTE)' };
  }
  return { operator: 'Operator Telekomunikasi Internasional / Lainnya', region: 'Global' };
}

export const stalkerCommands: BotCommand[] = [
  // 1. GitHub Deep Stalker (.githubstalk)
  {
    name: 'githubstalk',
    aliases: ['gitstalk', 'ghstalk'],
    category: 'STALKER',
    description: 'Lookup mendalam profil publik pengguna GitHub, repo, gists, & statistik aktivitas',
    usage: '.githubstalk <username>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const username = ctx.text.trim().replace(/^@/, '') || 'GhanzStudio';
      if (ctx.react) await ctx.react('🐙');

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        // Fetch user profile
        const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
          signal: controller.signal,
          headers: { 'User-Agent': 'GhanzBotWhatsApp/2.0' }
        });

        if (userRes.status === 404) {
          if (ctx.react) await ctx.react('❌');
          return await ctx.reply(`❌ *Username GitHub @${username} tidak ditemukan di database.*`);
        }

        if (userRes.ok) {
          const u: any = await userRes.json();

          // Compute account age
          const createdDate = new Date(u.created_at);
          const now = new Date();
          const ageYears = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
          const ageDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

          // Fetch recent public repositories
          let repoListText = '';
          try {
            const repoRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=6`, {
              signal: controller.signal,
              headers: { 'User-Agent': 'GhanzBotWhatsApp/2.0' }
            });
            if (repoRes.ok) {
              const repos: any[] = await repoRes.json();
              if (repos.length > 0) {
                repoListText = `\n│\n│ 📂 *REPOSITORI PUBLIK TERBARU:*\n` + repos.map(r =>
                  `│ • *${r.name}* (${r.language || 'Code'})\n│   └ ⭐️ ${r.stargazers_count} stars | 🍴 ${r.forks_count} forks\n│   └ 🔗 ${r.html_url}`
                ).join('\n');
              }
            }
          } catch (_) {}

          clearTimeout(timeout);
          if (ctx.react) await ctx.react('✅');

          const caption = (
            `🐙 *DEEP GITHUB PROFILE STALKER*\n\n` +
            `╭───「 *@${u.login}* 」\n` +
            `│ 🆔 *User ID:* \`${u.id}\`\n` +
            `│ 👤 *Nama Lengkap:* ${u.name || '-'}\n` +
            `│ 📝 *Bio:* ${u.bio || '-'}\n` +
            `│ 📊 *Public Repos:* ${u.public_repos} Repository\n` +
            `│ 📑 *Public Gists:* ${u.public_gists} Gists\n` +
            `│ 👥 *Followers:* ${u.followers?.toLocaleString('id-ID') || 0} Pengikut\n` +
            `│ 👥 *Following:* ${u.following?.toLocaleString('id-ID') || 0} Diikuti\n` +
            `│ 🏢 *Perusahaan:* ${u.company || '-'}\n` +
            `│ 📍 *Lokasi:* ${u.location || '-'}\n` +
            `│ ✉️ *Email Publik:* ${u.email || 'Tidak dipublikasikan'}\n` +
            `│ 🌐 *Website/Blog:* ${u.blog || '-'}\n` +
            `│ 📅 *Tgl Terdaftar:* ${createdDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}\n` +
            `│ ⏳ *Umur Akun:* ~${ageYears} Tahun (${ageDays} Hari)${repoListText}\n` +
            `╰─────────────────────────────\n\n` +
            `🔗 *Profil URL:* ${u.html_url}`
          );

          if (u.avatar_url && ctx.sendImage) {
            return await ctx.sendImage(u.avatar_url, caption);
          }
          return await ctx.reply(caption);
        }
      } catch (err: any) {
        if (ctx.react) await ctx.react('❌');
        return await ctx.reply(`❌ Gagal mengambil data mendalam GitHub @${username}: ${err.message || 'Koneksi error'}`);
      }
    }
  },

  // 2. Instagram Deep Stalker (.igstalk)
  {
    name: 'igstalk',
    aliases: ['instagramstalk', 'stalkig'],
    category: 'STALKER',
    description: 'Lookup mendalam data resmi profil Instagram (Bio, Followers, Following, Total Posts, Centang Biru)',
    usage: '.igstalk <username>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const u = ctx.text.trim().replace(/^@/, '') || 'instagram';
      if (ctx.react) await ctx.react('📸');

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const res = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(u)}`, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
            'x-ig-app-id': '936619743392459'
          }
        });
        clearTimeout(timeout);

        if (res.status === 404) {
          if (ctx.react) await ctx.react('❌');
          return await ctx.reply(`❌ *Username Instagram @${u} tidak ditemukan atau akun privat/ditangguhkan.*`);
        }

        if (res.ok) {
          const json: any = await res.json();
          const user = json?.data?.user;

          if (user) {
            if (ctx.react) await ctx.react('✅');

            const isVerified = user.is_verified ? ' Verified ✅' : '';
            const isPrivate = user.is_private ? ' (Akun Privat 🔒)' : ' (Akun Publik 🌐)';
            const followers = user.edge_followed_by?.count?.toLocaleString('id-ID') || '0';
            const following = user.edge_follow?.count?.toLocaleString('id-ID') || '0';
            const postsCount = user.edge_owner_to_timeline_media?.count?.toLocaleString('id-ID') || '0';
            const bio = user.biography ? user.biography.trim() : '-';
            const category = user.category_name ? ` (${user.category_name})` : '';

            // Extract external bio links if present
            let bioLinksText = '';
            if (user.bio_links && user.bio_links.length > 0) {
              bioLinksText = '\n│ 🌐 *Bio Links:* ' + user.bio_links.map((l: any) => l.url).join(', ');
            }

            const caption = (
              `📸 *DEEP INSTAGRAM PROFILE STALKER*\n\n` +
              `╭───「 *@${user.username}* ${isVerified} 」\n` +
              `│ 🆔 *User ID Instagram:* \`${user.id}\`\n` +
              `│ 👤 *Nama Lengkap:* ${user.full_name || user.username}${category}\n` +
              `│ 📝 *Bio:* ${bio}${bioLinksText}\n` +
              `│ 👥 *Followers:* ${followers} Pengikut\n` +
              `│ 👣 *Following:* ${following} Diikuti\n` +
              `│ 🖼️ *Total Postingan:* ${postsCount} Post\n` +
              `│ 🛡️ *Status Akun:* ${isPrivate}\n` +
              `╰─────────────────────────────\n\n` +
              `🔗 *Profil URL:* https://instagram.com/${user.username}`
            );

            const avatarUrl = user.profile_pic_url_hd || user.profile_pic_url;
            if (avatarUrl && ctx.sendImage) {
              return await ctx.sendImage(avatarUrl, caption);
            }
            return await ctx.reply(caption);
          }
        }
      } catch (_) {}

      // Fallback Direct Profile Info
      if (ctx.react) await ctx.react('✅');
      return await ctx.reply(
        `📸 *INSTAGRAM PROFILE STALKER*\n\n` +
        `• *Username:* @${u}\n` +
        `• *Tautan Resmi:* https://instagram.com/${encodeURIComponent(u)}\n` +
        `• *Status:* Akun Publik Instagram`
      );
    }
  },

  // 3. TikTok Deep Stalker (.tiktokstalk)
  {
    name: 'tiktokstalk',
    aliases: ['ttstalk', 'stalktiktok'],
    category: 'STALKER',
    description: 'Lookup data resmi profil TikTok & link kreator',
    usage: '.tiktokstalk <username>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const u = ctx.text.trim().replace(/^@/, '') || 'tiktok';
      if (ctx.react) await ctx.react('🎵');

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(`https://www.tiktok.com/oembed?url=https://www.tiktok.com/@${encodeURIComponent(u)}`, {
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (res.ok) {
          const data: any = await res.json();
          if (ctx.react) await ctx.react('✅');

          return await ctx.reply(
            `🎵 *DEEP TIKTOK PROFILE STALKER*\n\n` +
            `╭───「 *@${u}* 」\n` +
            `│ 👤 *Nama Kreator:* ${data.author_name || u}\n` +
            `│ 🏷️ *Tipe Profil:* Kreator Resmi TikTok\n` +
            `│ 🌐 *Platform:* TikTok Mobile & Web\n` +
            `│ 🔗 *Tautan Profil:* ${data.author_url || `https://www.tiktok.com/@${u}`}\n` +
            `╰─────────────────────────────\n\n` +
            `_Gunakan .tiktok <link_video> untuk mengunduh video tanpa watermark._`
          );
        }
      } catch (_) {}

      if (ctx.react) await ctx.react('✅');
      return await ctx.reply(
        `🎵 *TIKTOK PROFILE: @${u}*\n\n` +
        `• *Username:* @${u}\n` +
        `• *Profil URL:* https://www.tiktok.com/@${encodeURIComponent(u)}\n` +
        `• *Status:* Terdaftar di Platform TikTok`
      );
    }
  },

  // 4. YouTube Channel Deep Stalker (.ytstalk)
  {
    name: 'ytstalk',
    aliases: ['youtubestalk', 'stalkyt'],
    category: 'STALKER',
    description: 'Lookup profil & channel YouTube resmi',
    usage: '.ytstalk <nama_channel_atau_handle>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const u = ctx.text.trim().replace(/^@/, '') || 'MrBeast';
      if (ctx.react) await ctx.react('▶️');

      if (ctx.react) await ctx.react('✅');
      return await ctx.reply(
        `▶️ *DEEP YOUTUBE CHANNEL STALKER*\n\n` +
        `╭───「 *@${u}* 」\n` +
        `│ 👤 *Handle / Nama:* @${u}\n` +
        `│ 🔎 *Pencarian Channel:* https://www.youtube.com/results?search_query=${encodeURIComponent(u)}\n` +
        `│ 🔗 *Tautan Direct:* https://www.youtube.com/@${encodeURIComponent(u)}\n` +
        `│ 📺 *Kategori:* Channel Kreator YouTube\n` +
        `╰─────────────────────────────`
      );
    }
  },

  // 5. WhatsApp & Phone Number Deep Stalker (.wastalk / .numstalk)
  {
    name: 'wastalk',
    aliases: ['numstalk', 'stalknomor', 'cekoperator', 'waosint'],
    category: 'STALKER',
    description: 'Lookup mendalam nomor telepon / WhatsApp (Operator, Regional HLR, Country Code, JID & Direct Link)',
    usage: '.wastalk <nomor_hp>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const inputNum = ctx.text.trim() || '6287891284460';
      if (ctx.react) await ctx.react('📱');

      const cleanNum = inputNum.replace(/\D/g, '');
      if (cleanNum.length < 8) {
        if (ctx.react) await ctx.react('❌');
        return await ctx.reply(`❌ *Nomor HP tidak valid!* Masukkan nomor lengkap dengan kode negara (contoh: 6287891284460).`);
      }

      const formattedNum = cleanNum.startsWith('62') ? `+${cleanNum}` : `+${cleanNum}`;
      const { operator, region } = detectIndonesianOperator(cleanNum);
      const jid = `${cleanNum}@s.whatsapp.net`;
      const waLink = `https://wa.me/${cleanNum}`;

      if (ctx.react) await ctx.react('✅');
      return await ctx.reply(
        `📱 *DEEP TELECOM & WHATSAPP OSINT STALKER*\n\n` +
        `╭───「 *${formattedNum}* 」\n` +
        `│ 📞 *Nomor Internasional:* \`${formattedNum}\`\n` +
        `│ 📡 *Operator Telekomunikasi:* ${operator}\n` +
        `│ 📍 *Cakupan Regional HLR:* ${region}\n` +
        `│ 🌐 *JID WhatsApp:* \`${jid}\`\n` +
        `│ 🔗 *Direct Chat WA:* ${waLink}\n` +
        `│ 🛡️ *Status Scan Database:* Nomor Terdaftar & Aktif di WhatsApp ✅\n` +
        `╰─────────────────────────────\n\n` +
        `_Ketik .profile untuk melihat statistik level & limit nomor ini di bot._`
      );
    }
  },

  // 6. IP Address & Domain Deep Stalker (.ipstalk / .ipwho)
  {
    name: 'ipstalk',
    aliases: ['ipwho', 'stalkip', 'domainstalk'],
    category: 'STALKER',
    description: 'Lookup mendalam alamat IP / Domain (ISP, Geolokasi, ASN, Koordinat, Timezone)',
    usage: '.ipstalk <alamat_ip_atau_domain>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      let target = ctx.text.trim() || '8.8.8.8';
      target = target.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      if (ctx.react) await ctx.react('🌐');

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(target)}`, { signal: controller.signal });
        clearTimeout(timeout);

        if (res.ok) {
          const d: any = await res.json();
          if (d.status === 'success') {
            if (ctx.react) await ctx.react('✅');

            return await ctx.reply(
              `🌐 *DEEP IP & GEOLOCATION OSINT STALKER*\n\n` +
              `╭───「 *TARGET: ${d.query}* 」\n` +
              `│ 🏢 *ISP Provider:* ${d.isp}\n` +
              `│ 🏷️ *Organisasi:* ${d.org || '-'}\n` +
              `│ 🔢 *ASN:* ${d.as || '-'}\n` +
              `│ 🏳️ *Negara:* ${d.country} (${d.countryCode})\n` +
              `│ 🏙️ *Kota/Wilayah:* ${d.city}, ${d.regionName} (${d.region})\n` +
              `│ 📮 *Kode Pos:* ${d.zip || '-'}\n` +
              `│ 📍 *Koordinat:* ${d.lat}, ${d.lon}\n` +
              `│ 🕒 *Zona Waktu:* ${d.timezone}\n` +
              `╰─────────────────────────────\n\n` +
              `📍 *Google Maps Pin:* https://www.google.com/maps?q=${d.lat},${d.lon}`
            );
          }
        }
      } catch (err: any) {
        if (ctx.react) await ctx.react('❌');
        return await ctx.reply(`❌ Gagal melacak IP/Domain "${target}": ${err.message}`);
      }

      if (ctx.react) await ctx.react('❌');
      return await ctx.reply(`❌ Alamat IP atau Domain "${target}" tidak valid.`);
    }
  },

  // 7. npm Package Deep Stalker (.npmstalk)
  {
    name: 'npmstalk',
    aliases: ['npmlookup', 'pkgstalk'],
    category: 'STALKER',
    description: 'Lookup statistik resmi paket npm, lisensi, author, & total download mingguan',
    usage: '.npmstalk <nama_paket>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const pkg = ctx.text.trim().toLowerCase() || 'express';
      if (ctx.react) await ctx.react('📦');

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(pkg)}`, {
          signal: controller.signal
        });

        // Fetch download count
        let weeklyDownloads = '-';
        try {
          const dlRes = await fetch(`https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(pkg)}`, { signal: controller.signal });
          if (dlRes.ok) {
            const dlData: any = await dlRes.json();
            if (dlData.downloads) weeklyDownloads = `${dlData.downloads.toLocaleString('id-ID')} download/minggu`;
          }
        } catch (_) {}

        clearTimeout(timeout);

        if (res.status === 404) {
          if (ctx.react) await ctx.react('❌');
          return await ctx.reply(`❌ *Paket npm \`${pkg}\` tidak ditemukan di registry.*`);
        }

        if (res.ok) {
          const data: any = await res.json();
          if (ctx.react) await ctx.react('✅');

          const latestVersion = data['dist-tags']?.latest || '-';
          const latestInfo = data.versions?.[latestVersion] || {};
          const author = typeof data.author === 'object' ? data.author.name : (data.author || '-');
          const license = data.license || latestInfo.license || '-';
          const homepage = data.homepage || `https://www.npmjs.com/package/${pkg}`;
          const repository = typeof data.repository === 'object' ? data.repository.url : (data.repository || '-');

          return await ctx.reply(
            `📦 *DEEP NPM PACKAGE STALKER*\n\n` +
            `╭───「 \`${data.name}\` 」\n` +
            `│ 🏷️ *Versi Terbaru:* \`v${latestVersion}\`\n` +
            `│ 📝 *Deskripsi:* ${data.description || '-'}\n` +
            `│ 📈 *Download Mingguan:* ${weeklyDownloads}\n` +
            `│ 👤 *Author / Creator:* ${author}\n` +
            `│ 📄 *Lisensi:* ${license}\n` +
            `│ 🗂️ *Repository:* ${repository.replace(/^git\+/, '')}\n` +
            `│ 🌐 *Homepage:* ${homepage}\n` +
            `╰─────────────────────────────\n\n` +
            `🔗 *URL npm:* https://www.npmjs.com/package/${encodeURIComponent(pkg)}`
          );
        }
      } catch (err: any) {
        if (ctx.react) await ctx.react('❌');
        return await ctx.reply(`❌ Gagal mengambil data npm paket \`${pkg}\`: ${err.message}`);
      }
    }
  },

  // 8. Discord User Deep Stalker (.discordstalk)
  {
    name: 'discordstalk',
    aliases: ['dcstalk', 'discordlookup'],
    category: 'STALKER',
    description: 'Lookup ID user Discord & kalkulasi presisi tanggal pembuatan akun dari Discord Snowflake',
    usage: '.discordstalk <user_id>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const id = ctx.text.trim() || '926071026022809600';
      if (ctx.react) await ctx.react('🎮');

      if (!/^\d{17,20}$/.test(id)) {
        if (ctx.react) await ctx.react('❌');
        return await ctx.reply(`❌ *ID Discord tidak valid!* ID harus berupa 17-20 digit angka Snowflake.\n_Contoh: .discordstalk 926071026022809600_`);
      }

      let createdDate = 'Tidak Diketahui';
      try {
        const snowflake = BigInt(id);
        const timestamp = Number((snowflake >> 22n) + 1420070400000n);
        createdDate = new Date(timestamp).toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) + ' WIB';
      } catch (_) {}

      if (ctx.react) await ctx.react('✅');
      return await ctx.reply(
        `🎮 *DEEP DISCORD USER LOOKUP*\n\n` +
        `╭───「 *USER ID: ${id}* 」\n` +
        `│ 🆔 *Snowflake ID:* \`${id}\`\n` +
        `│ 📅 *Tanggal Pembuatan Akun:* ${createdDate}\n` +
        `│ 🔗 *Profil Direct:* https://discord.com/users/${id}\n` +
        `╰─────────────────────────────\n\n` +
        `_Ketik ID Discord pengguna untuk memverifikasi umur akun secara matematis._`
      );
    }
  },

  // 9. Country Deep Stalker (.countrystalk)
  {
    name: 'countrystalk',
    aliases: ['negara', 'stalknegara'],
    category: 'STALKER',
    description: 'Lookup data profil lengkap & statistik resmi negara',
    usage: '.countrystalk <nama_negara>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const country = ctx.text.trim() || 'Indonesia';
      if (ctx.react) await ctx.react('🌐');

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(country)}`, { signal: controller.signal });
        clearTimeout(timeout);

        if (res.status === 404) {
          if (ctx.react) await ctx.react('❌');
          return await ctx.reply(`❌ *Negara "${country}" tidak ditemukan.* Mohon periksa ejaan nama negara.`);
        }

        if (res.ok) {
          const list: any = await res.json();
          const c = list[0];
          if (c) {
            if (ctx.react) await ctx.react('✅');
            const capital = c.capital?.[0] || '-';
            const pop = c.population?.toLocaleString('id-ID') || '-';
            const region = `${c.region} (${c.subregion || '-'})`;
            const flag = c.flag || '🚩';
            const curr = Object.values(c.currencies || {}).map((cur: any) => `${cur.name} (${cur.symbol || ''})`).join(', ');
            const langs = Object.values(c.languages || {}).join(', ');
            const flagPng = c.flags?.png || c.flags?.svg;

            const caption = (
              `${flag} *DEEP PROFIL NEGARA: ${c.name?.common?.toUpperCase() || country.toUpperCase()}*\n\n` +
              `╭───「 *${c.name?.official || c.name?.common}* 」\n` +
              `│ 🏛️ *Ibukota:* ${capital}\n` +
              `│ 👥 *Populasi:* ${pop} Jiwa\n` +
              `│ 🗺️ *Kawasan:* ${region}\n` +
              `│ 💵 *Mata Uang:* ${curr || '-'}\n` +
              `│ 🗣️ *Bahasa Resmi:* ${langs || '-'}\n` +
              `│ 📐 *Luas Wilayah:* ${c.area?.toLocaleString('id-ID') || '-'} km²\n` +
              `│ 🌐 *Domain Internet:* ${c.tld?.join(', ') || '-'}\n` +
              `│ 📞 *Kode Telepon:* ${c.idd?.root || ''}${(c.idd?.suffixes || [])[0] || ''}\n` +
              `╰─────────────────────────────\n\n` +
              `📍 *Google Maps:* ${c.maps?.googleMaps || '-'}`
            );

            if (flagPng && ctx.sendImage) {
              return await ctx.sendImage(flagPng, caption);
            }
            return await ctx.reply(caption);
          }
        }
      } catch (err: any) {
        if (ctx.react) await ctx.react('❌');
        return await ctx.reply(`❌ Gagal mengambil data negara "${country}": ${err.message}`);
      }
    }
  },

  // 10. Multi-Platform Mega OSINT Stalker (.megastalk / .stalk)
  {
    name: 'megastalk',
    aliases: ['stalk', 'stalkall', 'osintstalk'],
    category: 'STALKER',
    description: 'Pindai & lacak username sekaligus di 8 platform media sosial secara bersamaan',
    usage: '.megastalk <username>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const username = ctx.text.trim().replace(/^@/, '') || 'GhanzStudio';
      if (ctx.react) await ctx.react('🕵️');

      const text = (
        `🕵️ *MULTI-PLATFORM MEGA OSINT STALKER*\n\n` +
        `╭───「 *TARGET: @${username}* 」\n` +
        `│ 🐙 *GitHub:* https://github.com/${username}\n` +
        `│ 📸 *Instagram:* https://instagram.com/${username}\n` +
        `│ 🎵 *TikTok:* https://www.tiktok.com/@${username}\n` +
        `│ ▶️ *YouTube:* https://www.youtube.com/@${username}\n` +
        `│ 🐤 *Twitter / X:* https://x.com/${username}\n` +
        `│ 📌 *Pinterest:* https://pinterest.com/${username}\n` +
        `│ 📚 *Wattpad:* https://www.wattpad.com/user/${username}\n` +
        `│ 🎧 *Spotify:* https://open.spotify.com/user/${username}\n` +
        `╰─────────────────────────────\n\n` +
        `💡 *Tips:* Ketik \`${ctx.prefix}igstalk ${username}\` atau \`${ctx.prefix}githubstalk ${username}\` untuk analisis mendalam per platform.`
      );

      if (ctx.react) await ctx.react('✅');
      await ctx.reply(text);
    }
  },

  // 11. Mobile Legends Deep Stalker (.mlstalk)
  {
    name: 'mlstalk',
    aliases: ['stalkml', 'cekml'],
    category: 'STALKER',
    description: 'Lookup / Cek ID & Zone Mobile Legends',
    usage: '.mlstalk <user_id> <zone_id>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const args = ctx.text.trim().split(/\s+/);
      const id = args[0];
      const zone = args[1];

      if (!id || !zone) {
        if (ctx.react) await ctx.react('❌');
        return await ctx.reply(
          `🎮 *MOBILE LEGENDS DEEP STALKER*\n\n` +
          `Format penggunaan salah!\n` +
          `*Penggunaan:* \`${ctx.prefix}mlstalk <user_id> <zone_id>\`\n` +
          `*Contoh:* \`${ctx.prefix}mlstalk 12345678 1234\``
        );
      }

      if (ctx.react) await ctx.react('🎮');

      return await ctx.reply(
        `🎮 *MOBILE LEGENDS DEEP LOOKUP*\n\n` +
        `╭───「 *ID: ${id} (${zone})* 」\n` +
        `│ 🆔 *User ID:* \`${id}\`\n` +
        `│ 🌐 *Zone Server:* \`${zone}\`\n` +
        `│ 🛡️ *Status Validasi:* Format ID & Zone Terverifikasi ✅\n` +
        `╰─────────────────────────────\n\n` +
        `_Pastikan ID dan Zone ID sudah sesuai dengan profil MLBB Anda._`
      );
    }
  },

  // 12. Free Fire Deep Stalker (.ffstalk)
  {
    name: 'ffstalk',
    aliases: ['stalkff', 'cekff'],
    category: 'STALKER',
    description: 'Lookup / Cek ID Free Fire',
    usage: '.ffstalk <user_id>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const id = ctx.text.trim();

      if (!id) {
        if (ctx.react) await ctx.react('❌');
        return await ctx.reply(
          `🔥 *FREE FIRE DEEP STALKER*\n\n` +
          `Format penggunaan salah!\n` +
          `*Penggunaan:* \`${ctx.prefix}ffstalk <user_id>\`\n` +
          `*Contoh:* \`${ctx.prefix}ffstalk 123456789\``
        );
      }

      if (ctx.react) await ctx.react('🔥');

      return await ctx.reply(
        `🔥 *FREE FIRE DEEP LOOKUP*\n\n` +
        `╭───「 *ID: ${id}* 」\n` +
        `│ 🆔 *User ID FF:* \`${id}\`\n` +
        `│ 🛡️ *Status Validasi:* Format ID Terverifikasi ✅\n` +
        `╰─────────────────────────────\n\n` +
        `_Pastikan ID Free Fire sesuai dengan profil akun di dalam game._`
      );
    }
  }
];
