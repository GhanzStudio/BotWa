/**
 * Fuzzy Command Typo Corrector Engine
 * Advanced Damerau-Levenshtein & String Similarity Algorithm
 */

// Calculate Damerau-Levenshtein distance (handles insertions, deletions, substitutions, and transpositions)
export function damerauLevenshteinDistance(a: string, b: string): number {
  const lenA = a.length;
  const lenB = b.length;

  if (lenA === 0) return lenB;
  if (lenB === 0) return lenA;

  const matrix: number[][] = Array(lenA + 1).fill(null).map(() => Array(lenB + 1).fill(0));

  for (let i = 0; i <= lenA; i++) matrix[i][0] = i;
  for (let j = 0; j <= lenB; j++) matrix[0][j] = j;

  for (let i = 1; i <= lenA; i++) {
    for (let j = 1; j <= lenB; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,       // Deletion
        matrix[i][j - 1] + 1,       // Insertion
        matrix[i - 1][j - 1] + cost  // Substitution
      );

      // Transposition check (swapped adjacent letters)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + cost);
      }
    }
  }

  return matrix[lenA][lenB];
}

// Calculate similarity score between 0.0 and 1.0
export function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  if (s1 === s2) return 1.0;

  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1.0;

  const dist = damerauLevenshteinDistance(s1, s2);
  let score = 1.0 - dist / maxLen;

  // Prefix bonus if both strings start with the same characters
  if (s1.length >= 2 && s2.length >= 2 && s1.substring(0, 2) === s2.substring(0, 2)) {
    score += 0.15;
  }

  // Containment bonus if one string includes another
  if (s1.includes(s2) || s2.includes(s1)) {
    score += 0.2;
  }

  return Math.min(1.0, score);
}

export interface SuggestionResult {
  bestMatch: string;
  score: number;
  alternatives: string[];
}

// Default list of command names for client-side fallback
const DEFAULT_COMMANDS = [
  'menu', 'allmenu', 'profile', 'donasi', 'qris', 'cekqris', 'rules', 'sc', 'ping', 'owner',
  'ai', 'gemini', 'gpt4o', 'deepseek', 'text2img', 'musicmaker',
  'tiktok', 'ttmp3', 'ttmp4', 'ytmp3', 'ytmp4', 'instagramdl', 'spotifydl', 'facebookdl',
  'igstalk', 'githubstalk', 'tiktokstalk', 'ytstalk', 'npmstalk', 'discordstalk', 'countrystalk', 'wastalk', 'ipstalk', 'megastalk', 'mlstalk', 'ffstalk',
  'hd', 'removebg', 'ssweb', 'ocr', 'nulis', 'qrlok', 'qrloklogs', 'qrcode',
  'buatquotes', 'fakecall', 'igstory', 'kalender', 'balogo', 'sroast', 'rankcard', 'welcomecard', 'sertifikat',
  'hidetag', 'tagall', 'kick', 'promote', 'demote', 'open', 'close', 'linkgc',
  'tebakgambar', 'tebakkata', 'tebaklagu', 'caklontong', 'tictactoe', 'ulartangga',
  'bc', 'addprem', 'delprem', 'addlimit', 'addkoin', 'ban', 'unban', 'setprefix'
];

// Find closest command or alias suggestions for a typed input
export function findClosestCommand(input: string, customCandidates?: Array<{ name: string; aliases?: string[] }>, threshold = 0.45): SuggestionResult | null {
  const cleanInput = input.trim().toLowerCase();
  if (!cleanInput) return null;

  const candidatesMap = new Map<string, string>(); // key: candidate, value: primaryName

  if (customCandidates && customCandidates.length > 0) {
    for (const cmd of customCandidates) {
      candidatesMap.set(cmd.name.toLowerCase(), cmd.name);
      if (cmd.aliases) {
        for (const alias of cmd.aliases) {
          candidatesMap.set(alias.toLowerCase(), cmd.name);
        }
      }
    }
  } else {
    for (const cmdName of DEFAULT_COMMANDS) {
      candidatesMap.set(cmdName.toLowerCase(), cmdName);
    }
  }

  const scored: { name: string; primaryName: string; score: number }[] = [];

  for (const [candidate, primaryName] of candidatesMap.entries()) {
    const similarity = calculateSimilarity(cleanInput, candidate);
    if (similarity >= threshold) {
      scored.push({ name: candidate, primaryName, score: similarity });
    }
  }

  scored.sort((a, b) => b.score - a.score);

  if (scored.length === 0) return null;

  const best = scored[0];
  const uniqueAlternatives: string[] = [];

  for (const item of scored) {
    if (item.primaryName !== best.primaryName && !uniqueAlternatives.includes(item.primaryName)) {
      uniqueAlternatives.push(item.primaryName);
      if (uniqueAlternatives.length >= 2) break;
    }
  }

  return {
    bestMatch: best.primaryName,
    score: best.score,
    alternatives: uniqueAlternatives
  };
}
