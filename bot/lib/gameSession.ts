/**
 * Interactive Minigame Session Manager
 * Automatically catches user replies & non-prefix chats when a minigame is active.
 */

export interface ActiveGameSession {
  chatJid: string;
  gameName: string;
  gameTitle: string;
  question: string;
  answer: string; // lowercase correct answer
  acceptableAnswers?: string[];
  hint?: string;
  rewardMoney: number;
  rewardExp: number;
  startTime: number;
  timeoutMs: number;
  timerId?: any;
  msgId?: string; // Stored message ID of the game question
}

export interface Family100AnswerItem {
  text: string;
  points: number;
  acceptable: string[];
  revealed: boolean;
  guessedBy?: string;
}

export interface Family100Session {
  chatJid: string;
  question: string;
  answers: Family100AnswerItem[];
  startTime: number;
  timeoutMs: number;
  timerId?: any;
  msgId?: string;
}

const activeSessions = new Map<string, ActiveGameSession>();
const activeFamily100Sessions = new Map<string, Family100Session>();

function cleanJid(jid: string): string {
  if (!jid) return '';
  return jid.split(':')[0].trim();
}

export function setGameSession(chatJid: string, sessionData: Omit<ActiveGameSession, 'startTime'>): ActiveGameSession {
  const normJid = cleanJid(chatJid);

  const existing = activeSessions.get(normJid) || activeSessions.get(chatJid);
  if (existing && existing.timerId) {
    clearTimeout(existing.timerId);
  }

  const session: ActiveGameSession = {
    ...sessionData,
    chatJid: normJid,
    startTime: Date.now()
  };

  session.timerId = setTimeout(() => {
    activeSessions.delete(normJid);
    if (chatJid !== normJid) activeSessions.delete(chatJid);
  }, sessionData.timeoutMs || 120000);

  activeSessions.set(normJid, session);
  if (chatJid && chatJid !== normJid) {
    activeSessions.set(chatJid, session);
  }
  return session;
}

export function getGameSession(chatJid: string): ActiveGameSession | undefined {
  if (!chatJid) return undefined;
  const normJid = cleanJid(chatJid);
  return activeSessions.get(normJid) || activeSessions.get(chatJid);
}

export function deleteGameSession(chatJid: string): void {
  if (!chatJid) return;
  const normJid = cleanJid(chatJid);
  const existing = activeSessions.get(normJid) || activeSessions.get(chatJid);
  if (existing && existing.timerId) {
    clearTimeout(existing.timerId);
  }
  activeSessions.delete(normJid);
  activeSessions.delete(chatJid);
}

// Family 100 Session Handlers
export function setFamily100Session(chatJid: string, sessionData: Omit<Family100Session, 'startTime'>): Family100Session {
  const normJid = cleanJid(chatJid);

  const existing = activeFamily100Sessions.get(normJid) || activeFamily100Sessions.get(chatJid);
  if (existing && existing.timerId) {
    clearTimeout(existing.timerId);
  }

  const session: Family100Session = {
    ...sessionData,
    chatJid: normJid,
    startTime: Date.now()
  };

  session.timerId = setTimeout(() => {
    activeFamily100Sessions.delete(normJid);
    if (chatJid !== normJid) activeFamily100Sessions.delete(chatJid);
  }, sessionData.timeoutMs || 180000);

  activeFamily100Sessions.set(normJid, session);
  if (chatJid && chatJid !== normJid) {
    activeFamily100Sessions.set(chatJid, session);
  }
  return session;
}

export function getFamily100Session(chatJid: string): Family100Session | undefined {
  if (!chatJid) return undefined;
  const normJid = cleanJid(chatJid);
  return activeFamily100Sessions.get(normJid) || activeFamily100Sessions.get(chatJid);
}

export function deleteFamily100Session(chatJid: string): void {
  if (!chatJid) return;
  const normJid = cleanJid(chatJid);
  const existing = activeFamily100Sessions.get(normJid) || activeFamily100Sessions.get(chatJid);
  if (existing && existing.timerId) {
    clearTimeout(existing.timerId);
  }
  activeFamily100Sessions.delete(normJid);
  activeFamily100Sessions.delete(chatJid);
}

