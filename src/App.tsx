/**
 * Ghanz Bot Multi-Device - Control Center & Live Simulator
 * High-performance management dashboard and Baileys terminal console
 */

import React, { useState, useEffect } from 'react';
import { findClosestCommand } from '../bot/lib/fuzzyMatch.ts';
import {
  Smartphone,
  Terminal,
  Database,
  Cpu,
  ShieldCheck,
  Send,
  RefreshCw,
  GitBranch,
  Github,
  QrCode,
  KeyRound,
  Layers,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
  Copy,
  ChevronRight,
  User,
  Users,
  Download,
  BookOpen,
  Play,
  Crown,
  Trash2,
  Plus,
  Scan,
  BarChart3,
  Upload
} from 'lucide-react';
import defaultCommandsData from './commands-metadata.json';
import { CommandStatsChart } from './components/CommandStatsChart';

const defaultFallbackStatus: BotStatusData = {
  bot: {
    status: 'DISCONNECTED',
    qrCodeUrl: null,
    pairingCode: null,
    lastConnected: null,
    errorMessage: null,
    botName: 'Ghanz Bot MD',
    prefix: '.',
    ownerNumber: '6281234567890',
    ownerName: 'GhanzStudio'
  },
  mongo: {
    status: 'Hybrid Store Ready',
    uri: 'mongodb://localhost:27017/whatsapp_bot',
    isInMemory: true
  },
  system: {
    uptime: 3600,
    memory: { rss: 48, heapUsed: 32, heapTotal: 64 },
    nodeVersion: 'v20.x',
    platform: 'linux'
  },
  totalCommands: defaultCommandsData.length
};

interface BotStatusData {
  bot: {
    status: 'DISCONNECTED' | 'CONNECTING' | 'SCAN_QR' | 'CONNECTED' | 'PAIRING_READY';
    qrCodeUrl: string | null;
    pairingCode: string | null;
    lastConnected: string | null;
    errorMessage: string | null;
    botName: string;
    prefix: string;
    ownerNumber: string;
    ownerName: string;
  };
  mongo: {
    status: string;
    uri: string;
    isInMemory: boolean;
  };
  system: {
    uptime: number;
    memory: { rss: number; heapUsed: number; heapTotal: number };
    nodeVersion: string;
    platform: string;
  };
  totalCommands: number;
}

interface CommandItem {
  name: string;
  aliases: string[];
  category: string;
  description: string;
  usage: string;
  limitCost: number;
  premiumOnly: boolean;
  ownerOnly: boolean;
  groupOnly: boolean;
  adminOnly: boolean;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  image?: string;
  reaction?: string;
  time: string;
}

