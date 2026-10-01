/**
 * Multi-Platform Media Downloader Service
 * High-speed downloading for YouTube (MP3 & MP4), TikTok, Instagram, Facebook, Spotify, MediaFire, Pinterest
 * Uses Loader.to, TikWM, Spotify OEmbed Bridge, MediaFire Direct Scraper & btch-downloader
 */

import { createRequire } from 'module';
import { exec } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import util from 'util';

const execAsync = util.promisify(exec);
const require = createRequire(import.meta.url);

let btch: any = null;
try {
  btch = require('btch-downloader');
} catch (e) {
  console.warn('[Downloader] btch-downloader load error:', e);
}

export interface YouTubeDownloadResult {
  status: boolean;
  title: string;
  author: string;
  thumbnail?: string;
  mp3?: string;
  mp4?: string;
  error?: string;
}

export interface TikTokDownloadResult {
  status: boolean;
  title: string;
  author: string;
  cover?: string;
  video?: string;
  audio?: string;
  images?: string[];
  isSlide?: boolean;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  error?: string;
}

export interface InstagramDownloadResult {
  status: boolean;
  url?: string[];
  title?: string;
  error?: string;
}

/**
 * Normalize YouTube URL (extracts clean video ID and standardizes format)
 */
export function normalizeYouTubeUrl(rawUrl: string): string {
  const match = rawUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match && match[1]) {
    return `https://www.youtube.com/watch?v=${match[1]}`;
  }
  return rawUrl.trim();
}

/**
 * Extract YouTube Video ID from URL or string
 */
export function extractYouTubeId(rawUrl: string): string | null {
  const match = rawUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

/**
 * Search YouTube for video ID by query
 */
export async function searchYouTubeVideo(query: string): Promise<{ id: string; title: string; author: string; thumbnail: string; url: string } | null> {
  try {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(searchUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    clearTimeout(timeout);

    if (res.ok) {
      const html = await res.text();
      const videoMatch = html.match(/"videoId":"([\w-]{11})"/);
      const titleMatch = html.match(/"title":\{"runs":\[\{"text":"([^"]+)"\}\]/);
      const authorMatch = html.match(/"ownerText":\{"runs":\[\{"text":"([^"]+)"/);

      if (videoMatch && videoMatch[1]) {
        const id = videoMatch[1];
        return {
          id,
          title: titleMatch?.[1] || query,
          author: authorMatch?.[1] || 'YouTube Creator',
          thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
          url: `https://www.youtube.com/watch?v=${id}`
        };
      }
    }
  } catch (e: any) {
    console.warn('[Downloader] searchYouTubeVideo error:', e.message);
  }
  return null;
}

/**
 * Fetch remote media as Buffer with browser headers and HTML error rejection
 */
export async function fetchMediaBuffer(url: string): Promise<Buffer | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': url.includes('ymcdn.org') ? 'https://c.ymcdn.org/' : (url.includes('tiktok') ? 'https://www.tiktok.com/' : '')
      }
    });
    clearTimeout(timeout);

    if (!res.ok && res.status !== 206) {
      console.warn(`[Downloader] fetchMediaBuffer failed with status ${res.status}`);
      return null;
    }

    const arrayBuf = await res.arrayBuffer();
    const buf = Buffer.from(arrayBuf);

    // Reject HTML error responses (Cloudflare challenges or 403 HTML pages)
    const prefix = buf.slice(0, 150).toString('utf-8').toLowerCase();
    if (prefix.includes('<!doctype html') || prefix.includes('<html') || buf.length < 500) {
      console.warn('[Downloader] Buffer is an HTML error page, rejecting.');
      return null;
    }

    return buf;
  } catch (err: any) {
    console.warn('[Downloader] fetchMediaBuffer error:', err.message);
    return null;
  }
}

/**
 * Convert any Audio (MP3, AAC, M4A) to Official WhatsApp Voice Note (OGG Opus Mono 48kHz)
 * Eliminates "Audio ini tidak tersedia karena file audio bermasalah" error on WhatsApp Android
 */
export async function convertToWhatsAppVoiceNote(input: Buffer | string): Promise<{ buffer: Buffer; mimetype: string }> {
  const tempId = Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const tempIn = path.join(os.tmpdir(), `vn_in_${tempId}`);
  const tempOut = path.join(os.tmpdir(), `vn_out_${tempId}.ogg`);

  try {
    let inPath = '';
    if (Buffer.isBuffer(input)) {
      await fs.promises.writeFile(tempIn, input);
      inPath = tempIn;
    } else if (typeof input === 'string' && fs.existsSync(input)) {
      inPath = input;
    } else if (typeof input === 'string' && input.startsWith('http')) {
      const downloaded = await fetchMediaBuffer(input);
      if (!downloaded) {
        throw new Error('Gagal mengunduh audio dari server sumber.');
      }
      await fs.promises.writeFile(tempIn, downloaded);
      inPath = tempIn;
    }

    if (inPath) {
      // Convert using FFmpeg with strict WhatsApp Android VOIP Opus flags
      await execAsync(`ffmpeg -y -i "${inPath}" -vn -map_metadata -1 -c:a libopus -b:a 48k -ar 48000 -ac 1 -application voip -frame_duration 20 -f ogg "${tempOut}"`);

      if (fs.existsSync(tempOut)) {
        const oggBuf = await fs.promises.readFile(tempOut);
        if (oggBuf.length > 500) {
          return {
            buffer: oggBuf,
            mimetype: 'audio/ogg; codecs=opus'
          };
        }
      }
    }
  } catch (err: any) {
    console.warn('[Downloader] FFmpeg Opus conversion fallback:', err.message);
  } finally {
    try { if (fs.existsSync(tempIn)) await fs.promises.unlink(tempIn); } catch (e) {}
    try { if (fs.existsSync(tempOut)) await fs.promises.unlink(tempOut); } catch (e) {}
  }

  throw new Error('Gagal mengonversi audio ke format voice note.');
}

/**
 * Loader.to High Speed Downloader (MP3 & MP4)
 */
async function downloadViaLoaderTo(targetUrl: string, format: 'mp3' | '720' | '1080' = 'mp3'): Promise<{ title: string; thumbnail: string; downloadUrl: string } | null> {
  try {
    const initRes = await fetch(`https://loader.to/ajax/download.php?format=${format}&url=${encodeURIComponent(targetUrl)}`);
    if (!initRes.ok) return null;
    const initData: any = await initRes.json();
    if (!initData.id) return null;

    // Up to 30 polls (24 seconds) to give enough time for new uncached conversions on Loader.to CDN
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 800));
      const progRes = await fetch(`https://loader.to/ajax/progress.php?id=${initData.id}`);
      if (!progRes.ok) continue;
      const progData: any = await progRes.json();
      if (progData.download_url) {
        return {
          title: initData.title || progData.title || 'YouTube Download',
          thumbnail: initData.thumbnail_url || `https://i.ytimg.com/vi/${extractYouTubeId(targetUrl)}/hqdefault.jpg`,
          downloadUrl: progData.download_url
        };
      }
    }
  } catch (e: any) {
    console.warn('[Downloader] Loader.to error:', e.message);
  }
  return null;
}

