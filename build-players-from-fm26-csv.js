/**
 * Aggiorna players.js, under.js e stipendi.js dal CSV FM26 DB FMTO.
 * Chiave: colonna ID (colonna A).
 *
 * Uso:
 *   node build-players-from-fm26-csv.js
 *   node build-players-from-fm26-csv.js "C:\percorso\FM26 DB FMTO.csv"
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const defaultCsv = path.join(process.env.USERPROFILE || '', 'Downloads', 'FM26 DB FMTO.csv');
const csvPath = process.argv[2] ? path.resolve(process.argv[2]) : defaultCsv;
const playersPath = path.join(__dirname, 'players.js');
const underPath = path.join(__dirname, 'under.js');
const stipendiPath = path.join(__dirname, 'stipendi.js');
const playersBackupPath = path.join(__dirname, 'players.backup.before_fm26_csv.js');

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

function isUnderClub(club) {
  return /\bunder\b/i.test(String(club || ''));
}

function normalizeFmtoTeam(club) {
  return String(club || '')
    .trim()
    .replace(/\s+under(\s+senior)?$/i, '')
    .trim();
}

function loadJsExports(filePath, exportExpr) {
  const code = fs.readFileSync(filePath, 'utf8');
  const sandbox = { console, module: { exports: {} }, exports: {} };
  vm.createContext(sandbox);
  vm.runInContext(code + '\nmodule.exports = ' + exportExpr + ';', sandbox, { filename: path.basename(filePath) });
  return sandbox.module.exports;
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
    'imp', 'angoli', 'cross', 'drib', 'final', 'pun', 'testa', 'tir_lont', 'rim_lung', 'marc', 'pass', 'cont', 'tecn',
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

  const club = getCell(row, idx, 'club_fmto');
  if (club) p.squadra = normalizeFmtoTeam(club);

  const sal = parseSalary(getCell(row, idx, 'stipendio'));
  if (sal != null) p.stipendio = sal;

  return p;
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
    stipendio: colIndex(headerNorm, ['Ingaggio lordo', 'Stipendio']),
    testa: colIndex(headerNorm, 'Colpo di Testa'),
    cont: colIndex(headerNorm, 'Contrasti'),
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

function defaultMainPlayer(id, squadra) {
  return {
    id: String(id),
    nome: '—',
    eta: 0,
    dob: '',
    ca: 0,
    pa: 0,
    naz: '',
    squadra,
    prezzo: 0,
    posizione: '—',
    acc: 0, agi: 0, equ: 0, ele: 0, pie_sin: 0, int_fis: 0, vel: 0, pie_des: 20, res: 0, forza: 0,
    pal_alt: 0, aut_area: 0, comm: 0, ecc: 0, bloc_tir: 0, rinv: 0, uno_v_uno: 0, rifl: 0, usc: 0, risp_pug: 0, ril: 0,
    agr: 0, int_ment: 0, cor: 0, fred: 0, conc: 0, dec: 0, det: 0, fan: 0, car: 0, senza_palla: 0, visione: 0, pos_ment: 0, gioc_squa: 0,
    crea: 0, imp: 0, angoli: 0, cross: 0, drib: 0, final: 0, gioc_prima: 0, pun: 0, testa: 0, tir_lont: 0, rim_lung: 0,
    marc: 0, pass: 0, guad_falli: 0, cont: 0, tecn: 0,
  };
}

function defaultUnderPlayer(id, squadra) {
  const p = defaultMainPlayer(id, squadra);
  p.stipendio = 0;
  return p;
}

function rebuildPlayersByTeam(allPlayers) {
  const out = {};
  for (const p of allPlayers) {
    if (!p || !p.squadra) continue;
    if (!out[p.squadra]) out[p.squadra] = [];
    out[p.squadra].push(p);
  }
  return out;
}

function rebuildUnderStructures(underPlayersByTeam) {
  const UNDER_BY_TEAM = {};
  for (const team of Object.keys(underPlayersByTeam)) {
    const ids = (underPlayersByTeam[team] || []).map((p) => String(p.id));
    UNDER_BY_TEAM[team] = ids.slice().sort((a, b) => {
      const na = Number(a);
      const nb = Number(b);
      if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
      return String(a).localeCompare(String(b));
    });
  }
  return UNDER_BY_TEAM;
}

function main() {
  if (!fs.existsSync(csvPath)) {
    console.error('CSV non trovato:', csvPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(csvPath, 'latin1');
  const lines = raw.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) {
    console.error('CSV troppo corto.');
    process.exit(1);
  }

  const headerLine = lines[0];
  const semi = (headerLine.match(/;/g) || []).length;
  const comma = (headerLine.match(/,/g) || []).length;
  const DELIM = semi >= comma ? ';' : ',';
  const headerRow = parseCsvLine(headerLine, DELIM).map((h) => String(h || '').trim());
  const headerNorm = headerRow.map(normHeader);
  const idx = buildIdx(headerNorm);
  // Colonne Excel AJ (Senza palla) e AK (Visione di gioco), se intestazione non riconosciuta
  if (idx.senza_palla < 0 && headerRow.length > 35) idx.senza_palla = 35;
  if (idx.visione < 0 && headerRow.length > 36) idx.visione = 36;

  if (idx.id < 0 || idx.club_fmto < 0) {
    console.error('Colonne obbligatorie ID e CLUB FMTO non trovate. Intestazioni:', headerRow);
    process.exit(1);
  }

  const { ALL_PLAYERS } = loadJsExports(playersPath, '{ ALL_PLAYERS }');
  const underExports = fs.existsSync(underPath)
    ? loadJsExports(underPath, '{ UNDER_BY_TEAM, UNDER_PLAYERS_BY_TEAM }')
    : { UNDER_BY_TEAM: {}, UNDER_PLAYERS_BY_TEAM: {} };

  const mainById = new Map();
  for (const p of ALL_PLAYERS) {
    if (p && p.id) mainById.set(String(p.id), p);
  }

  const underById = new Map();
  for (const team of Object.keys(underExports.UNDER_PLAYERS_BY_TEAM || {})) {
    for (const p of underExports.UNDER_PLAYERS_BY_TEAM[team] || []) {
      if (p && p.id) underById.set(String(p.id), { ...p });
    }
  }

  const STIPENDI_BY_ID = {};
  const report = {
    csvPath,
    righeCsv: 0,
    mainAggiornati: 0,
    mainAggiunti: 0,
    underAggiornati: 0,
    underAggiunti: 0,
    stipendi: 0,
    saltati: 0,
  };

  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvLine(lines[i], DELIM);
    if (!row.length) continue;
    const id = getCell(row, idx, 'id');
    if (!id) continue;
    report.righeCsv++;

    const club = getCell(row, idx, 'club_fmto');
    if (!club) {
      report.saltati++;
      continue;
    }

    const sal = parseSalary(getCell(row, idx, 'stipendio'));
    if (sal != null) {
      STIPENDI_BY_ID[id] = sal;
      report.stipendi++;
    }

    if (isUnderClub(club)) {
      const team = normalizeFmtoTeam(club);
      let p = underById.get(id);
      if (!p) {
        p = defaultUnderPlayer(id, team);
        underById.set(id, p);
        report.underAggiunti++;
      } else {
        report.underAggiornati++;
      }
      applyRowToPlayer(p, row, idx);
      p.squadra = team;
      underById.set(id, p);
    } else {
      let p = mainById.get(id);
      if (!p) {
        p = defaultMainPlayer(id, normalizeFmtoTeam(club));
        mainById.set(id, p);
        report.mainAggiunti++;
      } else {
        report.mainAggiornati++;
      }
      applyRowToPlayer(p, row, idx);
      mainById.set(id, p);
    }
  }

  const ALL_PLAYERS_OUT = Array.from(mainById.values());
  for (const p of ALL_PLAYERS_OUT) {
    if (p.senza_palla == null || p.senza_palla === '') p.senza_palla = 0;
    if (p.visione == null || p.visione === '') p.visione = 0;
  }
  const PLAYERS_BY_TEAM = rebuildPlayersByTeam(ALL_PLAYERS_OUT);

  const UNDER_PLAYERS_BY_TEAM = {};
  for (const p of underById.values()) {
    if (p.senza_palla == null || p.senza_palla === '') p.senza_palla = 0;
    if (p.visione == null || p.visione === '') p.visione = 0;
    const team = p.squadra;
    if (!team) continue;
    if (!UNDER_PLAYERS_BY_TEAM[team]) UNDER_PLAYERS_BY_TEAM[team] = [];
    UNDER_PLAYERS_BY_TEAM[team].push(p);
  }
  const UNDER_BY_TEAM = rebuildUnderStructures(UNDER_PLAYERS_BY_TEAM);

  if (!fs.existsSync(playersBackupPath)) {
    fs.copyFileSync(playersPath, playersBackupPath);
  }

  const playersOut =
    'const PLAYERS_BY_TEAM = ' +
    JSON.stringify(PLAYERS_BY_TEAM) +
    ';\nconst ALL_PLAYERS = ' +
    JSON.stringify(ALL_PLAYERS_OUT) +
    ';\n';
  fs.writeFileSync(playersPath, playersOut, 'utf8');

  const fmtoPlayers = path.join(__dirname, 'FMTO2.0-main', 'players.js');
  if (fs.existsSync(path.dirname(fmtoPlayers))) {
    fs.writeFileSync(fmtoPlayers, playersOut, 'utf8');
  }

  const underOut =
    '// Under FMTO — generato da build-players-from-fm26-csv.js\n' +
    'var UNDER_BY_TEAM = ' +
    JSON.stringify(UNDER_BY_TEAM, null, 2) +
    ';\n' +
    'var UNDER_PLAYERS_BY_TEAM = ' +
    JSON.stringify(UNDER_PLAYERS_BY_TEAM, null, 2) +
    ';\n';
  fs.writeFileSync(underPath, underOut, 'utf8');

  const stipOut =
    '// Stipendi FMTO — generato da build-players-from-fm26-csv.js (Ingaggio lordo)\n' +
    'var STIPENDI_BY_ID = ' +
    JSON.stringify(STIPENDI_BY_ID) +
    ';\n';
  fs.writeFileSync(stipendiPath, stipOut, 'utf8');

  console.log(JSON.stringify(report, null, 2));
}

main();
