/**
 * Full-Stack Express Server & Bot Controller
 * Integrates Vite middleware, Baileys socket, MongoDB, and REST APIs.
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { config } from './bot/config.ts';
import { connectDB, getMongoStatus } from './bot/database/mongo.ts';
import { startBaileysBot, getBotState } from './bot/lib/baileys.ts';
import { getAllCommands, getCommandsByCategory, getTotalCommandsCount } from './bot/commands/index.ts';
import { handleIncomingMessage } from './bot/lib/handler.ts';
import { getAllMemoryUsers } from './bot/database/models/User.ts';
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

  app.use(express.json());

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
      await startBaileysBot(phoneNumber);
      res.json({ success: true, message: 'Permintaan pairing code dikirim. Menunggu kode...' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
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

  // Live Simulator: test commands directly via web console
  app.post('/api/simulate', async (req, res) => {
    const { command, senderName = 'GhanzTester', isPremium = false, isOwner = false } = req.body;
    if (!command) {
      return res.status(400).json({ error: 'Command text is required' });
    }

    const testJid = isOwner ? `${config.ownerNumber}@s.whatsapp.net` : '628999999999@s.whatsapp.net';
    let replyCaptured = '';
    let reactCaptured = '';

    const result = await handleIncomingMessage({
      senderJid: testJid,
      senderName,
      body: command.startsWith(config.prefix) ? command : `${config.prefix}${command}`,
      isGroupAdmin: false,
      sendReply: async (text: string) => {
        replyCaptured = text;
        return text;
      },
      sendReaction: async (emoji: string) => {
        reactCaptured = emoji;
      }
    });

    res.json({
      executed: result.executed,
      reply: replyCaptured || result.replyText || 'Perintah dijalankan tanpa pesan balasan teks.',
      reaction: reactCaptured,
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

  // --- Vite & Frontend Integration ---
  const distPath = path.join(process.cwd(), 'dist');
  const hasDist = fs.existsSync(distPath) && fs.existsSync(path.join(distPath, 'index.html'));

  // Detect Android/Termux or production environment to serve precompiled lightweight bundle
  const isAndroidOrTermux = process.platform === 'android' || 
    Boolean(process.env.TERMUX_VERSION) || 
    Boolean(process.env.PREFIX && process.env.PREFIX.includes('termux')) ||
    process.env.SERVE_STATIC === 'true' ||
    process.argv.includes('--static');

  if (process.env.NODE_ENV !== 'production' && !isAndroidOrTermux) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (hasDist) {
    console.log('⚡ Dashboard mode: Melayani aset web pra-kompilasi (cepat, hemat RAM & anti layar putih)');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Web Dashboard & Bot Controller berjalan di port ${PORT}`);
    console.log(`📱 Buka di Chrome: http://localhost:${PORT} atau http://127.0.0.1:${PORT}`);
  });
}

startServer();
