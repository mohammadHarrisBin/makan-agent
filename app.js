/* MakanAgent — Qloo Taste-AI dining agent with full error handling and debug logging */
const BASE = 'https://hackathon.api.qloo.com';
const $ = id => document.getElementById(id);
const CUISINES = ['Malay', 'Chinese', 'Indian', 'Japanese', 'Korean', 'Thai', 'Vietnamese', 'Western', 'Middle Eastern', 'Desserts'];
let selCuisine = 'Malay';
let DEMO = [];

async function loadDemo() {
  try {
    const r = await fetch('data/fallback.json');
    DEMO = r.ok ? await r.json() : [];
    console.log('[LoadDemo] Loaded fallback.json:', DEMO.length, 'records');
  } catch (err) {
    console.warn('[LoadDemo] Could not load data/fallback.json, using EMBED array:', err);
    DEMO = [];
  }
  if (!DEMO.length) DEMO = EMBED;
}

function key() { 
  return ($('apiKey').value || localStorage.getItem('makan_key') || '').trim(); 
}

async function api(path) {
  const url = BASE + path;
  console.log(`[API Request] GET ${url}`);
  
  const headers = {
    'X-Api-Key': key(),
    'Accept': 'application/json'
  };

  const r = await fetch(url, { headers });
  
  if (!r.ok) {
    let errorDetail = '';
    try {
      const errJson = await r.json();
      errorDetail = JSON.stringify(errJson);
    } catch {
      errorDetail = await r.text();
    }
    console.error(`[API Error] HTTP ${r.status} on ${path}:`, errorDetail);
    throw new Error(`Qloo HTTP ${r.status}: ${errorDetail || r.statusText}`);
  }

  const data = await r.json();
  console.log(`[API Response] ${path}:`, data);
  return data;
}

async function resolveTag(cuisine) {
  console.log(`[ResolveTag] Searching tag for cuisine: "${cuisine}"`);
  // Qloo v2 uses filter.query for tag search
  const j = await api('/v2/tags?filter.query=' + encodeURIComponent(cuisine));
  const tags = j.results?.tags || j.tags || j.results || [];
  
  if (!tags.length) {
    console.warn(`[ResolveTag] No tags found for cuisine "${cuisine}"`);
    return null;
  }
  
  const tagId = tags[0]?.id || tags[0]?.urn;
  console.log(`[ResolveTag] Resolved tag ID/URN: ${tagId}`, tags[0]);
  return tagId;
}

async function insights(tagId, craving) {
  const p = new URLSearchParams({
    'filter.type': 'urn:entity:place',
    'filter.tags': tagId,
    'limit': '8'
  });

  if ($('fHalal') &&$('fHalal').checked) {
    p.append('signal.interests.tags', 'urn:tag:halal');
  }

  if (craving && craving.trim()) {
    p.append('filter.query', craving.trim());
  }

  console.log(`[Insights] Query params:`, p.toString());
  const j = await api('/v2/insights?' + p.toString());
  const entities = j.results?.entities || j.entities || j.results || [];
  console.log(`[Insights] Received ${entities.length} places`);
  return entities;
}

function card(name, addr, tags, why) {
  const d = document.createElement('div');
  d.className = 'card';
  d.innerHTML = `<h3>${name}</h3><div class="addr">${addr || ''}</div>
    <div class="tags">${(tags || []).slice(0, 4).map(t => `<span class="tag">${t}</span>`).join('')}</div>
    <div class="why">${why}</div>`;
  return d;
}

function renderPlaces(places, whyFn) {
  const g = $('results'); 
  g.innerHTML = '';
  $('empty').style.display = places.length ? 'none' : 'block';
  places.forEach(p => {
    const props = p.properties || {};
    const tags = (p.tags || []).map(t => t.name || t.id).filter(Boolean);
    g.appendChild(card(p.name, props.address || props.city || '', tags, whyFn(p)));
  });
}

function renderDemo() {
  console.log('[Demo] Falling back to demo data rendering');
  const q = ($('craving').value || '').toLowerCase();
  const list = DEMO.filter(d => !q || (d.name + d.cuisine + d.tags.join(' ')).toLowerCase().includes(q.split(' ')[0]));
  renderPlaces(list.slice(0, 8).map(d => ({ 
    name: d.name, 
    properties: { address: d.address }, 
    tags: (d.tags || []).map(t => ({ name: t })) 
  })), () => `Matches <b>${selCuisine}</b> craving via local demo data.`);
}

async function go() {
  const w = $('warn'); 
  w.hidden = true;
  $('results').innerHTML = '';$('empty').style.display = 'block';

  if (($('fDemo') &&$('fDemo').checked) || !key()) {
    if (!key()) { 
      w.textContent = 'No API key — showing demo data. Add your Qloo key for live taste results.'; 
      w.hidden = false; 
    }
    renderDemo(); 
    return;
  }

  try {
    console.log('[MakanAgent] Starting query pipeline...');
    const tagId = await resolveTag(selCuisine);
    if (!tagId) throw new Error('No tag found for ' + selCuisine);

    const places = await insights(tagId, $('craving').value);
    if (!places.length) { 
      w.textContent = 'Qloo returned no places — try another cuisine or craving.'; 
      w.hidden = false; 
    }
    renderPlaces(places, () => `Ranked by Qloo Taste AI for <b>${selCuisine}</b> + your craving.`);
  } catch (e) {
    console.error('[MakanAgent] Workflow failed:', e);
    w.textContent = 'Qloo error (' + e.message + ') — showing demo data instead.';
    w.hidden = false; 
    renderDemo();
  }
}

function renderCuisines() {
  const c = $('cuisines'); 
  c.innerHTML = '';
  CUISINES.forEach(n => {
    const b = document.createElement('button');
    b.className = 'chip' + (n === selCuisine ? ' sel' : '');
    b.textContent = n;
    b.onclick = () => { selCuisine = n; renderCuisines(); };
    c.appendChild(b);
  });
}

$('go').onclick = go;
$('keyBtn').onclick = () => {$('keyPanel').hidden = !$('keyPanel').hidden; };$('saveKey').onclick = () => {
  localStorage.setItem('makan_key', $('apiKey').value.trim());
  $('keyState').textContent =$('apiKey').value.trim() ? 'Key saved in this browser.' : 'Key cleared.';
};

$('apiKey').value = localStorage.getItem('makan_key') || '';
if ($('apiKey').value)$('keyState').textContent = 'Key loaded from this browser.';

const EMBED = [];
renderCuisines(); 
loadDemo();
