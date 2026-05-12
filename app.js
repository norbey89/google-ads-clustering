/* ================================================
   Keyword Cluster Builder — Google Ads
   Concordancia de Frase & Exacta
   ================================================ */

// ---- Spanish Stopwords ----
const STOPWORDS_ES = new Set([
  'a','al','algo','algunas','algunos','ante','antes','como','con','contra',
  'cual','cuando','de','del','desde','donde','durante','e','el','ella',
  'ellas','ellos','en','entre','era','esa','esas','ese','eso','esos',
  'esta','estas','este','esto','estos','fue','ha','hasta','hay','la',
  'las','le','les','lo','los','mas','me','mi','muy','ni','no','nos',
  'o','otra','otras','otro','otros','para','pero','por','que','se',
  'ser','si','sin','sobre','su','sus','te','ti','tu','tus','u','un',
  'una','unas','uno','unos','y','ya','yo'
]);

// ---- Negative Keyword Lists ----
const NEG_LISTS = {
  consumo: [
    'gratis','free','barato','baratos','barata','baratas','economico','economicos',
    'segunda mano','usado','usados','usada','usadas','regalo','regalado',
    'descargar','download','pdf','torrent','pirata','crack','serial',
    'casero','casera','hecho en casa','diy','hazlo tu mismo',
    'receta','recetas','manualidad','manualidades',
    'amazon','mercadolibre','olx','ebay','alibaba','aliexpress','temu','shein',
    'walmart','falabella','exito','alkosto','linio',
    'comparar precios','precio mas bajo','oferta','ofertas','descuento','descuentos',
    'cupon','cupones','promocion','promociones','liquidacion','remate',
    'sample','muestra gratis','prueba gratis','trial',
    'imitacion','replica','generico','chino','chinos'
  ],
  info: [
    'que es','qué es','como funciona','cómo funciona','para que sirve','para qué sirve',
    'significado','definicion','definición','concepto','historia',
    'tutorial','tutoriales','curso','cursos','clase','clases','capacitacion',
    'como hacer','cómo hacer','paso a paso','guia','guía','manual',
    'ejemplo','ejemplos','plantilla','plantillas','template','templates',
    'wikipedia','wiki','foro','foros','blog','articulo','artículo',
    'pdf','libro','libros','ebook','tesis','monografia','ensayo',
    'youtube','video','videos','ver online','pelicula','peliculas',
    'noticias','noticia','news','prensa','periodico',
    'meme','memes','chiste','chistes','juego','juegos','quiz',
    'porque','por que','por qué','cuando','cuándo','donde','dónde',
    'ventajas','desventajas','pros y contras','comparativa','vs',
    'caracteristicas','características','tipos','tipos de',
    'estadisticas','estadísticas','datos','cifras','infografia'
  ],
  empleo: [
    'empleo','empleos','trabajo','trabajos','vacante','vacantes',
    'oferta de empleo','ofertas de empleo','oferta laboral','ofertas laborales',
    'busco trabajo','busco empleo','se busca','se necesita','se requiere',
    'hoja de vida','curriculum','cv','sueldo','salario','salarios',
    'pasantia','pasantías','practicas','prácticas','becario','beca','becas',
    'computrabajo','elempleo','indeed','linkedin','magneto',
    'cargo','cargos','perfil','perfiles','contratacion','contratación',
    'freelance','freelancer','independiente','teletrabajo','trabajo remoto',
    'convocatoria','convocatorias','concurso','licitacion','licitación'
  ]
};

// ---- DOM Elements ----
const inputEl = document.getElementById('keywordsInput');
const countEl = document.getElementById('keywordCount');

// Update keyword count live
inputEl.addEventListener('input', () => {
  const lines = getKeywordsFromInput();
  countEl.textContent = `${lines.length} keyword${lines.length !== 1 ? 's' : ''}`;
});

