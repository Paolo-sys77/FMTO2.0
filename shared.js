// ══════════════════════════════════════════════════════
// FMTO 2.0 — Shared UI helpers (v2 — dati reali)
// ══════════════════════════════════════════════════════

// ── NAV ACTIVE LINK
const PAGE_MAP = {'index.html':'nav-home','home.html':'nav-home','ranking.html':'nav-ranking','squadre.html':'nav-sq','mercato.html':'nav-sq','mister.html':'nav-mister','forum.html':'nav-forum','palmares.html':'nav-palmares','calendario.html':'nav-calendario','area.html':'nav-area'};
function initNav(){const f=location.pathname.split('/').pop()||'index.html';const id=PAGE_MAP[f];if(id)document.getElementById(id)?.classList.add('active');}
document.addEventListener('DOMContentLoaded',initNav);

// ── MOBILE MENU (tutte le pagine): pulsante hamburger in alto a destra
function initMobileMenu(){
  if(document.getElementById('home-menu-btn'))return;
  var html='<button type="button" class="home-menu-btn" id="home-menu-btn" aria-label="Menu"><span></span><span></span><span></span></button>'+
    '<div class="home-menu-overlay" id="home-menu-overlay"></div>'+
    '<div id="home-menu-panel" class="home-menu-panel"><h3>Menu</h3>'+
    '<a href="home.html">Home</a><a href="mister.html">I Mister</a><a href="squadre.html">Le 56 Squadre</a><a href="scouting.html">Scouting</a>'+
    '<a href="calendario.html">Calendario</a><a href="ranking.html">Ranking</a><a href="palmares.html">Palmares</a>'+
    '<a href="serie-a-girone-a.html">Campionati</a><a href="coppe.html">Coppe</a><a href="area.html">Area Riservata</a></div>';
  document.body.insertAdjacentHTML('afterbegin',html);
  var btn=document.getElementById('home-menu-btn');
  var overlay=document.getElementById('home-menu-overlay');
  var panel=document.getElementById('home-menu-panel');
  function closeMenu(){overlay.classList.remove('open');panel.classList.remove('open');}
  btn.addEventListener('click',function(){overlay.classList.contains('open')?closeMenu():(overlay.classList.add('open'),panel.classList.add('open'));});
  overlay.addEventListener('click',closeMenu);
  panel.querySelectorAll('a').forEach(function(a){a.addEventListener('click',closeMenu);});
}
document.addEventListener('DOMContentLoaded',initMobileMenu);