/**
 * Download YouTube MP3 and MP4
 */
export async function downloadYouTube(rawInput: string, mode: 'mp3' | 'mp4' | 'both' = 'both'): Promise<YouTubeDownloadResult> {
  let cleanUrl = normalizeYouTubeUrl(rawInput);
  let searchTitle = '';
  let searchAuthor = '';

  // Handle song / video query search if input is not a direct URL
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    const searched = await searchYouTubeVideo(rawInput.trim());
    if (searched) {
      cleanUrl = searched.url;
      searchTitle = searched.title;
      searchAuthor = searched.author;
    } else {
      return { status: false, title: '', author: '', error: 'Tidak dapat menemukan video YouTube untuk pencarian tersebut.' };
    }
  }

  // 1. Engine 1: Loader.to MP3 & MP4
  try {
    let loaderMp3: any = null;
    let loaderMp4: any = null;

    if (mode === 'mp3' || mode === 'both') {
      loaderMp3 = await downloadViaLoaderTo(cleanUrl, 'mp3');
    }
    if (mode === 'mp4' || (mode === 'both' && !loaderMp3)) {
      loaderMp4 = await downloadViaLoaderTo(cleanUrl, '720');
    }

    if (loaderMp3 || loaderMp4) {
      return {
        status: true,
        title: loaderMp3?.title || loaderMp4?.title || searchTitle || 'YouTube Audio / Video',
        author: searchAuthor || 'YouTube Creator',
        thumbnail: loaderMp3?.thumbnail || loaderMp4?.thumbnail,
        mp3: loaderMp3?.downloadUrl,
        mp4: loaderMp4?.downloadUrl
      };
    }
  } catch (err: any) {
    console.warn('[Downloader] Loader.to engine failed:', err.message);
  }

  // 2. Engine 2: btch-downloader youtube
  if (btch?.youtube) {
    try {
      const res = await btch.youtube(cleanUrl);
      if (res && (res.mp3 || res.mp4)) {
        return {
          status: true,
          title: res.title || searchTitle || 'YouTube Audio / Video',
          author: res.author || searchAuthor || 'YouTube Creator',
          thumbnail: res.thumbnail,
          mp3: res.mp3,
          mp4: res.mp4
        };
      }
    } catch (err: any) {
      console.warn('[Downloader] btch.youtube error:', err.message);
    }
  }

  // 3. Engine 3: Fallback Public APIs
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const apiRes = await fetch(`https://api.v2.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(cleanUrl)}`, {
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (apiRes.ok) {
      const data: any = await apiRes.json();
      if (data?.data?.dl) {
        return {
          status: true,
          title: data.data.title || searchTitle || 'YouTube Audio',
          author: data.data.channel || searchAuthor || 'YouTube',
          thumbnail: data.data.thumbnail,
          mp3: data.data.dl,
          mp4: data.data.dl_video || data.data.dl
        };
      }
    }
  } catch (_) {}

  return {
    status: false,
    title: searchTitle,
    author: searchAuthor,
    error: 'Tidak dapat mengunduh media dari tautan YouTube ini. Pastikan link valid dan aktif.'
  };
}

