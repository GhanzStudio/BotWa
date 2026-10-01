import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts';
import { BarChart3, TrendingUp, Sparkles, RefreshCw, Zap, Award } from 'lucide-react';

export interface CommandStatItem {
  command: string;
  category: string;
  totalHits: number;
}

export interface DailyTrendItem {
  date: string;
  label: string;
  hits: number;
}

export interface StatsApiResponse {
  total7DaysHits: number;
  popularCommands: CommandStatItem[];
  dailyTrend: DailyTrendItem[];
}

const BAR_COLORS = [
  '#10b981', // emerald-500
  '#06b6d4', // cyan-500
  '#3b82f6', // blue-500
  '#6366f1', // indigo-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#f43f5e', // rose-500
  '#f97316', // orange-500
  '#eab308', // yellow-500
  '#84cc16'  // lime-500
];

export const CommandStatsChart: React.FC<{ onTestCommand?: (cmd: string) => void }> = ({ onTestCommand }) => {
  const [data, setData] = useState<StatsApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/command-stats');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        setError('Gagal mengambil statistik penggunaan.');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal terhubung ke API statistik.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading && !data) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-xs flex flex-col items-center justify-center min-h-[320px]">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
        <p className="text-sm font-semibold text-zinc-700">Memuat Grafik Statistik Penggunaan Command...</p>
        <p className="text-xs text-zinc-400 mt-1">Mengagregasi data aktivitas 7 hari terakhir...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs text-center">
        <p className="text-sm text-rose-600 font-semibold">{error || 'Tidak ada data statistik.'}</p>
        <button
          onClick={fetchStats}
          className="mt-3 px-4 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-xs font-medium"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  const top1Command = data.popularCommands[0];
  const avgDailyHits = Math.round(data.total7DaysHits / (data.dailyTrend.length || 7));

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-200/80 p-4 rounded-2xl flex items-center gap-3">
          <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-xs">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-zinc-500">Total Perintah (7 Hari)</span>
            <div className="text-2xl font-black text-zinc-900 font-mono">
              {data.total7DaysHits.toLocaleString('id-ID')} <span className="text-xs font-normal text-zinc-500">hits</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-200/80 p-4 rounded-2xl flex items-center gap-3">
          <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-xs">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-zinc-500">Fitur Paling Populer</span>
            <div className="text-lg font-black text-indigo-900 font-mono flex items-center gap-1.5">
              .{top1Command?.command || 'ai'}
              <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                {top1Command?.totalHits || 0}x
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200/80 p-4 rounded-2xl flex items-center gap-3">
          <div className="p-3 bg-amber-600 text-white rounded-xl shadow-xs">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-zinc-500">Rata-Rata / Hari</span>
            <div className="text-2xl font-black text-zinc-900 font-mono">
              {avgDailyHits.toLocaleString('id-ID')} <span className="text-xs font-normal text-zinc-500">hits/hari</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Chart: Top 10 Popular Commands Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                  Statistik Fitur / Command Paling Populer (7 Hari Terakhir)
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Grafik Recharts yang menampilkan 10 perintah paling sering dieksekusi pengguna
                </p>
              </div>
              <button
                onClick={fetchStats}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition"
                title="Refresh Data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="h-[320px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={320}>
                <BarChart
                  data={data.popularCommands.map(c => ({
                    name: `.${c.command}`,
                    hits: c.totalHits,
                    category: c.category
                  }))}
                  margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#3f3f46', fontSize: 11, fontWeight: 600 }}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fill: '#71717a', fontSize: 11 }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-zinc-900 text-white p-3 rounded-xl shadow-xl border border-zinc-800 text-xs">
                            <p className="font-mono font-bold text-emerald-400 text-sm">{item.name}</p>
                            <p className="text-zinc-300 mt-0.5">Kategori: <span className="text-amber-300">{item.category}</span></p>
                            <p className="font-bold text-white mt-1">Total Penggunaan: <span className="text-emerald-400 font-mono">{item.hits}x</span></p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="hits" radius={[6, 6, 0, 0]}>
                    {data.popularCommands.map((_, idx) => (
                      <Cell key={`cell-${idx}`} fill={BAR_COLORS[idx % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-100 flex flex-wrap items-center justify-between text-xs text-zinc-500">
            <span className="flex items-center gap-1 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Data terupdate secara real-time setiap kali user menjalankan perintah di WhatsApp.
            </span>
            <span className="font-mono text-[11px] text-zinc-400">Recharts D3 BarChart Engine</span>
          </div>
        </div>

        {/* Right Chart: 7-Day Trend Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              Tren Penggunaan Harian
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              Total eksekusi perintah per hari (7 Hari)
            </p>

            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
                <BarChart data={data.dailyTrend} margin={{ top: 10, right: 10, left: -25, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                  <XAxis dataKey="label" tick={{ fill: '#52525b', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#71717a', fontSize: 10 }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-zinc-900 text-white p-2.5 rounded-lg shadow-lg text-xs">
                            <p className="font-semibold text-zinc-300">{item.label}</p>
                            <p className="font-mono font-bold text-emerald-400">{item.hits} total hits</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="hits" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100">
            <h4 className="text-xs font-bold text-zinc-800 mb-2">10 Fitur Teratas:</h4>
            <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
              {data.popularCommands.map((c, i) => (
                <div key={c.command} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-zinc-50 hover:bg-zinc-100/80 transition">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-zinc-200 text-zinc-700 font-bold text-[10px] flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="font-mono font-bold text-zinc-800">.{c.command}</span>
                    <span className="text-[10px] bg-zinc-200 text-zinc-600 px-1.5 py-0.2 rounded font-medium">
                      {c.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-emerald-600">{c.totalHits} hits</span>
                    {onTestCommand && (
                      <button
                        onClick={() => onTestCommand(`.${c.command}`)}
                        className="text-[10px] text-zinc-500 hover:text-emerald-700 underline"
                      >
                        Uji
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
