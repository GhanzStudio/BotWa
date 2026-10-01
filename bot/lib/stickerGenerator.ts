import sharp from 'sharp';

/**
 * Download a media buffer from URL with timeout
 */
async function fetchBuffer(url: string, timeoutMs = 8000): Promise<Buffer | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const arrayBuf = await res.arrayBuffer();
      return Buffer.from(arrayBuf);
    }
  } catch (e: any) {
    console.warn('[stickerGenerator] Fetch buffer failed:', e.message);
  }
  return null;
}

/**
 * 1. BRAT STICKER GENERATOR (Charli XCX Album Style)
 */
export async function generateBratSticker(text: string): Promise<Buffer> {
  const cleanText = text.trim() || 'brat';

  // Try API first
  try {
    const apiBuf = await fetchBuffer(`https://api.siputzx.my.id/api/m/brat?text=${encodeURIComponent(cleanText)}`);
    if (apiBuf && apiBuf.length > 500) {
      return await sharp(apiBuf).resize(512, 512, { fit: 'contain' }).webp({ quality: 90 }).toBuffer();
    }
  } catch (e: any) {
    console.warn('[Brat] API failed, using local sharp generator:', e.message);
  }

  // Local Sharp SVG fallback
  const width = 512;
  const height = 512;
  const words = cleanText.toLowerCase().split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length > 16) {
      lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine += (currentLine ? ' ' : '') + word;
    }
  }
  if (currentLine) lines.push(currentLine.trim());

  const fontSize = lines.length > 4 ? 38 : lines.length > 2 ? 48 : 60;
  const lineHeight = fontSize * 1.15;
  const totalHeight = lines.length * lineHeight;
  const startY = (height - totalHeight) / 2 + fontSize * 0.8;

  const textTags = lines.map((line, idx) => {
    const y = startY + idx * lineHeight;
    const escaped = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<text x='256' y='${y}' font-family='Arial, sans-serif' font-size='${fontSize}' font-weight='normal' fill='#000000' text-anchor='middle'>${escaped}</text>`;
  }).join('');

  const svg = `
    <svg width='${width}' height='${height}' xmlns='http://www.w3.org/2000/svg'>
      <rect width='100%' height='100%' fill='#8ACE00'/>
      <g filter='url(#blur)'>
        ${textTags}
      </g>
      <filter id='blur'>
        <feGaussianBlur stdDeviation='0.8' />
      </filter>
    </svg>
  `;

  return await sharp(Buffer.from(svg))
    .resize(512, 512)
    .webp({ quality: 90 })
    .toBuffer();
}

/**
 * 2. ATTP ANIMATED RAINBOW TEXT STICKER GENERATOR
 */
export async function generateAttpSticker(text: string): Promise<Buffer> {
  const cleanText = (text.trim() || 'ATTP').substring(0, 30);
  const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#8B00FF'];
  const width = 512;
  const height = 512;

  const words = cleanText.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > 12) {
      lines.push(cur.trim());
      cur = w;
    } else {
      cur += (cur ? ' ' : '') + w;
    }
  }
  if (cur) lines.push(cur.trim());

  const fontSize = lines.length > 3 ? 42 : lines.length > 1 ? 52 : 64;
  const lineHeight = fontSize * 1.2;
  const totalH = lines.length * lineHeight;
  const startY = (height - totalH) / 2 + fontSize * 0.8;

  const frameBuffers = await Promise.all(colors.map(async (color) => {
    const textTags = lines.map((line, idx) => {
      const y = startY + idx * lineHeight;
      const escaped = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<text x='256' y='${y}' font-family='Impact, Arial Black, sans-serif' font-size='${fontSize}' font-weight='bold' fill='${color}' stroke='#000000' stroke-width='6' text-anchor='middle'>${escaped}</text>`;
    }).join('');

    const svg = `
      <svg width='${width}' height='${height}' xmlns='http://www.w3.org/2000/svg'>
        ${textTags}
      </svg>
    `;

    return sharp(Buffer.from(svg)).png().toBuffer();
  }));

  // Stack frames vertically
  const pageHeight = 512;
  const joined = await sharp({
    create: {
      width: 512,
      height: pageHeight * frameBuffers.length,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite(frameBuffers.map((b, i) => ({ input: b, top: i * pageHeight, left: 0 })))
  .png()
  .toBuffer();

  return await sharp(joined, { animated: true, pageHeight: 512 } as any)
    .webp({ loop: 0, delay: 120 })
    .toBuffer();
}

/**
 * 3. EMOJIMIX / EMOJI KITCHEN STICKER GENERATOR
 */
export async function generateEmojimixSticker(text: string): Promise<Buffer> {
  // Extract emojis or default to 😭 and 😎
  const emojiRegex = /(\p{Extended_Pictographic})/gu;
  const matches = text.match(emojiRegex) || ['😭', '😎'];
  const e1 = matches[0] || '😭';
  const e2 = matches[1] || matches[0] || '😎';

  const width = 512;
  const height = 512;

  const svg = `
    <svg width='${width}' height='${height}' xmlns='http://www.w3.org/2000/svg'>
      <defs>
        <radialGradient id='glow' cx='50%' cy='50%' r='50%'>
          <stop offset='0%' stop-color='#FFD700' stop-opacity='0.4'/>
          <stop offset='100%' stop-color='#FFD700' stop-opacity='0'/>
        </radialGradient>
      </defs>
      <circle cx='256' cy='256' r='210' fill='url(#glow)' />
      <!-- Left Emoji -->
      <text x='180' y='285' font-size='160' text-anchor='middle'>${e1}</text>
      <!-- Sparkle -->
      <text x='256' y='270' font-size='60' text-anchor='middle'>✨</text>
      <!-- Right Emoji -->
      <text x='332' y='285' font-size='160' text-anchor='middle'>${e2}</text>
    </svg>
  `;

  return await sharp(Buffer.from(svg))
    .webp({ quality: 90 })
    .toBuffer();
}

/**
 * 4. QUOTE CHAT (QC) BUBBLE STICKER GENERATOR
 */
export async function generateQcSticker(senderName: string, text: string): Promise<Buffer> {
  const name = senderName || 'User';
  const cleanText = text.trim() || 'Kutipan Chat';
  const initial = name.charAt(0).toUpperCase();

  const avatarSvg = `
    <svg width='64' height='64' xmlns='http://www.w3.org/2000/svg'>
      <circle cx='32' cy='32' r='32' fill='#00A884'/>
      <text x='32' y='43' font-family='Arial, sans-serif' font-size='32' font-weight='bold' fill='#FFFFFF' text-anchor='middle'>${initial}</text>
    </svg>
  `;
  const avatarBuf = await sharp(Buffer.from(avatarSvg)).png().toBuffer();

  const escapedName = name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const escapedText = cleanText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const bubbleSvg = `
    <svg width='512' height='512' xmlns='http://www.w3.org/2000/svg'>
      <g transform='translate(20, 160)'>
        <rect x='70' y='0' rx='16' ry='16' width='390' height='160' fill='#202C33' />
        <polygon points='55,20 70,10 70,30' fill='#202C33' />
        <text x='90' y='38' font-family='Arial, sans-serif' font-size='22' font-weight='bold' fill='#25D366'>${escapedName}</text>
        <text x='90' y='80' font-family='Arial, sans-serif' font-size='20' fill='#E9EDEF'>${escapedText}</text>
        <text x='430' y='140' font-family='Arial, sans-serif' font-size='14' fill='#8696A0' text-anchor='end'>${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</text>
      </g>
    </svg>
  `;

  return await sharp(Buffer.from(bubbleSvg))
    .composite([{ input: avatarBuf, top: 170, left: 20 }])
    .webp({ quality: 90 })
    .toBuffer();
}

/**
 * 5. STICKER.LY SEARCH & CONVERT TO WEBP STICKERS
 */
export async function searchStickerly(query: string): Promise<Buffer[]> {
  const cleanQuery = query.trim();
  const results: Buffer[] = [];

  try {
    const res = await fetch(`https://api.siputzx.my.id/api/s/pinterest?query=${encodeURIComponent(cleanQuery + ' sticker transparent')}`);
    if (res.ok) {
      const json: any = await res.json();
      const items = json?.data || [];
      for (const item of items.slice(0, 3)) {
        if (item.image_url) {
          const buf = await fetchBuffer(item.image_url);
          if (buf && buf.length > 1000) {
            const webp = await sharp(buf)
              .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
              .webp({ quality: 85 })
              .toBuffer();
            results.push(webp);
          }
        }
      }
    }
  } catch (e: any) {
    console.warn('[Stickerly] Search failed:', e.message);
  }

  return results;
}
