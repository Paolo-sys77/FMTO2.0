/**
 * Genera under.js dal file CSV degli Under delle 56 squadre.
 *
 * Struttura output:
 *   var UNDER_BY_TEAM = {
 *     "ATHLETIC BILBAO": ["28117372","28121564", ...],
 *     ...
 *   };
 *
 * Uso:
 *   node build-under-from-csv.js [percorso.csv]
 *
 * Default (se non passi argomenti):
 *   %USERPROFILE%\\Downloads\\under.csv
 */

const fs = require('fs');
const path = require('path');

const defaultCsv = 'under.csv';
const csvPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(process.env.USERPROFILE || '', 'Downloads', defaultCsv);

const outDir = __dirname;
const outJs = path.join(outDir, 'under.js');

if (!fs.existsSync(csvPath)) {
  console.error('File non trovato:', csvPath);
  console.error('Uso: node build-under-from-csv.js [percorso.csv]');
  process.exit(1);
}

console.log('Leggo file Under da:', csvPath);

const raw = fs.readFileSync(csvPath, 'utf8');
const lines = raw.split(/\r?\n/).filter(l => l.trim() !== '');
if (lines.length < 2) {
  console.error('CSV Under vuoto o senza dati.');
  process.exit(1);
}

// parsing CSV semplice, con auto-rilevamento delimitatore (virgola o punto e virgola)
function parseCsvLine(line, delimiter) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      result.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}

// rileva il delimitatore dal primo header: se ci sono molti ';' usiamo ';', altrimenti ','
const headerLine = lines[0];
const semiCount = (headerLine.match(/;/g) || []).length;
const commaCount = (headerLine.match(/,/g) || []).length;
const DELIM = semiCount > commaCount ? ';' : ',';

const headerRow = parseCsvLine(headerLine, DELIM).map(h => String(h ?? '').trim());

function colIndex(nameOrAliases) {
  const names = Array.isArray(nameOrAliases) ? nameOrAliases : [nameOrAliases];
  for (const name of names) {
    const idx = headerRow.findIndex(
      h => String(h || '').trim().toLowerCase() === String(name).toLowerCase()
    );
    if (idx >= 0) return idx;
  }
  return -1;
}

// mappa colonne → campi giocatore (stessa logica di build-svincolati-from-xlsx)
const idx = {
  nome: colIndex(['Nome completo', 'Nome', 'Nome e cognome']),
  eta: colIndex(['Età', 'Eta', 'Age']),
  dob: colIndex(['Data di nascita', 'Data nascita', 'Nascita']),
  ca: colIndex('CA'),
  pa: colIndex('PA'),
  naz: colIndex(['Nazionalità', 'Nazionalita', 'Naz']),
  squadra: colIndex(['Squadra', 'Team', 'Club', 'Nome squadra']),
  prezzo: colIndex(['Prezzo', 'Valore', 'Valore di mercato']),
  posizione: colIndex(['Posizione', 'Pos', 'Ruolo']),
  id: colIndex(['ID', 'Id', 'id giocatore', 'Giocatore ID', 'Player ID']),
  acc: colIndex('Accelerazione'),
  agi: colIndex('Agilità'),
  equ: colIndex('Equilibrio'),
  ele: colIndex('Elevazione'),
  pie_sin: colIndex('Piede sinistro'),
  int_fis: colIndex('Integrità fisica'),
  vel: colIndex('Velocità'),
  pie_des: colIndex('Piede destro'),
  res: colIndex('Resistenza'),
  forza: colIndex('Forza'),
  pal_alt: colIndex('Palle alte'),
  aut_area: colIndex('Autorità in area'),
  comm: colIndex('Comunicazione'),
  ecc: colIndex('Eccentricità'),
  bloc_tir: colIndex('Blocco tiri'),
  rinv: colIndex('Rinvii'),
  uno_v_uno: colIndex('Uno contro Uno'),
  rifl: colIndex('Riflessi'),
  usc: colIndex('Uscite'),
  risp_pug: colIndex('Resp. Di pugno'),
  ril: colIndex('Rilanci'),
  agr: colIndex('Aggressività'),
  int_ment: colIndex('Intuito'),
  cor: colIndex('Coraggio'),
  fred: colIndex('Freddezza'),
  conc: colIndex('Concentrazione'),
  dec: colIndex('Decisioni'),
  det: colIndex('Determinazione'),
  fan: colIndex('Fantasia'),
  car: colIndex('Carisma'),
  senza_palla: colIndex('Senza palla'),
  pos_ment: colIndex('Posizione'),
  gioc_squa: colIndex('Gioco di squadra'),
  crea: colIndex('Creatività'),
  imp: colIndex('Impegno'),
  angoli: colIndex("Calci d'angolo"),
  cross: colIndex('Cross'),
  drib: colIndex('Dribbling'),
  final: colIndex('Finalizzazione'),
  gioc_prima: colIndex('Gioco di prima'),
  pun: colIndex('Punizioni'),
  testa: colIndex('Colpo di testa'),
  tir_lont: colIndex('Tiri da lontano'),
  rim_lung: colIndex('Rimesse lunghe'),
  marc: colIndex('Marcatura'),
  pass: colIndex('Passaggi'),
  guad_falli: colIndex('Guadagnare falli'),
  cont: colIndex('Contrasti'),
  tecn: colIndex('Tecnica'),
  stipendio: colIndex('Stipendio'),
};