export function formatFamily100Board(session: Family100Session): string {
  let board = `👨‍👩‍👧‍👦 *FAMILY 100 SURVEY*\n\n`;
  board += `📋 *Pertanyaan:* "${session.question}"\n\n`;
  board += `🏆 *Papan Jawaban Survei:*\n`;

  session.answers.forEach((item, idx) => {
    if (item.revealed) {
      board += `${idx + 1}. *${item.text}* (${item.points} poin) ✅ _(@${item.guessedBy || 'Pemain'})_\n`;
    } else {
      board += `${idx + 1}. ❓ [________________________]\n`;
    }
  });

  const remaining = session.answers.filter(a => !a.revealed).length;
  if (remaining > 0) {
    board += `\n💡 *Sisa Jawaban Belum Tertebak:* ${remaining} jawaban\n`;
    board += `👉 *Cara Menjawab:* Ketik tebakanmu atau reply pesan ini!\n`;
    board += `_Ketik *pas* atau *menyerah* untuk membuka semua jawaban._`;
  } else {
    board += `\n🎉 *SELAMAT! SEMUA JAWABAN TELAH TERTEBAK!* 👏`;
  }

  return board;
}

const SURRENDER_WORDS = [
  'ga tau', 'gak tau', 'nggak tau', 'ngak tau', 'tidak tahu', 'tidak tau',
  'pas', 'menyerah', 'surrender', 'skip', 'nyerah', 'gatau', 'gk tau', 'ndak tau',
  'gaktahu', 'nggaktahu', 'ndaktau'
];

