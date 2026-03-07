// ══════════════════════════════════════════════════════
// FMTO 2.0 — Shared UI helpers (v2 — dati reali)
// ══════════════════════════════════════════════════════

// ── NAV ACTIVE LINK
const PAGE_MAP = {'index.html':'nav-home','squadre.html':'nav-sq','mister.html':'nav-mister','area.html':'nav-area'};
function initNav(){const f=location.pathname.split('/').pop()||'index.html';const id=PAGE_MAP[f];if(id)document.getElementById(id)?.classList.add('active');}
document.addEventListener('DOMContentLoaded',initNav);

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

// ── PRICE FORMAT
function fmtPrice(v){
  if(!v||v<=0)return'—';
  if(v>=1000000)return'€'+(v/1000000).toFixed(1)+'M';
  if(v>=1000)return'€'+(v/1000).toFixed(0)+'K';
  return'€'+v;
}

// ── WATCHLIST — per-squad, richiede autenticazione
// La sessione attiva viene salvata in sessionStorage (dura finché la scheda è aperta)
// chiave: fmto_session → { sqId, sqName }
// watchlist: fmto_wl_<sqId> → array giocatori

const WL_SESSION_KEY = 'fmto_session';
const WL_KEY_PREFIX  = 'fmto_wl_';

/* Restituisce la sessione attiva o null */
function getSession() {
  try { return JSON.parse(sessionStorage.getItem(WL_SESSION_KEY)); }
  catch { return null; }
}
/* Avvia sessione (chiamato da area.html dopo PIN corretto) */
function startSession(sqId, sqName) {
  sessionStorage.setItem(WL_SESSION_KEY, JSON.stringify({ sqId, sqName }));
}
/* Termina sessione (logout) */
function endSession() {
  sessionStorage.removeItem(WL_SESSION_KEY);
}

/* Chiave localStorage per la WL dell'utente corrente (null se non loggato) */
function _wlKey() {
  const s = getSession();
  return s ? WL_KEY_PREFIX + s.sqId : null;
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
  localStorage.setItem(k, JSON.stringify(wl));
}
function inWL(pid) {
  return getWL().some(p => String(p.id) === String(pid));
}

function toggleWLPlayer(pid, squadName) {
  if (!getSession()) {
    // Non autenticato → reindirizza all'area riservata
    location.href = 'area.html';
    return;
  }
  const players = (typeof PLAYERS_BY_TEAM !== 'undefined') ? (PLAYERS_BY_TEAM[squadName] || []) : [];
  const p = players.find(pl => String(pl.id) === String(pid));
  if (!p) return;
  let wl = getWL();
  if (inWL(pid)) { wl = wl.filter(w => String(w.id) !== String(pid)); }
  else { wl.push({ ...p, squadName }); }
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
