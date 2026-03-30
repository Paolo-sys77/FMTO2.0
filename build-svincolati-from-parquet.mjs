/**
 * Legge data/svincolati.parquet e genera svincolati.json (+ .gz) nella root del progetto,
 * stessa struttura di build-svincolati-from-xlsx.js → scouting "Solo svincolati" via fetch.
 *
 * Uso: node build-svincolati-from-parquet.mjs [percorso.parquet]
 * Default: <cartella progetto>/data/svincolati.parquet
 *
 * Richiede: npm install (hyparquet, hyparquet-compressors)
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';
import { asyncBufferFromFile, parquetReadObjects } from 'hyparquet';
import { compressors } from 'hyparquet-compressors';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const defaultParquet = path.join(__dirname, 'data', 'svincolati.parquet');
const parquetPath = process.argv[2] ? path.resolve(process.argv[2]) : defaultParquet;
const outDir = __dirname;
const outJson = path.join(outDir, 'svincolati.json');
const outGz = path.join(outDir, 'svincolati.json.gz');

function toInt(v) {
  if (v == null || v === '') return null;
  if (typeof v === 'bigint') v = Number(v);
  if (typeof v === 'number' && !Number.isNaN(v)) return Math.round(v);
  const s = String(v).replace(/\s/g, '').replace(/[^\d.-]/g, '').replace(/\./g, '');
  const n = parseInt(s, 10);
  return Number.isNaN(n) ? null : n;
}

function parseEuro(v) {
  if (v == null || v === '') return 0;
  if (typeof v === 'number' && !Number.isNaN(v)) return Math.round(v);
  const s = String(v).replace(/\s/g, '').replace(/€/g, '').replace(/\./g, '').replace(/,/g, '.');
  const n = parseFloat(s);
  return Number.isNaN(n) ? 0 : Math.round(n);
}

function cellStr(v) {
  if (v == null || v === '') return '';
  if (typeof v === 'bigint') return String(v);
  if (v instanceof Date) {
    const d = v.getDate().toString().padStart(2, '0');
    const m = (v.getMonth() + 1).toString().padStart(2, '0');
    return `${d}/${m}/${v.getFullYear()}`;
  }
  return String(v).trim();
}

const POS_LABEL = 'posizione';

/** Parquet con chiavi "1","2",… e prima riga = intestazioni (export tipo tabella). */
function isSpreadsheetStyleParquet(rows) {
  if (!rows.length) return false;
  const k = Object.keys(rows[0]);
  if (!k.length) return false;
  if (!k.every((x) => /^\d+$/.test(String(x)))) return false;
  const r0 = rows[0];
  const v = String(r0['2'] ?? r0[2] ?? '').trim().toLowerCase();
  return v === 'nome completo' || v.startsWith('nome');
}

/** Associa etichetta (nome colonna) → chiave parquet reale. */
function colKeyByHeaderNames(headerNames, colIds, nameOrAliases) {
  const names = Array.isArray(nameOrAliases) ? nameOrAliases : [nameOrAliases];
  for (const name of names) {
    const target = String(name).trim().toLowerCase();
    for (let i = 0; i < headerNames.length; i++) {
      if (String(headerNames[i] || '').trim().toLowerCase() === target) return colIds[i];
    }
  }
  for (const name of names) {
    const snake = String(name).trim().toLowerCase().replace(/\s+/g, '_');
    for (let i = 0; i < headerNames.length; i++) {
      const hn = String(headerNames[i] || '').trim().toLowerCase().replace(/\s+/g, '_');
      if (hn === snake) return colIds[i];
    }
  }
  return null;
}

function buildIdx(headerNames, colIds) {
  const col = (name) => colKeyByHeaderNames(headerNames, colIds, name);
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
  const posKeys = [];
  for (let i = 0; i < headerNames.length; i++) {
    if (String(headerNames[i] || '').trim().toLowerCase() === POS_LABEL) posKeys.push(colIds[i]);
  }
  idx.pos_ment = posKeys.length >= 2 ? posKeys[1] : null;
  return idx;
}

function get(row, idx, key) {
  const k = idx[key];
  if (!k || row[k] === undefined || row[k] === null) return '';
  return cellStr(row[k]);
}

function getNum(row, idx, key) {
  const k = idx[key];
  if (!k || row[k] === undefined || row[k] === null) return null;
  return toInt(row[k]);
}

if (!fs.existsSync(parquetPath)) {
  console.error('File Parquet non trovato:', parquetPath);
  console.error('Uso: node build-svincolati-from-parquet.mjs [percorso.parquet]');
  process.exit(1);
}

const file = await asyncBufferFromFile(parquetPath);
let rows;
try {
  rows = await parquetReadObjects({ file, compressors });
} catch (e) {
  console.error('Errore lettura Parquet:', e.message);
  process.exit(1);
}

if (!rows || !rows.length) {
  console.error('Nessuna riga nel file Parquet.');
  process.exit(1);
}

let metaHeaderNames;
let colIds;
let dataRows;
if (isSpreadsheetStyleParquet(rows)) {
  const r0 = rows[0];
  const derivedKeys = Object.keys(r0).sort((a, b) => Number(a) - Number(b));
  metaHeaderNames = derivedKeys.map((k) => String(r0[k] ?? '').trim());
  colIds = derivedKeys;
  dataRows = rows.slice(1);
  console.log('Formato Parquet: prima riga = intestazioni,', dataRows.length, 'righe dati.');
} else {
  colIds = Object.keys(rows[0]);
  metaHeaderNames = colIds.slice();
  dataRows = rows;
}
const idx = buildIdx(metaHeaderNames, colIds);

