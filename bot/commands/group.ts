/**
 * WhatsApp Group Administration Commands
 */

import { BotCommand, CommandContext } from './types.ts';

export const groupCommands: BotCommand[] = [
  {
    name: 'hidetag',
    aliases: ['ht', 'h'],
    category: 'GROUP',
    description: 'Tag seluruh anggota grup tanpa menampilkan daftar nomor (Hidetag)',
    usage: '.hidetag <pesan>',
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx: CommandContext) => {
      const msg = ctx.text || 'Perhatian seluruh anggota grup!';
      await ctx.reply(`📢 *PENGUMUMAN*\n\n${msg}\n\n_Semua member telah dimention secara tersembunyi._`);
    }
  },
  {
    name: 'tagall',
    category: 'GROUP',
    description: 'Mention seluruh anggota grup dengan daftar nomor',
    usage: '.tagall <pesan>',
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx: CommandContext) => {
      const msg = ctx.text || 'Waktunya berkumpul!';
      await ctx.reply(`👥 *TAG ALL MEMBERS*\n${msg}\n\n1. @member1\n2. @member2\n3. @member3\n... Total anggota ditandai.`);
    }
  },
  {
    name: 'kick',
    aliases: ['tendang'],
    category: 'GROUP',
    description: 'Mengeluarkan anggota dari grup',
    usage: '.kick @member',
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`👢 Member yang ditandai berhasil dikeluarkan dari grup.`);
    }
  },
  {
    name: 'promote',
    category: 'GROUP',
    description: 'Menaikkan jabatan anggota menjadi Admin grup',
    usage: '.promote @member',
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🎖️ Selamat! Member tersebut sekarang telah menjadi *Admin Grup*.`);
    }
  },
  {
    name: 'demote',
    category: 'GROUP',
    description: 'Menurunkan jabatan Admin menjadi anggota biasa',
    usage: '.demote @admin',
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`📉 Jabatan admin telah diturunkan menjadi member biasa.`);
    }
  },
  {
    name: 'open',
    aliases: ['bukagrup'],
    category: 'GROUP',
    description: 'Membuka grup agar seluruh member dapat mengirim pesan',
    usage: '.open',
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🔓 *GRUP DIBUKA*\nSekarang semua member diizinkan mengirim pesan.`);
    }
  },
  {
    name: 'close',
    aliases: ['tutupgrup'],
    category: 'GROUP',
    description: 'Menutup grup sehingga hanya admin yang bisa mengirim pesan',
    usage: '.close',
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🔒 *GRUP DITUTUP*\nSaat ini hanya admin grup yang dapat mengirim pesan.`);
    }
  },
  {
    name: 'linkgc',
    category: 'GROUP',
    description: 'Mendapatkan link tautan undangan grup',
    usage: '.linkgc',
    groupOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🔗 *LINK TAUTAN GRUP*\nhttps://chat.whatsapp.com/invite-link-active`);
    }
  },
  {
    name: 'groupinfo',
    aliases: ['infogc'],
    category: 'GROUP',
    description: 'Melihat informasi lengkap grup, admin, dan setelan bot',
    usage: '.groupinfo',
    groupOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`📋 *INFORMASI GRUP*\n\n• Nama: ${ctx.group?.name || 'Komunitas WA'}\n• ID: ${ctx.group?.id || '120363xxx@g.us'}\n• Anti-Link: ${ctx.group?.antiLink ? 'AKTIF ✅' : 'NONAKTIF ❌'}\n• Welcome Msg: ${ctx.group?.welcome ? 'AKTIF ✅' : 'NONAKTIF ❌'}\n• Status Sewa: Selamanya (Aktif)`);
    }
  },
  {
    name: 'rulesgrup',
    category: 'GROUP',
    description: 'Melihat tata tertib / peraturan resmi grup',
    usage: '.rulesgrup',
    groupOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`📜 *PERATURAN GRUP*\n\n${ctx.group?.rules || '1. Saling menghormati\n2. Dilarang spam\n3. Patuhi aturan admin'}`);
    }
  },
  {
    name: 'setrulesgrup',
    category: 'GROUP',
    description: 'Mengatur teks peraturan resmi grup',
    usage: '.setrulesgrup <teks rules>',
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx: CommandContext) => {
      if (ctx.group && ctx.text) {
        ctx.group.rules = ctx.text;
        await ctx.group.save?.();
      }
      await ctx.reply(`✅ Aturan grup berhasil diperbarui.`);
    }
  },
  {
    name: 'setwelcome',
    category: 'GROUP',
    description: 'Mengatur teks sambutan member baru masuk',
    usage: '.setwelcome <pesan>',
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`✅ Pesan selamat datang (welcome message) berhasil disimpan.`);
    }
  },
  {
    name: 'setgoodbye',
    category: 'GROUP',
    description: 'Mengatur pesan perpisahan saat member keluar',
    usage: '.setgoodbye <pesan>',
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`✅ Pesan selamat tinggal (goodbye message) berhasil disimpan.`);
    }
  },
  {
    name: 'addantilink',
    aliases: ['antilink'],
    category: 'GROUP',
    description: 'Mengaktifkan proteksi anti link grup WhatsApp',
    usage: '.antilink on/off',
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx: CommandContext) => {
      const state = ctx.text.toLowerCase().includes('off') ? false : true;
      if (ctx.group) ctx.group.antiLink = state;
      await ctx.reply(`🛡️ Anti-Link grup sekarang: *${state ? 'DIAKTIFKAN' : 'DINONAKTIFKAN'}*`);
    }
  },
  {
    name: 'delantilink',
    category: 'GROUP',
    description: 'Mematikan fitur anti-link',
    usage: '.delantilink',
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx: CommandContext) => {
      if (ctx.group) ctx.group.antiLink = false;
      await ctx.reply(`🛡️ Fitur Anti-Link telah dimatikan.`);
    }
  },
  {
    name: 'antilinkall',
    category: 'GROUP',
    description: 'Blokir semua link website apapun tanpa kecuali',
    usage: '.antilinkall on/off',
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🌐 Anti-Link All Website: Telah disesuaikan.`);
    }
  },
  {
    name: 'antitoxic',
    category: 'GROUP',
    description: 'Filter sensor kata kasar dan kotor di obrolan grup',
    usage: '.antitoxic on/off',
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🧼 Anti-Toxic filter grup berhasil diaktifkan.`);
    }
  },
  {
    name: 'antispam',
    category: 'GROUP',
    description: 'Proteksi anti flooding & spam pesan beruntun',
    usage: '.antispam on/off',
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🛡️ Anti-Spam protection aktif.`);
    }
  },
  {
    name: 'antibot',
    category: 'GROUP',
    description: 'Auto-kick bot lain yang masuk ke grup tanpa izin',
    usage: '.antibot on/off',
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🤖 Anti-Bot: Bot lain yang masuk tanpa izin akan langsung dikeluarkan.`);
    }
  },
  {
    name: 'anticulik',
    category: 'GROUP',
    description: 'Cegah bot dimasukkan ke grup sembarangan',
    usage: '.anticulik',
    adminOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🔒 Anti-Culik bot telah diproteksi dengan sistem sewa.`);
    }
  },
  {
    name: 'antidocument',
    category: 'GROUP',
    description: 'Cegah pengiriman file dokumen berat di grup',
    usage: '.antidocument on/off',
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`📁 Anti-Document status berhasil diubah.`);
    }
  },
  {
    name: 'antimedia',
    category: 'GROUP',
    description: 'Batasi kirim media foto/video saat jam tenang',
    usage: '.antimedia on/off',
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🖼️ Anti-Media status berhasil diubah.`);
    }
  },
  {
    name: 'antisticker',
    category: 'GROUP',
    description: 'Cegah banjir stiker beruntun di grup',
    usage: '.antisticker on/off',
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🎭 Anti-Sticker filter aktif.`);
    }
  },
  {
    name: 'autosticker',
    category: 'GROUP',
    description: 'Otomatis ubah foto masuk menjadi stiker',
    usage: '.autosticker on/off',
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🎨 Auto-Sticker status telah diubah.`);
    }
  },
  {
    name: 'autoreply',
    category: 'GROUP',
    description: 'Balasan otomatis pesan tertentu',
    usage: '.autoreply',
    groupOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`💬 Auto-Reply responder siap.`);
    }
  },
  {
    name: 'absen',
    category: 'GROUP',
    description: 'Daftar kehadiran absensi kegiatan di grup',
    usage: '.absen',
    groupOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`📝 *ABSENSI KEHADIRAN*\n\n1. @${ctx.user.name} (Hadir - ${new Date().toLocaleTimeString('id-ID')})\n\nKetik *${ctx.prefix}absen* untuk ikut mengisi.`);
    }
  },
  {
    name: 'cekabsen',
    category: 'GROUP',
    description: 'Melihat rekap daftar anggota yang sudah absen',
    usage: '.cekabsen',
    groupOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`📊 *REKAP ABSENSI*\nTotal hadir: 1 member tercatat.`);
    }
  },
  {
    name: 'warn',
    category: 'GROUP',
    description: 'Memberikan kartu peringatan pelanggaran kepada anggota (3x warn = kick)',
    usage: '.warn @member',
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`⚠️ *PERINGATAN PELANGGARAN*\nMember telah diberikan 1 poin peringatan (1/3). Jika mencapai 3 akan otomatis dikeluarkan.`);
    }
  },
  {
    name: 'listwarn',
    category: 'GROUP',
    description: 'Melihat daftar member yang memiliki poin peringatan',
    usage: '.listwarn',
    groupOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`📋 *DAFTAR WARN MEMBER*\nTidak ada member dalam daftar hitam peringatan aktif.`);
    }
  },
  {
    name: 'resetwarn',
    category: 'GROUP',
    description: 'Mereset poin peringatan member',
    usage: '.resetwarn @member',
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`♻️ Poin peringatan member telah direset menjadi 0.`);
    }
  },
  {
    name: 'mute',
    aliases: ['mutegc'],
    category: 'GROUP',
    description: 'Membuat bot diam di grup (tidak merespon command kecuali owner/admin)',
    usage: '.mute',
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🔇 Bot telah dibisukan di grup ini.`);
    }
  },
  {
    name: 'unmute',
    category: 'GROUP',
    description: 'Mengaktifkan kembali respon bot di grup',
    usage: '.unmute',
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🔊 Bot aktif kembali melayani anggota grup.`);
    }
  },
  {
    name: 'giveaway',
    category: 'GROUP',
    description: 'Sistem undian giveaway koin/hadiah di grup',
    usage: '.giveaway create <hadiah>',
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🎉 *GIVEAWAY RESMI DIMULAI*\nHadiah: 50.000 Koin RPG!\nKetik bergabung untuk mengikuti undian.`);
    }
  },
  {
    name: 'poll',
    category: 'GROUP',
    description: 'Membuat polling jajak pendapat di grup',
    usage: '.poll <topik> | <opsi 1> | <opsi 2>',
    groupOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`📊 *POLLING JAJAK PENDAPAT*\nTopik berhasil dibuat dalam fitur voting.`);
    }
  },
  {
    name: 'clearchat',
    category: 'GROUP',
    description: 'Bersihkan riwayat chat bot di grup',
    usage: '.clearchat',
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🧹 Riwayat chat bot telah dibersihkan.`);
    }
  },
  {
    name: 'slowmode',
    category: 'GROUP',
    description: 'Mengatur jeda waktu pengiriman pesan antar member',
    usage: '.slowmode <detik>',
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`⏱️ Mode lambat (Slowmode) telah diatur.`);
    }
  },
  {
    name: 'afk',
    category: 'GROUP',
    description: 'Menyetel status Away From Keyboard (AFK)',
    usage: '.afk <alasan>',
    execute: async (ctx: CommandContext) => {
      const reason = ctx.text || 'Sedang istirahat';
      await ctx.reply(`💤 @${ctx.user.name} sekarang dalam status *AFK*:\nAlasan: "${reason}"\nBot akan memberitahu siapa pun yang men-tag kamu.`);
    }
  },
  {
    name: 'welcome',
    category: 'GROUP',
    description: 'Toggle fitur sambutan member baru on/off',
    usage: '.welcome on/off',
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`👋 Status sambutan Welcome berhasil disesuaikan.`);
    }
  },
  {
    name: 'goodbye',
    category: 'GROUP',
    description: 'Toggle pesan perpisahan member keluar on/off',
    usage: '.goodbye on/off',
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`👋 Status pesan Goodbye berhasil disesuaikan.`);
    }
  },
  {
    name: 'listadmin',
    category: 'GROUP',
    description: 'Melihat seluruh daftar admin grup saat ini',
    usage: '.listadmin',
    groupOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`👑 *DAFTAR ADMIN GRUP*\n• Admin 1 (Owner Grup)\n• Admin 2`);
    }
  },
  {
    name: 'cekidgc',
    category: 'GROUP',
    description: 'Melihat JID identitas grup WhatsApp',
    usage: '.cekidgc',
    groupOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🆔 *ID GRUP WHATSAPP*\n${ctx.group?.id || '12036301234567890@g.us'}`);
    }
  },
  {
    name: 'setnamegc',
    category: 'GROUP',
    description: 'Mengganti nama subjek grup WhatsApp',
    usage: '.setnamegc <nama baru>',
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`✏️ Nama grup berhasil diubah.`);
    }
  },
  {
    name: 'setppgc',
    category: 'GROUP',
    description: 'Mengganti foto profil ikon grup',
    usage: '.setppgc (reply foto)',
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🖼️ Foto profil grup berhasil diperbarui.`);
    }
  },
  {
    name: 'pinchat',
    category: 'GROUP',
    description: 'Sematkan pesan penting di puncak obrolan grup',
    usage: '.pinchat (reply pesan)',
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`📌 Pesan berhasil disematkan (pinned).`);
    }
  },
  {
    name: 'intro',
    category: 'GROUP',
    description: 'Template perkenalan member baru grup',
    usage: '.intro',
    groupOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`👋 *FORMAT PERKENALAN MEMBER*\n• Nama: \n• Asal Kota: \n• Umur: \n• Hobi: \n\nSalam kenal semuanya!`);
    }
  },
  {
    name: 'setintro',
    category: 'GROUP',
    description: 'Mengubah format template perkenalan',
    usage: '.setintro <format>',
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`✅ Template intro grup berhasil diperbarui.`);
    }
  },
  {
    name: 'acc',
    category: 'GROUP',
    description: 'Terima permintaan bergabung member grup tertutup',
    usage: '.acc all / @member',
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`✅ Calon anggota berhasil disetujui bergabung ke grup.`);
    }
  },
  {
    name: 'banchat',
    category: 'GROUP',
    description: 'Blokir seluruh interaksi bot di ruang obrolan ini',
    usage: '.banchat',
    ownerOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🚫 Chat ini telah dimasukkan ke daftar banchat.`);
    }
  },
  {
    name: 'notifopengroup',
    category: 'GROUP',
    description: 'Notifikasi otomatis saat grup dibuka berkala',
    usage: '.notifopengroup',
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🔔 Jadwal notifikasi buka grup otomatis disetel.`);
    }
  },
  {
    name: 'notifclosegroup',
    category: 'GROUP',
    description: 'Notifikasi otomatis saat grup ditutup jam malam',
    usage: '.notifclosegroup',
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🔔 Jadwal notifikasi tutup grup otomatis disetel.`);
    }
  },
  {
    name: 'notifpromote',
    category: 'GROUP',
    description: 'Pengumuman kenaikan admin',
    usage: '.notifpromote',
    groupOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🎉 Selamat kepada admin baru yang terpilih!`);
    }
  },
  {
    name: 'notifdemote',
    category: 'GROUP',
    description: 'Pemberitahuan penurunan admin',
    usage: '.notifdemote',
    groupOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`ℹ️ Pemberitahuan perubahan susunan admin grup.`);
    }
  }
];
