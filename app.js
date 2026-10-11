/* MakanAgent — Qloo Taste-AI dining agent (static, key in localStorage) */
const BASE = 'https://hackathon.api.qloo.com';
const $ = id => document.getElementById(id);
const CUISINES = ['Malay', 'Chinese', 'Indian', 'Japanese', 'Korean', 'Thai', 'Vietnamese', 'Western', 'Middle Eastern', 'Desserts'];
let selCuisine = 'Malay';
let DEMO = [];

async function loadDemo() {
  try { const r = await fetch('data/fallback.json'); DEMO = r.ok ? await r.json() : []; }
  catch { DEMO = []; }
  if (!DEMO.length) DEMO = EMBED;
}

function key() { return ($('apiKey').value || localStorage.getItem('makan_key') || '').trim(); }

async function api(path) {
  const r = await fetch(BASE + path, { headers: { 'X-Api-Key': key() } });
  if (!r.ok) throw new Error('Qloo ' + r.status);
  return r.json();
}

async function resolveTag(cuisine) {
  const j = await api('/v2/tags?q=' + encodeURIComponent(cuisine));
  const tags = j.results?.tags || j.tags || [];
  return tags[0]?.id || tags[0]?.urn || null;
}

async function insights(tagId, craving) {
  const p = new URLSearchParams({ 'filter.type': 'urn:entity:place', 'filter.tags': tagId, 'limit': '8' });
  if ($('fHalal').checked) p.append('signal.interests.tags', 'halal');
  const j = await api('/v2/insights?' + p.toString());
  return j.results?.entities || j.entities || [];
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
  const g = $('results'); g.innerHTML = '';
  $('empty').style.display = places.length ? 'none' : 'block';
  places.forEach(p => {
    const props = p.properties || {};
    const tags = (p.tags || []).map(t => t.name || t.id).filter(Boolean);
    g.appendChild(card(p.name, props.address || props.city || '', tags, whyFn(p)));
  });
}

function renderDemo() {
  const q = ($('craving').value || '').toLowerCase();
  const list = DEMO.filter(d => !q || (d.name + d.cuisine + d.tags.join(' ')).toLowerCase().includes(q.split(' ')[0]));
  renderPlaces(list.slice(0, 8).map(d => ({ name: d.name, properties: { address: d.address }, tags: d.tags.map(t => ({ name: t })) })), () => `Matches <b>${selCuisine}</b> craving via local demo data.`);
}

async function go() {
  const w = $('warn'); w.hidden = true;
  $('results').innerHTML = ''; $('empty').style.display = 'block';
  if ($('fDemo').checked || !key()) {
    if (!key()) { w.textContent = 'No API key — showing demo data. Add your Qloo key for live taste results.'; w.hidden = false; }
    renderDemo(); return;
  }
  try {
    const tagId = await resolveTag(selCuisine);
    if (!tagId) throw new Error('no tag for ' + selCuisine);
    const places = await insights(tagId, $('craving').value);
    if (!places.length) { w.textContent = 'Qloo returned no places — try another cuisine.'; w.hidden = false; }
    renderPlaces(places, () => `Ranked by Qloo Taste AI for <b>${selCuisine}</b> + your craving.`);
  } catch (e) {
    w.textContent = 'Qloo error (' + e.message + ') — showing demo data instead.';
    w.hidden = false; renderDemo();
  }
}

function renderCuisines() {
  const c = $('cuisines'); c.innerHTML = '';
  CUISINES.forEach(n => {
    const b = document.createElement('button');
    b.className = 'chip' + (n === selCuisine ? ' sel' : '');
    b.textContent = n;
    b.onclick = () => { selCuisine = n; renderCuisines(); };
    c.appendChild(b);
  });
}

$('go').onclick = go;
$('keyBtn').onclick = () => { $('keyPanel').hidden = !$('keyPanel').hidden; };
$('saveKey').onclick = () => {
  localStorage.setItem('makan_key', $('apiKey').value.trim());
  $('keyState').textContent = $('apiKey').value.trim() ? 'Key saved in this browser.' : 'Key cleared.';
};
$('apiKey').value = localStorage.getItem('makan_key') || '';
if ($('apiKey').value) $('keyState').textContent = 'Key loaded from this browser.';

const EMBED = [];
renderCuisines(); loadDemo();
