// Build stipendi.js from CSV and report missing player IDs
const fs = require('fs');
const path = require('path');

const csvPath = path.join(process.env.USERPROFILE || '', 'Downloads', 'stipendi fmto.csv');
const playersPath = path.join(__dirname, 'players.js');
const outPath = path.join(__dirname, 'stipendi.js');

function parseStipendio(s) {
  if (!s || typeof s !== 'string') return null;
  // Remove spaces and non-ASCII (e.g. "А"), keep digits and dots
  const cleaned = s.replace(/\s/g, '').replace(/[^\d.]/g, '');
  // European format: 4.211.955 -> remove dots -> 4211955
  const numStr = cleaned.replace(/\./g, '');
  const n = parseInt(numStr, 10);
  return isNaN(n) ? null : n;
}

// 1) Parse CSV
const csvRaw = fs.readFileSync(csvPath, 'utf8');
const lines = csvRaw.split(/\r?\n/).filter(l => l.trim());
const header = lines[0].split(';').map(h => h.trim());
const ideIdx = header.findIndex(h => h.toLowerCase() === 'ide' || h === 'id');
const stipendioIdx = header.findIndex(h => h.toLowerCase() === 'stipendio');
if (ideIdx < 0 || stipendioIdx < 0) {
  console.error('CSV must have columns "ide" and "stipendio". Found:', header);
  process.exit(1);
}

const STIPENDI_BY_ID = {};
for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].split(';');
  const id = parts[ideIdx] ? String(parts[ideIdx]).trim() : '';
  const stip = parseStipendio(parts[stipendioIdx]);
  if (id && stip != null) STIPENDI_BY_ID[id] = stip;
}

// 2) Extract player IDs from players.js
const playersContent = fs.readFileSync(playersPath, 'utf8');
const idMatches = playersContent.match(/"id"\s*:\s*"(\d+)"/g) || [];
const playerIds = new Set();
idMatches.forEach(m => {
  const id = m.match(/"id"\s*:\s*"(\d+)"/)[1];
  playerIds.add(id);
});

// 3) Report missing
const csvIds = new Set(Object.keys(STIPENDI_BY_ID));
const missing = [...playerIds].filter(id => !csvIds.has(id));
if (missing.length > 0) {
  console.log('--- Giocatori nel sito senza stipendio nel CSV (' + missing.length + ') ---');
  missing.forEach(id => console.log(id));
  console.log('--- Fine elenco ---');
} else {
  console.log('Tutti i giocatori hanno uno stipendio nel CSV.');
}

// 4) Write stipendi.js
const jsContent = '// Stipendi FMTO — generato da build-stipendi.js (match su id)\n' +
  'var STIPENDI_BY_ID = ' + JSON.stringify(STIPENDI_BY_ID) + ';\n';
fs.writeFileSync(outPath, jsContent, 'utf8');
console.log('Scritto ' + outPath + ' con ' + Object.keys(STIPENDI_BY_ID).length + ' stipendi.');
