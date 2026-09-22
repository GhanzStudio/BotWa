/**
 * User Account, Profile, Level & Economy Commands
 */

import { BotCommand, CommandContext } from './types.ts';

export const userCommands: BotCommand[] = [
  {
    name: 'profile',
    aliases: ['me', 'profil'],
    category: 'USER',
    description: 'Melihat kartu profil pengguna, saldo koin, level, dan limit',
    usage: '.profile',
    execute: async (ctx: CommandContext) => {
      const { user } = ctx;
      const status = user.premium ? '👑 PREMIUM (VIP)' : '👤 USER BIASA';
      await ctx.reply(`👤 *KARTU PROFIL PENGGUNA*\n
• Nama: ${user.name}
• ID: ${user.id}
• Status: ${status}
• Level: ${user.level} (Exp: ${user.exp})
• Koin: 🪙 ${user.koin.toLocaleString('id-ID')}
• Limit: ⚡ ${user.premium ? 'Unlimited' : `${user.limit} tersisa`}
• Terdaftar: ${user.registered ? 'Sudah Terverifikasi ✅' : 'Belum Terdaftar ❌'}
• Ulang Tahun: ${user.birthday || 'Belum diatur'}
• Total Command: ${user.totalHit || 0}x digunakan`);
    }
  },
  {
    name: 'daftar',
    aliases: ['register', 'reg'],
    category: 'USER',
    description: 'Mendaftarkan diri ke database bot',
    usage: '.daftar <nama.umur>',
    execute: async (ctx: CommandContext) => {
      const { user } = ctx;
      if (user.registered) return ctx.reply(`⚠️ Kamu sudah terdaftar di database!`);
      const input = ctx.text.trim();
      let name = user.name || 'User';
      let age = 18;
      if (input.includes('.')) {
        const [n, a] = input.split('.');
        if (n) name = n.trim();
        if (a && !isNaN(Number(a))) age = Number(a);
      }
      user.registered = true;
      user.name = name;
      user.age = age;
      user.koin += 2000;
      user.limit += 20;
      await user.save?.();
      await ctx.reply(`🎉 *PENDAFTARAN BERHASIL!*\n\n• Nama: ${name}\n• Umur: ${age} tahun\n• Bonus Registrasi: +2.000 Koin, +20 Limit!\n\n_Ketik ${ctx.prefix}menu untuk mulai menggunakan fitur._`);
    }
  },
  {
    name: 'unreg',
    category: 'USER',
    description: 'Menghapus pendaftaran akun dari database',
    usage: '.unreg',
    execute: async (ctx: CommandContext) => {
      ctx.user.registered = false;
      await ctx.user.save?.();
      await ctx.reply(`🗑️ Pendaftaran akun kamu telah dibatalkan.`);
    }
  },
  {
    name: 'daily',
    aliases: ['klaim'],
    category: 'USER',
    description: 'Klaim hadiah harian koin dan energi gratis',
    usage: '.daily',
    execute: async (ctx: CommandContext) => {
      const { user } = ctx;
      const now = new Date();
      if (user.lastDaily) {
        const diff = now.getTime() - new Date(user.lastDaily).getTime();
        const oneDay = 24 * 60 * 60 * 1000;
        if (diff < oneDay) {
          const waitHour = Math.ceil((oneDay - diff) / (60 * 60 * 1000));
          return ctx.reply(`⏳ Kamu sudah mengambil hadiah harian! Silakan kembali dalam ${waitHour} jam.`);
        }
      }
      user.lastDaily = now;
      user.koin += 1500;
      user.limit += 25;
      user.exp += 200;
      await user.save?.();
      await ctx.reply(`🎁 *HADIAH HARIAN (DAILY CLAIM)*\n\nSelamat! Kamu mendapatkan:\n+ 🪙 1.500 Koin\n+ ⚡ 25 Limit Energi\n+ 🎖️ 200 Exp`);
    }
  },
  {
    name: 'energi',
    aliases: ['limit', 'ceklimit'],
    category: 'USER',
    description: 'Mengecek sisa kuota limit energi hari ini',
    usage: '.energi',
    execute: async (ctx: CommandContext) => {
      const { user } = ctx;
      if (user.premium) {
        return ctx.reply(`⚡ *LIMIT ENERGI*: Unlimited (Akun Premium VIP ✨)`);
      }
      await ctx.reply(`⚡ *SISA ENERGI / LIMIT KAMU*\n\nSisa: *${user.limit} limit*\nReset berkala: Setiap pukul 00:00 WIB\n\n_Ketik ${ctx.prefix}buyenergi untuk membeli tambahan limit dengan koin!_`);
    }
  },
  {
    name: 'koin',
    aliases: ['saldo', 'money'],
    category: 'USER',
    description: 'Cek saldo koin ekonomi kamu',
    usage: '.koin',
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🪙 Saldo koin kamu: *${ctx.user.koin.toLocaleString('id-ID')} koin*`);
    }
  },
  {
    name: 'exp',
    category: 'USER',
    description: 'Cek jumlah experience (Exp) karaktermu',
    usage: '.exp',
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🎖️ Exp kamu saat ini: *${ctx.user.exp} Exp* (Level ${ctx.user.level})`);
    }
  },
  {
    name: 'level',
    category: 'USER',
    description: 'Melihat progres level saat ini',
    usage: '.level',
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`📈 Level kamu: *Level ${ctx.user.level}*\nDibutuhkan ${(ctx.user.level * 500) - ctx.user.exp} Exp lagi untuk naik level.`);
    }
  },
  {
    name: 'levelup',
    category: 'USER',
    description: 'Menaikkan level jika exp mencukupi',
    usage: '.levelup',
    execute: async (ctx: CommandContext) => {
      const { user } = ctx;
      const needExp = user.level * 300;
      if (user.exp >= needExp) {
        user.level += 1;
        user.exp -= needExp;
        user.koin += 1000;
        await user.save?.();
        return ctx.reply(`🆙 *SELAMAT! NAIK LEVEL!*\nSekarang kamu berada di *Level ${user.level}*!\nBonus: +1.000 Koin!`);
      }
      await ctx.reply(`⚠️ Exp kamu belum mencukupi untuk naik level. Kumpulkan ${needExp - user.exp} Exp lagi dari game/rpg.`);
    }
  },
  {
    name: 'buyenergi',
    aliases: ['buylimit'],
    category: 'USER',
    description: 'Membeli limit energi menggunakan saldo koin (1 Limit = 100 Koin)',
    usage: '.buyenergi <jumlah>',
    execute: async (ctx: CommandContext) => {
      const amount = parseInt(ctx.args[0] || '10', 10);
      if (isNaN(amount) || amount <= 0) return ctx.reply(`Contoh: ${ctx.prefix}buyenergi 10`);
      const cost = amount * 100;
      if (ctx.user.koin < cost) {
        return ctx.reply(`❌ Koin tidak cukup! Butuh ${cost.toLocaleString('id-ID')} koin untuk membeli ${amount} limit.`);
      }
      ctx.user.koin -= cost;
      ctx.user.limit += amount;
      await ctx.user.save?.();
      await ctx.reply(`✅ Berhasil membeli *${amount} limit* seharga ${cost.toLocaleString('id-ID')} koin!\nSisa koin: ${ctx.user.koin.toLocaleString('id-ID')}`);
    }
  },
  {
    name: 'buyfitur',
    category: 'USER',
    description: 'Membeli akses fitur khusus dengan koin',
    usage: '.buyfitur',
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🛍️ *TOKO FITUR KHUSUS*\nKoin dapat digunakan untuk membeli item RPG dan boost limit.`);
    }
  },
  {
    name: 'setbirthday',
    category: 'USER',
    description: 'Menyetel tanggal ulang tahun kamu (DD-MM)',
    usage: '.setbirthday 17-08',
    execute: async (ctx: CommandContext) => {
      const date = ctx.text.trim();
      if (!date) return ctx.reply(`Format: ${ctx.prefix}setbirthday DD-MM (Contoh: 25-12)`);
      ctx.user.birthday = date;
      await ctx.user.save?.();
      await ctx.reply(`🎂 Tanggal ulang tahun kamu disetel ke: *${date}*`);
    }
  },
  {
    name: 'birthday',
    category: 'USER',
    description: 'Cek tanggal ulang tahun kamu',
    usage: '.birthday',
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🎂 Tanggal lahir terdaftar: *${ctx.user.birthday || 'Belum diatur'}*`);
    }
  },
  {
    name: 'birthdaylist',
    category: 'USER',
    description: 'Melihat daftar member yang berulang tahun bulan ini',
    usage: '.birthdaylist',
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`📅 *DAFTAR ULANG TAHUN BULAN INI*\n• Ahmad - 12 September\n• Salsabila - 28 September`);
    }
  }
];
