/**
 * Interactive Game & Quiz Engine
 * 27 Minigames with Auto-Session Receiver & Reply Detection
 */

import { BotCommand, CommandContext } from './types.ts';
import { setGameSession, deleteGameSession, setFamily100Session, getFamily100Session, formatFamily100Board } from '../lib/gameSession.ts';

interface QuizItem {
  q: string;
  a: string;
  acceptable?: string[];
  hint?: string;
  reward?: number;
}

const QUIZ_DATA: Record<string, QuizItem[]> = {
  tebakkata: [
    { q: 'Alat penerang di malam hari', a: 'lampu', acceptable: ['lampu'], hint: 'L _ M P U', reward: 350 },
    { q: 'Hewan berleher panjang pemakan daun', a: 'jerapah', acceptable: ['jerapah'], hint: 'J _ R _ P _ H', reward: 350 },
    { q: 'Alat untuk mengetik di komputer', a: 'keyboard', acceptable: ['keyboard', 'papan ketik'], hint: 'K _ Y B _ _ R D', reward: 400 },
    { q: 'Benda langit yang mengorbit bumi', a: 'bulan', acceptable: ['bulan'], hint: 'B _ L _ N', reward: 300 },
    { q: 'Ibukota negara Jepang', a: 'tokyo', acceptable: ['tokyo', 'tokio'], hint: 'T _ K _ O', reward: 350 }
  ],
  tebakgambar: [
    { q: 'Hewan berkaki empat + Belalai panjang + Gading', a: 'gajah', acceptable: ['gajah'], hint: 'G _ J _ H', reward: 400 },
    { q: 'Buku + Gambar mata terbuka + Kacamata', a: 'membaca', acceptable: ['membaca', 'baca'], hint: 'M _ M B _ C _', reward: 450 },
    { q: 'Gambar api membara + Tangan kedinginan', a: 'hangat', acceptable: ['hangat'], hint: 'H _ N G _ T', reward: 350 },
    { q: 'Gambar uang koin berterbangan + Sayap', a: 'boros', acceptable: ['boros'], hint: 'B _ R _ S', reward: 400 }
  ],
  tebakkalimat: [
    { q: 'Berakit-rakit ke hulu, berenang-renang ke...', a: 'tepian', acceptable: ['tepian', 'tepi'], hint: 'Bersakit-sakit dahulu, bersenang-senang kemudian', reward: 350 },
    { q: 'Tong kosong nyaring...', a: 'bunyinya', acceptable: ['bunyinya', 'suaranya'], hint: 'Pepatah tentang orang yang banyak bicara', reward: 300 },
    { q: 'Air beriak tanda tak...', a: 'dalam', acceptable: ['dalam'], hint: 'Orang yang sombong ilmunya sedikit', reward: 300 },
    { q: 'Ada gula ada...', a: 'semut', acceptable: ['semut'], hint: 'Di mana ada rezeki di situ banyak orang', reward: 300 }
  ],
  caklontong: [
    { q: 'Orang yang memimpin suatu negara disebut...', a: 'susah', acceptable: ['susah', 'sulit'], hint: 'Karena kalau semua orang memimpin, ya repot!', reward: 500 },
    { q: 'Banteng memiliki tanduk di...', a: 'kepala', acceptable: ['kepala'], hint: 'Masa di kaki, ya di kepala dong!', reward: 500 },
    { q: 'Kuda berkaki...', a: 'capek', acceptable: ['capek', 'capec', 'lelah'], hint: 'Kalau jalan jauh ya capek kakinya!', reward: 500 },
    { q: 'Burung bisa terbang karena punya...', a: 'bakat', acceptable: ['bakat'], hint: 'Kalau nggak ada bakat ya jatuh!', reward: 500 }
  ],
  asahotak: [
    { q: 'Apakah yang selalu naik tapi tidak pernah turun?', a: 'umur', acceptable: ['umur', 'usia'], hint: 'Setiap tahun bertambah 1 angka', reward: 450 },
    { q: 'Punya banyak gigi tapi tidak bisa menggigit?', a: 'sisir', acceptable: ['sisir', 'sisir rambut'], hint: 'Alat perapi rambut', reward: 400 },
    { q: 'Bisa bertambah jika dibagi dengan orang lain?', a: 'ilmu', acceptable: ['ilmu', 'kebahagiaan'], hint: 'Atau kebahagiaan', reward: 450 },
    { q: 'Makin dikeringkan makin basah?', a: 'handuk', acceptable: ['handuk'], hint: 'Dipakai setelah mandi', reward: 400 }
  ],
  tebakbendera: [
    { q: 'Bendera putih dengan lingkaran merah di tengah', a: 'jepang', acceptable: ['jepang', 'japan'], hint: '🇯🇵 Negeri Sakura', reward: 350 },
    { q: 'Bendera merah putih dua garis horizontal', a: 'indonesia', acceptable: ['indonesia', 'ri'], hint: '🇮🇩 Negara kita tercinta', reward: 300 },
    { q: 'Bendera garis merah putih dengan bintang biru di kiri atas', a: 'amerika', acceptable: ['amerika', 'usa', 'amerika serikat'], hint: '🇺🇸 Negeri Paman Sam', reward: 350 },
    { q: 'Bendera tiga warna: Hitam, Merah, Kuning emas horizontal', a: 'jerman', acceptable: ['jerman', 'germany'], hint: '🇩🇪 Pusat otomotif Eropa', reward: 400 }
  ],
  tebaknegara: [
    { q: 'Negara dengan landmark Menara Eiffel & Louvre', a: 'prancis', acceptable: ['prancis', 'perancis', 'france'], hint: 'Ibukota Paris', reward: 350 },
    { q: 'Negara piramida kuno dan Sungai Nil terpanjang', a: 'mesir', acceptable: ['mesir', 'egypt'], hint: 'Ibukota Kairo', reward: 350 },
    { q: 'Negara Taj Mahal dan populasi terpadat di Asia Selatan', a: 'india', acceptable: ['india'], hint: 'Ibukota New Delhi', reward: 350 },
    { q: 'Negara kanguru dan suku Aborigin di belahan selatan', a: 'australia', acceptable: ['australia', 'ostrali'], hint: 'Ibukota Canberra', reward: 350 }
  ],
  tebakhewan: [
    { q: 'Hewan berkantung yang melompat dan berasal dari Australia', a: 'kanguru', acceptable: ['kanguru', 'kangguru'], hint: 'K _ N G _ R U', reward: 350 },
    { q: 'Burung yang tidak bisa terbang tapi mahir berenang di kutub', a: 'pinguin', acceptable: ['pinguin', 'penguin'], hint: 'P _ N G _ I N', reward: 350 },
    { q: 'Hewan mamalia terbesar di lautan yang bernapas dengan paru-paru', a: 'paus', acceptable: ['paus', 'ikan paus'], hint: 'P _ U S', reward: 300 },
    { q: 'Reptil purba terbesar yang hidup di Nusa Tenggara Timur', a: 'komodo', acceptable: ['komodo'], hint: 'K _ M _ D _', reward: 400 }
  ],
  tebakmakanan: [
    { q: 'Olahan daging sapi khas Minangkabau yang dimasak santan pekat', a: 'rendang', acceptable: ['rendang'], hint: 'Salah satu makanan terenak di dunia', reward: 350 },
    { q: 'Sup daging sapi berwarna hitam pekat khas Jawa Timur', a: 'rawon', acceptable: ['rawon'], hint: 'Warna hitam dari kluwek', reward: 350 },
    { q: 'Nasi khas Timur Tengah yang dimasak dengan rempah kambing', a: 'kebuli', acceptable: ['kebuli', 'nasi kebuli'], hint: 'Nasi Gurih Rempah', reward: 350 },
    { q: 'Kue khas Bandung yang terbuat dari aci digoreng', a: 'cireng', acceptable: ['cireng'], hint: 'Cireng kenyal gurih', reward: 300 }
  ],
  tebakprofesi: [
    { q: 'Bertugas memadamkan kobaran api dan penyelamatan darurat', a: 'pemadam', acceptable: ['pemadam', 'pemadam kebakaran', 'damkar'], hint: 'P _ M _ D _ M kebakaran', reward: 350 },
    { q: 'Mengemudikan pesawat terbang komersial maupun militer', a: 'pilot', acceptable: ['pilot'], hint: 'P _ L _ T', reward: 350 },
    { q: 'Merancang desain dan struktur denah bangunan', a: 'arsitek', acceptable: ['arsitek', 'architect'], hint: 'A R S I T E K', reward: 400 },
    { q: 'Menulis kode program aplikasi dan software komputer', a: 'programmer', acceptable: ['programmer', 'coder', 'developer'], hint: 'P R O G R A M M E R', reward: 400 }
  ],
  tebakkimia: [
    { q: 'Lambang unsur Au pada tabel periodik kimia', a: 'emas', acceptable: ['emas', 'aurum', 'gold'], hint: 'Aurum (Logam mulia berharga)', reward: 400 },
    { q: 'Lambang unsur Fe pada tabel periodik kimia', a: 'besi', acceptable: ['besi', 'ferrum', 'iron'], hint: 'Ferrum (Logam kuat konstruksi)', reward: 400 },
    { q: 'Lambang molekul H2O yang sangat kita butuhkan setiap hari', a: 'air', acceptable: ['air', 'h2o'], hint: 'Zat cair penyegar dahaga', reward: 300 },
    { q: 'Gas yang kita hirup untuk bernapas (O2)', a: 'oksigen', acceptable: ['oksigen', 'o2', 'oxygen'], hint: 'O _ S _ G _ N', reward: 350 }
  ],
  tebaklirik: [
    { q: '"Hati-hati di jalan..." Siapa penyanyi lagu solo pria populer ini?', a: 'tulus', acceptable: ['tulus', 'hati-hati di jalan', 'hati hati di jalan'], hint: 'Penyanyi pria ternama Indonesia (T _ L _ S)', reward: 500 },
    { q: '"Ku menangis... membayangkan betapa kejamnya dirimu..." Judul/Penyanyi lagu ini?', a: 'rossa', acceptable: ['rossa', 'hati yang kau sakiti'], hint: 'Diva Indonesia (R _ S S _)', reward: 500 },
    { q: '"Dan mungkin bila nanti kita kan bersama lagi..." Siapa pelantun lagu ini?', a: 'peterpan', acceptable: ['peterpan', 'noah'], hint: 'Band papan atas Indonesia (P _ T _ R P _ N / N _ A H)', reward: 500 },
    { q: '"Kisah abadi di dalam mimpi..." Siapa penyanyi lagu Komang?', a: 'raim laode', acceptable: ['raim laode', 'raim', 'komang'], hint: 'Komika dan penyanyi asal Wakatobi', reward: 500 }
  ],
  tebaklagu: [
    { q: '"Aku yang dulu bukanlah yang sekarang..." Apa judul lagu komika/penyanyi Tegar ini?', a: 'aku yang dulu', acceptable: ['aku yang dulu', 'tegar'], hint: 'Penyanyi cilik pengamen jalanan viral', reward: 400 },
    { q: '"Entah apa yang merasukimu hingga kau tega menghianatiku..." Siapa penyanyi lagu ini?', a: 'ilux', acceptable: ['ilux', 'salah apa aku'], hint: 'Lagu "Salah Apa Aku"', reward: 400 }
  ],
  tebakdrakor: [
    { q: 'Prajurit Kapten Ri dari Korea Utara jatuh hati pada Yoon Se-ri. Apa judul drakor ini?', a: 'crash landing on you', acceptable: ['crash landing on you', 'cloy'], hint: 'Pemain: Hyun Bin & Son Ye-jin', reward: 500 },
    { q: 'Permainan bertaruh nyawa berhadiah 45.6 miliar won dengan boneka raksasa. Apa judul drakor ini?', a: 'squid game', acceptable: ['squid game', 'squidgame'], hint: 'S _ U I D  G _ M E', reward: 500 }
  ],
  tebakfilm: [
    { q: 'Kisah cinta Jack & Rose di kapal pesiar yang menabrak gunung es. Apa judul film ini?', a: 'titanic', acceptable: ['titanic'], hint: 'T _ T _ N _ C', reward: 500 },
    { q: 'Superhero Marvel bersatu melawan Thanos dan jentikan jari Infinity Gauntlet. Apa judul film ini?', a: 'avengers', acceptable: ['avengers', 'endgame', 'avengers endgame'], hint: 'A V E N G E R S', reward: 500 }
  ],
  tekateki: [
    { q: 'Ada daun tapi bukan pohon, ada halaman tapi bukan rumah. Apakah aku?', a: 'buku', acceptable: ['buku', 'buku bacaan'], hint: 'B _ K U', reward: 400 },
    { q: 'Punya satu mata tapi tidak bisa melihat?', a: 'jarum', acceptable: ['jarum', 'jarum jahit'], hint: 'J _ R _ M', reward: 400 }
  ],
  riddle: [
    { q: 'Aku berbicara tanpa mulut dan mendengar tanpa telinga. Hidup saat ada suara. Siapakah aku?', a: 'gema', acceptable: ['gema', 'echo'], hint: 'Pantulan suara di gua atau tebing', reward: 500 },
    { q: 'Aku bisa mengisi seluruh ruangan tapi tidak memakan tempat sama sekali. Apakah aku?', a: 'cahaya', acceptable: ['cahaya', 'lampu'], hint: 'C _ H _ Y _', reward: 500 }
  ],
  siapakahaku: [
    { q: 'Aku punya jarum tapi tidak bisa menjahit. Aku punya angka tapi tidak bisa berhitung. Siapakah aku?', a: 'jam', acceptable: ['jam', 'jam dinding', 'jam tangan'], hint: 'Penunjuk waktu', reward: 400 },
    { q: 'Aku selalu ada di depanmu, tapi kamu tidak akan pernah bisa melihatku sekarang. Siapakah aku?', a: 'masa depan', acceptable: ['masa depan', 'mase depan'], hint: 'Hari esok', reward: 400 }
  ],
  mct: [
    { q: 'Berapa jumlah obsidian minimum untuk membuat Nether Portal standar?', a: '10', acceptable: ['10', 'sepuluh', '14'], hint: 'Angka antara 8 dan 12', reward: 400 },
    { q: 'Bagaimana cara menjinakkan Ocelot / Kucing liar di Minecraft?', a: 'ikan', acceptable: ['ikan', 'ikan mentah', 'raw cod'], hint: 'Memberi makanan hasil memancing', reward: 400 }
  ]
};

