/**
 * Live Score & Football Schedule Fetcher (Real-time ESPN Sports API)
 */

export interface FootballMatch {
  leagueName: string;
  leagueCode: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | string;
  awayScore: number | string;
  statusState: 'pre' | 'in' | 'post';
  statusDetail: string;
  dateStr: string;
  timeWibStr: string;
}

const LEAGUES = [
  { code: 'eng.1', name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { code: 'esp.1', name: 'La Liga', flag: '🇪🇸' },
  { code: 'ita.1', name: 'Serie A', flag: '🇮🇹' },
  { code: 'ger.1', name: 'Bundesliga', flag: '🇩🇪' },
  { code: 'fra.1', name: 'Ligue 1', flag: '🇫🇷' },
  { code: 'uefa.champions', name: 'UEFA Champions League', flag: '🇪🇺' },
  { code: 'idn.1', name: 'BRI Liga 1 Indonesia', flag: '🇮🇩' },
];

/**
 * Fetch matches across leagues from ESPN Scoreboard API
 */
export async function getFootballScoreboard(filterQuery?: string): Promise<FootballMatch[]> {
  const matches: FootballMatch[] = [];
  const query = (filterQuery || '').toLowerCase();

  const selectedLeagues = LEAGUES.filter(l => {
    if (!query) return true;
    return (
      l.code.toLowerCase().includes(query) ||
      l.name.toLowerCase().includes(query) ||
      (query.includes('epl') && l.code === 'eng.1') ||
      (query.includes('liga1') && l.code === 'idn.1') ||
      (query.includes('ucl') && l.code === 'uefa.champions')
    );
  });

  const targetLeagues = selectedLeagues.length > 0 ? selectedLeagues : LEAGUES;

  await Promise.all(
    targetLeagues.map(async (league) => {
      try {
        const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${league.code}/scoreboard`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        if (res.ok) {
          const data: any = await res.json();
          const events = data.events || [];

          for (const ev of events) {
            const comp = ev.competitions?.[0];
            const home = comp?.competitors?.find((c: any) => c.homeAway === 'home');
            const away = comp?.competitors?.find((c: any) => c.homeAway === 'away');

            const statusState = ev.status?.type?.state as 'pre' | 'in' | 'post';
            const statusDetail = ev.status?.type?.shortDetail || ev.status?.type?.detail || 'Scheduled';

            const dateObj = new Date(ev.date);
            const timeWibStr = dateObj.toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'Asia/Jakarta'
            }) + ' WIB';

            const dateStr = dateObj.toLocaleDateString('id-ID', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              timeZone: 'Asia/Jakarta'
            });

            matches.push({
              leagueName: `${league.flag} ${league.name}`,
              leagueCode: league.code,
              homeTeam: home?.team?.displayName || 'Home Team',
              awayTeam: away?.team?.displayName || 'Away Team',
              homeScore: home?.score !== undefined ? home.score : '-',
              awayScore: away?.score !== undefined ? away.score : '-',
              statusState,
              statusDetail,
              dateStr,
              timeWibStr
            });
          }
        }
      } catch (err: any) {
        console.warn(`[Football] Error fetching ${league.code}:`, err.message);
      }
    })
  );

  return matches;
}

/**
 * Format Jadwal Bola text
 */
export async function getFormattedJadwalBola(filterQuery?: string): Promise<string> {
  const matches = await getFootballScoreboard(filterQuery);

  if (matches.length === 0) {
    return `⚽ *JADWAL PERTANDINGAN SEPAKBOLA*\n\n_Tidak ada jadwal pertandingan ditemukan untuk liga tersebut saat ini._`;
  }

  // Group by league
  const grouped: Record<string, FootballMatch[]> = {};
  for (const m of matches) {
    if (!grouped[m.leagueName]) grouped[m.leagueName] = [];
    grouped[m.leagueName].push(m);
  }

  let text = `⚽ *JADWAL PERTANDINGAN BOLA TERKINI*\n` +
             `📅 Updated: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })}\n\n`;

  for (const [leagueName, matchArray] of Object.entries(grouped)) {
    text += `*=== ${leagueName.toUpperCase()} ===*\n`;
    for (const m of matchArray) {
      const statusIcon = m.statusState === 'in' ? '🔴 LIVE' : m.statusState === 'post' ? '✅ FT' : '⏰ SCHEDULED';
      text += `• ${statusIcon} | *${m.homeTeam}* vs *${m.awayTeam}*\n`;
      text += `  🗓️ ${m.dateStr} (${m.timeWibStr}) | Status: _${m.statusDetail}_\n\n`;
    }
  }

  text += `💡 _Ketik *.livescore* untuk melihat skor langsung pertandingan saat ini._`;
  return text.trim();
}

/**
 * Format Live Score text
 */
export async function getFormattedLiveScore(filterQuery?: string): Promise<string> {
  const matches = await getFootballScoreboard(filterQuery);

  if (matches.length === 0) {
    return `🏆 *LIVESCORE SEPAKBOLA TERKINI*\n\n_Tidak ada pertandingan sepakbola berlangsung saat ini._`;
  }

  // Separate ongoing live, completed FT, and upcoming scheduled
  const liveMatches = matches.filter(m => m.statusState === 'in');
  const finishedMatches = matches.filter(m => m.statusState === 'post');
  const upcomingMatches = matches.filter(m => m.statusState === 'pre');

  let text = `🏆 *LIVESCORE SEPAKBOLA TERKINI*\n` +
             `🕒 WIB (Waktu Indonesia Barat) - Real-time ESPN Sports Data\n\n`;

  if (liveMatches.length > 0) {
    text += `🔴 *LIVESCORE PERTANDINGAN BERLANGSUNG*\n`;
    for (const m of liveMatches) {
      text += `• *${m.leagueName}*\n`;
      text += `  🔥 *${m.homeTeam} ${m.homeScore} - ${m.awayScore} ${m.awayTeam}*\n`;
      text += `  ⏱️ Waktu: *${m.statusDetail}*\n\n`;
    }
  }

  if (finishedMatches.length > 0) {
    text += `✅ *HASIL PERTANDINGAN SELESAI (FT)*\n`;
    for (const m of finishedMatches.slice(0, 10)) {
      text += `• ${m.leagueName}: *${m.homeTeam} ${m.homeScore} - ${m.awayScore} ${m.awayTeam}* (FT)\n`;
    }
    text += `\n`;
  }

  if (upcomingMatches.length > 0) {
    text += `⏰ *MENDATANG / SCHEDULED*\n`;
    for (const m of upcomingMatches.slice(0, 6)) {
      text += `• ${m.leagueName}: *${m.homeTeam} vs ${m.awayTeam}* (${m.dateStr}, ${m.timeWibStr})\n`;
    }
    text += `\n`;
  }

  text += `💡 _Gunakan *.jadwalbola* untuk rincian jadwal lengkap pertandingan._`;
  return text.trim();
}
