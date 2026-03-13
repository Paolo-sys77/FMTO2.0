// Aggiorna tutti i valori dei giocatori a partire dal CSV "Lista fmto 02-2026.csv"
// - Usa l'ID come chiave
// - Aggiorna tutti i campi numerici corrispondenti
// - Rigenera players.js (PLAYERS_BY_TEAM e ALL_PLAYERS)
// - Opzionale: rigenera anche stipendi.js dalla colonna "Stipendio"

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Percorso del CSV indicato dall'utente
const csvPath = 'C:\\Users\\sint2\\Desktop\\test\\Lista fmto 02-2026.csv';

// File del sito
const playersPath = path.join(__dirname, 'players.js');
const stipendiPath = path.join(__dirname, 'stipendi.js');

// Backup di sicurezza del file players.js
const playersBackupPath = path.join(__dirname, 'players.backup.before_csv.js');

function detectDelimiter(headerLine) {
  if (headerLine.includes(';') && headerLine.includes(',')) {
    // Se ci sono entrambi, preferisci il più frequente
    const sc = (headerLine.match(/;/g) || []).length;
    const cc = (headerLine.match(/,/g) || []).length;
    return sc >= cc ? ';' : ',';
  }
  if (headerLine.includes(';')) return ';';
  if (headerLine.includes(',')) return ',';
  return ';';
}

function toInt(value) {
  if (value == null) return null;
  const s = String(value).trim();
  if (!s) return null;
  const n = parseInt(s, 10);
  return Number.isNaN(n) ? null : n;
}

// Mappa intestazioni CSV (in minuscolo) -> chiavi in players.js
const headerToKey = {
  'id': 'id',
  'nome completo': 'nome',
  'età': 'eta',
  'ca': 'ca',
  'pa': 'pa',
  'accelerazione': 'acc',
  'agilità': 'agi',
  'equilibrio': 'equ',
  'elevazione': 'ele',
  'piede sinistro': 'pie_sin',
  'integrità fisica': 'int_fis',
  'velocità': 'vel',
  'piede destro': 'pie_des',
  'resistenza': 'res',
  'forza': 'forza',
  'palle alte': 'pal_alt',
  'autorità in area': 'aut_area',
  'comunicazione': 'comm',
  'eccentricità': 'ecc',
  // Nel JS è "bloc_tir", nel CSV "Presa"
  'presa': 'bloc_tir',
  'rinvii': 'rinv',
  'uno contro uno': 'uno_v_uno',
  'riflessi': 'rifl',
  'uscite': 'usc',
  'respinte di pugno': 'risp_pug',
  'rilanci': 'ril',
  'aggressività': 'agr',
  'intuito': 'int_ment',
  'coraggio': 'cor',
  'freddezza': 'fred',
  'concentrazione': 'conc',
  'decisioni': 'dec',
  'determinazione': 'det',
  'fantasia': 'fan',
  'carisma': 'car',
  'senza palla': 'senza_palla',
  'posizione': 'pos_ment',
  'gioco di squadra': 'gioc_squa',
  'creatività': 'crea',
  'impegno': 'imp',
  "calci d'angolo": 'angoli',
  'cross': 'cross',
  'dribbling': 'drib',
  'finalizzazione': 'final',
  'tocco di prima': 'gioc_prima',
  'punizioni': 'pun',
  'colpo di testa': 'testa',
  'tiri da lontano': 'tir_lont',
  'rimesse lunghe': 'rim_lung',
  'marcatura': 'marc',
  'passaggi': 'pass',
  'guadagnare falli': 'guad_falli',
  'contrasti': 'cont',
  'tecnica': 'tecn',
  'stipendio': 'stipendio' // usato solo per generare stipendi.js
};

// 1) Leggi e parsa il CSV
if (!fs.existsSync(csvPath)) {
  console.error('CSV non trovato in:', csvPath);
  process.exit(1);
}

const csvRaw = fs.readFileSync(csvPath, 'utf8');
const csvLines = csvRaw.split(/\r?\n/).filter(l => l.trim());
if (csvLines.length < 2) {
  console.error('CSV troppo corto (meno di 2 righe).');
  process.exit(1);
}

const delimiter = detectDelimiter(csvLines[0]);
const rawHeaders = csvLines[0].split(delimiter).map(h => h.trim());
const headersLower = rawHeaders.map(h => h.toLowerCase());

const idColIndex = headersLower.findIndex(h => h === 'id' || h === 'ide');
if (idColIndex < 0) {
  console.error('Nel CSV deve esserci una colonna "id" o "ide". Intestazioni trovate:', rawHeaders);
  process.exit(1);
}

