/**
 * WhatsApp Message Formatter
 * Provides stylish, clean, and consistent messaging across all bot commands.
 */

import { config } from '../config.ts';

export function formatHeader(title: string): string {
  return `╭───「 *${title.toUpperCase()}* 」\n`;
}

export function formatFooter(): string {
  return `\n╰───「 *${config.botName}* 」`;
}

export function formatBox(title: string, content: string): string {
  return `${formatHeader(title)}${content}${formatFooter()}`;
}

export function formatSuccess(message: string): string {
  return `✨ *BERHASIL*\n${message}`;
}

export function formatError(message: string): string {
  return `❌ *TERJADI KESALAHAN*\n${message}\n\n_Silakan coba lagi beberapa saat lagi atau hubungi owner._`;
}

export function formatWarning(message: string): string {
  return `⚠️ *PERINGATAN*\n${message}`;
}

export function formatInfo(message: string): string {
  return `ℹ️ *INFORMASI*\n${message}`;
}

export function formatLoading(activity: string): string {
  return `⏳ *MOHON TUNGGU*\nSedang memproses ${activity}...`;
}
