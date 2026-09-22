/**
 * Lite Web Dashboard & Mobile Controller for Ghanz Bot MD
 * Ultra-lightweight, zero-dependency, guaranteed 0ms loading on all mobile browsers and Termux.
 */

export function getLiteDashboardHtml(): string {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ghanz Bot MD - Lite Web Controller</title>
  <style>
    :root {
      --bg: #090d16;
      --card: #131b2e;
      --card-border: #1e293b;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --emerald: #10b981;
      --emerald-dark: #059669;
      --red: #ef4444;
      --amber: #f59e0b;
      --blue: #3b82f6;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    body { background-color: var(--bg); color: var(--text); min-height: 100vh; padding: 16px; font-size: 15px; }
    .container { max-width: 600px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px; }
    
    .card { background: var(--card); border: 1px solid var(--card-border); border-radius: 16px; padding: 18px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
    .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--card-border); padding-bottom: 14px; margin-bottom: 14px; }
    .header h1 { font-size: 1.15rem; font-weight: 700; display: flex; align-items: center; gap: 8px; }
    
    .badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 9999px; font-size: 0.78rem; font-weight: 600; text-transform: uppercase; }
    .badge-online { background: rgba(16, 185, 129, 0.15); color: var(--emerald); border: 1px solid var(--emerald); }
    .badge-offline { background: rgba(239, 68, 68, 0.15); color: var(--red); border: 1px solid var(--red); }
    .badge-connecting { background: rgba(245, 158, 11, 0.15); color: var(--amber); border: 1px solid var(--amber); }
    .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
    .dot-online { background: var(--emerald); box-shadow: 0 0 8px var(--emerald); }
    .dot-offline { background: var(--red); }
    .dot-connecting { background: var(--amber); animation: pulse 1s infinite; }
    
    @keyframes pulse { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
    
    .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 14px; }
    .stat-box { background: rgba(15, 23, 42, 0.6); padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.05); }
    .stat-label { font-size: 0.75rem; color: var(--text-muted); margin-bottom: 2px; }
    .stat-value { font-size: 0.95rem; font-weight: 700; color: #fff; }
    
    label { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 6px; }
    input[type="text"], input[type="tel"] {
      width: 100%; background: #0b1120; border: 1px solid #334155; border-radius: 10px;
      padding: 12px 14px; color: #fff; font-size: 1rem; outline: none; margin-bottom: 12px; transition: border-color 0.2s;
    }
    input:focus { border-color: var(--emerald); }
    
    .btn {
      width: 100%; background: var(--emerald); color: #fff; border: none; border-radius: 10px;
      padding: 12px; font-size: 0.95rem; font-weight: 600; cursor: pointer; display: flex;
      align-items: center; justify-content: center; gap: 8px; transition: background 0.2s;
    }
    .btn:hover { background: var(--emerald-dark); }
    .btn-secondary { background: #1e293b; color: #cbd5e1; border: 1px solid #334155; }
    .btn-secondary:hover { background: #334155; }
    .btn-danger { background: rgba(239, 68, 68, 0.15); color: var(--red); border: 1px solid var(--red); }
    .btn-danger:hover { background: rgba(239, 68, 68, 0.25); }
    
    .pairing-box {
      background: rgba(16, 185, 129, 0.08); border: 1px dashed var(--emerald);
      border-radius: 12px; padding: 16px; text-align: center; margin-top: 14px; display: none;
    }
    .pairing-code {
      font-family: monospace; font-size: 2rem; font-weight: 800; letter-spacing: 4px;
      color: var(--emerald); margin: 10px 0; user-select: all; cursor: pointer;
    }
    
    .instructions {
      font-size: 0.82rem; color: var(--text-muted); line-height: 1.5; text-align: left;
      margin-top: 12px; background: rgba(0,0,0,0.25); padding: 12px; border-radius: 8px;
    }
    .instructions ol { margin-left: 18px; margin-top: 6px; }
    
    .chat-container { display: flex; flex-direction: column; height: 260px; }
    .chat-logs { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding-right: 4px; margin-bottom: 10px; }
    .chat-bubble { max-width: 85%; padding: 10px 14px; border-radius: 12px; font-size: 0.88rem; line-height: 1.4; word-break: break-word; white-space: pre-wrap; }
    .bubble-user { align-self: flex-end; background: #2563eb; color: #fff; border-bottom-right-radius: 2px; }
    .bubble-bot { align-self: flex-start; background: #1e293b; color: #e2e8f0; border-bottom-left-radius: 2px; border: 1px solid #334155; }
    
    .chat-input-row { display: flex; gap: 8px; }
    .chat-input-row input { margin-bottom: 0; }
    .chat-input-row button { width: auto; padding: 0 18px; }
    
    .actions-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 12px; }
    
    .toast {
      position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
      background: #0f172a; border: 1px solid var(--emerald); color: #fff;
      padding: 10px 20px; border-radius: 30px; font-size: 0.85rem; z-index: 1000;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5); opacity: 0; pointer-events: none; transition: opacity 0.3s;
    }
    .toast.show { opacity: 1; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header & Status Card -->
    <div class="card">
      <div class="header">
        <h1>🤖 Ghanz Bot MD</h1>
        <div id="statusBadge" class="badge badge-connecting">
          <span class="dot dot-connecting" id="statusDot"></span>
          <span id="statusText">CONNECTING</span>
        </div>
      </div>
      
      <div class="stats-grid">
        <div class="stat-box">
          <div class="stat-label">STATUS WHATSAPP</div>
          <div class="stat-value" id="waStatusText">Menghubungkan...</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">TOTAL FITUR / PERINTAH</div>
          <div class="stat-value" id="cmdCount">343 Fitur</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">UPTIME SERVER</div>
          <div class="stat-value" id="uptimeText">Aktif</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">RAM DIGUNAKAN</div>
          <div class="stat-value" id="ramText">- MB</div>
        </div>
      </div>

      <div style="text-align: center; margin-top: 6px;">
        <a href="/" style="font-size: 0.8rem; color: #38bdf8; text-decoration: none;">✨ Ingin Tampilan Grafis Lengkap? Buka Full Dashboard &rarr;</a>
      </div>
    </div>

    <!-- WhatsApp Pairing & QR Card -->
    <div class="card">
      <h2 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
        🔑 Tautkan Akun WhatsApp
      </h2>
      
      <form id="pairingForm">
        <label for="phoneNumber">Nomor HP WhatsApp Bot (Contoh: 08123456789 atau 628123456789):</label>
        <input type="tel" id="phoneNumber" placeholder="628xxxxxxxxxx" required>
        <button type="submit" class="btn" id="pairBtn">
          ⚡ Dapatkan Kode Pairing 8-Digit
        </button>
      </form>

      <div id="pairingBox" class="pairing-box">
        <div style="font-size: 0.85rem; color: var(--text-muted);">KODE PAIRING WHATSAPP ANDA:</div>
        <div class="pairing-code" id="codeDisplay" title="Ketuk untuk menyalin">----</div>
        <button type="button" class="btn btn-secondary" id="copyBtn" style="margin-top: 6px;">
          📋 Salin Kode ke Papan Klip
        </button>
        <div class="instructions">
          <strong>Langkah Menghubungkan di WhatsApp HP:</strong>
          <ol>
            <li>Buka aplikasi WhatsApp di HP Anda</li>
            <li>Ketuk <strong>Titik 3</strong> di kanan atas &rarr; pilih <strong>Perangkat Tertaut</strong></li>
            <li>Ketuk <strong>Tautkan Perangkat</strong></li>
            <li>Ketuk <strong>"Tautkan dengan nomor telepon saja"</strong> di bagian bawah</li>
            <li>Masukkan kode di atas</li>
          </ol>
        </div>
      </div>

      <div id="qrBox" style="display:none; text-align:center; margin-top: 14px;">
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px;">Atau Pindai QR Code di bawah:</p>
        <img id="qrImg" src="" alt="WhatsApp QR Code" style="max-width: 220px; border-radius: 12px; border: 2px solid #334155;">
      </div>
    </div>

    <!-- Live Command Simulator Card -->
    <div class="card">
      <h2 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
        💬 Simulator Perintah Bot
      </h2>
      <div class="chat-container">
        <div class="chat-logs" id="chatLogs">
          <div class="chat-bubble bubble-bot">🤖 Halo! Saya Ghanz Bot MD. Coba ketik <strong>.ping</strong> atau <strong>.menu</strong> di bawah untuk menguji bot!</div>
        </div>
        <form id="chatForm" class="chat-input-row">
          <input type="text" id="cmdInput" placeholder="Ketik .menu, .ping, .ai halo..." value=".ping" required>
          <button type="submit" class="btn" id="sendBtn">Kirim</button>
        </form>
      </div>
    </div>

    <!-- Bot Management Card -->
    <div class="card">
      <h2 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 8px;">⚙️ Kelola Bot</h2>
      <div class="actions-row">
        <button type="button" class="btn btn-secondary" id="restartBtn">🔄 Muat Ulang Bot</button>
        <button type="button" class="btn btn-danger" id="clearBtn">🗑️ Reset Sesi WA</button>
      </div>
    </div>
  </div>

  <div class="toast" id="toast">Notifikasi</div>

  <script>
    function showToast(msg) {
      const t = document.getElementById('toast');
      t.innerText = msg;
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 3000);
    }

    // Status polling
    async function updateStatus() {
      try {
        const res = await fetch('/api/status');
        if (!res.ok) return;
        const data = await res.json();
        
        const badge = document.getElementById('statusBadge');
        const dot = document.getElementById('statusDot');
        const txt = document.getElementById('statusText');
        const waStatusText = document.getElementById('waStatusText');
        
        const status = data.bot?.status || 'DISCONNECTED';
        txt.innerText = status;
        waStatusText.innerText = status === 'CONNECTED' ? '🟢 Terhubung' : (status === 'CONNECTING' ? '🟡 Menghubungkan...' : '🔴 Belum Terhubung');
        
        badge.className = 'badge ' + (status === 'CONNECTED' ? 'badge-online' : (status === 'CONNECTING' ? 'badge-connecting' : 'badge-offline'));
        dot.className = 'dot ' + (status === 'CONNECTED' ? 'dot-online' : (status === 'CONNECTING' ? 'dot-connecting' : 'dot-offline'));

        if (data.bot?.pairingCode) {
          document.getElementById('pairingBox').style.display = 'block';
          document.getElementById('codeDisplay').innerText = data.bot.pairingCode;
        }

        if (data.bot?.qrCodeUrl && status === 'SCAN_QR') {
          document.getElementById('qrBox').style.display = 'block';
          document.getElementById('qrImg').src = data.bot.qrCodeUrl;
        } else {
          document.getElementById('qrBox').style.display = 'none';
        }

        if (data.totalCommands) {
          document.getElementById('cmdCount').innerText = data.totalCommands + ' Fitur';
        }

        if (data.system?.memory?.rss) {
          document.getElementById('ramText').innerText = data.system.memory.rss + ' MB';
        }

        if (data.system?.uptime) {
          const sec = Math.floor(data.system.uptime);
          const m = Math.floor(sec / 60);
          const s = sec % 60;
          document.getElementById('uptimeText').innerText = m + 'm ' + s + 's';
        }
      } catch (err) {
        console.warn('Polling error:', err);
      }
    }

    setInterval(updateStatus, 3000);
    updateStatus();

    // Pairing Form
    document.getElementById('pairingForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const phoneInput = document.getElementById('phoneNumber');
      const btn = document.getElementById('pairBtn');
      const phone = phoneInput.value.trim();
      if (!phone) return;

      btn.disabled = true;
      btn.innerText = '⏳ Meminta Kode ke WhatsApp...';

      try {
        const res = await fetch('/api/pair', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber: phone })
        });
        const json = await res.json();
        if (res.ok && json.code) {
          document.getElementById('pairingBox').style.display = 'block';
          document.getElementById('codeDisplay').innerText = json.code;
          showToast('✅ Kode pairing berhasil dibuat: ' + json.code);
        } else {
          showToast('❌ ' + (json.error || 'Gagal membuat kode pairing'));
        }
      } catch (err) {
        showToast('❌ Gagal menghubungi server bot');
      } finally {
        btn.disabled = false;
        btn.innerText = '⚡ Dapatkan Kode Pairing 8-Digit';
      }
    });

    // Copy Button
    document.getElementById('copyBtn').addEventListener('click', () => {
      const code = document.getElementById('codeDisplay').innerText.replace(/-/g, '').trim();
      if (code && code !== '----') {
        navigator.clipboard.writeText(code).then(() => {
          showToast('📋 Kode pairing berhasil disalin: ' + code);
        }).catch(() => {
          showToast('Kode: ' + code);
        });
      }
    });

    // Chat Simulator Form
    document.getElementById('chatForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = document.getElementById('cmdInput');
      const cmd = input.value.trim();
      if (!cmd) return;

      const logs = document.getElementById('chatLogs');
      
      // Append user bubble
      const userBubble = document.createElement('div');
      userBubble.className = 'chat-bubble bubble-user';
      userBubble.innerText = cmd;
      logs.appendChild(userBubble);
      input.value = '';
      logs.scrollTop = logs.scrollHeight;

      const sendBtn = document.getElementById('sendBtn');
      sendBtn.disabled = true;

      try {
        const res = await fetch('/api/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command: cmd, sender: '6281234567890' })
        });
        const data = await res.json();
        
        const botBubble = document.createElement('div');
        botBubble.className = 'chat-bubble bubble-bot';
        botBubble.innerText = data.reply || (data.success ? '✅ Berhasil dieksekusi' : '⚠️ Tidak ada respon');
        logs.appendChild(botBubble);
        logs.scrollTop = logs.scrollHeight;
      } catch (err) {
        const errBubble = document.createElement('div');
        errBubble.className = 'chat-bubble bubble-bot';
        errBubble.innerText = '❌ Error menghubungi simulator';
        logs.appendChild(errBubble);
      } finally {
        sendBtn.disabled = false;
      }
    });

    // Restart Button
    document.getElementById('restartBtn').addEventListener('click', async () => {
      if (!confirm('Muat ulang koneksi bot sekarang?')) return;
      try {
        await fetch('/api/restart', { method: 'POST' });
        showToast('🔄 Bot sedang memuat ulang...');
        setTimeout(updateStatus, 2000);
      } catch (e) {
        showToast('❌ Gagal memuat ulang');
      }
    });

    // Clear Session Button
    document.getElementById('clearBtn').addEventListener('click', async () => {
      if (!confirm('Yakin ingin mereset sesi WhatsApp bot? Anda perlu menautkan ulang setelah ini.')) return;
      try {
        await fetch('/api/clear-session', { method: 'POST' });
        showToast('🗑️ Sesi dihapus. Silakan hubungkan ulang.');
        setTimeout(updateStatus, 2000);
      } catch (e) {
        showToast('❌ Gagal reset sesi');
      }
    });
  </script>
</body>
</html>`;
}
