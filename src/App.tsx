/**
 * Ghanz Bot Multi-Device - Control Center & Live Simulator
 * High-performance management dashboard and Baileys terminal console
 */

import React, { useState, useEffect } from 'react';
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
  Download
} from 'lucide-react';

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
  reaction?: string;
  time: string;
}

export default function App() {
  const [statusData, setStatusData] = useState<BotStatusData | null>(null);
  const [commands, setCommands] = useState<CommandItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'console' | 'commands' | 'pairing' | 'git'>('console');
  
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
      console.warn('Gagal memuat status bot:', e);
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
      console.warn('Gagal memuat commands:', e);
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
      console.warn('Gagal memuat status git:', e);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchCommands();
    fetchGitStatus();
    const interval = setInterval(fetchStatus, 4000);
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

  const handleSimulateCommand = async (commandToRun?: string) => {
    const cmd = (commandToRun || inputCmd).trim();
    if (!cmd || simulating) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: cmd,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, userMsg]);
    setInputCmd('');
    setSimulating(true);

    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: cmd,
          senderName: 'GhanzStudio',
          isOwner: true
        })
      });
      const data = await res.json();
      const botMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'bot',
        text: data.reply || (data.executed ? 'Perintah berhasil diproses.' : 'Perintah tidak dikenali atau gagal.'),
        reaction: data.reaction,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      setChatMessages(prev => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'bot',
          text: `❌ Terjadi kesalahan jaringan saat memproses perintah: ${err.message}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
        </div>

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
                        {msg.sender === 'user' ? 'GhanzStudio (Owner)' : 'Ghanz Bot MD'}
                      </div>
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
              {filteredCommands.map(cmd => (
                <div
                  key={cmd.name}
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
      </main>
    </div>
  );
}
