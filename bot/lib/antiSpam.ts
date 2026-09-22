/**
 * Anti-Spam, Rate Limiter & Cooldown Manager
 * Prevents account bans and protects against command flooding.
 */

import { config } from '../config.ts';

// Command execution timestamps: key = `${jid}_${command}`
const commandCooldowns = new Map<string, number>();

// User last message timestamp for global message spacing
const userLastMessage = new Map<string, number>();

// Heavy commands with custom cooldowns (in milliseconds)
const HEAVY_COOLDOWNS: Record<string, number> = {
  ai: 4000,
  gpt4o: 5000,
  gemini: 4000,
  text2img: 10000,
  tiktok: 6000,
  ytmp3: 6000,
  ytmp4: 6000,
  instagramdl: 6000,
  ssweb: 5000,
  hd: 8000
};

export interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  waitSec?: number;
}

export function checkRateLimit(jid: string, commandName: string, isPremium: boolean = false): RateLimitResult {
  const now = Date.now();
  const cleanJid = jid.split('@')[0];

  // Global user delay check (anti-flood)
  const lastMsg = userLastMessage.get(cleanJid) || 0;
  const globalDelay = config.rateLimitDelay; // e.g. 1500ms
  if (!isPremium && now - lastMsg < globalDelay) {
    const wait = Math.ceil((globalDelay - (now - lastMsg)) / 1000);
    return {
      allowed: false,
      reason: `Jangan spam! Tunggu ${wait} detik sebelum mengirim command lagi.`,
      waitSec: wait
    };
  }

  // Specific command cooldown check
  const cdKey = `${cleanJid}_${commandName}`;
  const lastExec = commandCooldowns.get(cdKey) || 0;
  const requiredCooldown = HEAVY_COOLDOWNS[commandName] || (isPremium ? 1000 : 2000);

  if (now - lastExec < requiredCooldown) {
    const wait = Math.ceil((requiredCooldown - (now - lastExec)) / 1000);
    return {
      allowed: false,
      reason: `Command *${commandName}* memiliki cooldown! Mohon tunggu ${wait} detik.`,
      waitSec: wait
    };
  }

  // Update timestamps
  userLastMessage.set(cleanJid, now);
  commandCooldowns.set(cdKey, now);

  return { allowed: true };
}

export function clearCooldowns() {
  commandCooldowns.clear();
  userLastMessage.clear();
}
