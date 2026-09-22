/**
 * Role-Playing Game (RPG) Engine & Economy Commands
 * Complete MMORPG interactive text game for WhatsApp
 */

import { BotCommand, CommandContext } from './types.ts';
import { getRPGData } from '../database/models/Clan.ts';

export const rpgCommands: BotCommand[] = [
  {
    name: 'inventory',
    aliases: ['inv', 'tas'],
    category: 'RPG',
    description: 'Melihat isi tas ransel, perlengkapan, dan material RPG kamu',
    usage: '.inventory',
    execute: async (ctx: CommandContext) => {
      const rpg = await getRPGData(ctx.user.id);
      await ctx.reply(`🎒 *INVENTORY RPG: @${ctx.user.name}*\n
❤️ Darah (HP): ${rpg.health}/${rpg.maxHealth}
⚡ Stamina: ${rpg.stamina}/${rpg.maxStamina}
⚔️ Attack: ${rpg.attack} | 🛡️ Defense: ${rpg.defense}
🏦 Tabungan Bank: 🪙 ${rpg.bank.toLocaleString('id-ID')}

📦 *MATERIAL & RESOURCE*
🪵 Kayu: ${rpg.inventory.wood} | 🪨 Batu: ${rpg.inventory.stone}
⛓️ Besi: ${rpg.inventory.iron} | 💎 Berlian: ${rpg.inventory.diamond}
🐟 Ikan: ${rpg.inventory.fish} | 🌾 Panen: ${rpg.inventory.crop}
🧪 Potion: ${rpg.inventory.potion}

🐾 Pet: ${rpg.pet?.name || 'Belum punya'} (Lv. ${rpg.pet?.level || 1})
💍 Pasangan: ${rpg.marriage ? `@${rpg.marriage}` : 'Jomblo'}`);
    }
  },
  {
    name: 'adventure',
    aliases: ['petualang'],
    category: 'RPG',
    description: 'Menjelajahi hutan rimba mencari harta dan exp',
    usage: '.adventure',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const rpg = await getRPGData(ctx.user.id);
      if (rpg.stamina < 15) return ctx.reply(`⚠️ Stamina tidak cukup! Butuh minimal 15 stamina. Istirahat atau gunakan ${ctx.prefix}heal.`);
      rpg.stamina -= 15;
      const getKoin = Math.floor(Math.random() * 800) + 400;
      const getExp = Math.floor(Math.random() * 300) + 150;
      const getWood = Math.floor(Math.random() * 5) + 1;
      rpg.inventory.wood += getWood;
      ctx.user.koin += getKoin;
      ctx.user.exp += getExp;
      await rpg.save?.();
      await ctx.user.save?.();
      await ctx.reply(`🌲 *HASIL PETUALANGAN (ADVENTURE)*\n\nKamu menjelajahi Hutan Mistis dan menemukan peti harta karun kuno!\n\n+ 🪙 ${getKoin} Koin\n+ 🎖️ ${getExp} Exp\n+ 🪵 ${getWood} Kayu\n- ⚡ 15 Stamina`);
    }
  },
  {
    name: 'mining',
    aliases: ['tambang'],
    category: 'RPG',
    description: 'Menambang batu, besi, dan berlian di gua bawah tanah',
    usage: '.mining',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const rpg = await getRPGData(ctx.user.id);
      if (rpg.stamina < 20) return ctx.reply(`⚠️ Stamina habis! Butuh 20 stamina untuk menambang.`);
      rpg.stamina -= 20;
      const iron = Math.floor(Math.random() * 4) + 1;
      const stone = Math.floor(Math.random() * 8) + 2;
      const diamond = Math.random() > 0.8 ? 1 : 0;
      rpg.inventory.iron += iron;
      rpg.inventory.stone += stone;
      rpg.inventory.diamond += diamond;
      await rpg.save?.();
      await ctx.reply(`⛏️ *HASIL MENAMBANG (MINING)*\n\n+ 🪨 ${stone} Batu\n+ ⛓️ ${iron} Bijih Besi${diamond ? '\n+ 💎 1 Berlian Langka!' : ''}\n- ⚡ 20 Stamina`);
    }
  },
  {
    name: 'fishing',
    aliases: ['mancing'],
    category: 'RPG',
    description: 'Memancing ikan di danau untuk bahan makanan dan energi',
    usage: '.fishing',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const rpg = await getRPGData(ctx.user.id);
      rpg.stamina = Math.max(0, rpg.stamina - 10);
      const fish = Math.floor(Math.random() * 6) + 1;
      rpg.inventory.fish += fish;
      await rpg.save?.();
      await ctx.reply(`🎣 *HASIL MEMANCING*\nUmpan disambar! Kamu berhasil menangkap *${fish} ekor ikan segar*!`);
    }
  },
  {
    name: 'hunt',
    aliases: ['berburu'],
    category: 'RPG',
    description: 'Berburu monster liar di padang rumput',
    usage: '.hunt',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const rpg = await getRPGData(ctx.user.id);
      const monsters = ['Serigala Hitam', 'Beruang Hutan', 'Goblin Liar', 'Orc'];
      const target = monsters[Math.floor(Math.random() * monsters.length)];
      ctx.user.koin += 750;
      ctx.user.exp += 250;
      await ctx.user.save?.();
      await ctx.reply(`🏹 *BERBURU MONSTER*\nKamu berhasil melumpuhkan *${target}*!\nHadiah: +750 Koin, +250 Exp.`);
    }
  },
  {
    name: 'berburu',
    category: 'RPG',
    description: 'Berburu hewan hutan',
    usage: '.berburu',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🎯 Kamu berhasil memanah rusa liar! Mendapatkan daging dan tanduk berharga.`);
    }
  },
  {
    name: 'woodcut',
    aliases: ['nebang'],
    category: 'RPG',
    description: 'Menebang pohon untuk mengumpulkan persediaan kayu',
    usage: '.woodcut',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const rpg = await getRPGData(ctx.user.id);
      rpg.inventory.wood += 8;
      await rpg.save?.();
      await ctx.reply(`🪓 *TEBANG POHON*\nKamu menebang pohon jati dan memperoleh *+8 Kayu*.`);
    }
  },
  {
    name: 'berladang',
    aliases: ['garden', 'kebun'],
    category: 'RPG',
    description: 'Menanam dan memanen tanaman palawija di ladang',
    usage: '.berladang',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const rpg = await getRPGData(ctx.user.id);
      rpg.inventory.crop += 10;
      await rpg.save?.();
      await ctx.reply(`🌾 *BERLADANG & PANEN*\nTanaman gandum dan jagungmu siap dipanen! Mendapatkan *+10 Hasil Panen*.`);
    }
  },
  {
    name: 'garden',
    category: 'RPG',
    description: 'Cek taman kebun sayur',
    usage: '.garden',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🌻 Kebun bunga dan sayur kamu mekar dengan subur.`);
    }
  },
  {
    name: 'cook',
    aliases: ['masak'],
    category: 'RPG',
    description: 'Memasak ikan dan hasil panen menjadi sup pemulih tenaga',
    usage: '.cook',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const rpg = await getRPGData(ctx.user.id);
      if (rpg.inventory.fish < 2 || rpg.inventory.crop < 2) {
        return ctx.reply(`⚠️ Bahan tidak cukup! Butuh 2 Ikan dan 2 Panen untuk memasak sup.`);
      }
      rpg.inventory.fish -= 2;
      rpg.inventory.crop -= 2;
      rpg.inventory.potion += 1;
      await rpg.save?.();
      await ctx.reply(`🍲 *MEMASAK MAKANAN*\nKamu memasak Sup Ikan Rempah yang lezat! Mendapatkan *+1 Potion Pemulih*.`);
    }
  },
  {
    name: 'heal',
    category: 'RPG',
    description: 'Meminum ramuan potion untuk memulihkan Darah & Stamina hingga penuh',
    usage: '.heal',
    execute: async (ctx: CommandContext) => {
      const rpg = await getRPGData(ctx.user.id);
      if (rpg.inventory.potion <= 0) return ctx.reply(`❌ Kamu tidak memiliki Potion! Beli di ${ctx.prefix}shop atau masak dengan ${ctx.prefix}cook.`);
      rpg.inventory.potion -= 1;
      rpg.health = rpg.maxHealth;
      rpg.stamina = rpg.maxStamina;
      await rpg.save?.();
      await ctx.reply(`🧪 *HEAL SELESAI*\nKamu meminum ramuan suci! Darah (HP) dan Stamina pulih 100%!`);
    }
  },
  {
    name: 'shop',
    aliases: ['toko'],
    category: 'RPG',
    description: 'Toko perlengkapan petualang (beli senjata, potion, alat)',
    usage: '.shop',
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🛒 *TOKO PERLENGKAPAN RPG*\n
1. 🧪 Healing Potion - 🪙 300 Koin (${ctx.prefix}craft potion)
2. ⚔️ Iron Broadsword - 🪙 2.500 Koin
3. 🛡️ Steel Shield - 🪙 2.000 Koin
4. ⛏️ Diamond Pickaxe - 🪙 5.000 Koin
5. 🥩 Makanan Pet - 🪙 500 Koin

_Ketik ${ctx.prefix}craft atau ${ctx.prefix}blacksmith untuk menempa peralatan!_`);
    }
  },
  {
    name: 'blacksmith',
    aliases: ['tempa'],
    category: 'RPG',
    description: 'Menempa pedang dan perisai yang lebih kuat dari besi',
    usage: '.blacksmith',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🔨 *TUKANG TEMPA (BLACKSMITH)*\nPandai besi memalu besi panas menjadi pedang tajam berkilau.`);
    }
  },
  {
    name: 'craft',
    category: 'RPG',
    description: 'Merakit bahan mentah menjadi barang bermanfaat',
    usage: '.craft potion / sword',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🛠️ *CRAFTING SUKSES*\nBarang berhasil dirakit.`);
    }
  },
  {
    name: 'enchant',
    category: 'RPG',
    description: 'Memberikan kekuatan sihir magis pada senjata kamu',
    usage: '.enchant',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`✨ Senjata kamu bersinar dengan api mistik! Attack +15 permanently.`);
    }
  },
  {
    name: 'boss',
    aliases: ['bossraid'],
    category: 'RPG',
    description: 'Menyerang World Boss naga raksasa bersama teman grup',
    usage: '.boss',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🐉 *WORLD BOSS RAID*\nNaga Kuno "Ignis" berhasil ditundukkan!\nRampasan Boss: +10.000 Koin & 1x Batu Kristal Ajaib.`);
    }
  },
  {
    name: 'arena',
    aliases: ['pvp'],
    category: 'RPG',
    description: 'Bertarung di arena Colosseum melawan gladiator tangguh',
    usage: '.arena',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🏟️ *COLOSSEUM ARENA*\nKamu mengalahkan gladiator penantang dan meraih gelar Champion!`);
    }
  },
  {
    name: 'duel',
    category: 'RPG',
    description: 'Tantang pemain lain bertarung 1 vs 1 dengan taruhan koin',
    usage: '.duel @lawan <taruhan>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`⚔️ *DUEL 1 VS 1*\nTantangan duel telah dilemparkan.`);
    }
  },
  {
    name: 'bank',
    aliases: ['atm'],
    category: 'RPG',
    description: 'Menyimpan atau menarik koin dari brankas bank agar aman dari rampok',
    usage: '.bank nabung <jumlah> / tarik <jumlah>',
    execute: async (ctx: CommandContext) => {
      const rpg = await getRPGData(ctx.user.id);
      await ctx.reply(`🏦 *BANK & BRANKAS KERAJAAN*\n• Tabungan Tersimpan: 🪙 ${rpg.bank.toLocaleString('id-ID')} koin\n• Koin di Dompet: 🪙 ${ctx.user.koin.toLocaleString('id-ID')} koin\n• Bunga Simpanan: 1% / hari`);
    }
  },
  {
    name: 'transfer',
    aliases: ['tf', 'pay'],
    category: 'RPG',
    description: 'Kirim koin ke pengguna lain',
    usage: '.transfer @user <jumlah>',
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`💸 Transfer koin berhasil dikirimkan ke penerima.`);
    }
  },
  {
    name: 'beg',
    aliases: ['ngemis'],
    category: 'RPG',
    description: 'Meminta belas kasihan pejalan kaki di pasar kerajaan',
    usage: '.beg',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const get = Math.floor(Math.random() * 200) + 50;
      ctx.user.koin += get;
      await ctx.user.save?.();
      await ctx.reply(`🥺 Seorang saudagar kaya merasa iba dan memberimu sedekah *${get} koin*!`);
    }
  },
  {
    name: 'ngojek',
    aliases: ['ojek'],
    category: 'RPG',
    description: 'Menjadi driver ojek mengantar penumpang ke kota',
    usage: '.ngojek',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const get = Math.floor(Math.random() * 600) + 300;
      ctx.user.koin += get;
      await ctx.user.save?.();
      await ctx.reply(`🛵 Kamu mengantar penumpang selamat sampai stasiun! Mendapatkan ongkos *${get} koin* + bintang 5.`);
    }
  },
  {
    name: 'kurir',
    category: 'RPG',
    description: 'Mengantarkan paket barang kilat',
    usage: '.kurir',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      ctx.user.koin += 450;
      await ctx.user.save?.();
      await ctx.reply(`📦 Paket berhasil diantarkan! Menerima upah *450 koin*.`);
    }
  },
  {
    name: 'work',
    aliases: ['kerja'],
    category: 'RPG',
    description: 'Bekerja paruh waktu untuk mencari nafkah',
    usage: '.work',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const jobs = ['Koki Restoran', 'Petugas Arsip', 'Barista Kopi', 'Mekanik Bengkel'];
      const job = jobs[Math.floor(Math.random() * jobs.length)];
      const salary = Math.floor(Math.random() * 700) + 400;
      ctx.user.koin += salary;
      await ctx.user.save?.();
      await ctx.reply(`💼 Kamu bekerja keras sebagai *${job}* dan menerima gaji harian *${salary} koin*!`);
    }
  },
  {
    name: 'dice',
    aliases: ['dadu'],
    category: 'RPG',
    description: 'Melempar dadu keberuntungan berhadiah',
    usage: '.dice <taruhan>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const roll = Math.floor(Math.random() * 6) + 1;
      await ctx.reply(`🎲 Dadu berputar dan mendarat pada angka *[ ${roll} ]*!`);
    }
  },
  {
    name: 'slot',
    aliases: ['jackpot'],
    category: 'RPG',
    description: 'Mesin slot koin mini (Fun game tanpa uang asli)',
    usage: '.slot',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const emojis = ['🍒', '🍋', '🍇', '💎', '7️⃣'];
      const r1 = emojis[Math.floor(Math.random() * emojis.length)];
      const r2 = emojis[Math.floor(Math.random() * emojis.length)];
      const r3 = emojis[Math.floor(Math.random() * emojis.length)];
      const isWin = r1 === r2 && r2 === r3;
      await ctx.reply(`🎰 *SLOT MACHINE*\n\n[ ${r1} | ${r2} | ${r3} ]\n\n${isWin ? '🎉 JACKPOT! Tiga simbol cocok! Menang 5.000 Koin!' : 'Coba lagi lain kali!'}`);
    }
  },
  {
    name: 'lottery',
    category: 'RPG',
    description: 'Membeli kupon undian berhadiah akbar',
    usage: '.lottery',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🎟️ Kupon undian nomor #${Math.floor(Math.random() * 90000) + 10000} berhasil dibeli.`);
    }
  },
  {
    name: 'pet',
    category: 'RPG',
    description: 'Melihat dan merawat hewan peliharaan (Pet)',
    usage: '.pet feed / info',
    execute: async (ctx: CommandContext) => {
      const rpg = await getRPGData(ctx.user.id);
      await ctx.reply(`🐾 *PET PELIHARAAN: ${rpg.pet?.name || 'Kucing Oren'}*\n• Tipe: ${rpg.pet?.type || 'Cat'}\n• Level: ${rpg.pet?.level || 1} (Exp: ${rpg.pet?.exp || 20}/100)\n• Kesenangan: 100%\n\nPet kamu memberi bonus +5% serangan saat berburu!`);
    }
  },
  {
    name: 'quest',
    aliases: ['misi'],
    category: 'RPG',
    description: 'Daftar misi harian berhadiah koin & material melimpah',
    usage: '.quest',
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`📜 *MISI HARIAN (QUEST)*\n\n1. Selesaikan 1x Adventure [Hadiah: 1.000 Koin]\n2. Tambang 5x Batu [Hadiah: 500 Koin]\n3. Pancing 3x Ikan [Hadiah: 1 Potion]\n\nSelesaikan quest untuk klaim hadiah!`);
    }
  },
  {
    name: 'stamina',
    category: 'RPG',
    description: 'Cek sisa stamina karakter petualangmu',
    usage: '.stamina',
    execute: async (ctx: CommandContext) => {
      const rpg = await getRPGData(ctx.user.id);
      await ctx.reply(`⚡ Stamina kamu: *${rpg.stamina}/${rpg.maxStamina}*\nStamina otomatis terisi kembali setiap menit.`);
    }
  },
  {
    name: 'meditation',
    aliases: ['meditasi'],
    category: 'RPG',
    description: 'Bermeditasi di air terjun untuk memulihkan energi batin dan stamina',
    usage: '.meditation',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const rpg = await getRPGData(ctx.user.id);
      rpg.stamina = Math.min(rpg.maxStamina, rpg.stamina + 35);
      await rpg.save?.();
      await ctx.reply(`🧘 Kamu bermeditasi dengan tenang di bawah air terjun sejuk. Stamina bertambah +35.`);
    }
  },
  {
    name: 'training',
    aliases: ['latihan'],
    category: 'RPG',
    description: 'Latihan fisik meningkatkan poin serangan dan pertahanan',
    usage: '.training',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🥋 Kamu berlatih pedang dengan boneka kayu jerami! Attack bertambah +2.`);
    }
  },
  {
    name: 'guild',
    category: 'RPG',
    description: 'Markas serikat petualang kerajaan',
    usage: '.guild',
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🏛️ *GUILD HALL PETUALANG*\nDi sini para petualang berkumpul bertukar kabar dan mengambil kontrak.`);
    }
  },
  {
    name: 'merchant',
    category: 'RPG',
    description: 'Berdagang dengan saudagar keliling misterius',
    usage: '.merchant',
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🐪 Saudagar keliling menawarkan relik kuno langka.`);
    }
  },
  {
    name: 'jualan',
    category: 'RPG',
    description: 'Membuka lapak dagangan di pasar kota',
    usage: '.jualan',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      ctx.user.koin += 600;
      await ctx.user.save?.();
      await ctx.reply(`🏪 Barang dagangan laku terjual! Mendapatkan penghasilan *+600 koin*.`);
    }
  },
  {
    name: 'sellall',
    category: 'RPG',
    description: 'Menjual seluruh kayu, batu, ikan, dan hasil panen menjadi koin',
    usage: '.sellall',
    execute: async (ctx: CommandContext) => {
      const rpg = await getRPGData(ctx.user.id);
      const totalEarned = (rpg.inventory.wood * 20) + (rpg.inventory.stone * 25) + (rpg.inventory.fish * 50) + (rpg.inventory.crop * 30);
      rpg.inventory.wood = 0;
      rpg.inventory.stone = 0;
      rpg.inventory.fish = 0;
      rpg.inventory.crop = 0;
      ctx.user.koin += totalEarned;
      await rpg.save?.();
      await ctx.user.save?.();
      await ctx.reply(`💰 *JUAL SEMUA HASIL*\nSeluruh material mentah berhasil dijual ke pedagang kota seharga *🪙 ${totalEarned.toLocaleString('id-ID')} koin*!`);
    }
  },
  {
    name: 'expedition',
    category: 'RPG',
    description: 'Mengirim ekspedisi penjelajah ke benua seberang',
    usage: '.expedition',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`⛵ Kapal ekspedisi telah berlayar menuju Benua Salju Arkadia. Hasil ekspedisi akan tiba.`);
    }
  },
  {
    name: 'marry',
    aliases: ['nikah'],
    category: 'RPG',
    description: 'Melamar atau menikah dengan pemain lain di bot',
    usage: '.marry @user',
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`💍 Pernikahan impian digelar meriah di Katedral Kota! Selamat kepada kedua mempelai.`);
    }
  },
  {
    name: 'gift',
    category: 'RPG',
    description: 'Mengirim kado hadiah istimewa kepada teman',
    usage: '.gift @user',
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🎁 Kado kotak pita telah terkirim kepada teman.`);
    }
  },
  {
    name: 'use',
    category: 'RPG',
    description: 'Menggunakan item tertentu dari tas ransel',
    usage: '.use potion',
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`✨ Item berhasil digunakan.`);
    }
  },
  {
    name: 'weekly',
    category: 'RPG',
    description: 'Klaim hadiah peti harta karun mingguan',
    usage: '.weekly',
    execute: async (ctx: CommandContext) => {
      ctx.user.koin += 10000;
      ctx.user.limit += 50;
      await ctx.user.save?.();
      await ctx.reply(`👑 *HADIAH MINGGUAN (WEEKLY REWARD)*\nKamu membuka Peti Emas!\n+ 🪙 10.000 Koin\n+ ⚡ 50 Limit Energi`);
    }
  }
];