// ---- Initialize Negative Lists UI ----
function initNegLists() {
  Object.entries(NEG_LISTS).forEach(([key, words]) => {
    const tagsEl = document.getElementById(`negTags${capitalize(key)}`);
    const countEl = document.getElementById(`negCount${capitalize(key)}`);
    if (tagsEl) {
      tagsEl.innerHTML = words.map(w => `<span class="neg-tag">${w}</span>`).join('');
    }
    if (countEl) {
      countEl.textContent = `${words.length} palabras`;
    }
  });
  updateNegCount();
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function toggleNegList(key) {
  const body = document.getElementById(`negBody${capitalize(key)}`);
  if (body) body.style.display = body.style.display === 'none' ? 'block' : 'none';
}

function getActiveNegatives() {
  let negatives = [];
  Object.entries(NEG_LISTS).forEach(([key, words]) => {
    const toggle = document.getElementById(`negToggle${capitalize(key)}`);
    if (toggle && toggle.checked) {
      negatives = negatives.concat(words);
    }
  });
  // Add custom negatives
  const custom = document.getElementById('customNegatives').value
    .split('\n').map(l => l.trim().toLowerCase()).filter(l => l.length > 0);
  negatives = negatives.concat(custom);
  return [...new Set(negatives)];
}

function updateNegCount() {
  const count = getActiveNegatives().length;
  const el = document.getElementById('negActiveCount');
  if (el) el.textContent = `${count} negativas activas`;
}

function filterByNegatives(keywords) {
  const negatives = getActiveNegatives();
  if (negatives.length === 0) return { filtered: keywords, removed: [] };
  
  const removed = [];
  const filtered = keywords.filter(kw => {
    const kwLower = kw.toLowerCase();
    for (const neg of negatives) {
      if (kwLower.includes(neg)) {
        removed.push({ keyword: kw, matchedNeg: neg });
        return false;
      }
    }
    return true;
  });
  return { filtered, removed };
}

function exportNegatives() {
  const negatives = getActiveNegatives();
  if (negatives.length === 0) { showToast('⚠ No hay negativas activas'); return; }
  
  const csvContent = 'Keyword Negativa\n' + negatives.map(n => `"${n}"`).join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `negativas_google_ads_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('📥 Negativas CSV descargado');
}

function copyNegatives() {
  const negatives = getActiveNegatives();
  if (negatives.length === 0) { showToast('⚠ No hay negativas activas'); return; }
  navigator.clipboard.writeText(negatives.join('\n'))
    .then(() => showToast(`📋 ${negatives.length} negativas copiadas`));
}

// Listen for toggle changes to update count
document.addEventListener('change', (e) => {
  if (e.target.id && e.target.id.startsWith('negToggle')) updateNegCount();
});
document.addEventListener('DOMContentLoaded', initNegLists);

// ---- Helpers ----
function getKeywordsFromInput() {
  return inputEl.value
    .split('\n')
    .map(l => l.trim().toLowerCase())
    .filter(l => l.length > 0);
}

function normalize(text) {
  return text
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

function getTokens(keyword, removeStopwords) {
  let tokens = normalize(keyword).split(/\s+/).filter(t => t.length > 0);
  if (removeStopwords) {
    tokens = tokens.filter(t => !STOPWORDS_ES.has(t));
  }
  return tokens;
}

function getNgrams(tokens, n) {
  const ngrams = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    ngrams.push(tokens.slice(i, i + n).join(' '));
  }
  return ngrams;
}

// ---- Core Clustering Algorithm ----
function clusterKeywords(keywords, ngramSize, minCluster, removeStopwords) {
  // Step 1: Generate n-grams for every keyword
  const kwNgrams = keywords.map(kw => ({
    original: kw,
    ngrams: getNgrams(getTokens(kw, removeStopwords), ngramSize)
  }));

  // Step 2: Count n-gram frequency
  const freq = {};
  kwNgrams.forEach(item => {
    const seen = new Set();
    item.ngrams.forEach(ng => {
      if (!seen.has(ng)) {
        freq[ng] = (freq[ng] || 0) + 1;
        seen.add(ng);
      }
    });
  });

  // Step 3: Sort n-grams by frequency (descending)
  const sortedNgrams = Object.entries(freq)
    .filter(([_, count]) => count >= minCluster)
    .sort((a, b) => b[1] - a[1]);

  // Step 4: Assign keywords to clusters (greedy assignment)
  const assigned = new Set();
  const clusters = [];

  sortedNgrams.forEach(([ngram]) => {
    const members = [];
    kwNgrams.forEach(item => {
      if (!assigned.has(item.original) && item.ngrams.includes(ngram)) {
        members.push(item.original);
        assigned.add(item.original);
      }
    });

    if (members.length >= minCluster) {
      clusters.push({
        name: ngram,
        keywords: members.sort()
      });
    } else {
      // Release keywords that didn't meet threshold
      members.forEach(m => assigned.delete(m));
    }
  });

  // Step 5: Collect unclustered keywords
  const unclustered = keywords.filter(kw => !assigned.has(kw));

  return { clusters, unclustered };
}

// ---- Render Results ----
function renderResults(result) {
  const section = document.getElementById('resultsSection');
  const container = document.getElementById('clustersContainer');
  const totalKw = result.clusters.reduce((s, c) => s + c.keywords.length, 0) + result.unclustered.length;

  // Stats
  document.getElementById('statTotal').textContent = totalKw;
  document.getElementById('statClusters').textContent = result.clusters.length;
  document.getElementById('statUnclustered').textContent = result.unclustered.length;
  document.getElementById('statBlocked').textContent = (result.removedByNegatives || []).length;
  const avg = result.clusters.length
    ? (result.clusters.reduce((s, c) => s + c.keywords.length, 0) / result.clusters.length).toFixed(1)
    : '0';
  document.getElementById('statAvg').textContent = avg;

  // Build cards
  let html = '';
  result.clusters.forEach((cluster, idx) => {
    const phraseKws = cluster.keywords.map(k => `"${k}"`).join('\n');
    const exactKws = cluster.keywords.map(k => `[${k}]`).join('\n');
    const delay = Math.min(idx * 60, 600);

    html += `
      <div class="cluster-card" style="animation-delay: ${delay}ms" data-cluster="${idx}">
        <div class="cluster-header" onclick="toggleCluster(${idx})">
          <div class="cluster-title">
            <span>${capitalizeCluster(cluster.name)}</span>
            <span class="cluster-count">${cluster.keywords.length} kw</span>
          </div>
          <div class="cluster-actions">
            <button class="btn-icon" onclick="event.stopPropagation();copyCluster(${idx},'phrase')" title="Copiar Frase">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
            </button>
          </div>
        </div>
        <div class="cluster-body" id="clusterBody-${idx}">
          <div class="match-type-section">
            <div class="match-type-label phrase">⬤ Concordancia de Frase</div>
            <div class="kw-list">${escapeHtml(phraseKws)}</div>
          </div>
          <div class="match-type-section">
            <div class="match-type-label exact">⬤ Concordancia Exacta</div>
            <div class="kw-list">${escapeHtml(exactKws)}</div>
          </div>
        </div>
      </div>`;
  });

  // Unclustered
  if (result.unclustered.length > 0) {
    const phraseUn = result.unclustered.map(k => `"${k}"`).join('\n');
    const exactUn = result.unclustered.map(k => `[${k}]`).join('\n');

    html += `
      <div class="cluster-card" style="border-color: rgba(244,63,94,0.2);">
        <div class="cluster-header" onclick="toggleCluster('un')">
          <div class="cluster-title">
            <span>⚠ Sin Cluster</span>
            <span class="cluster-count" style="background:rgba(244,63,94,0.15);color:#f43f5e;">
              ${result.unclustered.length} kw
            </span>
          </div>
        </div>
        <div class="cluster-body" id="clusterBody-un">
          <div class="match-type-section">
            <div class="match-type-label phrase">⬤ Concordancia de Frase</div>
            <div class="kw-list">${escapeHtml(phraseUn)}</div>
          </div>
          <div class="match-type-section">
            <div class="match-type-label exact">⬤ Concordancia Exacta</div>
            <div class="kw-list">${escapeHtml(exactUn)}</div>
          </div>
        </div>
      </div>`;
  }

  container.innerHTML = html;
  section.style.display = 'block';
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Store for exports
  window._clusterResult = result;
}

// ---- Web Scraper ----
// Local server proxy is the most reliable (run: node server.js)
const LOCAL_PROXY = 'http://localhost:3456/proxy?url=';
const CORS_PROXIES = [
  'https://corsproxy.io/?url=',
  'https://api.allorigins.win/raw?url=',
  'https://api.codetabs.com/v1/proxy?quest='
];

async function fetchWithProxy(url) {
  // Try local proxy first (most reliable)
  try {
    const res = await fetch(LOCAL_PROXY + encodeURIComponent(url), { signal: AbortSignal.timeout(15000) });
    if (res.ok) return await res.text();
  } catch (_) { /* local server not running, try external proxies */ }

  // Fallback to external CORS proxies
  for (const proxy of CORS_PROXIES) {
    try {
      const res = await fetch(proxy + encodeURIComponent(url), { signal: AbortSignal.timeout(12000) });
      if (res.ok) return await res.text();
    } catch (_) { /* try next proxy */ }
  }
  throw new Error('No se pudo conectar. Ejecuta: node server.js');
}

function setScrapeStatus(type, msg) {
  const el = document.getElementById('scrapeStatus');
  el.style.display = 'flex';
  el.className = 'scrape-status ' + type;
  el.textContent = msg;
}

function showScrapePreview(keywords) {
  const el = document.getElementById('scrapePreview');
  el.style.display = 'block';
  el.innerHTML = `
    <h4>Keywords extraídas (${keywords.length})</h4>
    <div class="tag-list">
      ${keywords.slice(0, 60).map(k => `<span class="tag">${escapeHtml(k)}</span>`).join('')}
      ${keywords.length > 60 ? `<span class="tag">+${keywords.length - 60} más...</span>` : ''}
    </div>`;
}

async function scrapeUrl() {
  const urlInput = document.getElementById('urlInput');
  const btn = document.getElementById('btnScrape');
  let url = urlInput.value.trim();

  if (!url) { showToast('⚠ Pega una URL primero'); return; }
  if (!url.startsWith('http')) url = 'https://' + url;

  // UI: loading state
  btn.classList.add('loading');
  btn.disabled = true;
  btn.querySelector('span').textContent = 'Escaneando...';
  setScrapeStatus('info', '🔄 Conectando con ' + new URL(url).hostname + '...');

  try {
    const html = await fetchWithProxy(url);
    setScrapeStatus('info', '🧠 Analizando contenido...');

    // Parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Remove noise
    doc.querySelectorAll('script, style, nav, footer, header, iframe, noscript, svg').forEach(el => el.remove());

    // Extract text blocks with priority
    const blocks = [];

    // Title (high priority)
    const title = doc.querySelector('title');
    if (title) blocks.push({ text: title.textContent, weight: 3 });

    // Meta description
    const meta = doc.querySelector('meta[name="description"]');
    if (meta) blocks.push({ text: meta.getAttribute('content') || '', weight: 3 });

    // Meta keywords
    const metaKw = doc.querySelector('meta[name="keywords"]');
    if (metaKw) blocks.push({ text: (metaKw.getAttribute('content') || '').replace(/,/g, '\n'), weight: 3 });

    // Headings
    doc.querySelectorAll('h1, h2, h3, h4').forEach(h => {
      blocks.push({ text: h.textContent, weight: h.tagName === 'H1' ? 3 : 2 });
    });

    // Alt texts
    doc.querySelectorAll('img[alt]').forEach(img => {
      const alt = img.getAttribute('alt');
      if (alt && alt.length > 3) blocks.push({ text: alt, weight: 1 });
    });

    // Link texts
    doc.querySelectorAll('a').forEach(a => {
      const t = a.textContent.trim();
      if (t.length > 3 && t.length < 60 && !t.startsWith('http')) blocks.push({ text: t, weight: 1 });
    });

    // Paragraphs / list items
    doc.querySelectorAll('p, li, td, span, div').forEach(el => {
      const t = el.textContent.trim();
      if (t.length > 10 && t.length < 200 && el.children.length === 0) {
        blocks.push({ text: t, weight: 1 });
      }
    });

    // Extract keyword candidates
    const keywords = extractKeywordsFromBlocks(blocks);

    if (keywords.length === 0) {
      setScrapeStatus('error', '❌ No se encontraron keywords. Prueba con otra URL.');
    } else {
      // Populate textarea
      const existing = inputEl.value.trim();
      inputEl.value = (existing ? existing + '\n' : '') + keywords.join('\n');
      inputEl.dispatchEvent(new Event('input'));

      setScrapeStatus('success', `✅ ${keywords.length} keywords extraídas de ${new URL(url).hostname}`);
      showScrapePreview(keywords);
      showToast(`🌐 ${keywords.length} keywords extraídas`);
    }

  } catch (err) {
    console.error(err);
    setScrapeStatus('error', '❌ Error al escanear: ' + (err.message || 'No se pudo conectar'));
  } finally {
    btn.classList.remove('loading');
    btn.disabled = false;
    btn.querySelector('span').textContent = 'Escanear';
  }
}

function extractKeywordsFromBlocks(blocks) {
  const phraseFreq = {};

  blocks.forEach(block => {
    const text = block.text
      .toLowerCase()
      .replace(/[\r\n]+/g, ' ')
      .replace(/[^a-záéíóúüñ0-9\s]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (text.length < 5) return;

    const words = text.split(' ').filter(w => w.length > 1);

    // Generate 2-gram, 3-gram, and 4-gram phrases
    for (let n = 2; n <= 4; n++) {
      for (let i = 0; i <= words.length - n; i++) {
        const phraseWords = words.slice(i, i + n);
        const phrase = phraseWords.join(' ');
        
        // Must have at least 2 non-stopwords (for Google Ads relevance)
        const nonStop = phraseWords.filter(w => !STOPWORDS_ES.has(w));
        if (nonStop.length < 2) continue;
        
        // Skip very short phrases
        if (phrase.length < 6) continue;

        // Skip phrases that are just numbers
        if (/^\d+(\s\d+)*$/.test(phrase)) continue;

        if (!phraseFreq[phrase]) phraseFreq[phrase] = { count: 0, totalWeight: 0, ngramSize: n };
        phraseFreq[phrase].count++;
        phraseFreq[phrase].totalWeight += block.weight;
      }
    }
  });

  // Score: favor longer n-grams and higher weights
  const scored = Object.entries(phraseFreq)
    .map(([phrase, data]) => ({
      phrase,
      score: data.count * data.totalWeight * (data.ngramSize * 0.5)
    }))
    .filter(item => item.score >= 1.5)
    .sort((a, b) => b.score - a.score);

  // Relaxed deduplication: only remove exact substrings with same root
  const final = [];
  const used = new Set();

  for (const item of scored) {
    if (used.has(item.phrase)) continue;
    
    // Only skip if this phrase is a strict substring of an already-added phrase
    let strictSubstring = false;
    for (const existing of final) {
      if (existing !== item.phrase && existing.includes(item.phrase)) {
        strictSubstring = true;
        break;
      }
    }
    if (!strictSubstring) {
      final.push(item.phrase);
      used.add(item.phrase);
    }
    if (final.length >= 80) break;
  }

  return final;
}

// ---- Actions ----
function runClustering() {
  const rawKeywords = getKeywordsFromInput();
  if (rawKeywords.length === 0) {
    showToast('⚠ Pega al menos una keyword');
    return;
  }

  // Apply negative keyword filtering
  const { filtered: keywords, removed } = filterByNegatives(rawKeywords);
  
  const ngramSize = parseInt(document.getElementById('ngramSize').value);
  const minCluster = parseInt(document.getElementById('minClusterSize').value);
  const removeStopwords = document.getElementById('stopwordsToggle').checked;

  const result = clusterKeywords(keywords, ngramSize, minCluster, removeStopwords);
  result.removedByNegatives = removed;
  window._lastClusterResult = result;
  renderResults(result);

  const negMsg = removed.length > 0 ? ` | ${removed.length} bloqueadas por negativas` : '';
  showToast(`✅ ${result.clusters.length} clusters generados${negMsg}`);
}

function toggleCluster(idx) {
  const body = document.getElementById(`clusterBody-${idx}`);
  if (body) {
    body.style.display = body.style.display === 'none' ? 'block' : 'none';
  }
}

function copyCluster(idx, type) {
  const cluster = window._clusterResult.clusters[idx];
  if (!cluster) return;
  let text;
  if (type === 'phrase') text = cluster.keywords.map(k => `"${k}"`).join('\n');
  else if (type === 'exact') text = cluster.keywords.map(k => `[${k}]`).join('\n');
  else text = cluster.keywords.map(k => `"${k}"\t[${k}]`).join('\n');

  navigator.clipboard.writeText(text).then(() => showToast('📋 Copiado al clipboard'));
}

function copyAll() {
  const r = window._clusterResult;
  if (!r) return;
  let text = '';
  r.clusters.forEach(c => {
    text += `=== ${c.name.toUpperCase()} (${c.keywords.length} kw) ===\n`;
    text += '-- Frase --\n';
    text += c.keywords.map(k => `"${k}"`).join('\n') + '\n';
    text += '-- Exacta --\n';
    text += c.keywords.map(k => `[${k}]`).join('\n') + '\n\n';
  });
  if (r.unclustered.length > 0) {
    text += `=== SIN CLUSTER (${r.unclustered.length} kw) ===\n`;
    text += r.unclustered.map(k => `"${k}"  |  [${k}]`).join('\n');
  }
  navigator.clipboard.writeText(text).then(() => showToast('📋 Todo copiado al clipboard'));
}

function exportCSV(matchType) {
  const r = window._clusterResult;
  if (!r) return;

  let headers, rows = [];
  if (matchType === 'phrase') {
    headers = ['Cluster', 'Keyword (Frase)'];
    r.clusters.forEach(c => c.keywords.forEach(k => rows.push([c.name, `"${k}"`])));
    r.unclustered.forEach(k => rows.push(['(sin cluster)', `"${k}"`]));
  } else if (matchType === 'exact') {
    headers = ['Cluster', 'Keyword (Exacta)'];
    r.clusters.forEach(c => c.keywords.forEach(k => rows.push([c.name, `[${k}]`])));
    r.unclustered.forEach(k => rows.push(['(sin cluster)', `[${k}]`]));
  } else {
    headers = ['Cluster', 'Keyword Original', 'Frase', 'Exacta'];
    r.clusters.forEach(c => c.keywords.forEach(k =>
      rows.push([c.name, k, `"${k}"`, `[${k}]`])
    ));
    r.unclustered.forEach(k =>
      rows.push(['(sin cluster)', k, `"${k}"`, `[${k}]`])
    );
  }

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `clusters_${matchType}_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('📥 CSV descargado');
}

function loadSample() {
  inputEl.value = `apartamento en arriendo bogota
arriendo apartamento chapinero
alquiler apartamento bogota norte
arriendo apartamento suba
apartamento en arriendo usaquen
arriendo casa bogota
casa en arriendo chapinero
alquiler casa usaquen
casa en arriendo suba
arriendo oficina bogota
oficina en arriendo chapinero
alquiler oficina bogota norte
arriendo local comercial bogota
local comercial en arriendo chapinero
apartaestudio en arriendo bogota
arriendo apartaestudio chapinero
apartaestudio en arriendo suba
bodega en arriendo bogota
arriendo bodega fontibon
alquiler bodega bogota norte
arriendo apartamento amoblado bogota
apartamento amoblado chapinero
arriendo penthouse bogota
arriendo duplex usaquen`;
  inputEl.dispatchEvent(new Event('input'));
}

function clearInput() {
  inputEl.value = '';
  inputEl.dispatchEvent(new Event('input'));
  document.getElementById('resultsSection').style.display = 'none';
}

// ---- Utilities ----
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function capitalizeCluster(name) {
  return name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function showToast(message) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ---- Business Config Toggle ----
function toggleBizConfig() {
  const body = document.getElementById('bizConfigBody');
  const icon = document.getElementById('bizToggleIcon');
  if (body.style.display === 'none') {
    body.style.display = 'flex';
    icon.textContent = '▲';
  } else {
    body.style.display = 'none';
    icon.textContent = '▼';
  }
}

function getBizInfo() {
  return {
    name: document.getElementById('bizName').value.trim(),
    url: document.getElementById('bizUrl').value.trim(),
    value: document.getElementById('bizValue').value.trim(),
    diff: document.getElementById('bizDiff').value.trim()
  };
}

// ---- Prompt Generator for AI Ad Copy ----
function generatePromptForCluster(cluster, bizInfo) {
  const kwList = cluster.keywords.map(k => `- ${k}`).join('\n');
  const clusterName = cluster.name.charAt(0).toUpperCase() + cluster.name.slice(1);

  return `Actúa como un experto redactor de anuncios en Google Ads y ten en cuenta las mejores prácticas para la red de búsqueda con el objetivo de mejorar la relevancia y la efectividad de los anuncios.

Ten en cuenta la siguiente información:

Nombre del negocio: ${bizInfo.name || '[INSERTAR NOMBRE DEL NEGOCIO]'}

Propuesta de valor del negocio: ${bizInfo.value || '[INSERTAR PROPUESTA DE VALOR DEL NEGOCIO]'}

Diferenciales: ${bizInfo.diff || '[INSERTAR DIFERENCIALES DEL NEGOCIO]'}

Grupo de Anuncios: ${clusterName}

Palabras clave de este grupo:
${kwList}

Redacta textos para los siguientes espacios:
- 5 títulos de máximo 30 caracteres enfocados en las palabras clave del grupo "${clusterName}"
- 5 títulos de máximo 30 caracteres enfocados en la propuesta de valor y los diferenciadores
- 5 títulos de máximo 30 caracteres enfocados en diferentes llamados a la acción
- 4 descripciones de máximo 90 caracteres

Recomiéndame también qué recursos (Enlaces de sitio, textos destacados, fragmentos estructurados, precios, promociones, etc.) debería agregar al anuncio y dame ideas para ellos.

Formato de respuesta: Para cada título indica los caracteres usados entre paréntesis.`;
}

function copyAllPrompts() {
  if (!window._lastClusterResult || !window._lastClusterResult.clusters.length) {
    showToast('⚠ Primero genera los clusters');
    return;
  }
  const bizInfo = getBizInfo();
  const prompts = window._lastClusterResult.clusters.map((c, i) => {
    const sep = '═'.repeat(50);
    return `${sep}\n📂 AD GROUP ${i + 1}: ${c.name.toUpperCase()} (${c.keywords.length} kw)\n${sep}\n\n${generatePromptForCluster(c, bizInfo)}`;
  }).join('\n\n\n');

  navigator.clipboard.writeText(prompts)
    .then(() => showToast(`🤖 Prompt para ${window._lastClusterResult.clusters.length} ad groups copiado`));
}

// ---- Campaign Template CSV Export ----
function exportCampaignCSV() {
  if (!window._lastClusterResult || !window._lastClusterResult.clusters.length) {
    showToast('⚠ Primero genera los clusters');
    return;
  }

  const bizInfo = getBizInfo();
  const clusters = window._lastClusterResult.clusters;
  const rows = [];

  // Header row
  const headers = [''];
  clusters.forEach(c => {
    headers.push(`Ad Group: ${c.name.charAt(0).toUpperCase() + c.name.slice(1)}`);
    headers.push('Chars');
  });
  rows.push(headers);

  // Row definitions matching the user's Google Sheets template
  const defs = [
    ['URL de destino', () => bizInfo.url || 'https://dominio.com/pagina-de-aterrizaje', ''],
    ['Ruta 1', (c) => c.name.split(' ')[0] || '', ''],
    ['Ruta 2', () => '', ''],
    ['Título 1', () => 'Título alineado con las palabras clave', -8],
    ['Título 2', () => 'Título alineado con las palabras clave', -8],
    ['Título 3', () => 'Título alineado con las palabras clave', -8],
    ['Título 4', () => 'Título alineado con las palabras clave', -8],
    ['Título 5', () => 'Título alineado con las palabras clave', -8],
    ['Título 6', () => 'Título para destacar la propuesta de valor', -12],
    ['Título 7', () => 'Título para destacar la propuesta de valor', -12],
    ['Título 8', () => 'Título para destacar la propuesta de valor', -12],
    ['Título 9', () => 'Título para destacar la propuesta de valor', -12],
    ['Título 10', () => 'Título para destacar la propuesta de valor', -12],
    ['Título 11', () => 'Título con Llamado a la acción', 0],
    ['Título 12', () => 'Título con Llamado a la acción', 0],
    ['Título 13', () => 'Título con Llamado a la acción', 0],
    ['Título 14', () => 'Título con Llamado a la acción', 0],
    ['Título 15', () => 'Título con Llamado a la acción', 0],
    ['Descripción 1', () => 'Describe la propuesta de valor en más detalle', 45],
    ['Descripción 2', () => 'Describe la propuesta de valor en más detalle', 45],
    ['Descripción 3', () => 'Describe la propuesta de valor en más detalle', 45],
    ['Descripción 4', () => 'Describe la propuesta de valor en más detalle', 45],
  ];

  defs.forEach(([label, fillFn, chars]) => {
    const row = [label];
    clusters.forEach(c => {
      row.push(fillFn(c));
      row.push(chars);
    });
    rows.push(row);
  });

  // Blank row
  rows.push(['']);

  // Keywords section - Phrase match
  const kwHeader = ['Palabras clave'];
  clusters.forEach(() => { kwHeader.push('Concordancia de Frase'); kwHeader.push(''); });
  rows.push(kwHeader);

  const maxKw = Math.max(...clusters.map(c => c.keywords.length));
  for (let i = 0; i < maxKw; i++) {
    const row = [''];
    clusters.forEach(c => {
      const kw = c.keywords[i];
      row.push(kw ? `"${kw}"` : '');
      row.push('');
    });
    rows.push(row);
  }

  // Blank + Exact match
  rows.push(['']);
  const exHeader = [''];
  clusters.forEach(() => { exHeader.push('Concordancia Exacta'); exHeader.push(''); });
  rows.push(exHeader);

  for (let i = 0; i < maxKw; i++) {
    const row = [''];
    clusters.forEach(c => {
      const kw = c.keywords[i];
      row.push(kw ? `[${kw}]` : '');
      row.push('');
    });
    rows.push(row);
  }

  // Export
  const csvContent = rows.map(row =>
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `plantilla_campana_gads_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('📊 Plantilla de campaña descargada');
}
