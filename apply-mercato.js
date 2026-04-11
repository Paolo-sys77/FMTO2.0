/**
 * Legge il foglio mercato (.xlsx) nella cartella del sito e aggiorna players.js
 * CEDENTE = squadra di partenza attesa, CESSIONARIA = destinazione
 */
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { parseMercatoRows } = require('./mercato-parse-sheet');

const PLAYERS_JS = path.join(__dirname, 'players.js');

/**
 * Opzionale: applica solo un intervallo di righe Excel (numero riga come in Excel, 1-based).
 * Esempi: node apply-mercato.js --rows=111-137
 *         set MERCATO_ROW_MIN=111 & set MERCATO_ROW_MAX=137 & node apply-mercato.js
 * mercato-movimenti.js viene sempre generato da tutte le righe del foglio.
 */
function parseApplyRowRange() {
  const arg = process.argv.find((a) => String(a).startsWith('--rows='));
  if (arg) {
    const m = String(arg).slice('--rows='.length).trim().match(/^(\d+)\s*-\s*(\d+)$/);
    if (m) {
      const a = parseInt(m[1], 10);
      const b = parseInt(m[2], 10);
      return { min: Math.min(a, b), max: Math.max(a, b) };
    }
    console.error('Argomento --rows= non valido. Usa es. --rows=111-137');
    process.exit(1);
  }
  const envMin = process.env.MERCATO_ROW_MIN;
  const envMax = process.env.MERCATO_ROW_MAX;
  if (envMin != null && envMax != null && String(envMin).trim() !== '' && String(envMax).trim() !== '') {
    const a = parseInt(envMin, 10);
    const b = parseInt(envMax, 10);
    if (!Number.isNaN(a) && !Number.isNaN(b)) return { min: Math.min(a, b), max: Math.max(a, b) };
  }
  return null;
}