// ── FLAGS
const FLAG={'Afghanistan':'🇦🇫','Albania':'🇦🇱','Algeria':'🇩🇿','Angola':'🇦🇴','Antigua e Barbuda':'🇦🇬','Argentina':'🇦🇷','Armenia':'🇦🇲','Aruba':'🇦🇼','Australia':'🇦🇺','Austria':'🇦🇹','Barbados':'🇧🇧','Belgio':'🇧🇪','Benin':'🇧🇯','Bosnia-Erzegovina':'🇧🇦','Brasile':'🇧🇷','Burkina Faso':'🇧🇫','Burundi':'🇧🇮','Camerun':'🇨🇲','Canada':'🇨🇦','Capo Verde':'🇨🇻','Cechia':'🇨🇿','Cile':'🇨🇱','Cipro':'🇨🇾','Colombia':'🇨🇴','Congo':'🇨🇬','Corea del Sud':'🇰🇷','Costa Rica':'🇨🇷',"Costa d'Avorio":'🇨🇮','Croazia':'🇭🇷','Cuba':'🇨🇺','Curaçao':'🇨🇼','Danimarca':'🇩🇰','Dominica':'🇩🇲','Ecuador':'🇪🇨','Egitto':'🇪🇬','Emirati Arabi Uniti':'🇦🇪','Eritrea':'🇪🇷','Filippine':'🇵🇭','Finlandia':'🇫🇮','Francia':'🇫🇷','Galles':'🏴󠁧󠁢󠁷󠁬󠁳󠁿','Gambia':'🇬🇲','Georgia':'🇬🇪','Germania':'🇩🇪','Ghana':'🇬🇭','Giamaica':'🇯🇲','Giappone':'🇯🇵','Grecia':'🇬🇷','Guadalupa':'🇬🇵','Guinea':'🇬🇳','Guinea Equatoriale':'🇬🇶','Guinea-Bissau':'🇬🇼','Guyana':'🇬🇾','Guyana Francese':'🇬🇫','Haiti':'🇭🇹','Indonesia':'🇮🇩','Inghilterra':'🏴󠁧󠁢󠁥󠁮󠁧󠁿','Irlanda del Nord':'🇬🇧','Islanda':'🇮🇸','Israele':'🇮🇱','Italia':'🇮🇹','Kenya':'🇰🇪','Kosovo':'🇽🇰','Libano':'🇱🇧','Liberia':'🇱🇷','Libia':'🇱🇾','Lussemburgo':'🇱🇺','Macedonia del Nord':'🇲🇰','Mali':'🇲🇱','Marocco':'🇲🇦','Martinica':'🇲🇶','Mauritania':'🇲🇷','Messico':'🇲🇽','Monaco':'🇲🇨','Montenegro':'🇲🇪','Montserrat':'🇲🇸','Mozambico':'🇲🇿','Nigeria':'🇳🇬','Norvegia':'🇳🇴','Nuova Zelanda':'🇳🇿','Paesi Baschi':'🏳️','Paesi Bassi':'🇳🇱','Paraguay':'🇵🇾','Polonia':'🇵🇱','Portogallo':'🇵🇹','Repubblica Centrafricana':'🇨🇫','Repubblica Democratica del Congo':'🇨🇩','Repubblica Dominicana':'🇩🇴',"Repubblica d'Irlanda":'🇮🇪','Romania':'🇷🇴','Russia':'🇷🇺','Saint Kitts e Nevis':'🇰🇳','Scozia':'🏴󠁧󠁢󠁳󠁣󠁴󠁿','Senegal':'🇸🇳','Serbia':'🇷🇸','Sierra Leone':'🇸🇱','Siria':'🇸🇾','Slovacchia':'🇸🇰','Slovenia':'🇸🇮','Spagna':'🇪🇸','Stati Uniti':'🇺🇸','Sudan del Sud':'🇸🇸','Suriname':'🇸🇷','Svezia':'🇸🇪','Svizzera':'🇨🇭','São Tomé e Príncipe':'🇸🇹','Togo':'🇹🇬','Tunisia':'🇹🇳','Turchia':'🇹🇷','Ucraina':'🇺🇦','Ungheria':'🇭🇺','Uruguay':'🇺🇾','Uzbekistan':'🇺🇿','Venezuela':'🇻🇪','Vietnam':'🇻🇳'};
function getFlag(naz){if(!naz)return'🌍';return FLAG[naz.split(',')[0].trim()]||'🌍';}

// ── POSITION HELPERS
function displayRole(pos){
  if(!pos)return'—';const p=pos.toUpperCase();
  if(p.startsWith('P'))return'POR';
  if(p==='D C'||p==='D DC'||p==='D SC'||p==='D DSC')return'DC';
  if(p.includes('TF'))return'D/TF';
  if(p.startsWith('D'))return'DIF';
  if(p.startsWith('M/C')||p.startsWith('M'))return'CEN';
  if(p.startsWith('C/T')||p.startsWith('C'))return'CEN';
  if(p.startsWith('T/S'))return'ALA';
  if(p.startsWith('T'))return'TRE';
  if(p.startsWith('S'))return'ATT';
  return pos.split(' ')[0];
}
function getRoleClassFromPos(pos){
  return'r-white';
}