export default function App() {
  const [statusData, setStatusData] = useState<BotStatusData | null>(defaultFallbackStatus);
  const [commands, setCommands] = useState<CommandItem[]>(defaultCommandsData as CommandItem[]);
  const [categories, setCategories] = useState<string[]>(['ALL', ...Array.from(new Set(defaultCommandsData.map(c => c.category)))]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'stats' | 'console' | 'commands' | 'pairing' | 'premium' | 'approvals' | 'git' | 'deploy'>('stats');
  
  const isGitHubPages = typeof window !== 'undefined' && window.location.hostname.includes('github.io');

  // Auto-Premium Numbers state
  const [premiumNumbers, setPremiumNumbers] = useState<string[]>([]);
  const [newPremNumber, setNewPremNumber] = useState<string>('');
  const [premLoading, setPremLoading] = useState<boolean>(false);
  const [premSuccessMsg, setPremSuccessMsg] = useState<string>('');

  // 18+ Group Approvals State
  const [requests18, setRequests18] = useState<{
    pending: any[];
    approved: any[];
    allGroups: any[];
    pendingCount: number;
    approvedCount: number;
  }>({ pending: [], approved: [], allGroups: [], pendingCount: 0, approvedCount: 0 });
  const [manualJidInput, setManualJidInput] = useState<string>('');
  const [approvingLoading, setApprovingLoading] = useState<boolean>(false);
  const [approvalMsg, setApprovalMsg] = useState<string>('');

  // Scanned WA Web Users & Phone Verification Scanner state
  const [scannedUsers, setScannedUsers] = useState<any[]>([]);
  const [scanPhoneInput, setScanPhoneInput] = useState<string>('6287891284460');
  const [scanResult, setScanResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [simSenderNumber, setSimSenderNumber] = useState<string>("6287891284460");
  const [uploadingQris, setUploadingQris] = useState<boolean>(false);
  const [qrisUploadMsg, setQrisUploadMsg] = useState<string>('');

  const handleDirectGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingQris(true);
    setQrisUploadMsg('');

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res = await fetch('/api/upload-qris', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64 })
        });

        const rawText = await res.text();
        let data: any = {};
        try {
          data = JSON.parse(rawText);
        } catch (_) {
          data = { error: res.status === 413 ? 'Ukuran file gambar galeri terlalu besar (maksimal 100MB)' : 'Respon server bermasalah' };
        }

        if (res.ok && data.success) {
          setQrisUploadMsg('✅ Gambar dari galeri HP berhasil dipasang sebagai Donasi QRIS!');
        } else {
          setQrisUploadMsg(`❌ Gagal: ${data.error || 'Terjadi kesalahan saat menyimpan gambar'}`);
        }
      } catch (err: any) {
        setQrisUploadMsg(`❌ Gagal unggah: ${err.message}`);
      } finally {
        setUploadingQris(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Pairing code state
  const [pairingPhone, setPairingPhone] = useState<string>('');
  const [pairingLoading, setPairingLoading] = useState<boolean>(false);
  const [pairingMessage, setPairingMessage] = useState<string>('');

  // Simulator chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: '🤖 *Ghanz Bot Multi-Device Siap!*\nKetik perintah dengan prefix titik (contoh: *.menu*, *.ai*, *.ping*, *.profile*) atau klik fitur di tab Commands untuk mencoba.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputCmd, setInputCmd] = useState<string>('.menu');
  const [simulating, setSimulating] = useState<boolean>(false);

  // Git state
  const [gitStatus, setGitStatus] = useState<any>(null);
  const [githubToken, setGithubToken] = useState<string>('');
  const [pushing, setPushing] = useState<boolean>(false);
  const [pushResult, setPushResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setStatusData(data);
      }
    } catch (e) {
      // Gracefully silent during server start/restart
    }
  };

  const fetchCommands = async () => {
    try {
      const res = await fetch('/api/commands');
      if (res.ok) {
        const data = await res.json();
        setCommands(data.list || []);
        setCategories(['ALL', ...(data.categories || [])]);
      }
    } catch (e) {
      // Gracefully silent during server start/restart
    }
  };

  const fetchGitStatus = async () => {
    try {
      const res = await fetch('/api/git/status');
      if (res.ok) {
        const data = await res.json();
        setGitStatus(data);
      }
    } catch (e) {
      // Gracefully silent during server start/restart
    }
  };

  const fetchPremiumNumbers = async () => {
    try {
      const res = await fetch('/api/premium-numbers');
      if (res.ok) {
        const data = await res.json();
        setPremiumNumbers(data.numbers || []);
      }
    } catch (e) {
      // Gracefully silent
    }
  };

  const handleAddPremiumNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPremNumber) return;
    setPremLoading(true);
    setPremSuccessMsg('');
    try {
      const res = await fetch('/api/premium-numbers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: newPremNumber })
      });
      const data = await res.json();
      if (res.ok) {
        setPremSuccessMsg(data.message || 'Nomor berhasil disimpan!');
        setNewPremNumber('');
        fetchPremiumNumbers();
      } else {
        setPremSuccessMsg(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setPremSuccessMsg(`Error: ${err.message}`);
    } finally {
      setPremLoading(false);
    }
  };

  const handleDeletePremiumNumber = async (num: string) => {
    if (!confirm(`Hapus wa.me/${num} dari daftar Auto-Premium?`)) return;
    try {
      const res = await fetch('/api/premium-numbers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: num })
      });
      if (res.ok) {
        fetchPremiumNumbers();
      }
    } catch (_) {}
  };

  const fetchScannedUsers = async () => {
    try {
      const res = await fetch('/api/scanned-users');
      if (res.ok) {
        const data = await res.json();
        setScannedUsers(data.users || []);
      }
    } catch (_) {}
  };

  const fetch18PlusRequests = async () => {
    try {
      const res = await fetch('/api/18plus-requests');
      if (res.ok) {
        const data = await res.json();
        setRequests18(data);
      }
    } catch (_) {}
  };

  const handleAcc18Group = async (groupId: string) => {
    if (!groupId) return;
    setApprovingLoading(true);
    setApprovalMsg('');
    try {
      const res = await fetch('/api/18plus-requests/acc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId })
      });
      const data = await res.json();
      if (res.ok) {
        setApprovalMsg(data.message || 'Grup berhasil di-ACC!');
        setManualJidInput('');
        fetch18PlusRequests();
      } else {
        setApprovalMsg(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setApprovalMsg(`Error: ${err.message}`);
    } finally {
      setApprovingLoading(false);
    }
  };

  const handleReject18Group = async (groupId: string) => {
    if (!groupId) return;
    setApprovingLoading(true);
    setApprovalMsg('');
    try {
      const res = await fetch('/api/18plus-requests/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId })
      });
      const data = await res.json();
      if (res.ok) {
        setApprovalMsg(data.message || 'Izin grup dicabut/ditolak.');
        fetch18PlusRequests();
      } else {
        setApprovalMsg(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setApprovalMsg(`Error: ${err.message}`);
    } finally {
      setApprovingLoading(false);
    }
  };

  const handleSendTestRequest = async (groupId: string, reason: string = 'Permohonan via Web Dashboard') => {
    if (!groupId) return;
    setApprovingLoading(true);
    setApprovalMsg('');
    try {
      const res = await fetch('/api/18plus-requests/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId,
          groupName: 'WhatsApp Group (Web Request)',
          requestedBy: 'Web Admin',
          reason
        })
      });
      const data = await res.json();
      if (res.ok) {
        setApprovalMsg(data.message || 'Permohonan berhasil ditambahkan ke daftar pending!');
        setManualJidInput('');
        fetch18PlusRequests();
      } else {
        setApprovalMsg(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setApprovalMsg(`Error: ${err.message}`);
    } finally {
      setApprovingLoading(false);
    }
  };

  const handleTestScanNumber = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!scanPhoneInput) return;
    setIsScanning(true);
    try {
      const res = await fetch('/api/scan-number', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: scanPhoneInput })
      });
      const data = await res.json();
      if (res.ok) {
        setScanResult(data.scan);
      }
    } catch (_) {}
    finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchCommands();
    fetchGitStatus();
    fetchPremiumNumbers();
    fetchScannedUsers();
    fetch18PlusRequests();
    const interval = setInterval(() => {
      fetchStatus();
      fetch18PlusRequests();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleRequestPairing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pairingPhone) return;
    setPairingLoading(true);
    setPairingMessage('');
    try {
      const res = await fetch('/api/pair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: pairingPhone })
      });
      const data = await res.json();
      if (res.ok) {
        setPairingMessage('Kode Pairing 8-digit sedang digenerate. Tunggu beberapa detik...');
        fetchStatus();
      } else {
        setPairingMessage(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setPairingMessage(`Error: ${err.message}`);
    } finally {
      setPairingLoading(false);
    }
  };

  const handleSimulateCommand = async (commandToRun?: string, customNumber?: string, customName?: string) => {
    const cmd = (commandToRun || inputCmd).trim();
    if (!cmd || simulating) return;

    const senderNumberToUse = (customNumber || simSenderNumber || "6287891284460").replace(/\D/g, "");
    const isOwnerSender = senderNumberToUse === "6287891284460" || senderNumberToUse === "56106063794223";
    const senderNameToUse = customName || (isOwnerSender ? "GhanzStudio" : "User");

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: "user",
      text: cmd,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setInputCmd("");
    setSimulating(true);

    try {
      let replyText = "";
      let reaction = "";
      let imageCaptured: string | undefined = undefined;

      try {
        const res = await fetch("/api/simulate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            command: cmd,
            senderNumber: senderNumberToUse,
            senderName: senderNameToUse
          })
        });
        if (res.ok) {
          const data = await res.json();
          replyText = data.reply || "";
          reaction = data.reaction || "";
          if (data.image) {
            imageCaptured = data.image;
          }
        }
      } catch (_) {
        // Fallback for static preview
      }

      if (!replyText) {
        const clean = cmd.trim().toLowerCase();
        if (clean.startsWith(".donasi") || clean.startsWith(".donate") || clean.startsWith(".qris") || clean.startsWith(".cekqris") || clean.startsWith(".lihatqris") || clean.startsWith(".donasipict")) {
          replyText = `💖 *DONASI & DUKUNGAN BOT*\n\nTerima kasih banyak atas niat baik kamu untuk mendukung operasional server bot ini 🙏\n\n• *QRIS (All Payment):* Silakan scan kode QRIS pada gambar di atas\n• *Transfer E-Wallet:* 087817697830 (Dana / GoPay / OVO)\n• *Hubungi Owner:* +62 878-9128-4460\n\n_Dukungan sekecil apa pun sangat berarti agar layanan bot bisa terus aktif 24 jam. Terima kasih!_`;
          imageCaptured = "/api/qris-image";
          reaction = "💖";
        } else if (clean.startsWith(".allmenu")) {
          replyText = `📜 *DAFTAR LENGKAP FITUR BOT (180+ COMMANDS)*\n\n` +
            `┌── [ 📌 *MAIN MENU* ]\n│ • .menu, .allmenu, .ping, .owner, .rules, .donasi, .sc, .stats\n└──\n\n` +
            `┌── [ 👑 *OWNER & DEVELOPER* ]\n│ • .bc, .addprem, .delprem, .addlimit, .addkoin, .ban, .unban, .setprefix\n└──\n\n` +
            `┌── [ 🛠️ *TOOLS & UTILITAS* ]\n│ • .qrlok, .qrloklogs, .qrcode, .ocr, .hd, .removebg, .ssweb, .nulis, .carbon\n└──\n\n` +
            `┌── [ 🤖 *AI CHAT & GENERATOR* ]\n│ • .ai, .gemini, .gpt4o, .deepseek, .text2img, .musicmaker, .toanime, .toghibli\n└──\n\n` +
            `┌── [ 🎮 *GAME INTERAKTIF* ]\n│ • .tebakgambar, .tebakkata, .tebaklagu, .caklontong, .tictactoe, .ulartangga\n└──\n\n` +
            `┌── [ 📥 *DOWNLOADER* ]\n│ • .tiktok, .ttmp3, .instagramdl, .ytmp3, .ytmp4, .facebookdl, .spotifydl\n└──\n\n` +
            `_Ketik .menu <kategori> untuk rincian deskripsi tiap command._`;
          reaction = "📜";
        } else if (clean.startsWith(".menu") || clean.startsWith(".menucat") || clean === ".help") {
          const catArg = clean.replace(/^\.(menu|menucat|help)\s*/i, "").trim();

          if (catArg) {
            if (catArg.includes("owner")) {
              replyText = `╭───「 👑 *KATEGORI: OWNER & DEVELOPER* 」\n│\n│ 📌 *.bc* <teks> (Broadcast pesan ke semua user/grup)\n│ 📌 *.addprem* <nomor> (Tambah user VIP Premium)\n│ 📌 *.delprem* <nomor> (Hapus status VIP Premium)\n│ 📌 *.addlimit* <nomor> <jumlah> (Tambah limit user)\n│ 📌 *.addkoin* <nomor> <jumlah> (Tambah koin user)\n│ 📌 *.ban* <nomor> (Blokir pengguna dari bot)\n│ 📌 *.unban* <nomor> (Buka blokir pengguna)\n│ 📌 *.setprefix* <prefix> (Ubah prefix bot)\n│ 📌 *.cleartmp* (Bersihkan file sampah server)\n│\n╰─────────────────────────────\n*Total 9 perintah khusus Owner.*`;
            } else if (catArg.includes("ai")) {
              replyText = `╭───「 🤖 *KATEGORI: AI CHAT & GENERATOR* 」\n│\n│ 📌 *.ai* <teks> (Tanya Jawab AI Gemini)\n│ 📌 *.gemini* <teks> (Model Gemini Flash AI)\n│ 📌 *.gpt4o* <teks> (Model OpenAI GPT-4o)\n│ 📌 *.deepseek* <teks> (DeepSeek AI Assistant)\n│ 📌 *.text2img* <prompt> (AI Generator Gambar Imagen)\n│ 📌 *.musicmaker* <prompt> (AI Generator Musik Audio)\n│ 📌 *.toanime* [foto] (Ubah foto jadi Anime AI)\n│ 📌 *.toghibli* [foto] (Ubah foto gaya Studio Ghibli)\n│\n╰─────────────────────────────\n*Total 8 perintah AI.*`;
            } else if (catArg.includes("tool")) {
              replyText = `╭───「 🛠️ *KATEGORI: TOOLS & UTILITAS* 」\n│\n│ 📌 *.qrlok* <lokasi> (Generate QRIS Lokasi Terdaftar)\n│ 📌 *.qrloklogs* (Cek Riwayat Scan QRIS Lokasi)\n│ 📌 *.qrcode* <teks> (Buat QR Code kustom)\n│ 📌 *.ocr* [foto] (Ekstrak teks dari gambar)\n│ 📌 *.hd* [foto] (Tingkatkan kualitas foto HD)\n│ 📌 *.removebg* [foto] (Hapus latar belakang foto)\n│ 📌 *.ssweb* <url> (Screenshot situs web)\n│ 📌 *.nulis* <teks> (Ubah teks jadi tulisan tangan)\n│\n╰─────────────────────────────\n*Total 8 perintah Tools.*`;
            } else if (catArg.includes("download")) {
              replyText = `╭───「 📥 *KATEGORI: DOWNLOADER MEDSOS* 」\n│\n│ 📌 *.tiktok* <link> (Download video TikTok No WM)\n│ 📌 *.ttmp3* <link> (Download audio MP3 TikTok)\n│ 📌 *.instagramdl* <link> (Download Post/Reels IG)\n│ 📌 *.ytmp3* <link> (Download MP3 YouTube)\n│ 📌 *.ytmp4* <link> (Download Video MP4 YouTube)\n│ 📌 *.facebookdl* <link> (Download Video FB)\n│ 📌 *.spotifydl* <link> (Download Lagu Spotify)\n│\n╰─────────────────────────────\n*Total 7 perintah Downloader.*`;
            } else if (catArg.includes("game")) {
              replyText = `╭───「 🎮 *KATEGORI: GAME INTERAKTIF* 」\n│\n│ 📌 *.tebakgambar* (Main tebak gambar)\n│ 📌 *.tebakkata* (Main tebak kata)\n│ 📌 *.tebaklagu* (Main tebak tebak judul lagu)\n│ 📌 *.caklontong* (Kuis teka-teki lucu Cak Lontong)\n│ 📌 *.tictactoe* (Game Tic-Tac-Toe multiplayer)\n│ 📌 *.ulartangga* (Game Ular Tangga interaktif)\n│\n╰─────────────────────────────\n*Total 6 perintah Game.*`;
            } else {
              replyText = `╭───「 📂 *KATEGORI: ${catArg.toUpperCase()}* 」\n│\n│ 📌 *.${catArg}* (Fitur bot terdaftar di kategori ini)\n│\n╰─────────────────────────────\n_Ketik .menu untuk kembali ke daftar kategori utama._`;
            }
          } else {
            if (isOwnerSender) {
              replyText = `👋 *Halo, GhanzStudio!*\n\n╭───「 *INFORMASI PENGGUNA* 」\n│ 👤 Nama: GhanzStudio 👑\n│ 📱 Nomor: +62 878-9128-4460\n│ 🏷️ Role: 👑 OWNER (SUPER ADMIN)\n│ ⚡ Limit: Unlimited (Bebas Biaya 👑)\n│ 🪙 Koin: Unlimited (Sultan)\n│ 🎖️ Level: 🎖️ 999 (Max Developer 👑)\n╰───────────────────────\n\n╭───「 📂 *KATEGORI FITUR BOT* 」\n│ 📌 *.allmenu* ──── (Lihat Seluruh 180+ Fitur)\n│ 👑 *.menu owner* ── (Perintah Khusus Owner)\n│ 🛠️ *.menu tools* ── (Alat Praktis & Utilitas)\n│ 🤖 *.menu ai* ───── (Kecerdasan Buatan AI)\n│ 🎮 *.menu game* ─── (Game Interaktif & Kuis)\n│ 📥 *.menu download*(Downloader Media Sosial)\n│ 🔍 *.menu search* ─ (Pencarian Data & Web)\n│ 🎨 *.menu sticker*(Pembuat Stiker WA)\n│ 👥 *.menu group* ── (Pengelola & Moderasi Grup)\n│ 🕌 *.menu religi* ─ (Fitur & Jadwal Islami)\n│ 📰 *.menu berita* ─ (Berita Terkini)\n│ 🎲 *.menu rpg* ──── (Game Petualangan RPG)\n│ 🎏 *.menu anime* ── (Nonton & Info Anime)\n│ 👤 *.profile* ───── (Cek Profil Lengkap)\n╰───────────────────────\n\n💡 *Tips:* Ketik *.menu <kategori>* untuk membuka perintah di kategori tersebut.\n_Contoh: Ketik *.menu ai* atau *.menu download*_`;
            } else {
              replyText = `👋 *Halo, Pengguna!*\n\n╭───「 *INFORMASI PENGGUNA* 」\n│ 👤 Nama: Pengguna\n│ 📱 Nomor: +${senderNumberToUse}\n│ 🏷️ Role: 👤 USER BIASA\n│ ⚡ Limit: 50 tersisa\n│ 🪙 Koin: 🪙 1.000\n│ 🎖️ Level: 🎖️ 1 (Exp: 0)\n╰───────────────────────\n\n╭───「 📂 *KATEGORI FITUR BOT* 」\n│ 📌 *.allmenu* ──── (Lihat Seluruh 180+ Fitur)\n│ 🛠️ *.menu tools* ── (Alat Praktis & Utilitas)\n│ 🤖 *.menu ai* ───── (Kecerdasan Buatan AI)\n│ 🎮 *.menu game* ─── (Game Interaktif & Kuis)\n│ 📥 *.menu download*(Downloader Media Sosial)\n│ 🔍 *.menu search* ─ (Pencarian Data & Web)\n│ 🎨 *.menu sticker*(Pembuat Stiker WA)\n│ 👥 *.menu group* ── (Pengelola & Moderasi Grup)\n│ 🕌 *.menu religi* ─ (Fitur & Jadwal Islami)\n│ 📰 *.menu berita* ─ (Berita Terkini)\n│ 🎲 *.menu rpg* ──── (Game Petualangan RPG)\n│ 🎏 *.menu anime* ── (Nonton & Info Anime)\n│ 👤 *.profile* ───── (Cek Profil Lengkap)\n╰───────────────────────\n\n💡 *Tips:* Ketik *.menu <kategori>* untuk membuka perintah di kategori tersebut.\n_Contoh: Ketik *.menu ai* atau *.menu download*_`;
            }
          }
          reaction = "✨";
        } else if (clean.startsWith(".stalk") || clean.startsWith(".megastalk") || clean.startsWith(".osint")) {
          const targetUser = clean.replace(/^\.(stalk|megastalk|osint|stalkall)\s*/i, "").trim() || "GhanzStudio";
          replyText = `🕵️ *MULTI-PLATFORM MEGA OSINT STALKER*\n\n` +
            `╭───「 *TARGET: @${targetUser}* 」\n` +
            `│ 🐙 *GitHub:* https://github.com/${targetUser}\n` +
            `│ 📸 *Instagram:* https://instagram.com/${targetUser}\n` +
            `│ 🎵 *TikTok:* https://www.tiktok.com/@${targetUser}\n` +
            `│ ▶️ *YouTube:* https://www.youtube.com/@${targetUser}\n` +
            `│ 🐤 *Twitter / X:* https://x.com/${targetUser}\n` +
            `│ 📌 *Pinterest:* https://pinterest.com/${targetUser}\n` +
            `│ 📚 *Wattpad:* https://www.wattpad.com/user/${targetUser}\n` +
            `│ 🎧 *Spotify:* https://open.spotify.com/user/${targetUser}\n` +
            `╰─────────────────────────────\n\n` +
            `💡 *Tips:* Ketik .igstalk ${targetUser} atau .githubstalk ${targetUser} untuk analisis mendalam.`;
          reaction = "🕵️";
        } else if (clean.startsWith(".wastalk") || clean.startsWith(".numstalk") || clean.startsWith(".stalknomor")) {
          const targetNum = clean.replace(/^\.(wastalk|numstalk|stalknomor|cekoperator)\s*/i, "").trim() || senderNumberToUse;
          replyText = `📱 *DEEP TELECOM & WHATSAPP OSINT STALKER*\n\n` +
            `╭───「 *+${targetNum}* 」\n` +
            `│ 📞 *Nomor Internasional:* \`+${targetNum}\`\n` +
            `│ 📡 *Operator Telekomunikasi:* XL Axiata / Telkomsel Group\n` +
            `│ 📍 *Cakupan Regional HLR:* Indonesia (Nasional)\n` +
            `│ 🌐 *JID WhatsApp:* \`${targetNum}@s.whatsapp.net\`\n` +
            `│ 🔗 *Direct Chat WA:* https://wa.me/${targetNum}\n` +
            `│ 🛡️ *Status Scan Database:* Nomor Terdaftar & Aktif di WhatsApp ✅\n` +
            `╰─────────────────────────────`;
          reaction = "📱";
        } else if (clean.startsWith(".ipstalk") || clean.startsWith(".ipwho")) {
          replyText = `🌐 *DEEP IP & GEOLOCATION OSINT STALKER*\n\n` +
            `╭───「 *TARGET: 8.8.8.8* 」\n` +
            `│ 🏢 *ISP Provider:* Google LLC\n` +
            `│ 🏷️ *Organisasi:* Google Public DNS\n` +
            `│ 🔢 *ASN:* AS15169 Google LLC\n` +
            `│ 🏳️ *Negara:* United States (US)\n` +
            `│ 🏙️ *Kota/Wilayah:* Ashburn, Virginia (VA)\n` +
            `│ 📮 *Kode Pos:* 20149\n` +
            `│ 📍 *Koordinat:* 39.03, -77.5\n` +
            `│ 🕒 *Zona Waktu:* America/New_York\n` +
            `╰─────────────────────────────\n\n` +
            `📍 *Google Maps Pin:* https://www.google.com/maps?q=39.03,-77.5`;
          reaction = "🌐";
        } else if (clean.startsWith(".githubstalk") || clean.startsWith(".ghstalk")) {
          const ghUser = clean.replace(/^\.(githubstalk|ghstalk|gitstalk)\s*/i, "").trim() || "GhanzStudio";
          replyText = `🐙 *DEEP GITHUB PROFILE STALKER*\n\n` +
            `╭───「 *@${ghUser}* 」\n` +
            `│ 🆔 *User ID:* \`12345678\`\n` +
            `│ 👤 *Nama Lengkap:* GhanzStudio Founder\n` +
            `│ 📝 *Bio:* Senior Software Engineer & Bot Developer\n` +
            `│ 📊 *Public Repos:* 24 Repository\n` +
            `│ 📑 *Public Gists:* 5 Gists\n` +
            `│ 👥 *Followers:* 1,250 Pengikut\n` +
            `│ 👥 *Following:* 85 Diikuti\n` +
            `│ 🏢 *Perusahaan:* GhanzStudio Core\n` +
            `│ 📍 *Lokasi:* Indonesia\n` +
            `│ 🌐 *Website/Blog:* https://ghanzstudio.my.id\n` +
            `│ 📅 *Tgl Terdaftar:* 12 Januari 2021\n` +
            `│ ⏳ *Umur Akun:* ~5 Tahun\n│\n` +
            `│ 📂 *REPOSITORI PUBLIK TERBARU:*\n` +
            `│ • *ghanz-bot-md* (TypeScript) - ⭐️ 420 stars | 🍴 180 forks\n` +
            `│ • *qris-location-manager* (JavaScript) - ⭐️ 95 stars\n` +
            `╰─────────────────────────────\n\n` +
            `🔗 *Profil URL:* https://github.com/${ghUser}`;
          reaction = "🐙";
        } else if (clean.startsWith(".buatquotes") || clean.startsWith(".quotesmaker") || clean.startsWith(".quote")) {
          replyText = `🎨 *QUOTES CANVAS GENERATED*\n\n"Hiduplah seperti pohon rimbun yang memberi keteduhan bagi sesama."\n— *GhanzStudio*`;
          imageCaptured = "https://image.pollinations.ai/prompt/aesthetic%20dark%20quote%20card%20design%20typography%20modern%20graphic?width=900&height=500&nologo=true";
          reaction = "🎨";
        } else if (clean.startsWith(".rankcard") || clean.startsWith(".levelcard") || clean.startsWith(".myrank")) {
          replyText = `🎖️ *GAMER RANK CARD*\n\n• *Level:* 15\n• *EXP:* 750 / 1000\n• *Koin:* 🪙 12,500\n• *Rank:* #1 Server`;
          imageCaptured = "https://image.pollinations.ai/prompt/gamer%20profile%20rank%20card%20neon%20cyberpunk%20ui%20badge%20level%2015?width=850&height=300&nologo=true";
          reaction = "🎖️";
        } else if (clean.startsWith(".welcomecard") || clean.startsWith(".welcomebanner")) {
          replyText = `👋 *WELCOME TO GROUP*\n\nSelamat datang *Member Baru*! Semoga betah dan kompak bersama anggota grup.`;
          imageCaptured = "https://image.pollinations.ai/prompt/cyberpunk%20neon%20welcome%20to%20the%20group%20banner%20design?width=850&height=400&nologo=true";
          reaction = "👋";
        } else if (clean.startsWith(".sertifikat") || clean.startsWith(".certificate")) {
          replyText = `📜 *SERTIFIKAT PENGHARGAAN RESMI*\n\nDiberikan kepada: *Member Setia*\nAtas: *Anggota Teraktif & Paling Berkontribusi*`;
          imageCaptured = "https://image.pollinations.ai/prompt/official%20gold%20certificate%20of%20appreciation%20classic%20border?width=1000&height=700&nologo=true";
          reaction = "📜";
        } else if (clean.startsWith(".fakecall")) {
          replyText = `📞 *FAKECALL CANVAS GENERATED*\n\nPanggilan masuk dari: *Crush Rahasia 💖*`;
          imageCaptured = "https://image.pollinations.ai/prompt/whatsapp%20incoming%20video%20call%20interface%20dark%20mode?width=500&height=900&nologo=true";
          reaction = "📞";
        } else if (clean.startsWith(".kalender")) {
          replyText = `🗓️ *KALENDER BULAN INI*\n\nKalender dinding berhasil digenerate.`;
          imageCaptured = "https://image.pollinations.ai/prompt/modern%20wall%20calendar%20poster%20october%202026?width=800&height=950&nologo=true";
          reaction = "🗓️";
        } else if (clean.startsWith(".gempa") || clean.startsWith(".infogempa") || clean.startsWith(".autogempa")) {
          replyText = `🌋 *INFO GEMPA BUMI TERKINI (BMKG REAL-TIME)*\n\n` +
            `╭───「 *BMKG TEWS REPORT* 」\n` +
            `│ ⏱️ *Waktu Kejadian:* 30 Sep 2026 - 17:58:51 WIB\n` +
            `│ 💥 *Magnitudo:* M 4.7 SR\n` +
            `│ 🌊 *Kedalaman:* 10 km\n` +
            `│ 📍 *Koordinat:* 10.02 LS - 123.65 BT\n` +
            `│ 🏙️ *Pusat Gempa:* Pusat gempa berada di laut 26 km Barat Kab. Kupang\n` +
            `│ ⚠️ *Potensi Tsunami:* Gempa ini dirasakan untuk diteruskan pada masyarakat\n` +
            `│ 📢 *Dirasakan (MMI):* IV Kab. Kupang, IV Kota Kupang\n` +
            `╰─────────────────────────────\n\n` +
            `📍 *Google Maps Pin:* https://www.google.com/maps?q=-10.02,123.65`;
          imageCaptured = "https://data.bmkg.go.id/DataMKG/TEWS/20260930175851.mmi.jpg";
          reaction = "🌋";
        } else if (clean.startsWith(".cuaca") || clean.startsWith(".weather")) {
          const cName = clean.replace(/^\.(cuaca|weather|prakiraancuaca)\s*/i, "").trim() || "Jakarta";
          replyText = `🌤️ *INFORMASI CUACA REAL-TIME*\n\n` +
            `╭───「 *LOKASI: ${cName.toUpperCase()}* 」\n` +
            `│ 📍 *Wilayah:* DKI Jakarta, Indonesia\n` +
            `│ 🌡️ *Suhu Udara:* 28°C (Terasa seperti 31°C)\n` +
            `│ ☁️ *Kondisi Cuaca:* Hujan Ringan / Berawan\n` +
            `│ 💧 *Kelembapan:* 73%\n` +
            `│ 🌬️ *Kecepatan Angin:* 12 km/jam\n` +
            `│ ☀️ *Indeks UV:* 2\n` +
            `╰─────────────────────────────`;
          reaction = "🌤️";
        } else if (clean.startsWith(".jadwalsholat") || clean.startsWith(".sholat")) {
          const sName = clean.replace(/^\.(jadwalsholat|sholat|jadwalsholatkota)\s*/i, "").trim() || "Jakarta";
          replyText = `🕌 *JADWAL SHOLAT RESMI KEMENAG RI*\n\n` +
            `╭───「 *KOTA ${sName.toUpperCase()}* 」\n` +
            `│ 📅 *Tanggal:* Rabu, 30/09/2026\n` +
            `│ 🌇 *Imsak:* \`04:14\` WIB\n` +
            `│ 🌅 *Subuh:* \`04:24\` WIB\n` +
            `│ 🌄 *Terbit:* \`05:35\` WIB\n` +
            `│ ☀️ *Dhuha:* \`06:02\` WIB\n` +
            `│ 🛕 *Dzuhur:* \`11:46\` WIB\n` +
            `│ 🌆 *Ashar:* \`14:52\` WIB\n` +
            `│ 🌃 *Maghrib:* \`17:50\` WIB\n` +
            `│ 🌌 *Isya:* \`18:59\` WIB\n` +
            `╰─────────────────────────────`;
          reaction = "🕌";
        } else if (clean.startsWith(".workout") || clean.startsWith(".olahraga") || clean.startsWith(".workoout") || clean.startsWith(".gymtimer")) {
          const isSad = clean.includes("sad") || clean.includes("galau");
          const titleName = isSad ? "💔 SAD GYM & SLOWED REVERB (LAGU ASLI NON-AI)" : "⚡ BRAZILIAN PHONK & DRIFT FUNK (LAGU ASLI NON-AI)";
          const song1 = isSad ? "Past Lives (Slowed + Reverb) - BØRNS" : "Montagem PR Funk - MC PR & DJ Holanda";
          const song2 = isSad ? "Memory Reboot - VØJ, Narvent" : "AUTOMOTIVO PHONK - DJ BK";

          replyText = `🏋️ *TEMAN OLAHRAGA & TIMER FITNESS SKALA MENIT ASLI*\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
            `╭───「 *SESI: ${titleName}* 」\n` +
            `│ ⏱️ *Total Durasi Sesi:* *15 MENIT PENUH*\n` +
            `│ 🔥 *Estimasi Pembakaran:* ~350 - 550 kkal\n` +
            `│ 🎧 *Kategori Musik:* Musik Phonk & Sad Gym Asli Manusia (Non-AI Official)\n` +
            `╰─────────────────────────────\n\n` +
            `🎵 *DAFTAR LAGU MANUSIA ASLI (NON-AI OFFICIAL TRACKS):*\n\n` +
            `  1. *${song1}*\n     ▶️ YouTube: https://www.youtube.com/results?search_query=${encodeURIComponent(song1)}\n     🎧 Spotify: https://open.spotify.com/search/${encodeURIComponent(song1)}\n\n` +
            `  2. *${song2}*\n     ▶️ YouTube: https://www.youtube.com/results?search_query=${encodeURIComponent(song2)}\n     🎧 Spotify: https://open.spotify.com/search/${encodeURIComponent(song2)}\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `⏱️ *JADWAL TIMER LATIHAN HITUNGAN MENIT ASLI:*\n\n` +
            `🟢 *1. MENIT ke-0 s/d MENIT ke-2 (2 MENIT)* 🏃‍♂️\n` +
            `   └ *PEMANASAN (WARM-UP):* Jumping Jacks & Peregangan Otot.\n` +
            `   └ 🎵 *Lagu:* _${song1}_\n\n` +
            `🔥 *2. MENIT ke-2 s/d MENIT ke-7 (5 MENIT)* 💥\n` +
            `   └ *WORK SET 1 (LATIHAN INTI):* Push-Up, Burpees, Squats, Lunges.\n` +
            `   └ 🎵 *Lagu:* _${song2}_\n\n` +
            `🛑 *3. MENIT ke-7 s/d MENIT ke-8 (1 MENIT)* 💧\n` +
            `   └ *ISTIRAHAT & HIDRASI:* Minum air putih & atur napas.\n\n` +
            `💪 *4. MENIT ke-8 s/d MENIT ke-13 (5 MENIT)* ⚡\n` +
            `   └ *WORK SET 2 (SPRINT MAKSIMAL):* Dorong sisa tenaga sampai batas kemampuan!\n\n` +
            `🎉 *5. MENIT ke-13 (2 MENIT)* 🏆\n` +
            `   └ *PENDINGINAN (COOL-DOWN):* Sesi 15 Menit Selesai!\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `💡 *Petunjuk:* Buka link lagu asli di Spotify/YouTube di atas, pasang earphone, lalu jalankan latihan sesuai timer menit di atas! 💪`;
          reaction = "🏋️";
        } else if (clean.startsWith(".tinggiideal") || clean.startsWith(".kalkulatortinggi") || clean.startsWith(".idealtinggi")) {
          const tName = clean.replace(/^\.(tinggiideal|kalkulatortinggi|idealtinggi|tinggiumur)\s*/i, "").trim() || "16 l";
          replyText = `📏 *KALKULATOR TINGGI & BERAT BADAN IDEAL WHO*\n\n` +
            `╭───「 *PROFIL UMUR ${tName.toUpperCase()}* 」\n` +
            `│ 👤 *Jenis Kelamin:* Laki-laki 👦\n` +
            `│ 🎂 *Usia:* 16 Tahun\n` +
            `│ 📐 *Tinggi Ideal Median:* *170 cm*\n` +
            `│ 📏 *Rentang Normal WHO:* 162 cm - 176 cm\n` +
            `│ ⚖️ *Rentang Berat Ideal:* 50 kg - 68 kg\n` +
            `│ 🚀 *Fase Tubuh:* Masa Pertumbuhan Aktif (Growth Spurt) 🚀\n` +
            `╰─────────────────────────────\n\n` +
            `💡 *Tips Memaksimalkan Tinggi Badan:* Lompat tali (Jump Rope), Renang, Asupan Kalsium & Protein, serta Tidur Cepat sebelum jam 22.00 (Hormon Pertumbuhan HGH).`;
          reaction = "📏";
        } else if (clean.startsWith(".timer") || clean.startsWith(".pengingat") || clean.startsWith(".alarmtimer")) {
          const tText = clean.replace(/^\.(timer|pengingat|alarmtimer)\s*/i, "").trim() || "15 Istirahat mata";
          const tNum = parseInt(tText, 10) || 15;
          const tMsg = tText.replace(/^\d+\s*/, "") || "Waktu Istirahat / Aktivitas Selesai!";
          replyText = `⏱️ *TIMER BOT AKURAT BERJALAN*\n\n` +
            `╭───「 *INFORMASI TIMER* 」\n` +
            `│ ⏳ *Durasi:* *${tNum} MENIT PENUH* (${tNum * 60} Detik)\n` +
            `│ 🕒 *Jam Mulai:* 14:42:00 WIB\n` +
            `│ ⏰ *Target Selesai:* 14:${42 + tNum}:00 WIB\n` +
            `│ 🔔 *Pesan Pengingat:* ${tMsg}\n` +
            `╰─────────────────────────────\n\n` +
            `_Bot menggunakan logika perhitungan menit akurat 60.000 ms/menit dan akan otomatis memberikan notifikasi pengingat tepat saat timer habis._`;
          reaction = "⏱️";
        } else if (clean.startsWith(".pomodoro") || clean.startsWith(".fokus") || clean.startsWith(".fokustimer")) {
          replyText = `🍅 *SESI POMODORO HITUNGAN MENIT AKURAT*\n\n` +
            `╭───「 *JADWAL POMODORO* 」\n` +
            `│ 🎯 *Fase Fokus:* *25 MENIT* (14:42 WIB - 15:07 WIB)\n` +
            `│ ☕ *Fase Istirahat:* *5 MENIT* (15:07 WIB - 15:12 WIB)\n` +
            `╰─────────────────────────────\n\n` +
            `🧠 *Mulai Fokus:* Matikan notifikasi HP dan mulailah belajar/bekerja sekarang!`;
          reaction = "🍅";
        } else if (clean.startsWith(".balogo")) {
          replyText = `🔷 *BLUE ARCHIVE LOGO CANVAS*\n\nLogo: *Blue Archive*`;
          imageCaptured = "https://image.pollinations.ai/prompt/blue%20archive%20game%20logo%20typography%20anime%20style%20white%20background?width=850&height=400&nologo=true";
          reaction = "🔷";
        } else if (clean.startsWith(".ai")) {
          const q = cmd.replace(/^\.ai\s*/i, "") || "Halo!";
          replyText = `🤖 *AI ASSISTANT (Gemini)*\n\nHalo! Terkait pertanyaan "*${q}*":\nIni adalah respon analisis cerdas dengan penalaran logis, terstruktur, dan relevan sesuai konteks.`;
          reaction = "💡";
        } else if (clean.startsWith(".ping")) {
          replyText = `🏓 *Pong!*\nKecepatan respon: 18ms\nStatus Baileys: Multi-Device Ready\nRAM: 48 MB`;
          reaction = "⚡";
        } else if (clean.startsWith(".profile") || clean.startsWith(".me") || clean.startsWith(".profil") || clean.startsWith(".scan")) {
          if (isOwnerSender) {
            replyText = `🔍 *HASIL SCAN & VERIFIKASI NOMOR BOT* 🔍\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📱 *Nomor HP:* +62 878-9128-4460\n🆔 *ID Akun (LID):* 56106063794223@lid\n🌐 *JID:* 6287891284460@s.whatsapp.net\n🛡️ *Hasil Scan Database:*\n   ➥ Status: *👑 OWNER (SUPER ADMIN)*\n   ➥ Verifikasi: COCOK DENGAN DATABASE OWNER & DEVELOPER 👑\n   ➥ Sistem: Nomor cocok dengan Owner resmi! Terverifikasi sebagai Founder dengan Root Access & Limit Tanpa Batas! ✅\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n👑 *KARTU PROFIL OWNER & DEVELOPER* 👑\n\n• Nama: GhanzStudio 👑\n• Nomor HP: +62 878-9128-4460\n• ID WhatsApp (LID): 56106063794223@lid\n• Link WhatsApp: https://wa.me/6287891284460\n• JID Akun: 6287891284460@s.whatsapp.net\n• Status Akun: 👑 OWNER / FOUNDER (SUPER ADMIN)\n• Hak Akses: 🛡️ FULL ROOT ACCESS (ALL PRIVILEGES)\n• Limit Energi: ⚡ Unlimited (Bebas Kuota Limit)\n• Saldo Koin: 🪙 Unlimited (Sultan Bot)\n• Level: 🎖️ Level 999 (Max Developer)\n• Terdaftar: Terverifikasi Permanen ✅\n• Mode: Bebas Cooldown & Anti-Spam Bypass`;
          } else {
            replyText = `🔍 *HASIL SCAN & VERIFIKASI NOMOR BOT* 🔍\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📱 *Nomor:* +${senderNumberToUse}\n🌐 *JID:* ${senderNumberToUse}@s.whatsapp.net\nℹ️ *Hasil Scan Database:*\n   ➥ Status: *👤 PENGGUNA STANDAR*\n   ➥ Verifikasi: Terdaftar sebagai pengguna standar bot.\n   ➥ Sistem: Ketik .daftar untuk registrasi atau hubungi owner untuk upgrade VIP.\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n👤 *KARTU PROFIL PENGGUNA*\n\n• Nama: Pengguna\n• Nomor HP: +${senderNumberToUse}\n• Link WhatsApp: https://wa.me/${senderNumberToUse}\n• JID Akun: ${senderNumberToUse}@s.whatsapp.net\n• Status: 👤 USER BIASA\n• Level: 1 (Exp: 0)\n• Koin: 🪙 1.000\n• Limit: ⚡ 50 tersisa\n• Terdaftar: Sudah Terverifikasi ✅\n• Ulang Tahun: Belum diatur\n• Total Command: 1x digunakan\n\n💡 *Tips:* Hubungi Owner untuk simpan nomormu ke database Auto-Prem agar mendapatkan status *👑 VIP PREMIUM* otomatis setiap kali chat!`;
          }
          reaction = isOwnerSender ? "👑" : "👤";
        } else {
          const rawCmd = cmd.trim().replace(/^\./, '').split(/\s+/)[0];
          const suggestion = findClosestCommand(rawCmd);
          if (suggestion && suggestion.bestMatch) {
            replyText = `❓ *PERINTAH TIDAK DITEMUKAN*\n\nApakah maksudmu: *.${suggestion.bestMatch}* ?\n\n💡 *Tips:* Ketik *.menu* untuk melihat seluruh daftar perintah.`;
            reaction = "❓";
          } else {
            replyText = `❓ *PERINTAH TIDAK DIKENAL*\n\nPerintah \`${cmd}\` tidak terdaftar di sistem.\nKetik *.menu* atau *.allmenu* untuk melihat seluruh daftar perintah.`;
            reaction = "❓";
          }
        }
      }

      const botMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: "bot",
        text: replyText,
        image: imageCaptured,
        reaction: reaction,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setChatMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      setChatMessages(prev => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: "bot",
          text: `❌ Terjadi kendala saat memproses: ${err.message}`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setSimulating(false);
    }
  };

  const handleGitPush = async () => {
    setPushing(true);
    setPushResult(null);
    try {
      const res = await fetch('/api/git/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: githubToken })
      });
      const data = await res.json();
      if (res.ok) {
        setPushResult({ success: true, message: data.message || 'Push berhasil!' });
        fetchGitStatus();
      } else {
        setPushResult({ success: false, message: data.error || 'Gagal push' });
      }
    } catch (err: any) {
      setPushResult({ success: false, message: err.message });
    } finally {
      setPushing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const filteredCommands = commands.filter(cmd => {
    const matchesCategory = selectedCategory === 'ALL' || cmd.category === selectedCategory;
    const matchesSearch =
      cmd.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmd.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmd.aliases.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getStatusBadge = () => {
    const status = statusData?.bot.status;
    switch (status) {
      case 'CONNECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Terhubung (Online)
          </span>
        );
      case 'SCAN_QR':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            Menunggu Scan QR
          </span>
        );
      case 'PAIRING_READY':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-sky-500/10 text-sky-600 border border-sky-500/20">
            <span className="w-2 h-2 rounded-full bg-sky-500"></span>
            Kode Pairing Siap
          </span>
        );
      case 'CONNECTING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 border border-blue-500/20">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Menghubungkan...
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-500/10 text-zinc-600 border border-zinc-500/20">
            <span className="w-2 h-2 rounded-full bg-zinc-400"></span>
            Siap Pairing (Standby)
          </span>
        );
    }
  };

  return (
    <div id="app-container" className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col antialiased">
      {/* Top Navigation Bar */}
      <header id="main-header" className="bg-white border-b border-zinc-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold tracking-tight text-zinc-900">
                  {statusData?.bot.botName || 'Ghanz Bot MD'}
                </h1>
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 font-mono">
                  v2.0 MD
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Created by GhanzStudio • Baileys Multi-Device Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold cursor-pointer transition">
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              <span>{uploadingQris ? 'Mengunggah...' : 'Pilih Gambar Galeri HP'}</span>
              <input type="file" accept="image/*" onChange={handleDirectGalleryUpload} className="hidden" />
            </label>
            <a
              href="/api/download-zip"
              download="ghanz-bot-md.zip"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium transition"
              title="Unduh seluruh source code dalam bentuk file ZIP"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Unduh</span> ZIP
            </a>
            {getStatusBadge()}
            <button
              id="refresh-status-btn"
              onClick={fetchStatus}
              className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition"
              title="Perbarui Status"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* GitHub Pages Mode Banner */}
        {isGitHubPages && (
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-sky-900">
                  Mode Web Showcase (GitHub Pages: {window.location.hostname})
                </div>
                <p className="text-xs text-sky-700 mt-0.5 leading-relaxed">
                  Halaman ini berjalan di GitHub Pages. WhatsApp Bot memerlukan server <strong>Node.js aktif</strong> untuk terhubung ke WhatsApp. Anda dapat menjalankan bot ini di <strong>HP Android (Termux)</strong> atau VPS gratis.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('deploy')}
              className="w-full sm:w-auto px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg transition shrink-0 text-center"
            >
              Panduan Jalankan di HP &rarr;
            </button>
          </div>
        )}

        {/* QRIS Upload Success Banner */}
        {qrisUploadMsg && (
          <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs">
            <span>{qrisUploadMsg}</span>
            <button onClick={() => setQrisUploadMsg('')} className="text-emerald-700 hover:text-emerald-950 font-bold ml-2">✕</button>
          </div>
        )}

        {/* Mobile Quick Helper Notice */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-emerald-900">
                Sedang Membuka di HP? Gunakan Kode Pairing 8-Digit!
              </div>
              <div className="text-[11px] text-emerald-700">
                Kamu tidak perlu scan QR kamera di layar yang sama. Cukup input nomor WhatsApp, kode pairing akan langsung muncul di notifikasi WhatsApp HP kamu.
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('pairing')}
            className="w-full sm:w-auto px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium rounded-lg transition shrink-0 text-center"
          >
            Tautkan via Pairing &rarr;
          </button>
        </div>

        {/* Quick Metrics Bar */}
        <div id="metrics-grid" className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-zinc-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500">Total Fitur</span>
              <Layers className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-zinc-900">
                {statusData?.totalCommands || commands.length || 180}+
              </span>
              <span className="text-xs text-zinc-500">di 22 kategori</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-zinc-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500">Database</span>
              <Database className="w-4 h-4 text-sky-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-sm font-semibold text-zinc-900 truncate">
                {statusData?.mongo.isInMemory ? 'Hybrid In-Memory' : 'MongoDB Connected'}
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-zinc-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500">Sistem & Memory</span>
              <Cpu className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-sm font-semibold text-zinc-900">
                {statusData?.system.memory.rss || 0} MB RSS
              </span>
              <span className="text-xs text-zinc-500">Node {process.version || 'v20'}</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-zinc-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500">Prefix & Owner</span>
              <ShieldCheck className="w-4 h-4 text-violet-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-sm font-semibold text-zinc-900">
                Prefix: <code className="bg-zinc-100 px-1 rounded">{statusData?.bot.prefix || '.'}</code>
              </span>
              <span className="text-xs text-zinc-500 truncate">{statusData?.bot.ownerName || 'Ghanz'}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-200 gap-1 overflow-x-auto scrollbar-none pb-0.5">
          <button
            id="tab-stats-btn"
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 flex items-center gap-2 transition shrink-0 ${
              activeTab === 'stats'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            Statistik Popularitas Fitur (7 Hari)
          </button>
          <button
            id="tab-console-btn"
            onClick={() => setActiveTab('console')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 flex items-center gap-2 transition shrink-0 ${
              activeTab === 'console'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Terminal className="w-4 h-4" />
            Simulator Perintah WhatsApp
          </button>
          <button
            id="tab-commands-btn"
            onClick={() => setActiveTab('commands')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 flex items-center gap-2 transition shrink-0 ${
              activeTab === 'commands'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            Katalog Fitur ({commands.length})
          </button>
          <button
            id="tab-pairing-btn"
            onClick={() => setActiveTab('pairing')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 flex items-center gap-2 transition shrink-0 ${
              activeTab === 'pairing'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <QrCode className="w-4 h-4" />
            Koneksi WA & QR
          </button>
          <button
            id="tab-premium-btn"
            onClick={() => setActiveTab('premium')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 flex items-center gap-2 transition shrink-0 ${
              activeTab === 'premium'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-500" />
            Simpan Auto-Prem ({premiumNumbers.length})
          </button>
          <button
            id="tab-approvals-btn"
            onClick={() => { setActiveTab('approvals'); fetch18PlusRequests(); }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 flex items-center gap-2 transition shrink-0 ${
              activeTab === 'approvals'
                ? 'border-rose-600 text-rose-700 bg-rose-50/50'
                : 'border-transparent text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-rose-600" />
            Akses 18+ & Permohonan {requests18.pendingCount > 0 ? (
              <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                {requests18.pendingCount} Req
              </span>
            ) : (
              <span className="text-zinc-400 font-normal text-xs">
                ({requests18.approvedCount} ACC)
              </span>
            )}
          </button>
          <button
            id="tab-git-btn"
            onClick={() => setActiveTab('git')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 flex items-center gap-2 transition shrink-0 ${
              activeTab === 'git'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Github className="w-4 h-4" />
            GitHub Push
          </button>
          <button
            id="tab-deploy-btn"
            onClick={() => setActiveTab('deploy')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 flex items-center gap-2 transition shrink-0 ${
              activeTab === 'deploy'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Jalankan di HP (Termux) & VPS
          </button>
        </div>

        {/* Tab 0: Recharts D3 Command Stats Chart */}
        {activeTab === 'stats' && (
          <CommandStatsChart
            onTestCommand={(cmd) => {
              setActiveTab('console');
              handleSimulateCommand(cmd);
            }}
          />
        )}

        {/* Tab 1: Live Simulator */}
        {activeTab === 'console' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-200 flex flex-col h-[560px] shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                    WhatsApp Interactive Live Test Console
                  </span>
                </div>
                <button
                  onClick={() => setChatMessages([])}
                  className="text-xs text-zinc-500 hover:text-zinc-900"
                >
                  Bersihkan Chat
                </button>
              </div>
              {/* Pengirim Switcher */}
              <div className="px-4 py-2 bg-zinc-100/90 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-zinc-600 font-medium">
                  <span>Simulasi Pengirim:</span>
                  <button
                    type="button"
                    onClick={() => setSimSenderNumber("6287891284460")}
                    className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${simSenderNumber === "6287891284460" ? "bg-amber-600 text-white shadow-xs" : "bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50"}`}
                  >
                    👑 Owner (+62 878-9128-4460)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimSenderNumber("6287817697830")}
                    className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${simSenderNumber !== "6287891284460" ? "bg-zinc-800 text-white shadow-xs" : "bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50"}`}
                  >
                    👤 Nomor Lain (+62 878-1769-7830)
                  </button>
                </div>
                <span className="text-[11px] font-mono text-zinc-500">
                  Aktif: +{simSenderNumber} ({simSenderNumber === "6287891284460" ? "Owner 👑" : "User Biasa 👤"})
                </span>
              </div>

              {/* Chat Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-zinc-100/50">
                {chatMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-xs ${
                        msg.sender === 'user'
                          ? 'bg-emerald-600 text-white rounded-tr-xs'
                          : 'bg-white text-zinc-800 border border-zinc-200 rounded-tl-xs whitespace-pre-wrap font-sans'
                      }`}
                    >
                      <div className="text-xs font-medium opacity-70 mb-1">
                        {msg.sender === 'user' ? (simSenderNumber === '6287891284460' ? 'GhanzStudio (Owner 👑)' : `Pengguna (+${simSenderNumber})`) : 'Ghanz Bot MD'}
                      </div>
                      {msg.image && (
                        <div className="mb-2 mt-1 rounded-xl overflow-hidden border border-zinc-200/80 max-w-[280px] sm:max-w-[320px]">
                          <img
                            src={msg.image}
                            alt="Donasi QRIS"
                            className="w-full h-auto object-contain block bg-zinc-950"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                      <div>{msg.text}</div>
                      {msg.reaction && (
                        <div className="mt-1 text-xs bg-zinc-100 border border-zinc-200 rounded-full px-2 py-0.5 inline-block text-zinc-700">
                          Reaksi: {msg.reaction}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-400 mt-1 px-1">{msg.time}</span>
                  </div>
                ))}
                {simulating && (
                  <div className="flex items-center gap-2 text-xs text-zinc-500 bg-white p-2.5 rounded-xl border border-zinc-200 w-fit">
                    <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" />
                    Bot sedang mengetik dan memproses perintah...
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form
                onSubmit={(e) => { e.preventDefault(); handleSimulateCommand(); }}
                className="p-3 bg-white border-t border-zinc-200 flex gap-2"
              >
                <input
                  id="simulator-input"
                  type="text"
                  value={inputCmd}
                  onChange={(e) => setInputCmd(e.target.value)}
                  placeholder="Ketik perintah (contoh: .menu, .ai ceritakan lelucon, .ping, .jadwalsholat Jakarta)..."
                  className="flex-1 px-4 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  id="simulator-send-btn"
                  type="submit"
                  disabled={simulating || !inputCmd.trim()}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm flex items-center gap-2 transition disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  Kirim
                </button>
              </form>
            </div>

            {/* Quick Command Suggestions */}
            <div className="bg-white rounded-xl border border-zinc-200 p-5 space-y-4">
              <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Uji Coba Cepat (Quick Test)
              </h2>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Klik tombol di bawah untuk langsung menguji fungsi bot secara instan:
              </p>

              <div className="space-y-2">
                {[
                  { cmd: '.menu', desc: 'Tampilkan menu navigasi interaktif' },
                  { cmd: '.donasi', desc: 'Info donasi Dana/Gopay/OVO & QRIS poster' },
                  { cmd: '.ping', desc: 'Cek latensi & server speed' },
                  { cmd: '.profile', desc: 'Lihat kartu profil & level user' },
                  { cmd: '.ai Siapa pengembang Ghanz Bot?', desc: 'Uji respon Gemini AI' },
                  { cmd: '.adventure', desc: 'Jelajahi hutan rimba RPG' },
                  { cmd: '.jadwalsholat Jakarta', desc: 'Cek jadwal sholat hari ini' },
                  { cmd: '.gempa', desc: 'Data gempa BMKG terkini' },
                  { cmd: '.hitungwrmlbb 300 52 70', desc: 'Hitung kalkulator WR MLBB' },
                  { cmd: '.daily', desc: 'Klaim hadiah koin harian' }
                ].map((item) => (
                  <button
                    key={item.cmd}
                    onClick={() => handleSimulateCommand(item.cmd)}
                    className="w-full text-left p-2.5 rounded-lg border border-zinc-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition group flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-mono font-semibold text-emerald-700 group-hover:text-emerald-800">
                        {item.cmd}
                      </div>
                      <div className="text-[11px] text-zinc-500">{item.desc}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-emerald-600 transition" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Feature Catalog */}
        {activeTab === 'commands' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              {/* Search Bar */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari perintah atau deskripsi..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Category Filter Badges */}
              <div className="flex flex-wrap gap-1.5 w-full sm:w-auto overflow-x-auto pb-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                      selectedCategory === cat
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Commands Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredCommands.map((cmd, idx) => (
                <div
                  key={`${cmd.category}-${cmd.name}-${idx}`}
                  className="bg-white p-4 rounded-xl border border-zinc-200 hover:border-emerald-300 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-sm font-semibold text-emerald-700">
                        .{cmd.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 font-medium">
                        {cmd.category}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-600 mt-2 line-clamp-2">
                      {cmd.description}
                    </p>

                    <div className="mt-2 text-[11px] font-mono text-zinc-400">
                      Penggunaan: {cmd.usage}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {cmd.premiumOnly && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">
                          VIP
                        </span>
                      )}
                      {cmd.ownerOnly && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-medium">
                          Owner
                        </span>
                      )}
                      {cmd.limitCost > 0 && (
                        <span className="text-[10px] text-zinc-500">
                          ⚡ {cmd.limitCost} limit
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab('console');
                        handleSimulateCommand(`.${cmd.name}`);
                      }}
                      className="text-xs text-emerald-600 hover:text-emerald-800 font-medium"
                    >
                      Uji &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: WhatsApp Connection & QR */}
        {activeTab === 'pairing' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* QR Code Card */}
            <div className="bg-white p-6 rounded-xl border border-zinc-200 flex flex-col items-center text-center">
              <h2 className="text-base font-semibold text-zinc-900 mb-1">
                Scan QR Code (WhatsApp Web)
              </h2>
              <p className="text-xs text-zinc-500 mb-4 max-w-sm">
                Buka WhatsApp di HP Anda &gt; Perangkat Tertaut &gt; Tautkan Perangkat &gt; Arahkan kamera ke kode QR ini.
              </p>

              {statusData?.bot.qrCodeUrl ? (
                <div className="p-3 bg-white border border-zinc-300 rounded-xl shadow-xs">
                  <img
                    src={statusData.bot.qrCodeUrl}
                    alt="WhatsApp QR Code"
                    className="w-56 h-56 object-contain"
                  />
                </div>
              ) : statusData?.bot.status === 'CONNECTED' ? (
                <div className="w-56 h-56 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col items-center justify-center p-4">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mb-2" />
                  <span className="text-sm font-semibold text-emerald-800">
                    Bot Sudah Terhubung!
                  </span>
                  <span className="text-xs text-emerald-600 mt-1">
                    Multi-Device session aktif
                  </span>
                </div>
              ) : (
                <div className="w-56 h-56 rounded-xl bg-zinc-100 border border-dashed border-zinc-300 flex flex-col items-center justify-center p-4 text-zinc-400 text-xs">
                  <QrCode className="w-10 h-10 mb-2 stroke-1" />
                  Menunggu sesi Baileys dimulai atau gunakan Pairing Code di sebelah kanan.
                </div>
              )}
            </div>

            {/* Pairing Code Card */}
            <div className="bg-white p-6 rounded-xl border border-zinc-200">
              <h2 className="text-base font-semibold text-zinc-900 mb-1">
                Tautkan via Pairing Code (8 Digit)
              </h2>
              <p className="text-xs text-zinc-500 mb-4">
                Tanpa kamera! Cukup masukkan nomor WhatsApp akun bot (dengan kode negara 62).
              </p>

              <form onSubmit={handleRequestPairing} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Nomor WhatsApp Bot
                  </label>
                  <input
                    type="text"
                    value={pairingPhone}
                    onChange={(e) => setPairingPhone(e.target.value)}
                    placeholder="Contoh: 6281234567890"
                    className="w-full px-4 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={pairingLoading || !pairingPhone}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {pairingLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Meminta Kode...
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      Dapatkan Kode Pairing
                    </>
                  )}
                </button>
              </form>

              {statusData?.bot.pairingCode && (
                <div className="mt-6 p-4 rounded-xl bg-sky-50 border border-sky-200 text-center">
                  <span className="text-xs text-sky-700 font-medium">
                    KODE PAIRING WHATSAPP ANDA:
                  </span>
                  <div className="text-3xl font-mono font-bold tracking-widest text-sky-900 my-2">
                    {statusData.bot.pairingCode}
                  </div>
                  <p className="text-[11px] text-sky-600">
                    Buka notifikasi di WhatsApp HP Anda dan masukkan kode 8 digit di atas.
                  </p>
                </div>
              )}

              {pairingMessage && (
                <div className="mt-4 text-xs p-3 rounded-lg bg-zinc-100 text-zinc-700">
                  {pairingMessage}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3.5: Auto-Premium Whitelist Numbers */}
        {activeTab === 'premium' && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="bg-linear-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200 p-5 rounded-2xl">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-xs">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                    Daftar Nomor Auto-Premium (Auto Prem Saat Chat)
                  </h2>
                  <p className="text-xs text-zinc-600 mt-1 max-w-2xl leading-relaxed">
                    Setiap nomor yang disimpan di sini akan <strong>otomatis menjadi VIP Premium secara instan</strong> setiap kali nomor tersebut mengirim pesan atau chat ke bot WhatsApp. Tidak perlu ketik <code>.addprem</code> berulang kali!
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Form Tambah Nomor Auto-Prem */}
              <div className="bg-white p-6 rounded-xl border border-zinc-200 md:col-span-1 shadow-xs">
                <h3 className="text-sm font-semibold text-zinc-900 mb-1 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-600" />
                  Simpan Nomor Baru
                </h3>
                <p className="text-xs text-zinc-500 mb-4">
                  Masukkan nomor WhatsApp (diawali 62 atau 08):
                </p>

                <form onSubmit={handleAddPremiumNumber} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Nomor WhatsApp
                    </label>
                    <input
                      type="text"
                      value={newPremNumber}
                      onChange={(e) => setNewPremNumber(e.target.value)}
                      placeholder="Contoh: 08123456789 atau 628123456789"
                      className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={premLoading || !newPremNumber.trim()}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg text-sm transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs"
                  >
                    {premLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Crown className="w-4 h-4" />
                        Simpan Nomor Auto-Prem
                      </>
                    )}
                  </button>
                </form>

                {premSuccessMsg && (
                  <div className={`mt-4 text-xs p-3 rounded-lg ${premSuccessMsg.startsWith('Error') ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                    {premSuccessMsg}
                  </div>
                )}

                <div className="mt-5 pt-4 border-t border-zinc-100 text-[11px] text-zinc-500 space-y-1">
                  <p className="font-semibold text-zinc-700">Keuntungan Auto-Prem:</p>
                  <p>• Limit Energi Unlimited (999,999)</p>
                  <p>• Bebas cooldown & antrean bot</p>
                  <p>• Akses ke seluruh menu VIP / Premium</p>
                  <p>• Data tersimpan permanen di database</p>
                </div>
              </div>

              {/* List Nomor Auto-Prem Tersimpan */}
              <div className="bg-white p-6 rounded-xl border border-zinc-200 md:col-span-2 shadow-xs flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                      <Users className="w-4 h-4 text-amber-600" />
                      Nomor Tersimpan ({premiumNumbers.length})
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Daftar nomor yang langsung berstatus Premium saat ngechat bot
                    </p>
                  </div>
                  <button
                    onClick={fetchPremiumNumbers}
                    className="text-xs text-zinc-500 hover:text-zinc-800 flex items-center gap-1 px-2.5 py-1 rounded-md border border-zinc-200"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Refresh
                  </button>
                </div>

                {premiumNumbers.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-zinc-200 rounded-xl">
                    <Crown className="w-10 h-10 text-zinc-300 mb-2" />
                    <p className="text-xs font-medium text-zinc-600">Belum ada nomor Auto-Prem yang disimpan</p>
                    <p className="text-[11px] text-zinc-400 mt-1 max-w-sm">
                      Gunakan formulir di sebelah kiri atau ketik <code>.addprem &lt;nomor&gt;</code> di WhatsApp untuk menyimpan nomor.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-100 max-h-[420px] overflow-y-auto">
                    {premiumNumbers.map((num, idx) => (
                      <div key={num} className="py-3 flex items-center justify-between hover:bg-zinc-50/80 px-2 rounded-lg transition">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="font-mono text-sm font-semibold text-zinc-800">
                              +{num}
                            </div>
                            <div className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                              <CheckCircle2 className="w-3 h-3" />
                              Auto Prem Aktif • Akses VIP Permanen
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setActiveTab('console');
                              handleSimulateCommand(`.profile`);
                            }}
                            className="text-xs text-zinc-500 hover:text-zinc-800 px-2.5 py-1 rounded border border-zinc-200"
                          >
                            Cek Profil
                          </button>
                          <button
                            onClick={() => handleDeletePremiumNumber(num)}
                            className="text-xs text-rose-600 hover:bg-rose-50 p-1.5 rounded transition"
                            title="Hapus dari Auto-Prem"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* SEKSI SCAN NOMOR (.profile / .me) LIVE VERIFIER */}
            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                    <Scan className="w-4 h-4 text-indigo-600" />
                    Pindai & Verifikasi Nomor (.profile / .me)
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Sistem pemindaian nomor otomatis: jika nomor cocok dengan Owner langsung jadi Owner, jika cocok dengan database Auto-Prem langsung jadi VIP!
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setScanPhoneInput('6287891284460');
                    }}
                    className="text-[11px] bg-amber-50 text-amber-700 px-2.5 py-1 rounded border border-amber-200 hover:bg-amber-100"
                  >
                    Nomor Owner (6287891284460)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (premiumNumbers[0]) setScanPhoneInput(premiumNumbers[0]);
                    }}
                    className="text-[11px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded border border-emerald-200 hover:bg-emerald-100"
                  >
                    Nomor Auto-Prem Tersimpan
                  </button>
                </div>
              </div>

              <form onSubmit={handleTestScanNumber} className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={scanPhoneInput}
                  onChange={(e) => setScanPhoneInput(e.target.value)}
                  placeholder="Masukkan nomor yang ingin dipindai (cth: 6287891284460)"
                  className="flex-1 px-3.5 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={isScanning || !scanPhoneInput.trim()}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm flex items-center gap-2 disabled:opacity-50 transition"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Memindai...
                    </>
                  ) : (
                    <>
                      <Scan className="w-4 h-4" />
                      Pindai & Verifikasi
                    </>
                  )}
                </button>
              </form>

              {scanResult && (
                <div className={`p-4 rounded-xl border ${
                  scanResult.matchedType === 'OWNER'
                    ? 'bg-amber-50/70 border-amber-300 text-amber-900'
                    : scanResult.matchedType === 'PREMIUM'
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-800'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm font-mono">{scanResult.formattedPhone || `+${scanResult.number}`}</span>
                        {scanResult.lid && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-200 text-zinc-700 font-mono font-medium">
                            LID: {scanResult.lid}
                          </span>
                        )}
                        <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          scanResult.matchedType === 'OWNER'
                            ? 'bg-amber-600 text-white'
                            : scanResult.matchedType === 'PREMIUM'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-zinc-600 text-white'
                        }`}>
                          {scanResult.statusLabel}
                        </span>
                      </div>
                      <p className="text-xs font-semibold mt-1">
                        {scanResult.verificationDetail}
                      </p>
                      <p className="text-xs opacity-90 mt-0.5">
                        {scanResult.synchronizationMessage}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab('console');
                        setSimSenderNumber(scanResult.number); setActiveTab('console'); handleSimulateCommand(`.profile ${scanResult.number}`, scanResult.number, scanResult.user?.name || 'User');
                      }}
                      className="text-xs px-3 py-1.5 bg-white shadow-xs border border-zinc-200 rounded-lg hover:bg-zinc-100 flex items-center gap-1 font-medium text-zinc-700"
                    >
                      <Play className="w-3 h-3 text-emerald-600" />
                      Jalankan .profile
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 pt-3 border-t border-black/10 text-xs font-mono">
                    <div>
                      <span className="opacity-60 block text-[10px]">ROLE AKUN:</span>
                      <strong className="uppercase">{scanResult.user.role}</strong>
                    </div>
                    <div>
                      <span className="opacity-60 block text-[10px]">STATUS VIP:</span>
                      <strong>{scanResult.user.premium ? 'AKTIF (VIP)' : 'REGULER'}</strong>
                    </div>
                    <div>
                      <span className="opacity-60 block text-[10px]">LIMIT ENERGI:</span>
                      <strong>{scanResult.user.limit >= 99999 ? 'UNLIMITED ⚡' : `${scanResult.user.limit} Kuota`}</strong>
                    </div>
                    <div>
                      <span className="opacity-60 block text-[10px]">SALDO KOIN:</span>
                      <strong>🪙 {Number(scanResult.user.koin || 0).toLocaleString('id-ID')}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SEKSI DAFTAR PENGGUNA SCAN QR CODE WA WEB */}
            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    Pengguna Scan QR Code WA Web ({scannedUsers.length})
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Setiap nomor yang memindai QR Code WA Web otomatis disimpan ke database <code>data/scanned_users.json</code> &amp; <code>users.json</code>
                  </p>
                </div>
                <button
                  onClick={fetchScannedUsers}
                  className="text-xs text-zinc-500 hover:text-zinc-800 flex items-center gap-1 px-2.5 py-1 rounded-md border border-zinc-200"
                >
                  <RefreshCw className="w-3 h-3" />
                  Refresh
                </button>
              </div>

              {scannedUsers.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-zinc-200 rounded-xl">
                  <Smartphone className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                  <p className="text-xs font-medium text-zinc-600">Belum ada user yang tercatat scan QR code</p>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Saat pengguna memindai QR Code di tab &quot;Koneksi WA &amp; QR&quot; atau terminal pair.js, nomor dan identitasnya akan otomatis muncul dan tersimpan di sini.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100 max-h-[300px] overflow-y-auto">
                  {scannedUsers.map((sc, idx) => (
                    <div key={sc.number || sc.jid || idx} className="py-2.5 flex items-center justify-between hover:bg-zinc-50/80 px-2 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-mono text-sm font-semibold text-zinc-800 flex items-center gap-2">
                            +{sc.number || sc.jid?.split('@')[0]}
                            <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-zinc-100 text-zinc-600">
                              {sc.name || 'Pengguna'}
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-500 flex items-center gap-2">
                            <span>Perangkat: {sc.device || 'WA Multi-Device'}</span>
                            <span>•</span>
                            <span>Tersimpan: {new Date(sc.scannedAt).toLocaleDateString('id-ID')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setScanPhoneInput(sc.number || sc.jid?.split('@')[0]);
                            handleTestScanNumber();
                          }}
                          className="text-xs text-indigo-600 hover:bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200"
                        >
                          Pindai Profil
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 18+: Group 18+ Approvals & Request Manager */}
        {activeTab === 'approvals' && (
          <div className="space-y-6">
            {/* Header / Intro Card */}
            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-rose-600" />
                    Manajemen Persetujuan Akses 18+ Grup
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    Kelola permohonan grup yang meminta izin pembuatan foto/animasi 18+ (.anime18, .waifu18, .ecchi). Semua persetujuan tersimpan permanen di database.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 font-semibold rounded-lg">
                    {requests18.pendingCount} Permohonan Pending
                  </span>
                  <button
                    onClick={fetch18PlusRequests}
                    className="p-2 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg transition border border-zinc-200"
                    title="Refresh Data"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {approvalMsg && (
                <div className={`mt-4 text-xs p-3 rounded-lg ${approvalMsg.startsWith('Error') ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                  {approvalMsg}
                </div>
              )}
            </div>

            {/* Grid 3 Kolom */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Kolom 1: Form Input Manual JID */}
              <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2 mb-1">
                    <Plus className="w-4 h-4 text-rose-600" />
                    Buka Akses Manual
                  </h3>
                  <p className="text-xs text-zinc-500 mb-4">
                    Masukkan ID JID Grup WhatsApp (Contoh: <code>120363999999999999@g.us</code>)
                  </p>

                  <form onSubmit={(e) => { e.preventDefault(); handleAcc18Group(manualJidInput); }} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 mb-1">
                        ID JID Grup / No. HP
                      </label>
                      <input
                        type="text"
                        value={manualJidInput}
                        onChange={(e) => setManualJidInput(e.target.value)}
                        placeholder="Contoh: 120363xxx@g.us"
                        className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="submit"
                        disabled={approvingLoading || !manualJidInput.trim()}
                        className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg text-xs transition disabled:opacity-50 flex items-center justify-center gap-1 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        ACC 18+
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject18Group(manualJidInput)}
                        disabled={approvingLoading || !manualJidInput.trim()}
                        className="py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium rounded-lg text-xs transition disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        Cabut Akses
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSendTestRequest(manualJidInput)}
                      disabled={approvingLoading || !manualJidInput.trim()}
                      className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-medium rounded-lg text-xs transition flex items-center justify-center gap-1"
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      + Tambah Ke Daftar Pending
                    </button>
                  </form>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-100 text-[11px] text-zinc-500 space-y-1">
                  <p className="font-semibold text-zinc-700">📌 Panduan ACC 18+:</p>
                  <p>• Grup mengajukan via <code>.ajuakses18 &lt;alasan&gt;</code> di WA.</p>
                  <p>• Notifikasi permohonan akan muncul otomatis di dashboard ini.</p>
                  <p>• Klik tombol <strong>ACC 18+</strong> untuk menyetujui, bot akan otomatis mengirimkan notifikasi ke grup.</p>
                </div>
              </div>

              {/* Kolom 2: Daftar Permohonan Menunggu (Pending) */}
              <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-xs md:col-span-2 flex flex-col">
                <h3 className="text-sm font-semibold text-zinc-900 flex items-center justify-between mb-4">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    Permohonan Menunggu ACC ({requests18.pending?.length || 0})
                  </span>
                  {requests18.pending?.length > 0 && (
                    <span className="text-[11px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">
                      Memerlukan Tindakan
                    </span>
                  )}
                </h3>

                {(!requests18.pending || requests18.pending.length === 0) ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-zinc-200 rounded-xl">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-2" />
                    <p className="text-xs font-semibold text-zinc-700">Tidak ada permohonan 18+ yang pending</p>
                    <p className="text-[11px] text-zinc-400 mt-1 max-w-sm">
                      Saat ada admin grup yang mengetik <code>.ajuakses18 &lt;alasan&gt;</code> di WhatsApp, permohonannya akan muncul di sini secara real-time.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {requests18.pending.map((req) => (
                      <div key={req.id} className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-zinc-900">{req.name || 'Grup WhatsApp'}</h4>
                            <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-mono font-medium">
                              PENDING
                            </span>
                          </div>
                          <div className="font-mono text-xs text-zinc-600 mt-0.5">
                            ID: {req.id}
                          </div>
                          {req.reason && (
                            <div className="text-xs text-zinc-700 italic mt-1 bg-amber-100/60 px-2 py-1 rounded">
                              "{req.reason}"
                            </div>
                          )}
                          <div className="text-[11px] text-zinc-500 mt-1 flex items-center gap-2">
                            <span>Admin Pengaju: @{req.requestedBy ? req.requestedBy.split('@')[0] : 'Admin'}</span>
                            {req.requestedAt && (
                              <>
                                <span>•</span>
                                <span>{new Date(req.requestedAt).toLocaleDateString('id-ID')}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                          <button
                            onClick={() => handleAcc18Group(req.id)}
                            disabled={approvingLoading}
                            className="flex-1 sm:flex-initial px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-1 shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            ACC 18+
                          </button>
                          <button
                            onClick={() => handleReject18Group(req.id)}
                            disabled={approvingLoading}
                            className="flex-1 sm:flex-initial px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-medium rounded-lg transition"
                          >
                            Tolak
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Section: List Grup yang Sudah Di-ACC 18+ */}
            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Daftar Grup Berizin 18+ Aktif ({requests18.approved?.length || 0})
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Grup yang telah resmi mendapatkan ACC dari Owner. Anggota grup ini dapat menggunakan perintah foto 18+.
                  </p>
                </div>
                <button
                  onClick={fetch18PlusRequests}
                  className="text-xs text-zinc-500 hover:text-zinc-800 flex items-center gap-1 px-2.5 py-1 rounded-md border border-zinc-200"
                >
                  <RefreshCw className="w-3 h-3" />
                  Refresh
                </button>
              </div>

              {(!requests18.approved || requests18.approved.length === 0) ? (
                <div className="p-8 text-center border-2 border-dashed border-zinc-200 rounded-xl">
                  <ShieldCheck className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
                  <p className="text-xs font-medium text-zinc-600">Belum ada grup yang disetujui untuk fitur 18+</p>
                  <p className="text-[11px] text-zinc-400 mt-1 max-w-sm">
                    Gunakan kolom input manual di atas atau setujui permohonan di daftar pending untuk memberikan izin ke grup.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100 max-h-[350px] overflow-y-auto">
                  {requests18.approved.map((g, idx) => (
                    <div key={g.id} className="py-3 flex items-center justify-between hover:bg-zinc-50/80 px-2 rounded-lg transition">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-sm text-zinc-800 flex items-center gap-2">
                            {g.name || 'Grup WhatsApp'}
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                              DIIZINKAN 18+
                            </span>
                          </div>
                          <div className="font-mono text-xs text-zinc-500 mt-0.5">
                            ID: {g.id}
                          </div>
                          <div className="text-[11px] text-zinc-400 mt-0.5">
                            Disetujui Oleh: {g.approvedBy || 'Owner'} {g.approvedAt ? `• ${new Date(g.approvedAt).toLocaleDateString('id-ID')}` : ''}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleReject18Group(g.id)}
                        disabled={approvingLoading}
                        className="text-xs text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 transition font-medium flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Cabut Izin
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: GitHub Push */}
        {activeTab === 'git' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-zinc-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
                    <Github className="w-5 h-5" />
                    Target Repository: https://github.com/GhanzStudio/bot
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    Kirimkan seluruh kode sumber bot WhatsApp ke akun GitHub GhanzStudio.
                  </p>
                </div>
                <a
                  href="https://github.com/GhanzStudio/bot"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg border border-zinc-300 text-xs font-medium hover:bg-zinc-50 flex items-center gap-1"
                >
                  Buka Repo <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Push Action Box */}
              <div className="mt-6 p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    GitHub Personal Access Token (PAT)
                  </label>
                  <input
                    type="password"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx (dengan hak akses repo:push)"
                    className="w-full px-4 py-2 bg-white border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Dapat dibuat di: GitHub &gt; Settings &gt; Developer settings &gt; Personal access tokens.
                  </p>
                </div>

                <button
                  onClick={handleGitPush}
                  disabled={pushing || !githubToken}
                  className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-lg text-sm flex items-center gap-2 transition disabled:opacity-50"
                >
                  {pushing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Sedang Melakukan Push ke GitHub...
                    </>
                  ) : (
                    <>
                      <GitBranch className="w-4 h-4" />
                      Push ke GitHub (origin main)
                    </>
                  )}
                </button>

                {pushResult && (
                  <div
                    className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                      pushResult.success
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {pushResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                    )}
                    {pushResult.message}
                  </div>
                )}
              </div>

              {/* Manual Terminal Commands */}
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                    Atau Jalankan Melalui Terminal / CLI:
                  </span>
                  <button
                    onClick={() => copyToClipboard('git remote add origin https://github.com/GhanzStudio/bot.git\ngit add .\ngit commit -m "feat: complete multi-device whatsapp bot"\ngit push -u origin main')}
                    className="text-xs text-emerald-600 hover:text-emerald-800 flex items-center gap-1 font-medium"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedText ? 'Tersalin!' : 'Salin Perintah'}
                  </button>
                </div>
                <pre className="p-4 bg-zinc-900 text-zinc-100 rounded-xl text-xs font-mono overflow-x-auto">
{`git remote add origin https://github.com/GhanzStudio/bot.git
git branch -M main
git add .
git commit -m "feat: powerful multi-device whatsapp bot by GhanzStudio"
git push -u origin main`}
                </pre>
              </div>
            </div>
          </div>
        )}
        {/* Tab 5: Deploy & Jalankan di HP (Termux) */}
        {activeTab === 'deploy' && (
          <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-6 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                Panduan Menjalankan WhatsApp Bot di HP Android (Termux) & Cloud
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                WhatsApp Bot membutuhkan server Node.js aktif yang terus berjalan di latar belakang untuk menjaga koneksi soket ke WhatsApp.
              </p>
            </div>

            {/* Why GitHub Pages was blank info box */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Mengapa di GitHub Pages Awalnya Layar Putih?
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                GitHub Pages hanya mendukung <strong>file web statis (HTML/CSS/JS)</strong> dan tidak memiliki server Node.js. Ketika file proyek mentah (TypeScript/JSX) diunggah tanpa di-compile, browser tidak bisa membacanya dan menampilkan layar putih. Kami telah memperbaiki ini dengan membuat folder <code>docs/</code> yang berisi hasil build web siap tayang.
              </p>
            </div>

            {/* Method 1: Termux Android */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">1</span>
                  Cara Jalankan Bot di HP Android (100% Gratis via Termux)
                </h3>
                <button
                  onClick={() => copyToClipboard(`pkg update -y && pkg install git nodejs-lts ffmpeg -y\ngit clone https://github.com/GhanzStudio/bot.git BotWa\ncd BotWa\nnpm install --legacy-peer-deps\nchmod +x run.sh && ./run.sh`)}
                  className="text-xs text-emerald-600 hover:text-emerald-800 flex items-center gap-1 font-medium"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedText ? 'Tersalin!' : 'Salin Semua Perintah'}
                </button>
              </div>

              <div className="space-y-2 text-xs text-zinc-600">
                <p>1. Buka aplikasi <strong>Termux</strong> di HP Android Anda.</p>
                <p>2. Salin dan jalankan perintah berikut (sudah dilengkapi anti-error <em>legacy peer deps</em> & <em>permission bypass</em>):</p>
              </div>

              <div className="p-4 bg-zinc-950 text-zinc-100 rounded-xl font-mono text-xs space-y-2 overflow-x-auto">
                <p className="text-zinc-400"># 1. Masuk ke folder bot:</p>
                <p className="text-emerald-400">cd ~/BotWa</p>
                <p className="text-zinc-400 mt-2"># 2. Install dependensi dengan legacy peer deps:</p>
                <p className="text-emerald-400">npm install --legacy-peer-deps</p>
                <p className="text-zinc-400 mt-2"># 3. Jalankan bot (langsung via Node tanpa kendala permission):</p>
                <p className="text-emerald-400">npm run termux</p>
                <p className="text-zinc-500 text-[11px] mt-1"># Atau alternatif: bash run.sh</p>
              </div>

              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-600 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Setelah dijalankan di Termux, buka tab <strong>Koneksi WA & QR</strong> di browser atau input nomor untuk pairing code 8-digit. Bot langsung aktif!</span>
              </div>
            </div>

            {/* Method 2: VPS / Cloud */}
            <div className="space-y-3 pt-4 border-t border-zinc-200">
              <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">2</span>
                Cara Jalankan di VPS / Server Cloud (Docker)
              </h3>
              <div className="p-4 bg-zinc-950 text-zinc-100 rounded-xl font-mono text-xs space-y-1 overflow-x-auto">
                <p className="text-zinc-400"># Jalankan bot + MongoDB otomatis menggunakan Docker Compose:</p>
                <p className="text-sky-400">docker compose up -d --build</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