async function handleQuizCommand(ctx: CommandContext, key: string, title: string, emoji: string) {
  const items = QUIZ_DATA[key];
  if (!items || items.length === 0) {
    return ctx.reply(`${emoji} *${title}*\nGame sedang disiapkan.`);
  }

  const chatJid = ctx.m?.key?.remoteJid || ctx.senderJid;
  const userGuess = ctx.text.trim().toLowerCase();

  // If user provided an inline guess with the command e.g. .tebakkata lampu
  if (userGuess) {
    const matched = items.find(item => {
      const allAns = [item.a.toLowerCase(), ...(item.acceptable || []).map(x => x.toLowerCase())];
      return allAns.some(ans => userGuess === ans || userGuess.includes(ans));
    });

    if (matched) {
      const rewardMoney = matched.reward || 400;
      const rewardExp = Math.floor(rewardMoney / 2);
      ctx.user.money = (ctx.user.money || 0) + rewardMoney;
      ctx.user.exp = (ctx.user.exp || 0) + rewardExp;
      await ctx.user.save?.();

      deleteGameSession(chatJid);

      if (ctx.react) await ctx.react('🎉');
      return ctx.reply(
        `🎉 *BENAR SEKALI! JAWABAN TEPAT!* 👏\n\n` +
        `• 🎮 Game: *${title}*\n` +
        `• ✅ Jawaban: *${matched.a.toUpperCase()}*\n` +
        `• 💰 Hadiah: *+${rewardMoney.toLocaleString()} Koin*\n` +
        `• ⭐ Exp: *+${rewardExp} EXP*\n` +
        `• 🏦 Saldo Kamu: *${(ctx.user.money || 0).toLocaleString()} Koin*\n\n` +
        `_Ketik ${ctx.prefix}${ctx.command} untuk teka-teki baru!_`
      );
    } else {
      if (ctx.react) await ctx.react('❌');
      return ctx.reply(
        `❌ *JAWABAN BELUM TEPAT!*\n\n` +
        `Tebakan kamu "*${ctx.text.trim()}*" masih salah.\n` +
        `_Balas pesan ini langsung dengan jawabanmu, atau ketik *pas* / *menyerah*._`
      );
    }
  }

  // Pick random question and REGISTER active session!
  const pick = items[Math.floor(Math.random() * items.length)];

  if (ctx.react) await ctx.react('❓');

  const sentMsg = await ctx.reply(
    `${emoji} *${title.toUpperCase()}*\n\n` +
    `❓ *Pertanyaan:*\n"${pick.q}"\n\n` +
    `💡 *Petunjuk / Clue:* ${pick.hint || 'Tidak ada petunjuk'}\n` +
    `🎁 *Hadiah Menang:* +${pick.reward || 400} Koin, +${Math.floor((pick.reward || 400) / 2)} EXP\n\n` +
    `👉 *Cara Menjawab:*\n` +
    `Cukup *balas / reply* pesan ini langsung dengan jawabanmu!\n` +
    `_Ketik *pas* atau *menyerah* jika tidak tahu jawabannya._`
  );

  setGameSession(chatJid, {
    chatJid,
    gameName: key,
    gameTitle: title,
    question: pick.q,
    answer: pick.a,
    acceptableAnswers: pick.acceptable,
    hint: pick.hint,
    rewardMoney: pick.reward || 400,
    rewardExp: Math.floor((pick.reward || 400) / 2),
    timeoutMs: 120000,
    msgId: sentMsg?.key?.id
  });

  return sentMsg;
}