const players = [];
for (let i = 0; i < dataRows.length; i++) {
  const row = dataRows[i];
  const id = get(row, idx, 'id');
  const nome = get(row, idx, 'nome');
  if (!id && !nome) continue;

  const p = {
    id: id || String(i + 1),
    nome: nome || '—',
    eta: getNum(row, idx, 'eta') ?? 0,
    dob: get(row, idx, 'dob') || '',
    ca: getNum(row, idx, 'ca') ?? 0,
    pa: getNum(row, idx, 'pa') ?? 0,
    naz: get(row, idx, 'naz') || '',
      squadra: 'SVINCOLATI',
      prezzo: parseEuro(get(row, idx, 'prezzo')) || 0,
      stipendio: parseEuro(get(row, idx, 'stipendio')) || 0,
      posizione: get(row, idx, 'posizione') || '—',
    acc: getNum(row, idx, 'acc') ?? 0,
    agi: getNum(row, idx, 'agi') ?? 0,
    equ: getNum(row, idx, 'equ') ?? 0,
    ele: getNum(row, idx, 'ele') ?? 0,
    pie_sin: getNum(row, idx, 'pie_sin') ?? 0,
    int_fis: getNum(row, idx, 'int_fis') ?? 0,
    vel: getNum(row, idx, 'vel') ?? 0,
    pie_des: getNum(row, idx, 'pie_des') ?? 20,
    res: getNum(row, idx, 'res') ?? 0,
    forza: getNum(row, idx, 'forza') ?? 0,
    pal_alt: getNum(row, idx, 'pal_alt') ?? 0,
    aut_area: getNum(row, idx, 'aut_area') ?? 0,
    comm: getNum(row, idx, 'comm') ?? 0,
    ecc: getNum(row, idx, 'ecc') ?? 0,
    bloc_tir: getNum(row, idx, 'bloc_tir') ?? 0,
    rinv: getNum(row, idx, 'rinv') ?? 0,
    uno_v_uno: getNum(row, idx, 'uno_v_uno') ?? 0,
    rifl: getNum(row, idx, 'rifl') ?? 0,
    usc: getNum(row, idx, 'usc') ?? 0,
    risp_pug: getNum(row, idx, 'risp_pug') ?? 0,
    ril: getNum(row, idx, 'ril') ?? 0,
    agr: getNum(row, idx, 'agr') ?? 0,
    int_ment: getNum(row, idx, 'int_ment') ?? 0,
    cor: getNum(row, idx, 'cor') ?? 0,
    fred: getNum(row, idx, 'fred') ?? 0,
    conc: getNum(row, idx, 'conc') ?? 0,
    dec: getNum(row, idx, 'dec') ?? 0,
    det: getNum(row, idx, 'det') ?? 0,
    fan: getNum(row, idx, 'fan') ?? 0,
    car: getNum(row, idx, 'car') ?? 0,
    senza_palla: getNum(row, idx, 'senza_palla') ?? 0,
    pos_ment:
      idx.pos_ment && row[idx.pos_ment] !== undefined && row[idx.pos_ment] !== null
        ? toInt(row[idx.pos_ment]) ?? 0
        : 0,
    gioc_squa: getNum(row, idx, 'gioc_squa') ?? 0,
    crea: getNum(row, idx, 'crea') ?? 0,
    imp: getNum(row, idx, 'imp') ?? 0,
    angoli: getNum(row, idx, 'angoli') ?? 0,
    cross: getNum(row, idx, 'cross') ?? 0,
    drib: getNum(row, idx, 'drib') ?? 0,
    final: getNum(row, idx, 'final') ?? 0,
    gioc_prima: getNum(row, idx, 'gioc_prima') ?? 0,
    pun: getNum(row, idx, 'pun') ?? 0,
    testa: getNum(row, idx, 'testa') ?? 0,
    tir_lont: getNum(row, idx, 'tir_lont') ?? 0,
    rim_lung: getNum(row, idx, 'rim_lung') ?? 0,
    marc: getNum(row, idx, 'marc') ?? 0,
    pass: getNum(row, idx, 'pass') ?? 0,
    guad_falli: getNum(row, idx, 'guad_falli') ?? 0,
    cont: getNum(row, idx, 'cont') ?? 0,
    tecn: getNum(row, idx, 'tecn') ?? 0,
  };
  players.push(p);
}

const json = JSON.stringify(players);
fs.writeFileSync(outJson, json, 'utf8');
console.log('Scritto', outJson, '—', players.length, 'giocatori.');

fs.writeFileSync(outGz, zlib.gzipSync(Buffer.from(json, 'utf8')));
console.log('Scritto', outGz);

const inlineJs = path.join(outDir, 'build-svincolati-inline.js');
if (fs.existsSync(inlineJs)) {
  try {
    execFileSync(process.execPath, [inlineJs], { cwd: outDir, stdio: 'inherit' });
  } catch (_) {
    console.warn('Avviso: build-svincolati-inline.js non eseguito (opzionale).');
  }
}