/**
 * Download TikTok No-Watermark Video and MP3 Audio
 */
export async function downloadTikTok(url: string): Promise<TikTokDownloadResult> {
  const cleanUrl = url.trim();
  if (!cleanUrl) {
    return { status: false, title: '', author: '', error: 'URL TikTok tidak boleh kosong' };
  }

  // 1. Engine 1: TikWM API (High speed, no watermark, slide & video support)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(cleanUrl)}`, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    clearTimeout(timeout);

    if (res.ok) {
      const json: any = await res.json();
      if (json?.code === 0 && json?.data) {
        const d = json.data;
        const hasImages = Array.isArray(d.images) && d.images.length > 0;
        const isAudioOnly = typeof d.play === 'string' && d.play.includes('mime_type=audio_mpeg');
        
        let playVideo: string | undefined = undefined;
        if (!hasImages && !isAudioOnly && (d.play || d.hdplay || d.wmplay)) {
          playVideo = d.play || d.hdplay || d.wmplay;
          if (playVideo && playVideo.startsWith('/')) {
            playVideo = `https://www.tikwm.com${playVideo}`;
          }
        }

        return {
          status: true,
          title: d.title || 'TikTok Media',
          author: d.author?.nickname || d.author?.unique_id || 'TikTok User',
          cover: d.cover,
          video: playVideo,
          audio: d.music || d.music_info?.play,
          images: hasImages ? d.images : undefined,
          isSlide: hasImages,
          views: typeof d.play_count === 'number' ? d.play_count : (parseInt(d.play_count) || undefined),
          likes: typeof d.digg_count === 'number' ? d.digg_count : (parseInt(d.digg_count) || undefined),
          comments: typeof d.comment_count === 'number' ? d.comment_count : (parseInt(d.comment_count) || undefined),
          shares: typeof d.share_count === 'number' ? d.share_count : (parseInt(d.share_count) || undefined),
          saves: typeof d.collect_count === 'number' ? d.collect_count : (parseInt(d.collect_count) || undefined)
        };
      }
    }
  } catch (err: any) {
    console.warn('[Downloader] TikWM error:', err.message);
  }

  // 2. Engine 2: btch.ttdl
  if (btch?.ttdl) {
    try {
      const res = await btch.ttdl(cleanUrl);
      if (res && (res.video || res.audio)) {
        return {
          status: true,
          title: res.title || 'TikTok Media',
          author: res.author || 'TikTok User',
          cover: res.thumbnail,
          video: Array.isArray(res.video) ? res.video[0] : res.video,
          audio: Array.isArray(res.audio) ? res.audio[0] : res.audio
        };
      }
    } catch (err: any) {
      console.warn('[Downloader] btch.ttdl error:', err.message);
    }
  }

  return {
    status: false,
    title: '',
    author: '',
    error: 'Gagal mengambil video TikTok. Pastikan akun tidak di-private dan tautan video aktif.'
  };
}

/**
 * Download Instagram Post / Reel / Carousel
 */
export async function downloadInstagram(url: string): Promise<InstagramDownloadResult> {
  const cleanUrl = url.trim();
  if (!cleanUrl) {
    return { status: false, error: 'URL Instagram tidak boleh kosong' };
  }

  // 1. Engine 1: btch.igdl
  if (btch?.igdl) {
    try {
      const res = await btch.igdl(cleanUrl);
      if (Array.isArray(res) && res.length > 0) {
        const urls = res.map((item: any) => typeof item === 'string' ? item : (item.url || item.download_url)).filter(Boolean);
        if (urls.length > 0) {
          return { status: true, url: urls, title: 'Instagram Post / Reel' };
        }
      } else if (res?.url) {
        const urls = Array.isArray(res.url) ? res.url : [res.url];
        return { status: true, url: urls, title: res.title || 'Instagram Post / Reel' };
      }
    } catch (err: any) {
      console.warn('[Downloader] btch.igdl error:', err.message);
    }
  }

  // 2. Engine 2: Loader.to Instagram downloader
  try {
    const loaderResult = await downloadViaLoaderTo(cleanUrl, '720');
    if (loaderResult && loaderResult.downloadUrl) {
      return { status: true, url: [loaderResult.downloadUrl], title: loaderResult.title || 'Instagram Post / Reel' };
    }
  } catch (_) {}

  return {
    status: false,
    error: 'Gagal mengambil media Instagram. Pastikan akun tidak di-private dan tautan reels/postingan valid.'
  };
}

