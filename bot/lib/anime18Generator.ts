/**
 * High-Precision Authentic 18+ Ecchi & Uncensored Anime Archive Fetcher
 * Multi-Booru real archive search (Yande.re, Gelbooru, Rule34, Danbooru, Konachan, Safebooru, Waifu.im)
 * Resolves character name aliases, Japanese name order, and typos (e.g. Miku Nakano, Hinata, Sunade/Tsunade)
 */

// Popular character aliases and canonical Booru tag mappings
const CHARACTER_ALIAS_MAP: Record<string, string> = {
  // Naruto
  'sunade': 'tsunade',
  'tsunade': 'tsunade',
  'hinata': 'hyuuga_hinata',
  'hinata_hyuga': 'hyuuga_hinata',
  'hyuga_hinata': 'hyuuga_hinata',
  'sakura': 'haruno_sakura',
  'ino': 'yamanaka_ino',
  'tenten': 'tenten_(naruto)',
  'kushina': 'uzumaki_kushina',
  'mei_terumi': 'mei_terumi',

  // Quintessential Quintuplets
  'miku_nakano': 'nakano_miku',
  'miku': 'nakano_miku',
  'nino_nakano': 'nakano_nino',
  'nino': 'nakano_nino',
  'yotsuba_nakano': 'nakano_yotsuba',
  'yotsuba': 'nakano_yotsuba',
  'ichika_nakano': 'nakano_ichika',
  'ichika': 'nakano_ichika',
  'itsuki_nakano': 'nakano_itsuki',
  'itsuki': 'nakano_itsuki',

  // One Piece
  'boa_hancock': 'boa_hancock',
  'hancock': 'boa_hancock',
  'nico_robin': 'nico_robin',
  'robin': 'nico_robin',
  'nami': 'nami',
  'yamato': 'yamato_(one_piece)',
  'uta': 'uta_(one_piece)',
  'perona': 'perona',

  // Spy x Family & Re:Zero
  'yor_forger': 'yor_forger',
  'yor': 'yor_forger',
  'yor_briar': 'yor_briar',
  'rem': 'rem_(re:zero)',
  'ram': 'ram_(re:zero)',
  'emilia': 'emilia_(re:zero)',

  // Chainsaw Man & Darling in the Franxx
  'makima': 'makima_(chainsaw_man)',
  'power': 'power_(chainsaw_man)',
  'reze': 'reze_(chainsaw_man)',
  'zero_two': 'zero_two_(darling_in_the_franxx)',
  '02': 'zero_two_(darling_in_the_franxx)',

  // Genshin Impact
  'furina': 'furina_(genshin_impact)',
  'raiden': 'raiden_shogun',
  'raiden_shogun': 'raiden_shogun',
  'yae_miko': 'yae_miko',
  'yae': 'yae_miko',
  'ganyu': 'ganyu_(genshin_impact)',
  'shenhe': 'shenhe_(genshin_impact)',
  'yelan': 'yelan_(genshin_impact)',
  'hu_tao': 'hu_tao_(genshin_impact)',
  'hutao': 'hu_tao_(genshin_impact)',
  'mona': 'mona_(genshin_impact)',
  'keqing': 'keqing_(genshin_impact)',

  // Honkai Star Rail
  'kafka': 'kafka_(honkai:_star_rail)',
  'firefly': 'firefly_(honkai:_star_rail)',
  'acheron': 'acheron_(honkai:_star_rail)',
  'jingliu': 'jingliu_(honkai:_star_rail)',
  'topaz': 'topaz_(honkai:_star_rail)',
  'silver_wolf': 'silver_wolf_(honkai:_star_rail)',
  'sparkle': 'sparkle_(honkai:_star_rail)',
  'march_7th': 'march_7th',

  // Other Popular Waifus
  'esdeath': 'esdeath',
  'tifa': 'tifa_lockhart',
  'tifa_lockhart': 'tifa_lockhart',
  '2b': '2b_(nier:automata)',
  'yoruichi': 'shihoin_yoruichi',
  'rangiku': 'matsumoto_rangiku',
  'nezuko': 'kamado_nezuko',
  'mitsuri': 'kanroji_mitsuri',
  'shinobu': 'kocho_shinobu',
  'marin_kitagawa': 'kitagawa_marin',
  'marin': 'kitagawa_marin',
  'fubuki': 'fubuki_(one-punch_man)',
  'tatsumaki': 'tatsumaki_(one-punch_man)',
  'asuka': 'souryuu_asuka_langley',
  'rei': 'ayanami_rei',
  'albedo': 'albedo_(overlord)',
  'megumin': 'megumin',
  'aqua': 'aqua_(konosuba)',
  'darkness': 'darkness_(konosuba)'
};

