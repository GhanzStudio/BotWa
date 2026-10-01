import { CommandContext } from '../commands/types.ts';

export interface ProgressBarController {
  update: (percent: number, statusText?: string) => Promise<void>;
  stepProgress: (targetPercent: number, statusText: string) => Promise<void>;
  finishAndDelete: () => Promise<void>;
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const SPINNERS = ['⏳', '⚡', '🔄', '✨', '🎧'];

/**
 * Creates an animated editing progress bar message (0% to 100%).
 * Edits the progress message smoothly in real-time as percentage updates,
 * and automatically deletes the progress message once completed!
 */
export async function createProgressBar(
  ctx: CommandContext,
  title: string
): Promise<ProgressBarController> {
  let currentPercent = 0;
  let spinnerIdx = 0;

  const renderBar = (percent: number, statusText?: string) => {
    const clamped = Math.min(100, Math.max(0, Math.round(percent)));
    const filledCount = Math.round((clamped / 100) * 10);
    const emptyCount = 10 - filledCount;
    const barStr = '█'.repeat(filledCount) + '░'.repeat(emptyCount);
    const icon = SPINNERS[spinnerIdx % SPINNERS.length];
    spinnerIdx++;

    return `${icon} *${title.toUpperCase()}*\n\n` +
           `[${barStr}] *${clamped}%*\n` +
           `_${statusText || 'Sedang memproses, mohon tunggu...'}_`;
  };

  let sentMsgKey: any = null;
  let lastText = renderBar(0, 'Memulai proses...');

  try {
    const res = await ctx.reply(lastText);
    if (res && typeof res === 'object' && res.key) {
      sentMsgKey = res.key;
    }
  } catch (err: any) {
    console.warn('[ProgressBar] Error sending initial message:', err.message);
  }

  const sendEdit = async (percent: number, statusText?: string) => {
    currentPercent = percent;
    const newText = renderBar(percent, statusText);
    if (newText === lastText) return;
    lastText = newText;

    if (ctx.sock && sentMsgKey) {
      try {
        const targetJid = ctx.group?.id || ctx.m?.key?.remoteJid || ctx.senderJid;
        if (targetJid) {
          await ctx.sock.sendMessage(targetJid, { text: newText, edit: sentMsgKey });
        }
      } catch (e: any) {
        console.warn('[ProgressBar] Error editing message:', e.message);
      }
    }
  };

  return {
    async update(percent: number, statusText?: string) {
      await sendEdit(percent, statusText);
    },

    async stepProgress(targetPercent: number, statusText: string) {
      const start = currentPercent;
      const steps = 3;
      const diff = targetPercent - start;
      if (diff <= 0) {
        await sendEdit(targetPercent, statusText);
        return;
      }

      for (let i = 1; i <= steps; i++) {
        const stepVal = Math.round(start + (diff * (i / steps)));
        await sendEdit(stepVal, statusText);
        await delay(350);
      }
    },

    async finishAndDelete() {
      await sendEdit(100, 'Selesai!');
      await delay(400);

      if (ctx.sock && sentMsgKey) {
        try {
          const targetJid = ctx.group?.id || ctx.m?.key?.remoteJid || ctx.senderJid;
          if (targetJid) {
            await ctx.sock.sendMessage(targetJid, { delete: sentMsgKey });
          }
        } catch (e: any) {
          console.warn('[ProgressBar] Error deleting progress message:', e.message);
        }
      }
    }
  };
}
