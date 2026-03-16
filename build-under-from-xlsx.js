/**
 * Genera under.js dal file Excel degli Under delle 56 squadre.
 *
 * Struttura output:
 *   var UNDER_BY_TEAM = {
 *     "ATHLETIC BILBAO": ["28117372","28121564", ...],
 *     ...
 *   };
 *
 * Uso:
 *   node build-under-from-xlsx.js [percorso.xlsx]
 *
 * Default (se non passi argomenti):
 *   %USERPROFILE%\\Downloads\\under.xlsx
 */

const fs = require('fs');
const path = require('path');

let XLSX;
try {
  XLSX = require('xlsx');
} catch (e) {
  console.error('Installa xlsx: npm install xlsx');
  process.exit(1);
}

const defaultXlsx = 'under.xlsx';
const xlsxPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(process.env.USERPROFILE || '', 'Downloads', defaultXlsx);

const outDir = __dirname;
const outJs = path.join(outDir, 'under.js');

function colIndex(headerRow, nameOrAliases) {
  const names = Array.isArray(nameOrAliases) ? nameOrAliases : [nameOrAliases];
  for (const name of names) {
    const i = headerRow.findIndex(
      (h) => String(h || '').trim().toLowerCase() === String(name).toLowerCase()
    );
    if (i >= 0) return i;
  }
  return -1;
}

if (!fs.existsSync(xlsxPath)) {
  console.error('File non trovato:', xlsxPath);
  console.error('Uso: node build-under-from-xlsx.js [percorso.xlsx]');
  process.exit(1);
}

console.log('Leggo file Under da:', xlsxPath);

const wb = XLSX.readFile(xlsxPath);
const firstSheet = wb.SheetNames[0];
const ws = wb.Sheets[firstSheet];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

if (!rows || rows.length < 2) {
  console.error('Foglio Under vuoto o senza dati.');
  process.exit(1);
}

const headerRow = rows[0].map((h) => String(h ?? '').trim());
const col = (nameOrAliases) => colIndex(headerRow, nameOrAliases);

// Proviamo a essere tolleranti sui nomi delle colonne
const idx = {
  squadra: col(['Squadra', 'Team', 'Club', 'Nome squadra']),
  id: col(['ID', 'Id', 'id giocatore', 'Giocatore ID', 'Player ID']),
};

if (idx.squadra < 0 || idx.id < 0) {
  console.error('Colonne obbligatorie non trovate.');
  console.error('Serve almeno una colonna "Squadra" e una "ID" (o equivalenti).');
  console.error('Intestazioni viste:', headerRow);
  process.exit(1);
}

const UNDER_BY_TEAM = {};

for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  if (!Array.isArray(row)) continue;

  const rawTeam = row[idx.squadra];
  const rawId = row[idx.id];

  const team = String(rawTeam || '').trim();
  const id = String(rawId || '').trim();

  if (!team || !id) continue;

  if (!UNDER_BY_TEAM[team]) UNDER_BY_TEAM[team] = [];

  // Evita duplicati sulla stessa squadra
  if (!UNDER_BY_TEAM[team].includes(id)) {
    UNDER_BY_TEAM[team].push(id);
  }
}

// Ordina gli ID all'interno di ogni squadra (solo per ordine stabile)
for (const team of Object.keys(UNDER_BY_TEAM)) {
  UNDER_BY_TEAM[team].sort((a, b) => {
    const na = Number(a);
    const nb = Number(b);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    return String(a).localeCompare(String(b));
  });
}

const jsContent =
  '// Under FMTO — generato da build-under-from-xlsx.js\n' +
  'var UNDER_BY_TEAM = ' +
  JSON.stringify(UNDER_BY_TEAM, null, 2) +
  ';\n';

fs.writeFileSync(outJs, jsContent, 'utf8');
console.log('Scritto', outJs, 'con', Object.keys(UNDER_BY_TEAM).length, 'squadre con Under.');

