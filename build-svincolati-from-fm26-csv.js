/**
 * Aggiorna svincolati.json (e .gz) dal CSV FM26 Svincolati — match su colonna A (ID).
 * Se l'ID non esiste, crea la scheda. Assenti dal CSV vengono rimossi dall'elenco.
 * Genera anche svincolati-data.js (primi 1000 per pagina Squadre).
 *
 * Uso:
 *   node build-svincolati-from-fm26-csv.js
 *   node build-svincolati-from-fm26-csv.js "C:\percorso\FM26 DB Svincolati.csv"
 */
'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const zlib = require('zlib');

const defaultCsv = path.join(process.env.USERPROFILE || '', 'Downloads', 'FM26 DB Svincolati.csv');
const csvPath = process.argv[2] ? path.resolve(process.argv[2]) : defaultCsv;
const outDir = __dirname;
const outJson = path.join(outDir, 'svincolati.json');
const outGz = path.join(outDir, 'svincolati.json.gz');
const outData = path.join(outDir, 'svincolati-data.js');
const MAX_PAGE = 1000;

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

function normHeader(h) {
  return String(h || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

function colIndex(headerNorm, aliases) {
  const names = Array.isArray(aliases) ? aliases : [aliases];
  for (const name of names) {
    const want = normHeader(name);
    const i = headerNorm.findIndex((h) => h === want);
    if (i >= 0) return i;
  }
  return -1;
}

function toInt(value) {
  if (value == null || value === '') return null;
  const s = String(value).trim().replace(/\s/g, '');
  const n = parseInt(s, 10);
  return Number.isNaN(n) ? null : n;
}

function parseSalary(value) {
  if (value == null || value === '') return null;
  const s = String(value).replace(/\s/g, '').replace(/[^\d]/g, '');
  if (!s) return null;
  const n = parseInt(s, 10);
  return Number.isNaN(n) ? null : n;
}

function isSvincolatoClub(club) {
  const c = String(club || '')
    .trim()
    .toLowerCase();
  return !c || c === 'free' || c === 'svincolato' || c === 'svincolati';
}

function buildIdx(headerNorm) {
  return {
    id: colIndex(headerNorm, 'ID'),
    nome: colIndex(headerNorm, ['Nome Completo', 'Nome completo']),
    dob: colIndex(headerNorm, 'Data di nascita'),
    eta: colIndex(headerNorm, ['Età', 'Eta']),
    naz: colIndex(headerNorm, ['Nazionalità', 'Nazionalita']),
    posizione: colIndex(headerNorm, ['Ruoli', 'Ruolo', 'Posizione']),
    ca: colIndex(headerNorm, 'CA'),
    pa: colIndex(headerNorm, 'PA'),
    club_fmto: colIndex(headerNorm, 'CLUB FMTO'),
    stipendio: colIndex(headerNorm, ['Ingaggio lordo', 'Stipendio', 'Prezzo']),
    testa: colIndex(headerNorm, 'Colpo di Testa'),
    cont: colIndex(headerNorm, 'Contrasti'),
    gioc_prima: colIndex(headerNorm, ['Controllo di palla', 'Controllo palla']),
    cross: colIndex(headerNorm, 'Cross'),
    drib: colIndex(headerNorm, 'Dribbling'),
    final: colIndex(headerNorm, 'Finalizzazione'),
    marc: colIndex(headerNorm, 'Marcatura'),
    pass: colIndex(headerNorm, 'Passaggi'),
    tecn: colIndex(headerNorm, 'Tecnica'),
    tir_lont: colIndex(headerNorm, ['Tiri da lonatano', 'Tiri da lontano']),
    agr: colIndex(headerNorm, 'Aggressività'),
    car: colIndex(headerNorm, 'Carisma'),
    conc: colIndex(headerNorm, 'Concentrazione'),
    cor: colIndex(headerNorm, 'Coraggio'),
    dec: colIndex(headerNorm, 'Decisioni'),
    det: colIndex(headerNorm, 'Determinazione'),
    fan: colIndex(headerNorm, 'Fantasia'),
    fred: colIndex(headerNorm, 'Freddezza'),
    gioc_squa: colIndex(headerNorm, 'Gioco di squadra'),
    imp: colIndex(headerNorm, 'Impegno'),
    int_ment: colIndex(headerNorm, 'Intuito'),
    pos_ment: colIndex(headerNorm, 'Posizione'),
    senza_palla: colIndex(headerNorm, 'Senza palla'),
    visione: colIndex(headerNorm, ['Visione di gioco', 'Visione']),
    acc: colIndex(headerNorm, ['Accellerazione', 'Accelerazione']),
    agi: colIndex(headerNorm, 'Agilità'),
    equ: colIndex(headerNorm, 'Equilibrio'),
    forza: colIndex(headerNorm, 'Forza'),
    int_fis: colIndex(headerNorm, 'Integrità fisica'),
    ele: colIndex(headerNorm, ['Massima elevazione', 'Elevazione']),
    res: colIndex(headerNorm, 'Resistenza'),
    vel: colIndex(headerNorm, 'Velocità'),
    pun: colIndex(headerNorm, 'Punizioni'),
    pie_sin: colIndex(headerNorm, 'Piede sx'),
    pie_des: headerNorm.indexOf('piede sx') >= 0 ? headerNorm.lastIndexOf('piede sx') : colIndex(headerNorm, 'Piede destro'),
    angoli: colIndex(headerNorm, ["Calcio d'angolo", 'Calci d angolo']),
    rim_lung: colIndex(headerNorm, 'Rimesse lunghe'),
    aut_area: colIndex(headerNorm, ['Autorità area', 'Autorità in area']),
    comm: colIndex(headerNorm, 'Comunicazione'),
    ecc: colIndex(headerNorm, 'Eccentricità'),
    pal_alt: colIndex(headerNorm, 'Palle alte'),
    bloc_tir: colIndex(headerNorm, ['Bloccare tiri', 'Blocco tiri']),
    risp_pug: colIndex(headerNorm, 'Respinte di pugno'),
    rifl: colIndex(headerNorm, 'Riflessi'),
    ril: colIndex(headerNorm, 'Rilanci'),
    rinv: colIndex(headerNorm, 'Rinvii'),
    uno_v_uno: colIndex(headerNorm, ['Uno vs uno', 'Uno contro uno']),
    usc: colIndex(headerNorm, ['uscita', 'Uscite']),
  };
}

function defaultSvincolato(id) {
  return {
    id: String(id),
    nome: '—',
    eta: 0,
    dob: '',
    ca: 0,
    pa: 0,
    naz: '',
    squadra: 'SVINCOLATI',
    prezzo: 0,
    posizione: '—',
    acc: 0,
    agi: 0,
    equ: 0,
    ele: 0,
    pie_sin: 0,
    int_fis: 0,
    vel: 0,
    pie_des: 20,
    res: 0,
    forza: 0,
    pal_alt: 0,
    aut_area: 0,
    comm: 0,
    ecc: 0,
    bloc_tir: 0,
    rinv: 0,
    uno_v_uno: 0,
    rifl: 0,
    usc: 0,
    risp_pug: 0,
    ril: 0,
    agr: 0,
    int_ment: 0,
    cor: 0,
    fred: 0,
    conc: 0,
    dec: 0,
    det: 0,
    fan: 0,
    car: 0,
    senza_palla: 0,
    visione: 0,
    pos_ment: 0,
    gioc_squa: 0,
    crea: 0,
    imp: 0,
    angoli: 0,
    cross: 0,
    drib: 0,
    final: 0,
    gioc_prima: 0,
    pun: 0,
    testa: 0,
    tir_lont: 0,
    rim_lung: 0,
    marc: 0,
    pass: 0,
    guad_falli: 0,
    cont: 0,
    tecn: 0,
    stipendio: 0,
  };
}

function getCell(row, idx, key) {
  const i = idx[key];
  if (i == null || i < 0) return '';
  return row[i] != null ? String(row[i]).trim() : '';
}

function applyRowToPlayer(p, row, idx) {
  const intFields = [
    'eta', 'ca', 'pa', 'acc', 'agi', 'equ', 'ele', 'pie_sin', 'int_fis', 'vel', 'pie_des', 'res', 'forza',
    'pal_alt', 'aut_area', 'comm', 'ecc', 'bloc_tir', 'rinv', 'uno_v_uno', 'rifl', 'usc', 'risp_pug', 'ril',
    'agr', 'int_ment', 'cor', 'fred', 'conc', 'dec', 'det', 'fan', 'car', 'senza_palla', 'visione', 'pos_ment', 'gioc_squa',
    'imp', 'angoli', 'cross', 'drib', 'final', 'pun', 'testa', 'tir_lont', 'rim_lung', 'marc', 'pass', 'cont', 'tecn', 'gioc_prima',
  ];
  const strFields = ['nome', 'dob', 'naz', 'posizione'];

  for (const key of strFields) {
    const v = getCell(row, idx, key);
    if (v) p[key] = v;
  }
  for (const key of intFields) {
    const v = toInt(getCell(row, idx, key));
    if (v != null) p[key] = v;
  }

  p.squadra = 'SVINCOLATI';

  const sal = parseSalary(getCell(row, idx, 'stipendio'));
  if (sal != null) {
    p.stipendio = sal;
    if (!p.prezzo) p.prezzo = sal;
  }

  if (p.senza_palla == null) p.senza_palla = 0;
  if (p.visione == null) p.visione = 0;

  return p;
}

function loadExistingById() {
  const map = new Map();
  if (!fs.existsSync(outJson)) return map;
  try {
    const raw = fs.readFileSync(outJson, 'utf8');
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return map;
    for (const p of list) {
      if (p && p.id) map.set(String(p.id), p);
    }
  } catch (e) {
    console.warn('Impossibile leggere svincolati.json esistente:', e.message);
  }
  return map;
}

function writeJsonArrayStreaming(players, filePath) {
  return new Promise((resolve, reject) => {
    const out = fs.createWriteStream(filePath, { encoding: 'utf8' });
    out.on('error', reject);
    out.on('finish', resolve);
    out.write('[');
    let first = true;
    for (const p of players) {
      if (!first) out.write(',');
      out.write(JSON.stringify(p));
      first = false;
    }
    out.write(']');
    out.end();
  });
}

async function main() {
  if (!fs.existsSync(csvPath)) {
    console.error('CSV non trovato:', csvPath);
    process.exit(1);
  }

  const existingById = loadExistingById();
  const byId = new Map();

  const report = {
    csvPath,
    righeCsv: 0,
    aggiornati: 0,
    aggiunti: 0,
    rimossi: 0,
    saltati: 0,
    esistentiPrima: existingById.size,
  };

  const rl = readline.createInterface({
    input: fs.createReadStream(csvPath, { encoding: 'latin1' }),
    crlfDelay: Infinity,
  });

  let idx = null;
  let DELIM = ';';
  let lineNo = 0;

  for await (const line of rl) {
    if (!line.trim()) continue;
    lineNo++;

    if (lineNo === 1) {
      const semi = (line.match(/;/g) || []).length;
      const comma = (line.match(/,/g) || []).length;
      DELIM = semi >= comma ? ';' : ',';
      const headerRow = parseCsvLine(line, DELIM).map((h) => String(h || '').trim());
      const headerNorm = headerRow.map(normHeader);
      idx = buildIdx(headerNorm);
      if (idx.senza_palla < 0 && headerRow.length > 35) idx.senza_palla = 35;
      if (idx.visione < 0 && headerRow.length > 36) idx.visione = 36;
      if (idx.id < 0) {
        console.error('Colonna ID (A) non trovata.');
        process.exit(1);
      }
      continue;
    }

    const row = parseCsvLine(line, DELIM);
    const id = getCell(row, idx, 'id');
    if (!id) {
      report.saltati++;
      continue;
    }

    const club = getCell(row, idx, 'club_fmto');
    if (club && !isSvincolatoClub(club)) {
      report.saltati++;
      continue;
    }

    report.righeCsv++;

    let p = existingById.get(id);
    if (p) {
      report.aggiornati++;
      p = { ...p };
    } else {
      report.aggiunti++;
      p = defaultSvincolato(id);
    }

    applyRowToPlayer(p, row, idx);
    byId.set(id, p);
  }

  for (const id of existingById.keys()) {
    if (!byId.has(id)) report.rimossi++;
  }

  const players = Array.from(byId.values());
  report.totale = players.length;

  console.error('Scrittura', outJson, '…');
  await writeJsonArrayStreaming(players, outJson);

  const jsonBuf = fs.readFileSync(outJson);
  fs.writeFileSync(outGz, zlib.gzipSync(jsonBuf));
  report.jsonBytes = jsonBuf.length;
  report.gzBytes = fs.statSync(outGz).size;

  const first1000 = players.slice(0, MAX_PAGE);
  fs.writeFileSync(
    outData,
    '// Svincolati FMTO — primi ' + MAX_PAGE + ' (build-svincolati-from-fm26-csv.js)\n' +
      'window.SVINCOLATI_INLINE = ' +
      JSON.stringify(first1000) +
      ';\n',
    'utf8'
  );
  report.inlinePagina = first1000.length;

  const scoutingPath = path.join(outDir, 'svincolati-scouting.js');
  if (players.length <= 15000) {
    fs.writeFileSync(
      scoutingPath,
      '// Generato da build-svincolati-from-fm26-csv.js\nwindow.SVINCOLATI_SCOUTING = ' +
        JSON.stringify(players) +
        ';\n',
      'utf8'
    );
    report.scoutingInline = players.length;
  } else {
    fs.writeFileSync(
      scoutingPath,
      '// Dataset troppo grande per inline: usa fetch su svincolati.json (Scouting)\nwindow.SVINCOLATI_SCOUTING = [];\n',
      'utf8'
    );
    report.scoutingInline = 0;
    report.scoutingNota = 'Usa svincolati.json via server HTTP o Parquet in config.js';
  }

  console.log(JSON.stringify(report, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
