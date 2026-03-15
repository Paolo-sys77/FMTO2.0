// Legge under.xlsx (ID, Nome, Squadra) e genera under-by-squad.js
// Ogni riga: giocatore con quell'ID va nella sezione Under della squadra indicata.
// Output: UNDER_PLAYER_IDS_BY_SQUAD = { "ARSENAL": ["2000046214", ...], ... }

const fs = require('fs');
const path = require('path');

const xlsxPath = path.join(process.env.USERPROFILE || '', 'Downloads', 'under.xlsx');
const outPath = path.join(__dirname, 'under-by-squad.js');

if (!fs.existsSync(xlsxPath)) {
  console.error('File non trovato:', xlsxPath);
  process.exit(1);
}

let XLSX;
try {
  XLSX = require('xlsx');
} catch (e) {
  console.error('Installa xlsx: npm install xlsx');
  process.exit(1);
}

const wb = XLSX.readFile(xlsxPath);
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

if (!data.length) {
  console.error('Foglio vuoto.');
  process.exit(1);
}

const header = (data[0] || []).map(h => String(h || '').trim());
const lower = header.map(h => h.toLowerCase());
const idCol = lower.findIndex(h => h === 'id' || h === 'ide' || h === 'uid');
const squadCol = lower.findIndex(h => h === 'squadra' || h === 'squad' || h === 'team' || h === 'club' || h === 'squadra appartenenza');

if (idCol < 0) {
  console.error('Colonna ID non trovata. Intestazioni:', header);
  process.exit(1);
}
if (squadCol < 0) {
  console.error('Colonna Squadra non trovata. Intestazioni:', header);
  process.exit(1);
}

const bySquad = {};

for (let i = 1; i < data.length; i++) {
  const row = data[i] || [];
  const id = String(row[idCol] != null ? row[idCol] : '').trim();
  let squad = String(row[squadCol] != null ? row[squadCol] : '').trim().toUpperCase();
  if (!id) continue;
  if (!squad) squad = 'SVINCOLATI';
  if (!bySquad[squad]) bySquad[squad] = [];
  if (bySquad[squad].indexOf(id) === -1) bySquad[squad].push(id);
}

const jsContent =
  '// Under per squadra — generato da build-under.js (da under.xlsx)\n' +
  'var UNDER_PLAYER_IDS_BY_SQUAD = ' + JSON.stringify(bySquad) + ';\n';

fs.writeFileSync(outPath, jsContent, 'utf8');
const total = Object.values(bySquad).reduce((s, arr) => s + arr.length, 0);
console.log('Scritto', outPath, '—', total, 'giocatori Under in', Object.keys(bySquad).length, 'squadre.');
console.log('Esempio:', Object.keys(bySquad)[0], '→', (bySquad[Object.keys(bySquad)[0]] || []).length, 'giocatori');