if (idx.squadra < 0 || idx.id < 0) {
  console.error('Colonne obbligatorie non trovate.');
  console.error('Serve almeno una colonna "Squadra" e una "ID" (o equivalenti).');
  console.error('Intestazioni viste:', headerRow);
  process.exit(1);
}

function toInt(v) {
  if (v == null || v === '') return null;
  const s = String(v).replace(/\s/g, '').replace(/[^\d.-]/g, '').replace(/\./g, '');
  const n = parseInt(s, 10);
  return isNaN(n) ? null : n;
}

function parseEuro(v) {
  if (v == null || v === '') return 0;
  const s = String(v).replace(/\s/g, '').replace(/€/g, '').replace(/\./g, '').replace(/,/g, '.');
  const n = parseFloat(s);
  return isNaN(n) ? 0 : Math.round(n);
}

function get(row, key) {
  const i = idx[key];
  if (i == null || i < 0 || row[i] === undefined) return '';
  return String(row[i] ?? '').trim();
}

const UNDER_BY_TEAM = {};
const UNDER_PLAYERS_BY_TEAM = {};

for (let i = 1; i < lines.length; i++) {
  const row = parseCsvLine(lines[i], DELIM);
  if (!row || !row.length) continue;

  const rawTeam = get(row, 'squadra');
  const rawId = get(row, 'id');

  const team = String(rawTeam || '').trim();
  const id = String(rawId || '').trim();

  if (!team || !id) continue;

  if (!UNDER_BY_TEAM[team]) UNDER_BY_TEAM[team] = [];
  if (!UNDER_BY_TEAM[team].includes(id)) {
    UNDER_BY_TEAM[team].push(id);
  }

  // Costruisci oggetto giocatore completo solo da questo CSV
  const p = {
    id: id,
    nome: get(row, 'nome') || '—',
    eta: toInt(get(row, 'eta')) ?? 0,
    dob: get(row, 'dob') || '',
    ca: toInt(get(row, 'ca')) ?? 0,
    pa: toInt(get(row, 'pa')) ?? 0,
    naz: get(row, 'naz') || '',
    squadra: team,
    prezzo: parseEuro(get(row, 'prezzo')) || 0,
    posizione: get(row, 'posizione') || '—',
    acc: toInt(get(row, 'acc')) ?? 0,
    agi: toInt(get(row, 'agi')) ?? 0,
    equ: toInt(get(row, 'equ')) ?? 0,
    ele: toInt(get(row, 'ele')) ?? 0,
    pie_sin: toInt(get(row, 'pie_sin')) ?? 0,
    int_fis: toInt(get(row, 'int_fis')) ?? 0,
    vel: toInt(get(row, 'vel')) ?? 0,
    pie_des: toInt(get(row, 'pie_des')) ?? 20,
    res: toInt(get(row, 'res')) ?? 0,
    forza: toInt(get(row, 'forza')) ?? 0,
    pal_alt: toInt(get(row, 'pal_alt')) ?? 0,
    aut_area: toInt(get(row, 'aut_area')) ?? 0,
    comm: toInt(get(row, 'comm')) ?? 0,
    ecc: toInt(get(row, 'ecc')) ?? 0,
    bloc_tir: toInt(get(row, 'bloc_tir')) ?? 0,
    rinv: toInt(get(row, 'rinv')) ?? 0,
    uno_v_uno: toInt(get(row, 'uno_v_uno')) ?? 0,
    rifl: toInt(get(row, 'rifl')) ?? 0,
    usc: toInt(get(row, 'usc')) ?? 0,
    risp_pug: toInt(get(row, 'risp_pug')) ?? 0,
    ril: toInt(get(row, 'ril')) ?? 0,
    agr: toInt(get(row, 'agr')) ?? 0,
    int_ment: toInt(get(row, 'int_ment')) ?? 0,
    cor: toInt(get(row, 'cor')) ?? 0,
    fred: toInt(get(row, 'fred')) ?? 0,
    conc: toInt(get(row, 'conc')) ?? 0,
    dec: toInt(get(row, 'dec')) ?? 0,
    det: toInt(get(row, 'det')) ?? 0,
    fan: toInt(get(row, 'fan')) ?? 0,
    car: toInt(get(row, 'car')) ?? 0,
    senza_palla: toInt(get(row, 'senza_palla')) ?? 0,
    pos_ment: toInt(get(row, 'pos_ment')) ?? 0,
    gioc_squa: toInt(get(row, 'gioc_squa')) ?? 0,
    crea: toInt(get(row, 'crea')) ?? 0,
    imp: toInt(get(row, 'imp')) ?? 0,
    angoli: toInt(get(row, 'angoli')) ?? 0,
    cross: toInt(get(row, 'cross')) ?? 0,
    drib: toInt(get(row, 'drib')) ?? 0,
    final: toInt(get(row, 'final')) ?? 0,
    gioc_prima: toInt(get(row, 'gioc_prima')) ?? 0,
    pun: toInt(get(row, 'pun')) ?? 0,
    testa: toInt(get(row, 'testa')) ?? 0,
    tir_lont: toInt(get(row, 'tir_lont')) ?? 0,
    rim_lung: toInt(get(row, 'rim_lung')) ?? 0,
    marc: toInt(get(row, 'marc')) ?? 0,
    pass: toInt(get(row, 'pass')) ?? 0,
    guad_falli: toInt(get(row, 'guad_falli')) ?? 0,
    cont: toInt(get(row, 'cont')) ?? 0,
    tecn: toInt(get(row, 'tecn')) ?? 0,
    stipendio: parseEuro(get(row, 'stipendio')) || 0,
  };

  if (!UNDER_PLAYERS_BY_TEAM[team]) UNDER_PLAYERS_BY_TEAM[team] = [];
  UNDER_PLAYERS_BY_TEAM[team].push(p);
}

for (const team of Object.keys(UNDER_BY_TEAM)) {
  UNDER_BY_TEAM[team].sort((a, b) => {
    const na = Number(a);
    const nb = Number(b);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    return String(a).localeCompare(String(b));
  });
}

const jsContent =
  '// Under FMTO — generato da build-under-from-csv.js\n' +
  'var UNDER_BY_TEAM = ' +
  JSON.stringify(UNDER_BY_TEAM, null, 2) +
  ';\n' +
  'var UNDER_PLAYERS_BY_TEAM = ' +
  JSON.stringify(UNDER_PLAYERS_BY_TEAM, null, 2) +
  ';\n';

fs.writeFileSync(outJs, jsContent, 'utf8');
console.log('Scritto', outJs, 'con', Object.keys(UNDER_BY_TEAM).length, 'squadre con Under.');