// ── OVR COLOR (based on CA 75-191)
function getOvrClass(ca){
  if(ca>=170)return'ov-gold';
  if(ca>=150)return'ov-green';
  if(ca>=130)return'ov-v';
  return'ov-w';
}

// ── PRICE / STIPENDIO FORMAT
function fmtPrice(v){
  if(!v||v<=0)return'—';
  if(v>=1000000)return'€'+(v/1000000).toFixed(1)+'M';
  if(v>=1000)return'€'+(v/1000).toFixed(0)+'K';
  return'€'+v;
}
// Per gli stipendi: se < 1M mostra in milioni con una cifra decimale (es. 200k → "€0.2M"),
// altrimenti usa il formato standard con € e M.
function fmtStipendio(v){
  if(!v||v<=0)return'—';
  if(v<1000000)return'€'+(v/1000000).toFixed(1)+'M';
  return fmtPrice(v);
}
/** Stipendio: tabella stipendi.js per ID, altrimenti campo `stipendio` sul giocatore. Mai `prezzo` (valore di mercato). */
function getStipendio(p) {
  if (!p) return null;
  if (typeof STIPENDI_BY_ID !== 'undefined' && STIPENDI_BY_ID[p.id] != null) return STIPENDI_BY_ID[p.id];

  function numStip(obj) {
    if (!obj || obj.stipendio == null || obj.stipendio === '') return null;
    var n = Number(obj.stipendio);
    return isNaN(n) ? null : n;
  }

  var isSv =
    (p.squadra && /svincol/i.test(String(p.squadra))) ||
    (p.squadName && /svincol/i.test(String(p.squadName)));
  if (isSv) {
    var sid = String(p.id || '');
    if (sid) {
      var src = null;
      if (typeof PLAYERS_BY_TEAM !== 'undefined' && Array.isArray(PLAYERS_BY_TEAM.SVINCOLATI)) {
        src = PLAYERS_BY_TEAM.SVINCOLATI.find(function (pl) { return String(pl.id) === sid; });
      }
      if (!src && typeof window !== 'undefined' && Array.isArray(window.SVINCOLATI_SCOUTING)) {
        src = window.SVINCOLATI_SCOUTING.find(function (pl) { return String(pl.id) === sid; });
      }
      if (!src && typeof window !== 'undefined' && Array.isArray(window.SVINCOLATI_EXTRA)) {
        src = window.SVINCOLATI_EXTRA.find(function (pl) { return String(pl.id) === sid; });
      }
      var fromSrc = numStip(src);
      if (fromSrc != null && fromSrc > 0) return fromSrc;
    }
  }

  if (p.stipendio != null && p.stipendio !== '') {
    var n = Number(p.stipendio);
    return isNaN(n) ? null : n;
  }
  return null;
}

// ── WATCHLIST — per-squad, richiede autenticazione
// Sessione in localStorage: resta dopo chiusura browser; si azzera solo con logout (endSession)
// chiave: fmto_session → { sqId, sqName }
// watchlist: fmto_wl_<sqId> → array giocatori

const WL_SESSION_KEY = 'fmto_session';
const WL_KEY_PREFIX  = 'fmto_wl_';
const WL_SYNC_META_PREFIX = 'fmto_wlmeta_'; // meta per sync (per-squad): { updatedAt }
let _wlSyncTimer = null;
let _wlSyncInFlight = false;
let _wlRemoteAppliedForSq = null;

function _sessionRawFromStorage() {
  try {
    let raw = localStorage.getItem(WL_SESSION_KEY);
    if (raw) return raw;
    raw = sessionStorage.getItem(WL_SESSION_KEY);
    if (raw) {
      try { localStorage.setItem(WL_SESSION_KEY, raw); } catch (e) {}
      try { sessionStorage.removeItem(WL_SESSION_KEY); } catch (e) {}
      return raw;
    }
  } catch (e) {}
  return null;
}