export const gameCommands: BotCommand[] = [
  {
    name: 'tebakgambar',
    category: 'GAME',
    description: 'Permainan tebak gambar teka-teki visual berhadiah koin',
    usage: '.tebakgambar [jawaban]',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await handleQuizCommand(ctx, 'tebakgambar', 'Tebak Gambar', '🖼️');
    }
  },
  {
    name: 'tebakkata',
    category: 'GAME',
    description: 'Game menebak kata berdasarkan petunjuk huruf',
    usage: '.tebakkata [jawaban]',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await handleQuizCommand(ctx, 'tebakkata', 'Tebak Kata', '🔤');
    }
  },
  {
    name: 'tebakkalimat',
    category: 'GAME',
    description: 'Game menebak kelanjutan kalimat atau peribahasa',
    usage: '.tebakkalimat [jawaban]',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await handleQuizCommand(ctx, 'tebakkalimat', 'Tebak Kalimat', '📝');
    }
  },
  {
    name: 'tebaktebakan',
    aliases: ['tebakan'],
    category: 'GAME',
    description: 'Tebak-tebakan lucu dan menghibur pelepas penat',
    usage: '.tebaktebakan',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const riddles = [
        { q: 'Ban apa yang enak dimakan?', a: 'Bandeng presto! 🐟' },
        { q: 'Gajah apa yang belalainya pendek?', a: 'Gajah yang lagi pilek! 🐘' },
        { q: 'Pintu apa yang didorong sepuluh orang nggak kebuka?', a: 'Pintu yang ada tulisannya TARIK! 🚪' },
        { q: 'Kucing apa yang paling kuno?', a: 'Kucinggalan zaman! 🐱' },
        { q: 'Hewan apa yang paling banyak saudara?', a: 'Katak, katak-beradik! 🐸' }
      ];
      const pick = riddles[Math.floor(Math.random() * riddles.length)];
      await ctx.reply(`🤔 *TEBAK-TEBAKAN LUCU*\n\n*Pertanyaan:* ${pick.q}\n*Jawaban:* ${pick.a}`);
    }
  },
  {
    name: 'caklontong',
    category: 'GAME',
    description: 'Teka-teki logika absurd khas Cak Lontong berhadiah',
    usage: '.caklontong [jawaban]',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await handleQuizCommand(ctx, 'caklontong', 'Kuis Absurd Cak Lontong', '🧠');
    }
  },
  {
    name: 'asahotak',
    category: 'GAME',
    description: 'Game teka-teki pengasah otak dan wawasan',
    usage: '.asahotak [jawaban]',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await handleQuizCommand(ctx, 'asahotak', 'Asah Otak Cerdas', '💡');
    }
  },
  {
    name: 'family100',
    aliases: ['family', 'f100', 'survey100'],
    category: 'GAME',
    description: 'Game survey Family 100 interaktif seru bersama tim',
    usage: '.family100',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const chatJid = ctx.m?.key?.remoteJid || ctx.senderJid;

      // Check if session already exists
      const existing = getFamily100Session(chatJid);
      if (existing) {
        return ctx.reply(
          `⚠️ *SESI FAMILY 100 SEDANG BERLANGSUNG!*\n\n` +
          formatFamily100Board(existing)
        );
      }

      const surveys = [
        {
          q: 'Makanan apa yang sering dibeli saat malam hari?',
          answers: [
            { text: 'Martabak Manis/Telor', points: 52, acceptable: ['martabak', 'martabak manis', 'martabak telor'] },
            { text: 'Nasi Goreng', points: 28, acceptable: ['nasi goreng', 'nasgor'] },
            { text: 'Sate Ayam/Kambing', points: 12, acceptable: ['sate', 'sate ayam', 'sate kambing'] },
            { text: 'Mie Instan/Goreng', points: 8, acceptable: ['mie', 'mie instan', 'indomie', 'mie goreng', 'migoreng'] }
          ]
        },
        {
          q: 'Apa yang dicari orang pertama kali saat bangun tidur?',
          answers: [
            { text: 'HP / Smartphone', points: 68, acceptable: ['hp', 'handphone', 'smartphone', 'ponsel', 'telepon'] },
            { text: 'Air Minum', points: 14, acceptable: ['air', 'air minum', 'air putih', 'minum'] },
            { text: 'Kamar Mandi / Toilet', points: 11, acceptable: ['kamar mandi', 'wc', 'toilet'] },
            { text: 'Kacamata', points: 7, acceptable: ['kacamata', 'kaca mata'] }
          ]
        },
        {
          q: 'Sebab apa orang sering terlambat masuk kerja/sekolah?',
          answers: [
            { text: 'Bangun Kesiangan', points: 55, acceptable: ['kesiangan', 'bangun kesiangan', 'telat bangun', 'tidur kesiangan'] },
            { text: 'Jalanan Macet', points: 25, acceptable: ['macet', 'jalanan macet', 'kemacetan'] },
            { text: 'Ban Motor/Mobil Bocor', points: 12, acceptable: ['ban bocor', 'ban kempes', 'ban pecah', 'bocor'] },
            { text: 'Hujan Deras', points: 8, acceptable: ['hujan', 'hujan deras'] }
          ]
        },
        {
          q: 'Barang apa yang sering tertinggal di rumah saat bepergian?',
          answers: [
            { text: 'Dompet / Kartu', points: 42, acceptable: ['dompet', 'kartu'] },
            { text: 'HP / Smartphone', points: 35, acceptable: ['hp', 'handphone', 'smartphone', 'ponsel'] },
            { text: 'Kunci Rumah/Motor', points: 15, acceptable: ['kunci', 'kunci rumah', 'kunci motor'] },
            { text: 'Charger / Powerbank', points: 8, acceptable: ['charger', 'casan', 'powerbank'] }
          ]
        },
        {
          q: 'Tempat apa yang paling sering dikunjungi saat akhir pekan?',
          answers: [
            { text: 'Mall / Pusat Perbelanjaan', points: 48, acceptable: ['mall', 'mol', 'pusat perbelanjaan'] },
            { text: 'Bioskop / Nonton Movie', points: 26, acceptable: ['bioskop', 'nonton', 'cinema'] },
            { text: 'Kafe / Tempat Nongkrong', points: 16, acceptable: ['kafe', 'cafe', 'tempat nongkrong', 'restoran'] },
            { text: 'Taman / Tempat Wisata', points: 10, acceptable: ['taman', 'wisata', 'pantai'] }
          ]
        }
      ];

      const pick = surveys[Math.floor(Math.random() * surveys.length)];
      const initialAnswers = pick.answers.map(a => ({
        ...a,
        revealed: false
      }));

      const session = setFamily100Session(chatJid, {
        chatJid,
        question: pick.q,
        answers: initialAnswers,
        timeoutMs: 180000
      });

      if (ctx.react) await ctx.react('👨‍👩‍👧‍👦');

      const msg = await ctx.reply(formatFamily100Board(session));
      if (msg?.key?.id) {
        session.msgId = msg.key.id;
      }
      return msg;
    }
  },
  {
    name: 'susunkata',
    category: 'GAME',
    description: 'Menyusun huruf acak menjadi kata baku yang tepat',
    usage: '.susunkata [jawaban]',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const words = [
        { scrambled: 'K - A - B - I - S - E - T - O', correct: 'sepakbola', clue: 'Olahraga terpopuler dunia' },
        { scrambled: 'P - U - K - A - O - M - E - T - R', correct: 'komputer', clue: 'Perangkat teknologi digital' },
        { scrambled: 'D - N - E - O - I - S - I - A', correct: 'indonesia', clue: 'Negara kepulauan zamrud khatulistiwa' }
      ];
      const chatJid = ctx.m?.key?.remoteJid || ctx.senderJid;
      const userGuess = ctx.text.trim().toLowerCase().replace(/\s+/g, '');
      if (userGuess) {
        const found = words.find(w => w.correct === userGuess);
        if (found) {
          ctx.user.money = (ctx.user.money || 0) + 400;
          await ctx.user.save?.();
          deleteGameSession(chatJid);
          return ctx.reply(`🎉 *BENAR!* Huruf terangkai menjadi *${found.correct.toUpperCase()}*. Mendapatkan +400 Koin!`);
        } else {
          return ctx.reply(`❌ Masih kurang tepat! Coba susun ulang kembali.`);
        }
      }

      const pick = words[Math.floor(Math.random() * words.length)];
      const sentMsg = await ctx.reply(
        `🔠 *SUSUN KATA*\n\n` +
        `Acakan Huruf: [ *${pick.scrambled}* ]\n` +
        `Clue: ${pick.clue}\n\n` +
        `Balas / reply pesan ini langsung dengan jawabanmu!\n` +
        `_Atau ketik pas / menyerah untuk menyerah._`
      );

      setGameSession(chatJid, {
        chatJid,
        gameName: 'susunkata',
        gameTitle: 'Susun Kata',
        question: `Acakan Huruf: [ ${pick.scrambled} ]`,
        answer: pick.correct,
        hint: pick.clue,
        rewardMoney: 400,
        rewardExp: 200,
        timeoutMs: 120000,
        msgId: sentMsg?.key?.id
      });
    }
  },
  {
    name: 'kataacak',
    category: 'GAME',
    description: 'Game tebak kata yang diacak posisinya',
    usage: '.kataacak [jawaban]',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const anagrams = [
        { scrambled: 'R - E - T - B - A - I', a: 'berita', hint: 'Kabar aktual di koran/media' },
        { scrambled: 'L - A - T - O - H - S', a: 'sholat', hint: 'Ibadah wajib umat Islam' }
      ];
      const chatJid = ctx.m?.key?.remoteJid || ctx.senderJid;
      const userGuess = ctx.text.trim().toLowerCase();
      if (userGuess) {
        const matched = anagrams.find(a => a.a === userGuess);
        if (matched) {
          ctx.user.money = (ctx.user.money || 0) + 300;
          await ctx.user.save?.();
          deleteGameSession(chatJid);
          return ctx.reply(`🎉 *BENAR!* Kata yang benar adalah *${matched.a.toUpperCase()}*. +300 Koin!`);
        }
      }
      const pick = anagrams[Math.floor(Math.random() * anagrams.length)];
      const sentMsg = await ctx.reply(
        `🔀 *KATA ACAK*\n\n` +
        `Huruf: *${pick.scrambled}*\n` +
        `Petunjuk: ${pick.hint}\n\n` +
        `Balas / reply pesan ini langsung dengan jawabanmu!`
      );

      setGameSession(chatJid, {
        chatJid,
        gameName: 'kataacak',
        gameTitle: 'Kata Acak',
        question: `Huruf: ${pick.scrambled}`,
        answer: pick.a,
        hint: pick.hint,
        rewardMoney: 300,
        rewardExp: 150,
        timeoutMs: 120000,
        msgId: sentMsg?.key?.id
      });
    }
  },
  {
    name: 'tictactoe',
    aliases: ['ttt'],
    category: 'GAME',
    description: 'Permainan papan Tic-Tac-Toe bersama lawan',
    usage: '.tictactoe [1-9]',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const pos = parseInt(ctx.text.trim(), 10);
      if (!isNaN(pos) && pos >= 1 && pos <= 9) {
        return ctx.reply(
          `❌⭕ *TIC TAC TOE*\n\n` +
          `Kamu meletakkan ❌ di kotak *${pos}*!\n` +
          `🤖 Bot meletakkan ⭕ di kotak *${pos === 5 ? 1 : 5}*.\n\n` +
          `Permainan berlangsung sengit! Ketik *${ctx.prefix}tictactoe <1-9>* untuk langkah berikutnya.`
        );
      }
      await ctx.reply(
        `❌⭕ *TIC TAC TOE*\n\n` +
        ` 1 | 2 | 3 \n` +
        `---+---+---\n` +
        ` 4 | 5 | 6 \n` +
        `---+---+---\n` +
        ` 7 | 8 | 9 \n\n` +
        `Pilih nomor kotak untuk memulai langkahmu!\n` +
        `Contoh: *${ctx.prefix}tictactoe 5*`
      );
    }
  },
  {
    name: 'ulartangga',
    category: 'GAME',
    description: 'Permainan papan Ular Tangga virtual dengan lemparan dadu',
    usage: '.ulartangga',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const dice = Math.floor(Math.random() * 6) + 1;
      const diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
      const reward = dice * 50;
      ctx.user.money = (ctx.user.money || 0) + reward;
      await ctx.user.save?.();

      const events = [
        '🎉 Menemukan Tangga! Kamu naik 10 langkah cepat!',
        '🐍 Menemui Ekor Ular! Beruntung kamu berhasil menghindar!',
        '💎 Menemukan Peti Harta Karun di kotak langkah!'
      ];
      const randomEvent = events[Math.floor(Math.random() * events.length)];

      await ctx.reply(
        `🎲 *ULAR TANGGA ARENA*\n\n` +
        `• 🎲 Lemparan Dadu: *${diceEmojis[dice - 1]} (${dice})*\n` +
        `• 🏃 Langkah Pion: Bergerak maju *${dice} kotak*\n` +
        `• 🌟 Peristiwa: ${randomEvent}\n` +
        `• 💰 Hadiah Langkah: *+${reward} Koin*\n\n` +
        `_Ketik ${ctx.prefix}ulartangga lagi untuk melanjutkan langkahmu!_`
      );
    }
  },
  {
    name: 'tebakbendera',
    category: 'GAME',
    description: 'Tebak bendera negara-negara di dunia berhadiah koin',
    usage: '.tebakbendera [nama negara]',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await handleQuizCommand(ctx, 'tebakbendera', 'Tebak Bendera Dunia', '🚩');
    }
  },
  {
    name: 'tebaknegara',
    category: 'GAME',
    description: 'Tebak nama negara dari ciri khas atau ibukota',
    usage: '.tebaknegara [jawaban]',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await handleQuizCommand(ctx, 'tebaknegara', 'Tebak Nama Negara', '🌍');
    }
  },
  {
    name: 'tebakhewan',
    category: 'GAME',
    description: 'Tebak nama hewan berdasarkan ciri fisik atau habitatnya',
    usage: '.tebakhewan [jawaban]',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await handleQuizCommand(ctx, 'tebakhewan', 'Tebak Hewan', '🦁');
    }
  },
  {
    name: 'tebakmakanan',
    category: 'GAME',
    description: 'Tebak nama kuliner nusantara dan hidangan dunia',
    usage: '.tebakmakanan [jawaban]',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await handleQuizCommand(ctx, 'tebakmakanan', 'Tebak Kuliner', '🍲');
    }
  },
  {
    name: 'tebakprofesi',
    category: 'GAME',
    description: 'Tebak pekerjaan dan profesi dari tugas utamanya',
    usage: '.tebakprofesi [jawaban]',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await handleQuizCommand(ctx, 'tebakprofesi', 'Tebak Profesi', '👮');
    }
  },
  {
    name: 'tebaklagu',
    category: 'GAME',
    description: 'Tebak judul lagu dari potongan lirik hits',
    usage: '.tebaklagu [jawaban]',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await handleQuizCommand(ctx, 'tebaklagu', 'Tebak Judul Lagu', '🎶');
    }
  },
  {
    name: 'tebaklirik',
    category: 'GAME',
    description: 'Lanjutkan potongan lirik lagu terkenal',
    usage: '.tebaklirik [jawaban]',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await handleQuizCommand(ctx, 'tebaklirik', 'Tebak Lirik Lagu', '🎤');
    }
  },
  {
    name: 'tebakdrakor',
    category: 'GAME',
    description: 'Tebak judul drama korea terpopuler',
    usage: '.tebakdrakor [jawaban]',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await handleQuizCommand(ctx, 'tebakdrakor', 'Tebak Drama Korea', '🎬');
    }
  },
  {
    name: 'tebakfilm',
    category: 'GAME',
    description: 'Tebak judul film box office dunia',
    usage: '.tebakfilm [jawaban]',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await handleQuizCommand(ctx, 'tebakfilm', 'Tebak Film Box Office', '🍿');
    }
  },
  {
    name: 'tebakkimia',
    category: 'GAME',
    description: 'Tebak lambang unsur tabel periodik kimia berhadiah',
    usage: '.tebakkimia [jawaban]',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await handleQuizCommand(ctx, 'tebakkimia', 'Tebak Unsur Kimia', '🧪');
    }
  },
  {
    name: 'tekateki',
    category: 'GAME',
    description: 'Teka-teki silang santai dan logika',
    usage: '.tekateki [jawaban]',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await handleQuizCommand(ctx, 'tekateki', 'Teka-Teki Logika', '🧩');
    }
  },
  {
    name: 'riddle',
    category: 'GAME',
    description: 'Teka-teki misteri pemecah teka-teki logika tinggi',
    usage: '.riddle [jawaban]',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await handleQuizCommand(ctx, 'riddle', 'Riddle Misteri', '🕵️');
    }
  },
  {
    name: 'siapakahaku',
    category: 'GAME',
    description: 'Tebak identitas objek benda atau fenomena alam',
    usage: '.siapakahaku [jawaban]',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await handleQuizCommand(ctx, 'siapakahaku', 'Siapakah Aku', '❓');
    }
  },
  {
    name: 'kyubigame',
    category: 'GAME',
    description: 'Game minigame rubik kubus mini dan hadiah koin',
    usage: '.kyubigame',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const bonus = Math.floor(Math.random() * 500) + 200;
      ctx.user.money = (ctx.user.money || 0) + bonus;
      await ctx.user.save?.();
      await ctx.reply(
        `🧊 *KYUBI RUBIK MINIGAME*\n\n` +
        `🟧🟩🟦\n` +
        `🟨⬜🟥 ➔ 🟩🟩🟩 (SOLVED!)\n` +
        `⬜🟦🟨\n\n` +
        `🎉 Kamu berhasil menyelesaikan Rubik 3x3 dalam waktu 45 detik!\n` +
        `🎁 Hadiah: *+${bonus} Koin*`
      );
    }
  },
  {
    name: 'mct',
    category: 'GAME',
    description: 'Minecraft Trivia Challenge Quiz',
    usage: '.mct [jawaban]',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await handleQuizCommand(ctx, 'mct', 'Minecraft Trivia', '⛏️');
    }
  },
  {
    name: 'dungeon',
    category: 'GAME',
    description: 'Eksplorasi dungeon instan berhadiah item dan koin',
    usage: '.dungeon',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      const monsters = ['Gorgon Golem', 'Skeleton King', 'Shadow Demon', 'Dragon Whelp'];
      const lootMoney = Math.floor(Math.random() * 1500) + 800;
      const lootExp = Math.floor(lootMoney / 2);
      const monster = monsters[Math.floor(Math.random() * monsters.length)];

      ctx.user.money = (ctx.user.money || 0) + lootMoney;
      ctx.user.exp = (ctx.user.exp || 0) + lootExp;
      await ctx.user.save?.();

      await ctx.reply(
        `⚔️ *DUNGEON RAID EXPEDITION*\n\n` +
        `• 🏰 Lantai: *Lantai 7 Kastil Terkutuk*\n` +
        `• 👹 Monster Ditemui: *${monster}*\n` +
        `• 💥 Hasil Pertarungan: *Kemenangan Telak! Boss dikalahkan!*\n` +
        `• 💰 Hadiah Koin: *+${lootMoney.toLocaleString()} Koin*\n` +
        `• ⭐ Bonus EXP: *+${lootExp} EXP*\n\n` +
        `_Ketik ${ctx.prefix}rpg untuk fitur petualangan RPG lebih mendalam._`
      );
    }
  }
];