/** Cerca il file in quest’ordine (stessa cartella di apply-mercato.js). */
function resolveMercatoXlsxPath() {
  const candidates = [
    path.join(__dirname, 'mercato 26_.xlsx'),
    path.join(__dirname, 'mercato 26_2.xlsx'),
    path.join(process.env.USERPROFILE || '', 'Downloads', 'mercato 26_2.xlsx'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return candidates[0];
}

function normName(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function normTeam(s) {
  return String(s || '')
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function loadPlayers() {
  const src = fs.readFileSync(PLAYERS_JS, 'utf8');
  const fn = new Function(src + '\nreturn { PLAYERS_BY_TEAM, ALL_PLAYERS };');
  return fn();
}

/** Esporta righe Excel per la pagina mercato.html (mercato-movimenti.js). */
function writeMercatoMovimentiJs(sourcePath, rows, intestazioni) {
  const righe = rows.map((row) => ({
    n: row._row,
    giocatore: row.GIOCATORE != null ? String(row.GIOCATORE).trim() : '',
    cedente: row.CEDENTE != null ? String(row.CEDENTE).trim() : '',
    cessionaria: row.CESSIONARIA != null ? String(row.CESSIONARIA).trim() : '',
    tipo: row.TIPO_SCAMBIO != null ? String(row.TIPO_SCAMBIO).trim() : '',
    tipoRighe: Array.isArray(row.TIPO_RIGHE) ? row.TIPO_RIGHE : [],
    costoCr: row.COSTO_CR != null ? String(row.COSTO_CR).trim() : '',
    note: row.NOTE != null ? String(row.NOTE).trim() : '',
    noteRighe: Array.isArray(row.NOTE_RIGHE) ? row.NOTE_RIGHE : [],
  })).filter((r) => r.giocatore || r.cedente || r.cessionaria);

  const payload = {
    fonte: path.basename(sourcePath),
    generatoIso: new Date().toISOString(),
    intestazioni: intestazioni || null,
    righe,
  };
  const out = 'window.MERCATO_MOVIMENTI = ' + JSON.stringify(payload) + ';\n';
  fs.writeFileSync(path.join(__dirname, 'mercato-movimenti.js'), out, 'utf8');
}

/** Nomi in Excel -> nome esatto in DB (se diverso) */
const EXCEL_TO_DB_NAME = {
  'YAN BUENO COUTO': 'Yan Couto',
  'LUIZ HENRIQUE ANDRE ROSA DA SILVA': 'Luiz Henrique',
};

function resolveDbName(excelNome) {
  const k = normName(excelNome);
  return EXCEL_TO_DB_NAME[k] || excelNome;
}

function findPlayer(nomeExcel, from, byName, anomalies, excelRow) {
  const dbNome = resolveDbName(nomeExcel);
  const nk = normName(dbNome);
  const fromN = normTeam(from);
  let candidates = byName.get(nk) || [];

  let player = candidates.find((p) => normTeam(p.squadra) === fromN);

  if (!player && candidates.length === 1) {
    player = candidates[0];
    if (normTeam(player.squadra) !== fromN) {
      anomalies.push({
        type: 'CEDENTE_DIVERSO_DA_DB',
        excelRow,
        nome: nomeExcel,
        attesoCedente: from,
        squadraInDb: player.squadra,
      });
    }
  }

  if (!player && candidates.length === 0) {
    const all = [];
    byName.forEach((arr) => all.push(...arr));
    const onTeam = all.filter((p) => normTeam(p.squadra) === fromN);
    const partial = onTeam.filter((p) => {
      const pn = normName(p.nome);
      return pn.includes(nk) || nk.includes(pn);
    });
    if (partial.length === 1) {
      player = partial[0];
      anomalies.push({
        type: 'MATCH_PARZIALE_NOME',
        excelRow,
        nomeExcel: nomeExcel,
        nomeDb: player.nome,
        from,
      });
    }
  }

  if (!player && candidates.length > 1) {
    anomalies.push({
      type: 'OMONIMI_MULTIPLI',
      excelRow,
      nome: nomeExcel,
      from,
      candidati: candidates.map((p) => ({ id: p.id, squadra: p.squadra })),
    });
  }

  return player;
}

function main() {
  const XLSX_PATH = resolveMercatoXlsxPath();
  if (!fs.existsSync(XLSX_PATH)) {
    console.error('File Excel non trovato. Metti uno di questi nella cartella del sito:');
    console.error('  - mercato 26_.xlsx');
    console.error('  - mercato 26_2.xlsx');
    process.exit(1);
  }

  const wb = XLSX.readFile(XLSX_PATH);
  const { rows, intestazioni } = parseMercatoRows(wb);
  writeMercatoMovimentiJs(XLSX_PATH, rows, intestazioni);

  const rowRange = parseApplyRowRange();
  const rowsApply = rowRange
    ? rows.filter((r) => r._row >= rowRange.min && r._row <= rowRange.max)
    : rows;
  if (rowRange) {
    console.error(
      `Solo righe Excel ${rowRange.min}–${rowRange.max}: ${rowsApply.length} righe da applicare su ${rows.length} totali nel foglio.`
    );
  }

  let { PLAYERS_BY_TEAM, ALL_PLAYERS } = loadPlayers();

  const validTeams = new Set(Object.keys(PLAYERS_BY_TEAM));
  const anomalies = [];
  const applied = [];

  const byName = new Map();
  for (const p of ALL_PLAYERS) {
    const k = normName(p.nome);
    if (!byName.has(k)) byName.set(k, []);
    byName.get(k).push(p);
  }

  const lastRowByPlayer = new Map();
  rowsApply.forEach((row) => {
    const nome = row.GIOCATORE;
    const to = normTeam(row.CESSIONARIA);
    const from = normTeam(row.CEDENTE);
    const excelRow = row._row;
    if (!nome || !to || !from) {
      anomalies.push({ type: 'RIGA_INCOMPLETA', row: excelRow, nome, from, to });
      return;
    }
    lastRowByPlayer.set(normName(resolveDbName(nome)), {
      nomeRaw: nome,
      from,
      to,
      excelRow,
    });
  });

  const seenPairs = new Map();
  rowsApply.forEach((row) => {
    const excelRow = row._row;
    const key = normName(resolveDbName(row.GIOCATORE));
    const to = normTeam(row.CESSIONARIA);
    const from = normTeam(row.CEDENTE);
    const pair = key + '|' + from + '|' + to;
    const rev = key + '|' + to + '|' + from;
    if (seenPairs.has(rev)) {
      anomalies.push({
        type: 'TRASFERIMENTI_OPPOSTI_STESSO_GIOCATORE',
        giocatore: row.GIOCATORE,
        rigaPrecedente: seenPairs.get(rev),
        riga: excelRow,
        nota: "Si applica l'ultima riga del file per questo giocatore.",
      });
    }
    seenPairs.set(pair, excelRow);
  });

  for (const { nomeRaw, from, to, excelRow } of lastRowByPlayer.values()) {
    if (!validTeams.has(to)) {
      anomalies.push({ type: 'CESSIONARIA_SCONOSCIUTA', excelRow, nome: nomeRaw, to });
      continue;
    }
    if (!validTeams.has(from)) {
      anomalies.push({ type: 'CEDENTE_SCONOSCIUTO', excelRow, nome: nomeRaw, from });
      continue;
    }

    const player = findPlayer(nomeRaw, from, byName, anomalies, excelRow);
    if (!player) {
      anomalies.push({ type: 'GIOCATORE_NON_TROVATO', excelRow, nome: nomeRaw, from });
      continue;
    }

    const id = String(player.id);
    const fresh = { ...player, squadra: to };

    for (const key of Object.keys(PLAYERS_BY_TEAM)) {
      PLAYERS_BY_TEAM[key] = (PLAYERS_BY_TEAM[key] || []).filter((p) => String(p.id) !== id);
    }
    if (!PLAYERS_BY_TEAM[to]) PLAYERS_BY_TEAM[to] = [];
    PLAYERS_BY_TEAM[to].push(fresh);

    const ai = ALL_PLAYERS.findIndex((p) => String(p.id) === id);
    if (ai >= 0) ALL_PLAYERS[ai] = fresh;
    else anomalies.push({ type: 'ID_MANCANTE_IN_ALL_PLAYERS', excelRow, nome: nomeRaw, id });

    applied.push({ nome: fresh.nome, id, from, to, excelRow });
    byName.set(normName(fresh.nome), [fresh]);
  }

  const out =
    'const PLAYERS_BY_TEAM = ' +
    JSON.stringify(PLAYERS_BY_TEAM) +
    ';\nconst ALL_PLAYERS = ' +
    JSON.stringify(ALL_PLAYERS) +
    ';\n';
  fs.writeFileSync(PLAYERS_JS, out, 'utf8');

  const fmto = path.join(__dirname, 'FMTO2.0-main', 'players.js');
  if (fs.existsSync(fmto)) fs.writeFileSync(fmto, out, 'utf8');

  console.log(
    JSON.stringify(
      {
        file: XLSX_PATH,
        soloRighe: rowRange || null,
        applicati: applied.length,
        anomalie: anomalies,
      },
      null,
      2
    )
  );
}

main();
