/**
 * Game & Quiz Commands
 */

import { BotCommand, CommandContext } from './types.ts';

export const gameCommands: BotCommand[] = [
  {
    name: 'tebakgambar',
    category: 'GAME',
    description: 'Permainan tebak gambar teka-teki visual',
    usage: '.tebakgambar',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🖼️ *TEBAK GAMBAR*\n\nPetunjuk: Hewan berkaki empat + Belalai\nBonus: +500 Koin, +150 Exp\n\n_Balas pesan ini untuk menjawab!_`);
    }
  },
  {
    name: 'tebakkata',
    category: 'GAME',
    description: 'Game menebak kata berdasarkan petunjuk',
    usage: '.tebakkata',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🔤 *TEBAK KATA*\n\nPetunjuk: Alat penerang di malam hari (L _ _ P _)\nBonus: +300 Koin`);
    }
  },
  {
    name: 'tebakkalimat',
    category: 'GAME',
    description: 'Game menebak kalimat tersembunyi',
    usage: '.tebakkalimat',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`📝 *TEBAK KALIMAT*\nLengkapi pepatah: "Berakit-rakit ke hulu, berenang-renang ke..."`);
    }
  },
  {
    name: 'tebaktebakan',
    aliases: ['tebakan'],
    category: 'GAME',
    description: 'Tebak-tebakan lucu dan menghibur',
    usage: '.tebaktebakan',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🤔 *TEBAK-TEBAKAN*\nPertanyaan: Ban apa yang enak dimakan?\nJawabannya: Bandeng presto! 😆`);
    }
  },
  {
    name: 'caklontong',
    category: 'GAME',
    description: 'Teka-teki logika absurd khas Cak Lontong',
    usage: '.caklontong',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🧠 *KUIS CAK LONTONG*\nPertanyaan: Orang yang memimpin suatu negara disebut?\nJawaban absurd: Susah! (Karena presiden kan cuma satu, susah kalau semua mimpin) 🤣`);
    }
  },
  {
    name: 'asahotak',
    category: 'GAME',
    description: 'Game teka-teki pengasah otak dan wawasan',
    usage: '.asahotak',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`💡 *ASAH OTAK*\nApakah yang selalu naik tapi tidak pernah turun?\nJawaban: Umur!`);
    }
  },
  {
    name: 'family100',
    category: 'GAME',
    description: 'Game survey Family 100 interaktif',
    usage: '.family100',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`👨‍👩‍👧‍👦 *FAMILY 100*\nSurvei membuktikan: Apa yang dicari orang saat bangun tidur?\n1. HP (68 poin)\n2. Jam dinding (15 poin)\n3. Air minum (10 poin)`);
    }
  },
  {
    name: 'susunkata',
    category: 'GAME',
    description: 'Menyusun huruf acak menjadi kata baku',
    usage: '.susunkata',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🔠 *SUSUN KATA*\nSusun huruf ini: [ K - A - B - I - S - E - T - O ]\nPetunjuk: Cabang olahraga`);
    }
  },
  {
    name: 'kataacak',
    category: 'GAME',
    description: 'Game tebak kata yang diacak posisinya',
    usage: '.kataacak',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🔀 *KATA ACAK*\nKata: N A G A R A M P E\nPetunjuk: Terjadi saat perang`);
    }
  },
  {
    name: 'tictactoe',
    aliases: ['ttt'],
    category: 'GAME',
    description: 'Permainan papan Tic-Tac-Toe bersama teman di grup',
    usage: '.tictactoe @lawan',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`❌⭕ *TIC TAC TOE*\n\n1 | 2 | 3\n---------\n4 | 5 | 6\n---------\n7 | 8 | 9\n\nGiliran: ❌ @${ctx.user.id.split('@')[0]}\nKetik angka 1-9 untuk menaruh pion.`);
    }
  },
  {
    name: 'ulartangga',
    category: 'GAME',
    description: 'Permainan papan Ular Tangga virtual',
    usage: '.ulartangga',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🎲 *ULAR TANGGA*\nDadu dilempar: ⚄ (Angka 5)\nPosisi pion kamu bergerak ke kotak 14! Hati-hati ada ular di kotak 21.`);
    }
  },
  {
    name: 'tebakbendera',
    category: 'GAME',
    description: 'Tebak bendera negara-negara di dunia',
    usage: '.tebakbendera',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🚩 *TEBAK BENDERA*\nBendera: 🇯🇵\nPetunjuk: Negeri Sakura di Asia Timur`);
    }
  },
  {
    name: 'tebaknegara',
    category: 'GAME',
    description: 'Tebak nama negara dari ciri khas atau ibukota',
    usage: '.tebaknegara',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🌍 *TEBAK NEGARA*\nIbukota: Paris\nLandmark: Menara Eiffel`);
    }
  },
  {
    name: 'tebakhewan',
    category: 'GAME',
    description: 'Tebak nama hewan berdasarkan suara atau ciri fisiknya',
    usage: '.tebakhewan',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🦁 *TEBAK HEWAN*\nCiri: Memiliki kantung di perut dan melompat tinggi di Australia`);
    }
  },
  {
    name: 'tebakmakanan',
    category: 'GAME',
    description: 'Tebak nama kuliner nusantara dan dunia',
    usage: '.tebakmakanan',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🍲 *TEBAK MAKANAN*\nMakanan khas Padang yang berbahan daging sapi dengan rempah kaya rasa`);
    }
  },
  {
    name: 'tebakprofesi',
    category: 'GAME',
    description: 'Tebak pekerjaan dan profesi',
    usage: '.tebakprofesi',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`👮 *TEBAK PROFESI*\nBertugas memadamkan kebakaran dan menyelamatkan orang`);
    }
  },
  {
    name: 'tebaklagu',
    category: 'GAME',
    description: 'Tebak judul lagu dari potongan lirik',
    usage: '.tebaklagu',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🎶 *TEBAK LAGU*\nLirik: "Ku menangis... membayangkan..."`);
    }
  },
  {
    name: 'tebaklirik',
    category: 'GAME',
    description: 'Lanjutkan potongan lirik lagu terkenal',
    usage: '.tebaklirik',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🎤 *TEBAK LIRIK*\n"Hati-hati di jalan..." siapa penyanyinya?`);
    }
  },
  {
    name: 'tebakdrakor',
    category: 'GAME',
    description: 'Tebak judul drama korea terpopuler',
    usage: '.tebakdrakor',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🎬 *TEBAK DRAMA KOREA*\nPemain: Hyun Bin & Son Ye-jin\nTema: Prajurit Korea Utara & Konglomerat Korea Selatan`);
    }
  },
  {
    name: 'tebakfilm',
    category: 'GAME',
    description: 'Tebak judul film box office',
    usage: '.tebakfilm',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🍿 *TEBAK FILM*\nKarakter: Jack & Rose di kapal pesiar yang menabrak gunung es`);
    }
  },
  {
    name: 'tebakkimia',
    category: 'GAME',
    description: 'Tebak lambang unsur tabel periodik kimia',
    usage: '.tebakkimia',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🧪 *TEBAK UNSUR KIMIA*\nLambang: Au\nApakah nama unsur ini?`);
    }
  },
  {
    name: 'tekateki',
    category: 'GAME',
    description: 'Teka-teki silang santai',
    usage: '.tekateki',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🧩 *TEKA TEKI*\nAda daun tapi bukan pohon, ada halaman tapi bukan rumah. Apakah itu?\n(Buku)`);
    }
  },
  {
    name: 'riddle',
    category: 'GAME',
    description: 'Teka-teki misteri pemecah teka-teki',
    usage: '.riddle',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🕵️ *RIDDLE MISTERI*\nAku berbicara tanpa mulut dan mendengar tanpa telinga. Aku tidak berwujud, tapi hidup dengan angin. Siapakah aku?\n(Gema / Echo)`);
    }
  },
  {
    name: 'siapakahaku',
    category: 'GAME',
    description: 'Tebak identitas objek atau profesi',
    usage: '.siapakahaku',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`❓ *SIAPAKAH AKU?*\nAku punya jarum tapi tidak bisa menjahit. Aku punya angka tapi tidak bisa berhitung. Siapakah aku?\n(Jam)`);
    }
  },
  {
    name: 'kyubigame',
    category: 'GAME',
    description: 'Game minigame rubik kubus mini',
    usage: '.kyubigame',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🧊 *KYUBI RUBIK*\nKubus 3x3 diputar! Susun warna yang sama pada tiap sisi.`);
    }
  },
  {
    name: 'mct',
    category: 'GAME',
    description: 'Minecraft Trivia Challenge Quiz',
    usage: '.mct',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`⛏️ *MINECRAFT TRIVIA*\nBerapa jumlah obsidian yang dibutuhkan untuk membuat Nether Portal standar? (Jawaban: 10 atau 14)`);
    }
  },
  {
    name: 'dungeon',
    category: 'GAME',
    description: 'Eksplorasi dungeon instan berhadiah',
    usage: '.dungeon',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`⚔️ *DUNGEON RAID*\nKamu memasuki lantai 3 Labirin Kuno!\nMonster dikalahkan! Mendapatkan +1.200 Koin dan 1x Diamond Pickaxe.`);
    }
  }
];
