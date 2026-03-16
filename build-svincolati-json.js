/**
 * Genera svincolati.json e svincolati.json.gz da un CSV (stessa struttura giocatori delle 56 squadre).
 * Uso: node build-svincolati-json.js [percorso.csv]
 * Se non passi il percorso, usa: Downloads/db enore 12-03-26 senza fmto CSV.csv
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const defaultCsvName = 'db enore 12-03-26 senza fmto CSV.csv';
const csvPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(process.env.USERPROFILE || '', 'Downloads', defaultCsvName);
const outDir = path.join(__dirname);
const outJson = path.join(outDir, 'svincolati.json');
const outGz = path.join(outDir, 'svincolati.json.gz');

function toInt(s) {
  if (s == null || s === '') return null;
  const cleaned = String(s).replace(/\s/g, '').replace(/[^\d.-]/g, '').replace(/\./g, '');
  const n = parseInt(cleaned, 10);
  return isNaN(n) ? null : n;
}

function parseEuro(s) {
  if (s == null || s === '') return 0;
  const cleaned = String(s).replace(/\s/g, '').replace(/€/g, '').replace(/\./g, '').replace(/,/g, '.');
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : Math.round(n);
}

if (!fs.existsSync(csvPath)) {
  console.error('CSV non trovato:', csvPath);
  console.error('Uso: node build-svincolati-json.js [percorso.csv]');
  process.exit(1);
}

const raw = fs.readFileSync(csvPath, 'utf8');
const lines = raw.split(/\r?\n/).filter(l => l.trim());
if (lines.length < 3) {
  console.error('CSV troppo corto.');
  process.exit(1);
}

const delimiter = ';';
const header = lines[1].split(delimiter).map(h => (h || '').trim());
const col = (name) => {
  const i = header.findIndex(h => (h || '').toLowerCase() === name.toLowerCase());
  return i >= 0 ? i : -1;
};

const idx = {
  nome: col('Nome completo'),
  eta: col('Età'),
  dob: col('Data di nascita'),
  ca: col('CA'),
  pa: col('PA'),
  naz: col('Nazionalità'),
  squadra: col('Squadra appartenenza'),
  prezzo: col('Prezzo'),
  posizione: col('Posizione'),
  id: col('ID'),
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

const posCols = header.map((h, i) => (h || '').toLowerCase() === 'posizione' ? i : -1).filter(i => i >= 0);
idx.pos_ment = posCols.length >= 2 ? posCols[1] : -1;

const players = [];
for (let i = 2; i < lines.length; i++) {
  const parts = lines[i].split(delimiter);
  const get = (key) => (idx[key] >= 0 && parts[idx[key]] !== undefined) ? String(parts[idx[key]]).trim() : '';

  const id = get('id');
  const nome = get('nome');
  if (!id && !nome) continue;

  const p = {
    id: id || String(i),
    nome: nome || '—',
    eta: toInt(get('eta')) ?? 0,
    dob: get('dob') || '',
    ca: toInt(get('ca')) ?? 0,
    pa: toInt(get('pa')) ?? 0,
    naz: get('naz') || '',
    squadra: 'SVINCOLATI',
    prezzo: parseEuro(get('prezzo')) || 0,
    posizione: get('posizione') || '—',
    acc: toInt(get('acc')) ?? 0,
    agi: toInt(get('agi')) ?? 0,
    equ: toInt(get('equ')) ?? 0,
    ele: toInt(get('ele')) ?? 0,
    pie_sin: toInt(get('pie_sin')) ?? 0,
    int_fis: toInt(get('int_fis')) ?? 0,
    vel: toInt(get('vel')) ?? 0,
    pie_des: toInt(get('pie_des')) ?? 20,
    res: toInt(get('res')) ?? 0,
    forza: toInt(get('forza')) ?? 0,
    pal_alt: toInt(get('pal_alt')) ?? 0,
    aut_area: toInt(get('aut_area')) ?? 0,
    comm: toInt(get('comm')) ?? 0,
    ecc: toInt(get('ecc')) ?? 0,
    bloc_tir: toInt(get('bloc_tir')) ?? 0,
    rinv: toInt(get('rinv')) ?? 0,
    uno_v_uno: toInt(get('uno_v_uno')) ?? 0,
    rifl: toInt(get('rifl')) ?? 0,
    usc: toInt(get('usc')) ?? 0,
    risp_pug: toInt(get('risp_pug')) ?? 0,
    ril: toInt(get('ril')) ?? 0,
    agr: toInt(get('agr')) ?? 0,
    int_ment: toInt(get('int_ment')) ?? 0,
    cor: toInt(get('cor')) ?? 0,
    fred: toInt(get('fred')) ?? 0,
    conc: toInt(get('conc')) ?? 0,
    dec: toInt(get('dec')) ?? 0,
    det: toInt(get('det')) ?? 0,
    fan: toInt(get('fan')) ?? 0,
    car: toInt(get('car')) ?? 0,
    senza_palla: toInt(get('senza_palla')) ?? 0,
    pos_ment: idx.pos_ment >= 0 && parts[idx.pos_ment] !== undefined ? (toInt(parts[idx.pos_ment]) ?? 0) : 0,
    gioc_squa: toInt(get('gioc_squa')) ?? 0,
    crea: toInt(get('crea')) ?? 0,
    imp: toInt(get('imp')) ?? 0,
    angoli: toInt(get('angoli')) ?? 0,
    cross: toInt(get('cross')) ?? 0,
    drib: toInt(get('drib')) ?? 0,
    final: toInt(get('final')) ?? 0,
    gioc_prima: toInt(get('gioc_prima')) ?? 0,
    pun: toInt(get('pun')) ?? 0,
    testa: toInt(get('testa')) ?? 0,
    tir_lont: toInt(get('tir_lont')) ?? 0,
    rim_lung: toInt(get('rim_lung')) ?? 0,
    marc: toInt(get('marc')) ?? 0,
    pass: toInt(get('pass')) ?? 0,
    guad_falli: toInt(get('guad_falli')) ?? 0,
    cont: toInt(get('cont')) ?? 0,
    tecn: toInt(get('tecn')) ?? 0,
  };
  players.push(p);
}

const json = JSON.stringify(players);
fs.writeFileSync(outJson, json, 'utf8');
console.log('Scritto', outJson, '—', players.length, 'giocatori.');

const gzip = zlib.gzipSync(Buffer.from(json, 'utf8'));
fs.writeFileSync(outGz, gzip);
console.log('Scritto', outGz);