export async function checkAndHandleGameAnswer(
  chatJid: string,
  rawText: string,
  user: any,
  reply: (msg: string) => Promise<any>,
  react?: (emoji: string) => Promise<any>,
  quotedInfo?: {
    isQuotedReply?: boolean;
    quotedStanzaId?: string;
    quotedParticipant?: string;
    quotedText?: string;
    botJid?: string;
  }
): Promise<boolean> {
  const normJid = cleanJid(chatJid);

  // 1. Handle Family 100 Session
  const f100 = getFamily100Session(normJid);
  if (f100) {
    const text = rawText.trim().toLowerCase().replace(/^[.#!]/, '');
    const cleanText = text.replace(/[.,!?\-_]/g, '').trim();

    if (!cleanText) return false;

    // Check surrender
    const isSurrender = SURRENDER_WORDS.some(w => cleanText === w || cleanText.startsWith(w));
    if (isSurrender) {
      f100.answers.forEach(a => { a.revealed = true; });
      if (react) await react('🏳️');
      await reply(
        `❌ *PERMAINAN FAMILY 100 DIAKHIRI!* 🏳️\n\n` +
        formatFamily100Board(f100)
      );
      deleteFamily100Session(normJid);
      return true;
    }

    // Check answers
    let matchedItem: Family100AnswerItem | undefined;
    let alreadyRevealed = false;

    for (const item of f100.answers) {
      const candidates = [item.text.toLowerCase(), ...item.acceptable.map(a => a.toLowerCase())];
      const match = candidates.some(cand => {
        const cleanCand = cand.replace(/[.,!?\-_]/g, '').trim();
        return cleanText === cleanCand || (cleanCand.length >= 3 && cleanText.includes(cleanCand));
      });

      if (match) {
        if (item.revealed) {
          alreadyRevealed = true;
          matchedItem = item;
          break;
        } else {
          item.revealed = true;
          item.guessedBy = user?.name || 'Pemain';
          matchedItem = item;
          break;
        }
      }
    }

    if (matchedItem) {
      if (alreadyRevealed) {
        if (react) await react('⚠️');
        await reply(`⚠️ Jawaban "*${rawText.trim()}*" (*${matchedItem.text}*) sudah tertebak sebelumnya!`);
        return true;
      }

      // Award money & exp based on points
      const rewardMoney = matchedItem.points * 15;
      const rewardExp = matchedItem.points * 8;
      if (user) {
        user.money = (user.money || 0) + rewardMoney;
        user.exp = (user.exp || 0) + rewardExp;
        await user.save?.();
      }

      if (react) await react('🎉');

      const allRevealed = f100.answers.every(a => a.revealed);
      if (allRevealed) {
        await reply(
          `🎉 *JAWABAN TEPAT! (+${rewardMoney} Koin)* 👏\n\n` +
          formatFamily100Board(f100) + `\n\n` +
          `🏆 *Seluruh survei telah diselesaikan dengan sempurna!*`
        );
        deleteFamily100Session(normJid);
      } else {
        await reply(
          `🎯 *TEBAKAN TEPAT!* 👏\n` +
          `• Jawaban: *${matchedItem.text}* (${matchedItem.points} poin)\n` +
          `• Hadiah: *+${rewardMoney} Koin, +${rewardExp} EXP*\n\n` +
          formatFamily100Board(f100)
        );
      }
      return true;
    }

    // Direct reply incorrect
    if (quotedInfo?.isQuotedReply) {
      if (react) await react('❌');
      await reply(
        `❌ *TEBAKAN BELUM ADA DI SURVEI!*\n\n` +
        `Jawaban "*${rawText.trim()}*" belum tepat.\n` +
        `_Coba tebak jawaban lain atau ketik *pas* / *menyerah*._`
      );
      return true;
    }
  }

  // 2. Handle Standard Single Quiz Session
  const session = getGameSession(normJid);
  if (!session) return false;

  const text = rawText.trim().toLowerCase().replace(/^[.#!]/, '');
  if (!text) return false;

  const cleanText = text.replace(/[.,!?\-_]/g, '').trim();

  // Check surrender
  const isSurrender = SURRENDER_WORDS.some(w => cleanText === w || cleanText.startsWith(w));
  if (isSurrender) {
    if (react) await react('🏳️');
    await reply(
      `❌ *KAMU MENYERAH!* 🏳️\n\n` +
      `• 🎮 Game: *${session.gameTitle}*\n` +
      `• 🔑 Jawaban yang Benar: *${session.answer.toUpperCase()}*\n\n` +
      `_Game telah diakhiri. Ketik .${session.gameName} untuk memulai kuis baru!_`
    );
    deleteGameSession(normJid);
    return true;
  }

  // Normalize correct answers
  const rawAnswers = [
    session.answer.toLowerCase(),
    ...(session.acceptableAnswers || []).map(a => a.toLowerCase())
  ];
  const cleanAnswers = rawAnswers.map(a => a.replace(/[.,!?\-_]/g, '').trim());

  // Check if answer matches
  const isCorrect = cleanAnswers.some(ans => 
    cleanText === ans || 
    (ans.length >= 3 && (cleanText === ans || cleanText.includes(ans) || ans.includes(cleanText)))
  );

  if (isCorrect) {
    const rewardMoney = session.rewardMoney || 400;
    const rewardExp = session.rewardExp || Math.floor(rewardMoney / 2);

    if (user) {
      user.money = (user.money || 0) + rewardMoney;
      user.exp = (user.exp || 0) + rewardExp;
      await user.save?.();
    }

    if (react) await react('🎉');
    await reply(
      `🎉 *SELAMAT! JAWABAN KAMU BENAR!* 👏\n\n` +
      `• 🎮 Game: *${session.gameTitle}*\n` +
      `• 👤 Pemain: *${user?.name || 'User'}*\n` +
      `• ✅ Jawaban: *${session.answer.toUpperCase()}*\n` +
      `• 💰 Hadiah: *+${rewardMoney.toLocaleString()} Koin*\n` +
      `• ⭐ EXP: *+${rewardExp} EXP*\n` +
      `• 🏦 Saldo Kamu: *${(user?.money || 0).toLocaleString()} Koin*\n\n` +
      `_Game diselesaikan! Ketik .${session.gameName} untuk soal berikutnya._`
    );
    deleteGameSession(normJid);
    return true;
  }

  // Verify direct reply
  let isDirectReplyToGame = false;
  if (quotedInfo?.isQuotedReply) {
    if (session.msgId && quotedInfo.quotedStanzaId) {
      isDirectReplyToGame = session.msgId === quotedInfo.quotedStanzaId;
    } else {
      const isFromBot = Boolean(
        quotedInfo.botJid &&
        quotedInfo.quotedParticipant &&
        quotedInfo.quotedParticipant.includes(quotedInfo.botJid)
      );

      const containsGamePrompt = Boolean(
        quotedInfo.quotedText && (
          quotedInfo.quotedText.includes('Pertanyaan:') ||
          quotedInfo.quotedText.includes('Petunjuk / Clue:') ||
          quotedInfo.quotedText.includes('Cara Menjawab:') ||
          quotedInfo.quotedText.includes(session.question)
        )
      );

      isDirectReplyToGame = isFromBot || containsGamePrompt;
    }
  }

  if (isDirectReplyToGame) {
    if (react) await react('❌');
    await reply(
      `❌ *JAWABAN BELUM TEPAT!*\n\n` +
      `Tebakan "*${rawText.trim()}*" masih salah.\n` +
      `💡 *Petunjuk / Clue:* ${session.hint || 'Tidak ada petunjuk'}\n\n` +
      `_Balas pesan ini lagi dengan jawabanmu, atau ketik *pas* / *menyerah*._`
    );
    return true;
  }

  return false;
}