// Costruisci una tabella: id -> dati riga normalizzati
const csvById = new Map();
for (let i = 1; i < csvLines.length; i++) {
  const line = csvLines[i];
  if (!line.trim()) continue;
  const parts = line.split(delimiter);
  if (parts.length <= idColIndex) continue;

  const row = {};
  for (let c = 0; c < rawHeaders.length; c++) {
    const headerOrig = rawHeaders[c];
    const headerKey = headersLower[c];
    const cell = (parts[c] || '').trim();
    row[headerOrig] = cell;
    row[headerKey] = cell; // accesso anche in minuscolo
  }

  const id = (row[rawHeaders[idColIndex]] || row[headersLower[idColIndex]] || '').trim();
  if (!id) continue;

  csvById.set(String(id), row);
}

console.log('Righe CSV lette (escluse intestazioni):', csvById.size);

// 2) Carica players.js come codice JS e ottieni PLAYERS_BY_TEAM e ALL_PLAYERS
if (!fs.existsSync(playersPath)) {
  console.error('players.js non trovato in:', playersPath);
  process.exit(1);
}

const playersCode = fs.readFileSync(playersPath, 'utf8');

const sandbox = {
  console,
  module: { exports: {} },
  exports: {}
};
vm.createContext(sandbox);

try {
  vm.runInContext(playersCode + '\nmodule.exports = { PLAYERS_BY_TEAM, ALL_PLAYERS };', sandbox, {
    filename: 'players.js'
  });
} catch (e) {
  console.error('Errore eseguendo players.js dentro la sandbox:', e);
  process.exit(1);
}

const exported = sandbox.module.exports || {};
const ALL_PLAYERS = exported.ALL_PLAYERS;

if (!Array.isArray(ALL_PLAYERS)) {
  console.error('ALL_PLAYERS non trovato o non è un array in players.js');
  process.exit(1);
}

// 3) Applica i valori del CSV a ogni giocatore tramite ID
const byId = new Map();
ALL_PLAYERS.forEach(p => {
  if (p && p.id) {
    byId.set(String(p.id), p);
  }
});

let updatedPlayers = 0;
let missingInPlayers = 0;

const STIPENDI_BY_ID = {};

for (const [id, row] of csvById.entries()) {
  const player = byId.get(id);
  if (!player) {
    missingInPlayers++;
    continue;
  }

  // Per ciascuna intestazione del CSV prova a mappare sul campo corrispondente
  for (const [headerLower, key] of Object.entries(headerToKey)) {
    const value = row[headerLower];
    if (value == null || value === '') continue;

    if (key === 'id') {
      // L'id resta quello base
      continue;
    } else if (key === 'nome') {
      player.nome = value;
    } else if (key === 'stipendio') {
      const n = toInt(value);
      if (n != null) {
        STIPENDI_BY_ID[id] = n;
      }
    } else {
      const n = toInt(value);
      if (n != null) {
        player[key] = n;
      }
    }
  }

  updatedPlayers++;
}

console.log('Giocatori aggiornati da CSV:', updatedPlayers);
console.log('Righe CSV senza corrispondenza in players.js (id non trovato):', missingInPlayers);

// 4) Rigenera PLAYERS_BY_TEAM raggruppando ALL_PLAYERS per "squadra"
const PLAYERS_BY_TEAM = {};
for (const p of ALL_PLAYERS) {
  if (!p || !p.squadra) continue;
  if (!PLAYERS_BY_TEAM[p.squadra]) {
    PLAYERS_BY_TEAM[p.squadra] = [];
  }
  PLAYERS_BY_TEAM[p.squadra].push(p);
}

// 5) Scrivi backup di players.js
if (!fs.existsSync(playersBackupPath)) {
  fs.writeFileSync(playersBackupPath, playersCode, 'utf8');
  console.log('Backup di players.js scritto in', playersBackupPath);
} else {
  console.log('Backup di players.js già esistente in', playersBackupPath);
}

// 6) Scrivi il nuovo players.js
const newPlayersContent =
  'const PLAYERS_BY_TEAM = ' + JSON.stringify(PLAYERS_BY_TEAM) + ';\n' +
  'const ALL_PLAYERS = ' + JSON.stringify(ALL_PLAYERS) + ';\n';

fs.writeFileSync(playersPath, newPlayersContent, 'utf8');
console.log('players.js aggiornato con i valori del CSV.');

// 7) Scrivi anche stipendi.js dalla colonna "Stipendio" (se presente)
if (Object.keys(STIPENDI_BY_ID).length > 0) {
  const stipContent =
    '// Stipendi FMTO — generato da build-players-from-csv.js (match su id)\n' +
    'var STIPENDI_BY_ID = ' + JSON.stringify(STIPENDI_BY_ID) + ';\n';
  fs.writeFileSync(stipendiPath, stipContent, 'utf8');
  console.log('stipendi.js aggiornato da colonna "Stipendio" del CSV con', Object.keys(STIPENDI_BY_ID).length, 'voci.');
} else {
  console.log('Nessuna colonna "Stipendio" utile trovata nel CSV: stipendi.js non aggiornato.');
}