/**
 * Download Facebook Video
 */
export async function downloadFacebook(url: string): Promise<{ status: boolean; video?: string; title?: string; error?: string }> {
  const cleanUrl = url.trim();

  // 1. Engine 1: Loader.to Facebook downloader
  try {
    const loaderResult = await downloadViaLoaderTo(cleanUrl, '720');
    if (loaderResult && loaderResult.downloadUrl) {
      return {
        status: true,
        video: loaderResult.downloadUrl,
        title: loaderResult.title || 'Facebook Video'
      };
    }
  } catch (_) {}

  // 2. Engine 2: btch.fbdown
  if (btch?.fbdown) {
    try {
      const res = await btch.fbdown(cleanUrl);
      if (res?.normal || res?.hd || res?.sd) {
        return {
          status: true,
          video: res.hd || res.normal || res.sd,
          title: res.title || 'Facebook Video'
        };
      }
    } catch (err: any) {
      console.warn('[Downloader] btch.fbdown error:', err.message);
    }
  }

  return { status: false, error: 'Gagal mengunduh video Facebook. Pastikan postingan bersifat publik.' };
}

/**
 * Download Spotify Track / Audio (via Spotify OEmbed + YouTube Audio Bridge)
 */
export async function downloadSpotify(url: string): Promise<{ status: boolean; title?: string; artist?: string; mp3?: string; cover?: string; error?: string }> {
  const cleanUrl = url.trim();

  // 1. Engine 1: Spotify OEmbed metadata + YouTube Audio Bridge (100% Reliable for all Spotify tracks)
  try {
    const oembedRes = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(cleanUrl)}`);
    if (oembedRes.ok) {
      const metadata: any = await oembedRes.json();
      const trackTitle = metadata.title || 'Spotify Track';
      const thumbnail = metadata.thumbnail_url;

      // Extract artist from title or metadata if available
      const searchPrompt = `${trackTitle} official audio`;
      const ytResult = await downloadYouTube(searchPrompt);

      if (ytResult.status && ytResult.mp3) {
        return {
          status: true,
          title: trackTitle,
          artist: ytResult.author || 'Spotify Artist',
          mp3: ytResult.mp3,
          cover: thumbnail || ytResult.thumbnail
        };
      }
    }
  } catch (err: any) {
    console.warn('[Downloader] Spotify OEmbed bridge error:', err.message);
  }

  // 2. Engine 2: btch.spotify
  if (btch?.spotify) {
    try {
      const res = await btch.spotify(cleanUrl);
      if (res?.url || res?.mp3 || res?.download) {
        return {
          status: true,
          title: res.title || res.name || 'Spotify Track',
          artist: res.artist || res.artists || 'Artist',
          mp3: res.url || res.mp3 || res.download,
          cover: res.cover || res.thumbnail
        };
      }
    } catch (err: any) {
      console.warn('[Downloader] btch.spotify error:', err.message);
    }
  }

  return { status: false, error: 'Gagal mengunduh musik dari Spotify.' };
}

/**
 * Download MediaFire Direct File
 */
export async function downloadMediaFire(url: string): Promise<{ status: boolean; link?: string; filename?: string; filesize?: string; error?: string }> {
  try {
    const res = await fetch(url.trim(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (res.ok) {
      const html = await res.text();
      const linkMatch = html.match(/href="(https?:\/\/download\d+\.mediafire\.com\/[^"]+)"/i);
      const nameMatch = html.match(/<div class="filename">([^<]+)<\/div>/i) || html.match(/class="dl-btn-label"[^>]*title="([^"]+)"/i);
      const sizeMatch = html.match(/<li>File size: <span>([^<]+)<\/span><\/li>/i);

      if (linkMatch && linkMatch[1]) {
        return {
          status: true,
          link: linkMatch[1],
          filename: nameMatch?.[1]?.trim() || 'MediaFire File',
          filesize: sizeMatch?.[1]?.trim() || 'Ukuran Tidak Diketahui'
        };
      }
    }
  } catch (e: any) {
    console.warn('[Downloader] MediaFire scraper error:', e.message);
  }

  return { status: false, error: 'Gagal mengambil tautan MediaFire. Pastikan link masih aktif.' };
}
