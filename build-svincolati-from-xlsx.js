/**
 * Genera svincolati.json e svincolati.json.gz dal file Excel degli svincolati.
 * Stessa struttura giocatori delle 56 squadre → schede identiche in pagina.
 *
 * Uso: node build-svincolati-from-xlsx.js [percorso.xlsx]
 * Default: %USERPROFILE%\Downloads\db enore 12-03-26 senza fmto solo stipendi.xlsx
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

let XLSX;
try {
  XLSX = require('xlsx');
} catch (e) {
  console.error('Installa xlsx: npm install xlsx');
  process.exit(1);
}

const defaultXlsx = 'db enore 12-03-26 senza fmto solo stipendi.xlsx';
const xlsxPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(process.env.USERPROFILE || '', 'Downloads', defaultXlsx);
const outDir = __dirname;
const outJson = path.join(outDir, 'svincolati.json');
const outGz = path.join(outDir, 'svincolati.json.gz');

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

function colIndex(headerRow, nameOrAliases) {
  const names = Array.isArray(nameOrAliases) ? nameOrAliases : [nameOrAliases];
  for (const name of names) {
    const i = headerRow.findIndex(h => (String(h || '').trim().toLowerCase()) === name.toLowerCase());
    if (i >= 0) return i;
  }
  return -1;
}

if (!fs.existsSync(xlsxPath)) {
  console.error('File non trovato:', xlsxPath);
  console.error('Uso: node build-svincolati-from-xlsx.js [percorso.xlsx]');
  process.exit(1);
}

const wb = XLSX.readFile(xlsxPath);
const firstSheet = wb.SheetNames[0];
const ws = wb.Sheets[firstSheet];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
if (!rows || rows.length < 2) {
  console.error('Foglio vuoto o senza dati.');
  process.exit(1);
}

const headerRow = rows[0].map(h => String(h ?? '').trim());
const col = name => colIndex(headerRow, name);

const idx = {
  nome: col(['Nome completo', 'Nome', 'Nome e cognome']),
  eta: col(['Età', 'Eta', 'Age']),
  dob: col(['Data di nascita', 'Data nascita', 'Nascita']),
  ca: col('CA'),
  pa: col('PA'),
  naz: col(['Nazionalità', 'Nazionalita', 'Naz']),
  prezzo: col(['Prezzo', 'Valore', 'Valore di mercato']),
  posizione: col(['Posizione', 'Pos', 'Ruolo']),
  id: col(['ID', 'Id', 'UID']),
  acc: col('Accelerazione'),
  agi: col('Agilità'),
  equ: col('Equilibrio'),
  ele: col('Elevazione'),
  pie_sin: col('Piede sinistro'),
  int_fis: col('Integrità fisica'),
  vel: col('Velocità'),
  pie_des: col('Piede destro'),
  res: col('Resistenza'),
  forza: col('Forza'),
  pal_alt: col('Palle alte'),
  aut_area: col('Autorità in area'),
  comm: col('Comunicazione'),
  ecc: col('Eccentricità'),
  bloc_tir: col('Blocco tiri'),
  rinv: col('Rinvii'),
  uno_v_uno: col('Uno contro Uno'),
  rifl: col('Riflessi'),
  usc: col('Uscite'),
  risp_pug: col('Resp. Di pugno'),
  ril: col('Rilanci'),
  agr: col('Aggressività'),
  int_ment: col('Intuito'),
  cor: col('Coraggio'),
  fred: col('Freddezza'),
  conc: col('Concentrazione'),
  dec: col('Decisioni'),
  det: col('Determinazione'),
  fan: col('Fantasia'),
  car: col('Carisma'),
  senza_palla: col('Senza palla'),
  gioc_squa: col('Gioco di squadra'),
  crea: col('Creatività'),
  imp: col('Impegno'),
  angoli: col("Calci d'angolo"),
  cross: col('Cross'),
  drib: col('Dribbling'),
  final: col('Finalizzazione'),
  gioc_prima: col('Gioco di prima'),
  pun: col('Punizioni'),
  testa: col('Colpo di testa'),
  tir_lont: col('Tiri da lontano'),
  rim_lung: col('Rimesse lunghe'),
  marc: col('Marcatura'),
  pass: col('Passaggi'),
  guad_falli: col('Guadagnare falli'),
  cont: col('Contrasti'),
  tecn: col('Tecnica'),
  stipendio: col('Stipendio'),
};

const posCols = headerRow.map((h, i) => (String(h || '').toLowerCase() === 'posizione' ? i : -1)).filter(i => i >= 0);
idx.pos_ment = posCols.length >= 2 ? posCols[1] : -1;

function get(row, key) {
  const i = idx[key];
  if (i < 0 || row[i] === undefined) return '';
  return String(row[i] ?? '').trim();
}

const players = [];
for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  if (!Array.isArray(row)) continue;
  const id = get(row, 'id');
  const nome = get(row, 'nome');
  if (!id && !nome) continue;

  const p = {
    id: id || String(i + 1),
    nome: nome || '—',
    eta: toInt(get(row, 'eta')) ?? 0,
    dob: get(row, 'dob') || '',
    ca: toInt(get(row, 'ca')) ?? 0,
    pa: toInt(get(row, 'pa')) ?? 0,
    naz: get(row, 'naz') || '',
    squadra: 'SVINCOLATI',
    prezzo: parseEuro(get(row, 'prezzo')) || parseEuro(get(row, 'stipendio')) || 0,
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
    pos_ment: idx.pos_ment >= 0 && row[idx.pos_ment] !== undefined ? (toInt(row[idx.pos_ment]) ?? 0) : 0,
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
  };
  players.push(p);
}

const json = JSON.stringify(players);
fs.writeFileSync(outJson, json, 'utf8');
console.log('Scritto', outJson, '—', players.length, 'giocatori.');

const gzip = zlib.gzipSync(Buffer.from(json, 'utf8'));
fs.writeFileSync(outGz, gzip);
console.log('Scritto', outGz);