export async function generate18PlusAnimePhoto(prompt: string, groupName?: string): Promise<Buffer> {
  const query = (prompt || 'Ecchi Waifu').trim();
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);

  const tagStandard = words.join('_').replace(/[^a-z0-9_]/g, '');
  const tagReversed = [...words].reverse().join('_').replace(/[^a-z0-9_]/g, '');
  const tagFirst = words[0] ? words[0].replace(/[^a-z0-9_]/g, '') : '';
  const tagLast = words[words.length - 1] ? words[words.length - 1].replace(/[^a-z0-9_]/g, '') : '';

  // Build candidate tags trying aliases first, then reversed Japanese order, then standard tags
  const tagCandidates = Array.from(
    new Set(
      [
        CHARACTER_ALIAS_MAP[tagStandard],
        CHARACTER_ALIAS_MAP[tagFirst],
        tagReversed,
        tagStandard,
        tagFirst,
        tagLast
      ].filter(Boolean)
    )
  );

  let imageUrl: string | null = null;

  for (const tag of tagCandidates) {
    if (!tag) continue;

    // 1. Primary Source: Yande.re (Rating: explicit / questionable / ecchi)
    const yandeTags = [
      `${tag} rating:explicit`,
      `${tag} rating:questionable`,
      `${tag}`
    ];

    for (const yTag of yandeTags) {
      try {
        const res = await fetch(`https://yande.re/post.json?limit=30&tags=${encodeURIComponent(yTag)}`);
        if (res.ok) {
          const posts: any = await res.json();
          if (Array.isArray(posts) && posts.length > 0) {
            const valid = posts.filter((p: any) => p.file_url || p.sample_url || p.jpeg_url);
            if (valid.length > 0) {
              const pick = valid[Math.floor(Math.random() * valid.length)];
              imageUrl = pick.file_url || pick.sample_url || pick.jpeg_url;
              console.log(`[Anime18] Yande.re match for "${query}" (tag: ${yTag}):`, imageUrl);
              break;
            }
          }
        }
      } catch (e: any) {
        console.warn('[Anime18] Yande.re error:', e.message);
      }
    }
    if (imageUrl) break;

    // 2. Gelbooru API
    try {
      const res = await fetch(`https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&limit=30&tags=${encodeURIComponent(tag)}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      if (res.ok) {
        const data: any = await res.json();
        const posts = data.post || data;
        if (Array.isArray(posts) && posts.length > 0) {
          const valid = posts.filter((p: any) => p.file_url);
          if (valid.length > 0) {
            const pick = valid[Math.floor(Math.random() * valid.length)];
            imageUrl = pick.file_url;
            console.log(`[Anime18] Gelbooru match for "${query}" (tag: ${tag}):`, imageUrl);
            break;
          }
        }
      }
    } catch (e: any) {
      console.warn('[Anime18] Gelbooru error:', e.message);
    }
    if (imageUrl) break;

    // 3. Rule34 API
    try {
      const res = await fetch(`https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&limit=30&tags=${encodeURIComponent(tag)}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      if (res.ok) {
        const posts: any = await res.json();
        if (Array.isArray(posts) && posts.length > 0) {
          const valid = posts.filter((p: any) => p.file_url);
          if (valid.length > 0) {
            const pick = valid[Math.floor(Math.random() * valid.length)];
            imageUrl = pick.file_url;
            console.log(`[Anime18] Rule34 match for "${query}" (tag: ${tag}):`, imageUrl);
            break;
          }
        }
      }
    } catch (e: any) {
      console.warn('[Anime18] Rule34 error:', e.message);
    }
    if (imageUrl) break;

    // 4. Konachan API
    try {
      const res = await fetch(`https://konachan.com/post.json?limit=30&tags=${encodeURIComponent(tag)}`);
      if (res.ok) {
        const posts: any = await res.json();
        if (Array.isArray(posts) && posts.length > 0) {
          const valid = posts.filter((p: any) => p.file_url || p.sample_url);
          if (valid.length > 0) {
            const pick = valid[Math.floor(Math.random() * valid.length)];
            imageUrl = pick.file_url || pick.sample_url;
            console.log(`[Anime18] Konachan match for "${query}" (tag: ${tag}):`, imageUrl);
            break;
          }
        }
      }
    } catch (e: any) {
      console.warn('[Anime18] Konachan error:', e.message);
    }
    if (imageUrl) break;

    // 5. Safebooru API
    try {
      const res = await fetch(`https://safebooru.org/index.php?page=dapi&s=post&q=index&json=1&limit=30&tags=${encodeURIComponent(tag)}`);
      if (res.ok) {
        const posts: any = await res.json();
        if (Array.isArray(posts) && posts.length > 0) {
          const valid = posts.filter((p: any) => p.file_url || p.sample_url);
          if (valid.length > 0) {
            const pick = valid[Math.floor(Math.random() * valid.length)];
            const imgName = pick.file_url || pick.image;
            imageUrl = imgName.startsWith('http') ? imgName : `https://safebooru.org/images/${pick.directory}/${pick.image}`;
            console.log(`[Anime18] Safebooru match for "${query}" (tag: ${tag}):`, imageUrl);
            break;
          }
        }
      }
    } catch (e: any) {
      console.warn('[Anime18] Safebooru error:', e.message);
    }
    if (imageUrl) break;
  }

  // 6. Ultimate Waifu.im Ecchi Fallback API
  if (!imageUrl) {
    try {
      const res = await fetch('https://api.waifu.im/search?is_nsfw=true&tag=ecchi&limit=10');
      if (res.ok) {
        const data: any = await res.json();
        if (data?.images?.length > 0) {
          const pick = data.images[Math.floor(Math.random() * data.images.length)];
          if (pick.url) {
            imageUrl = pick.url;
            console.log(`[Anime18] Waifu.im fallback match for "${query}":`, imageUrl);
          }
        }
      }
    } catch (e: any) {
      console.warn('[Anime18] Waifu.im fallback error:', e.message);
    }
  }

  if (!imageUrl) {
    throw new Error(`Foto 18+ untuk karakter "${query}" tidak ditemukan. Silakan coba karakter lain (Contoh: .anime18 Miku Nakano, .anime18 Hinata, .anime18 Tsunade).`);
  }

  // Fetch direct image buffer from authentic Booru CDN
  const imgRes = await fetch(imageUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  if (!imgRes.ok) {
    throw new Error(`Gagal mengunduh foto 18+ untuk karakter "${query}" (${imgRes.status}).`);
  }

  const arr = await imgRes.arrayBuffer();
  return Buffer.from(arr);
}