/* Restituisce la sessione attiva o null */
function getSession() {
  try {
    const raw = _sessionRawFromStorage();
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
/* Avvia sessione (chiamato da pin.html dopo PIN corretto) */
function startSession(sqId, sqName) {
  try { sessionStorage.removeItem(WL_SESSION_KEY); } catch (e) {}
  try { localStorage.setItem(WL_SESSION_KEY, JSON.stringify({ sqId, sqName })); } catch (e) {}
  // appena loggato, prova a caricare dal server (se configurato)
  try { syncWLFromServer(); } catch(e) {}
}
/* Termina sessione (logout) */
function endSession() {
  try { localStorage.removeItem(WL_SESSION_KEY); } catch (e) {}
  try { sessionStorage.removeItem(WL_SESSION_KEY); } catch (e) {}
}

/** Normalizza nome squadra per confronti (stesso criterio utile tra data.js e players.js). */
function normalizeSquadRosterKey(name) {
  return String(name || '').trim().toUpperCase().replace(/\s+/g, ' ');
}

/**
 * Rosa per uno o più nomi squadra (es. nome da SQUADS + eventuale sqName in sessione).
 * 1) PLAYERS_BY_TEAM chiave esatta, 2) chiave case-insensitive, 3) ALL_PLAYERS filtrato per squadra.
 * Allineato al comportamento di squadre.html quando la chiave oggetto non coincide al millimetro.
 */
function getRosterPlayersBySquadNames(/* name1, name2, ... */) {
  const raw = Array.prototype.slice.call(arguments).filter(function (n) { return n != null && String(n).trim() !== ''; });
  const seen = {};
  const names = [];
  for (let i = 0; i < raw.length; i++) {
    const k = normalizeSquadRosterKey(raw[i]);
    if (!k || seen[k]) continue;
    seen[k] = true;
    names.push(raw[i]);
  }
  for (let j = 0; j < names.length; j++) {
    const list = rosterPlayersFromSingleSquadName(names[j]);
    if (list.length) return list;
  }
  return [];
}

function rosterPlayersFromSingleSquadName(sqName) {
  if (!sqName || typeof PLAYERS_BY_TEAM === 'undefined') return [];
  const direct = PLAYERS_BY_TEAM[sqName];
  if (Array.isArray(direct) && direct.length) return direct;
  const t = normalizeSquadRosterKey(sqName);
  const keys = Object.keys(PLAYERS_BY_TEAM);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (normalizeSquadRosterKey(key) === t) {
      const arr = PLAYERS_BY_TEAM[key];
      if (Array.isArray(arr) && arr.length) return arr;
    }
  }
  if (typeof ALL_PLAYERS !== 'undefined' && Array.isArray(ALL_PLAYERS)) {
    return ALL_PLAYERS.filter(function (p) {
      return p && normalizeSquadRosterKey(p.squadra) === t;
    });
  }
  return [];
}

/* Chiave localStorage per la WL dell'utente corrente (null se non loggato) */
function _wlKey() {
  const s = getSession();
  if (!s || s.sqId == null || String(s.sqId).trim() === '') return null;
  return WL_KEY_PREFIX + s.sqId;
}

function getWL() {
  const k = _wlKey();
  if (!k) return [];
  try { return JSON.parse(localStorage.getItem(k) || '[]'); }
  catch { return []; }
}
function saveWL(wl) {
  const k = _wlKey();
  if (!k) return;
  try {
    localStorage.setItem(k, JSON.stringify(wl));
  } catch (err) {
    console.error('FMTO saveWL:', err);
    try { alert('Impossibile salvare la watchlist (memoria del browser piena o bloccata).'); } catch (e) {}
    return;
  }
  _touchWLMeta();
  scheduleWLSyncToServer();
}
function inWL(pid) {
  return getWL().some(p => String(p.id) === String(pid));
}

function _wlMetaKey() {
  const s = getSession();
  if (!s || s.sqId == null || String(s.sqId).trim() === '') return null;
  return WL_SYNC_META_PREFIX + s.sqId;
}

function _getWLUpdatedAt() {
  const mk = _wlMetaKey();
  if (!mk) return 0;
  try {
    const meta = JSON.parse(localStorage.getItem(mk) || '{}');
    const t = meta && meta.updatedAt ? Number(meta.updatedAt) : 0;
    return isNaN(t) ? 0 : t;
  } catch { return 0; }
}

function _touchWLMeta(ts) {
  const mk = _wlMetaKey();
  if (!mk) return;
  const updatedAt = ts ? Number(ts) : Date.now();
  try { localStorage.setItem(mk, JSON.stringify({ updatedAt })); } catch(e) {}
}

function _supabaseEnabled() {
  return (typeof SUPABASE_URL !== 'undefined' && SUPABASE_URL &&
          typeof SUPABASE_ANON_KEY !== 'undefined' && SUPABASE_ANON_KEY &&
          typeof WATCHLIST_TABLE !== 'undefined' && WATCHLIST_TABLE);
}

function _supabaseHeaders(extra) {
  const h = Object.assign({
    apikey: SUPABASE_ANON_KEY,
    Authorization: 'Bearer ' + SUPABASE_ANON_KEY,
    'Content-Type': 'application/json'
  }, extra || {});
  return h;
}

async function _fetchWLRemote(sqId) {
  if (!_supabaseEnabled()) return null;
  const table = WATCHLIST_TABLE;
  const base = SUPABASE_URL.replace(/\/+$/, '');
  const url = base + '/rest/v1/' + encodeURIComponent(table) +
    '?select=wl,updated_at,updated_ms&sq_id=eq.' + encodeURIComponent(String(sqId)) + '&limit=1';
  try {
    const res = await fetch(url, { headers: _supabaseHeaders() });
    if (!res.ok) return null;
    const rows = await res.json();
    if (!Array.isArray(rows) || !rows.length) return { wl: null, updatedMs: 0 };
    const r = rows[0] || {};
    const wl = Array.isArray(r.wl) ? r.wl : (r.wl && Array.isArray(r.wl.wl) ? r.wl.wl : r.wl);
    const updatedMs = (r.updated_ms != null) ? Number(r.updated_ms) :
      (r.updated_at ? Date.parse(r.updated_at) : 0);
    return { wl: Array.isArray(wl) ? wl : null, updatedMs: isNaN(updatedMs) ? 0 : updatedMs };
  } catch (e) {
    return null;
  }
}

async function _pushWLRemote(sqId, wl, updatedMs) {
  if (!_supabaseEnabled()) return false;
  const table = WATCHLIST_TABLE;
  const base = SUPABASE_URL.replace(/\/+$/, '');
  const url = base + '/rest/v1/' + encodeURIComponent(table);
  const payload = [{ sq_id: String(sqId), wl: wl, updated_ms: Number(updatedMs) || Date.now() }];
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: _supabaseHeaders({
        Prefer: 'resolution=merge-duplicates,return=minimal'
      }),
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

function scheduleWLSyncToServer() {
  if (!_supabaseEnabled()) return;
  if (_wlSyncTimer) clearTimeout(_wlSyncTimer);
  _wlSyncTimer = setTimeout(function() {
    _wlSyncTimer = null;
    syncWLToServer();
  }, 700);
}

/** Applica la WL remota solo se è davvero più nuova; [] remoto non cancella mai una WL locale già popolata (bug: [] è truthy in JS). */
function _maybeApplyRemoteWatchlist(sqId, remote) {
  if (!remote || remote.wl == null || !Array.isArray(remote.wl)) return false;
  const localUpdated = _getWLUpdatedAt();
  const remoteUpdated = Number(remote.updatedMs) || 0;
  if (remoteUpdated <= localUpdated) return false;
  const localWl = getWL();
  if (remote.wl.length === 0 && localWl.length > 0) return false;
  localStorage.setItem(WL_KEY_PREFIX + sqId, JSON.stringify(remote.wl));
  _touchWLMeta(remoteUpdated);
  try { refreshWLButtons(); } catch (e) {}
  return true;
}

async function syncWLFromServer() {
  const s = getSession();
  if (!s || !_supabaseEnabled()) return;
  // evita doppio apply nello stesso caricamento per la stessa squadra
  if (_wlRemoteAppliedForSq === String(s.sqId)) return;
  const remote = await _fetchWLRemote(s.sqId);
  if (remote) _maybeApplyRemoteWatchlist(s.sqId, remote);
  _wlRemoteAppliedForSq = String(s.sqId);
}

async function syncWLToServer() {
  const s = getSession();
  if (!s || !_supabaseEnabled()) return;
  if (_wlSyncInFlight) return;
  _wlSyncInFlight = true;
  try {
    // Solo push: un fetch+merge qui poteva sovrascrivere la WL locale appena salvata
    // se il server aveva updated_ms più alto (dati vecchi o riga placeholder).
    const wl = getWL();
    const localUpdated = _getWLUpdatedAt();
    await _pushWLRemote(s.sqId, wl, localUpdated || Date.now());
  } finally {
    _wlSyncInFlight = false;
  }
}

function toggleWLPlayer(pid, squadName, knownPlayer) {
  if (!getSession()) {
    // Non autenticato → reindirizza all'area riservata
    location.href = 'area.html';
    return;
  }
  let p = null;
  let squadLabel = squadName;
  if (knownPlayer != null && String(knownPlayer.id) === String(pid)) {
    p = knownPlayer;
  }
  const cache = (typeof window !== 'undefined' && window.__fmtoWlPlayerCache) ? window.__fmtoWlPlayerCache : null;
  if (!p && cache && cache[String(pid)]) {
    p = cache[String(pid)];
  } else if (!p && typeof PLAYERS_BY_TEAM !== 'undefined') {
    const arr = PLAYERS_BY_TEAM[squadName] || [];
    p = arr.find(pl => String(pl.id) === String(pid));
    if (!p) {
      for (const k of Object.keys(PLAYERS_BY_TEAM)) {
        const list = PLAYERS_BY_TEAM[k];
        if (!Array.isArray(list)) continue;
        const found = list.find(pl => String(pl.id) === String(pid));
        if (found) {
          p = found;
          if (!squadLabel) squadLabel = k;
          break;
        }
      }
    }
  }
  if (!p) {
    try { alert('Impossibile aggiungere alla watchlist: dati giocatore non trovati. Apri il profilo dalla pagina Squadre o aggiorna la pagina.'); } catch (e) {}
    return;
  }
  let wl = getWL();
  const label = squadLabel || squadName || p.squadra || '';
  if (inWL(pid)) { wl = wl.filter(w => String(w.id) !== String(pid)); }
  else { wl.push({ ...p, squadName: label }); }
  saveWL(wl);
  refreshWLButtons();
}

function refreshWLButtons() {
  const logged = !!getSession();
  document.querySelectorAll('.wl-btn[data-pid]').forEach(btn => {
    if (!logged) {
      btn.classList.remove('inw');
      btn.textContent = '☆';
      btn.title = 'Accedi all\'Area Riservata per usare la watchlist';
      btn.style.opacity = '0.35';
    } else {
      btn.style.opacity = '';
      btn.title = '';
      const inList = inWL(btn.dataset.pid);
      btn.classList.toggle('inw', inList);
      btn.textContent = inList ? '★' : '☆';
    }
  });
}

// ── LOGO HELPER
function logoHTML(sq,size=52){
  const darkBg=sq.name==='JUVENTUS'?'#111':'var(--sf)';
  const bg=sq.logo?darkBg:`linear-gradient(135deg,${sq.color1},${sq.color2})`;
  const style=`width:${size}px;height:${size}px;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;background:${bg};flex-shrink:0`;
  if(sq.logo)return`<div style="${style}"><img src="${sq.logo}" alt="${sq.name}" style="width:100%;height:100%;object-fit:contain;padding:${Math.round(size*.07)}px" loading="lazy"></div>`;
  const abbr=sq.name.split(' ').map(w=>w[0]).join('').slice(0,3);
  return`<div style="${style}"><span style="font-family:'Barlow Condensed',sans-serif;font-size:${Math.round(size*.22)}px;font-weight:800;color:#fff">${abbr}</span></div>`;
}

// ── COUNTDOWN
function startCountdown(dId,hId,mId,sId){
  function update(){
    const now=new Date(),tgt=new Date(now);
    tgt.setDate(tgt.getDate()+((5-tgt.getDay()+7)%7||7));tgt.setHours(21,0,0,0);
    const d=tgt-now;if(d<=0)return;
    const pad=n=>String(Math.floor(n)).padStart(2,'0');
    document.getElementById(dId).textContent=pad(d/86400000);
    document.getElementById(hId).textContent=pad((d%86400000)/3600000);
    document.getElementById(mId).textContent=pad((d%3600000)/60000);
    document.getElementById(sId).textContent=pad((d%60000)/1000);
  }
  update();setInterval(update,1000);
}

// ── POSITION SORT ORDER ──────────────────────────────
// Segue l'ordinamento FM autentico (vedi screenshot):
// Por → D(C/SC/DC/DSC) → D/TF → D/M(/) → M/C → TF/C/T,M/C/T,D/TF/C,D/C/T → C/T,D/TF/C/T → T → T/S,C/T/S → S
//
// Mappa: stringa primaria della posizione → priorità numerica (più basso = prima)
const POS_ORDER_MAP = {
  'P':        0,   // Portiere
  'D':        10,  // Difensore centrale puro (D C, D DC, D SC, D DSC)
  'D/TF':     20,  // Terzino/Esterno difensivo
  'D/M':      30,  // Difensore/Mediano
  'D/M/C':    35,
  'D/M/C/T':  36,
  'TF/M/C':   37,
  'M':        40,  // Mediano puro
  'M/C':      45,  // Mediano/Centrocampista centrale
  'D/TF/M':   46,
  'D/TF/M/C': 47,
  'D/TF/C':   50,  // Esterno/Centrocampista (ibrido difensore-centrocampista)
  'TF/C/T':   55,  // Esterno/Centrocampista/Trequartista
  'M/C/T':    57,  // Mediano/Centrocampista/Trequartista
  'D/C/T':    58,
  'C':        60,  // Centrocampista puro
  'C/T':      65,  // Centrocampista/Trequartista
  'D/TF/T':   66,
  'D/TF/C/T': 67,  // Esterno polivalente difesa-centrocampo-attacco
  'T':        70,  // Trequartista puro
  'T/S':      80,  // Trequartista/Seconda punta
  'C/T/S':    85,  // Centrocampista/Trequartista/Seconda punta
  'S':        90,  // Attaccante/Seconda punta
};

function posOrder(pos) {
  if (!pos) return 45;
  const p = pos.toUpperCase().trim();
  // P = portiere
  if (p === 'P' || p.startsWith('P ')) return 0;
  // Estrai la parte primaria (tutto prima del primo spazio)
  const primary = p.split(' ')[0];
  if (POS_ORDER_MAP[primary] !== undefined) return POS_ORDER_MAP[primary];
  // Fallback per posizioni non mappate: analisi per contenuto
  if (p.startsWith('S')) return 90;
  if (p.startsWith('T/S') || p.startsWith('C/T/S')) return 82;
  if (p.startsWith('T') || p.startsWith('C/T')) return 70;
  if (p.startsWith('M') || p.startsWith('C')) return 50;
  if (p.includes('TF')) return 20;
  if (p.startsWith('D')) return 10;
  return 50;
}

// Sort players array by role order (POR→DIF→TER→CEN→TRE→ATT), then by CA desc within role
function sortByRole(players) {
  return [...players].sort((a, b) => {
    const ro = posOrder(a.posizione) - posOrder(b.posizione);
    if (ro !== 0) return ro;
    return b.ca - a.ca; // same role → higher CA first
  });
}

// ── AUTO-REFRESH (ricarica la pagina ogni N minuti per mostrare eventuali aggiornamenti)
const AUTO_REFRESH_MINUTES = 15;
const AUTO_REFRESH_STORAGE_KEY = 'fmto_no_autorefresh';
function initAutoRefresh() {
  if (localStorage.getItem(AUTO_REFRESH_STORAGE_KEY) === '1') return;
  const ms = AUTO_REFRESH_MINUTES * 60 * 1000;
  setTimeout(function() { location.reload(); }, ms);
}
function disableAutoRefresh() {
  localStorage.setItem(AUTO_REFRESH_STORAGE_KEY, '1');
  location.reload();
}
function enableAutoRefresh() {
  localStorage.removeItem(AUTO_REFRESH_STORAGE_KEY);
  location.reload();
}
document.addEventListener('DOMContentLoaded', initAutoRefresh);

// ── SCOUTING: risultati in IndexedDB (sessionStorage ~5MB non basta per elenchi grandi)
var FMTO_SCOUT_DB = 'fmto_scouting_v1';
var FMTO_SCOUT_STORE = 'bundle';
var FMTO_SCOUT_KEY = 'last';

function openScoutDb() {
  return new Promise(function (resolve, reject) {
    var req = indexedDB.open(FMTO_SCOUT_DB, 1);
    req.onupgradeneeded = function (ev) {
      var db = ev.target.result;
      if (!db.objectStoreNames.contains(FMTO_SCOUT_STORE)) {
        db.createObjectStore(FMTO_SCOUT_STORE);
      }
    };
    req.onsuccess = function () { resolve(req.result); };
    req.onerror = function () { reject(req.error); };
  });
}

/** Salva tutti i giocatori trovati; resolve(true) se ok, false se IndexedDB non disponibile / errore */
function saveScoutingResultsBundle(players, total) {
  var n = total != null ? total : (players && players.length) || 0;
  var payload = { players: players || [], total: n, savedAt: Date.now() };
  return openScoutDb()
    .then(function (db) {
      return new Promise(function (resolve) {
        try {
          var tx = db.transaction(FMTO_SCOUT_STORE, 'readwrite');
          tx.objectStore(FMTO_SCOUT_STORE).put(payload, FMTO_SCOUT_KEY);
          tx.oncomplete = function () {
            try {
              db.close();
              sessionStorage.removeItem('fmto_scout_results');
              sessionStorage.removeItem('fmto_scout_total');
              sessionStorage.setItem('fmto_scout_storage', 'idb');
            } catch (e) {}
            resolve(true);
          };
          tx.onerror = function () {
            try { db.close(); } catch (e) {}
            resolve(false);
          };
        } catch (e) {
          try { db.close(); } catch (e2) {}
          resolve(false);
        }
      });
    })
    .catch(function () { return false; });
}

/** Carica l’ultimo bundle salvato (o null) */
function loadScoutingResultsBundle() {
  return openScoutDb()
    .then(function (db) {
      return new Promise(function (resolve) {
        try {
          var tx = db.transaction(FMTO_SCOUT_STORE, 'readonly');
          var r = tx.objectStore(FMTO_SCOUT_STORE).get(FMTO_SCOUT_KEY);
          r.onsuccess = function () {
            var v = r.result || null;
            try { db.close(); } catch (e) {}
            resolve(v);
          };
          r.onerror = function () {
            try { db.close(); } catch (e) {}
            resolve(null);
          };
        } catch (e) {
          try { db.close(); } catch (e2) {}
          resolve(null);
        }
      });
    })
    .catch(function () { return null; });
}
