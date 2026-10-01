/**
 * Command Usage Statistics Tracking & 7-Day Aggregator
 * Persists hit logs per command and per day for dashboard chart visualization.
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STATS_FILE = path.join(DATA_DIR, 'command_stats.json');

if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (_) {}
}

export interface CommandHitLog {
  command: string;
  category: string;
  date: string; // YYYY-MM-DD
  count: number;
}

let statsMap = new Map<string, CommandHitLog>(); // Key: "command_YYYY-MM-DD"

function getFormattedDateStr(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function loadStats() {
  try {
    if (fs.existsSync(STATS_FILE)) {
      const data = JSON.parse(fs.readFileSync(STATS_FILE, 'utf-8'));
      if (Array.isArray(data)) {
        for (const item of data) {
          // Filter out legacy fake seeded entries if any exist
          if (item.command && item.date && typeof item.count === 'number' && item.count > 0) {
            const key = `${item.command}_${item.date}`;
            statsMap.set(key, item);
          }
        }
      }
    }
  } catch (err: any) {
    console.warn('[CommandStats] Failed to load command_stats.json:', err.message);
  }
}

function saveStats() {
  try {
    const list = Array.from(statsMap.values());
    fs.writeFileSync(STATS_FILE, JSON.stringify(list, null, 2));
  } catch (err: any) {
    console.warn('[CommandStats] Failed to save command_stats.json:', err.message);
  }
}

/**
 * Clear legacy fake stats data and reset to 100% real tracking
 */
export function resetCommandStatsToReal() {
  statsMap.clear();
  saveStats();
}

// Initial load
loadStats();

/**
 * Track execution of a command
 */
export function recordCommandHit(commandName: string, category: string = 'GENERAL') {
  const dateStr = getFormattedDateStr();
  const key = `${commandName.toLowerCase()}_${dateStr}`;

  if (statsMap.has(key)) {
    const item = statsMap.get(key)!;
    item.count += 1;
  } else {
    statsMap.set(key, {
      command: commandName.toLowerCase(),
      category: category.toUpperCase(),
      date: dateStr,
      count: 1
    });
  }

  saveStats();
}

/**
 * Get aggregated statistics for the last 7 days
 */
export function getCommandStats7Days() {
  const today = new Date();
  const last7DateStrings: string[] = [];
  const dayLabels: string[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = getFormattedDateStr(d);
    last7DateStrings.push(dateStr);

    const dayName = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
    dayLabels.push(dayName);
  }

  const commandTotals = new Map<string, { command: string; category: string; totalHits: number }>();
  const dailyTotalHitsMap = new Map<string, number>();

  for (const dateStr of last7DateStrings) {
    dailyTotalHitsMap.set(dateStr, 0);
  }

  for (const item of statsMap.values()) {
    if (last7DateStrings.includes(item.date)) {
      // Add to command total
      const existing = commandTotals.get(item.command) || { command: item.command, category: item.category, totalHits: 0 };
      existing.totalHits += item.count;
      commandTotals.set(item.command, existing);

      // Add to daily total
      const currentDayHits = dailyTotalHitsMap.get(item.date) || 0;
      dailyTotalHitsMap.set(item.date, currentDayHits + item.count);
    }
  }

  // Top 10 most popular commands in 7 days
  const popularCommands = Array.from(commandTotals.values())
    .sort((a, b) => b.totalHits - a.totalHits)
    .slice(0, 10);

  // Daily trend
  const dailyTrend = last7DateStrings.map((dateStr, idx) => ({
    date: dateStr,
    label: dayLabels[idx],
    hits: dailyTotalHitsMap.get(dateStr) || 0
  }));

  // Total hits overall in 7 days
  const total7DaysHits = Array.from(dailyTotalHitsMap.values()).reduce((acc, v) => acc + v, 0);

  return {
    total7DaysHits,
    popularCommands,
    dailyTrend
  };
}
