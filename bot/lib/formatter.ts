/**
 * WhatsApp Message Formatter
 * Provides stylish, clean, and consistent messaging across all bot commands.
 */

import { config } from '../config.ts';

export function getIndonesianTime(date: Date = new Date()): string {
  return date.toLocaleTimeString('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }) + ' WIB';
}

export function getIndonesianDate(date: Date = new Date()): string {
  return date.toLocaleDateString('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export function getIndonesianDateTime(date: Date = new Date()): string {
  return `${getIndonesianDate(date)} - ${getIndonesianTime(date)}`;
}

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

/**
 * Transforms AI raw outputs into ultra-clean, elegant WhatsApp cards
 * Fixes broken raw tab columns, formats chemical/math structures, and styles lists
 */
export function formatAiWhatsAppResponse(text: string): string {
  if (!text) return '';

  let formatted = text;

  // 1. Convert tab-separated table rows into clean WhatsApp cards
  const lines = formatted.split('\n');
  const processedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line contains tab characters (table row)
    if (line.includes('\t')) {
      const parts = line.split('\t').map(p => p.trim()).filter(Boolean);
      if (parts.length >= 3) {
        // Table header or data row
        const first = parts[0];
        const isHeader = first.toLowerCase().includes('no') || first.toLowerCase().includes('nama');

        if (isHeader) {
          processedLines.push(`\n📌 *ANALISIS DATA / TABEL:*`);
        } else {
          const num = parts[0];
          const name = parts[1];
          const status = parts[2];
          const desc = parts.slice(3).join(' - ');

          const statusBadge = status.toLowerCase().includes('salah') || status.toLowerCase().includes('wrong') || status.toLowerCase().includes('false')
            ? '❌ *Salah*'
            : status.toLowerCase().includes('benar') || status.toLowerCase().includes('correct') || status.toLowerCase().includes('true')
              ? '✅ *Benar*'
              : `*${status}*`;

          processedLines.push(
            `\n🔹 *${num}. ${name}*\n` +
            `   • Status: ${statusBadge}\n` +
            (desc ? `   • Penjelasan: ${desc}` : '')
          );
          continue;
        }
      } else if (parts.length === 2) {
        processedLines.push(`• *${parts[0]}:* ${parts[1]}`);
        continue;
      }
    }

    // Convert raw Markdown table lines (| col1 | col2 |) into WhatsApp bullet cards
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const parts = line.split('|').map(p => p.trim()).filter(Boolean);
      // Skip table separator line (|---|---|)
      if (parts.every(p => p.replace(/[-:\s]/g, '').length === 0)) {
        continue;
      }

      if (parts.length >= 3) {
        const isHeader = parts[0].toLowerCase().includes('no') || parts[0].toLowerCase().includes('nama') || parts[0].includes('---');
        if (isHeader) {
          processedLines.push(`\n📊 *TABEL PENJELASAN:*`);
        } else {
          const num = parts[0];
          const name = parts[1];
          const status = parts[2];
          const desc = parts.slice(3).join(' - ');

          const statusBadge = status.toLowerCase().includes('salah')
            ? '❌ *Salah*'
            : status.toLowerCase().includes('benar')
              ? '✅ *Benar*'
              : `*${status}*`;

          processedLines.push(
            `\n▫️ *${num}. ${name}*\n` +
            `   • Status: ${statusBadge}\n` +
            (desc ? `   • Penjelasan: ${desc}` : '')
          );
          continue;
        }
      }
    }

    processedLines.push(line);
  }

  formatted = processedLines.join('\n');

  // 2. Wrap chemical formulas (like CH₃–CH₂–C≡C–CH₂–CH₃) in backticks if not already wrapped
  formatted = formatted.replace(/(?<![`\w])([A-Z][a-z0-9₀-₉]*[–—\-≡=][A-Z0-9₀-₉–—\-≡=\(\)]+)(?![`\w])/g, '`$1`');

  // 3. Clean up multiple empty lines
  formatted = formatted.replace(/\n{3,}/g, '\n\n').trim();

  return formatted;
}
