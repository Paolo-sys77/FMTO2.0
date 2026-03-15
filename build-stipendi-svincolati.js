// Aggiorna gli stipendi degli svincolati dal file Excel "db enore 12-03-26 senza fmto solo stipendi.xlsx"
// - Legge ID e Stipendio (o ING); cella vuota = 0
// - Se il valore è < 10000 viene interpretato come milioni (es. 2,5 → 2.500.000)
// - Merge con stipendi.js esistente: aggiorna/aggiunge solo gli ID presenti nel file

const fs = require('fs');
const path = require('path');

const xlsxPath = path.join(process.env.USERPROFILE || '', 'Downloads', 'db enore 12-03-26 senza fmto solo stipendi.xlsx');
const stipendiPath = path.join(__dirname, 'stipendi.js');

function parseStipendio(val) {
  if (val === null || val === undefined || val === '') return 0;
  const s = String(val).trim().replace(',', '.');
  if (!s) return 0;
  const n = parseFloat(s);
  if (isNaN(n)) return 0;
  // Valori piccoli = milioni (es. 2,5 → 2.500.000), altrimenti euro
  const stip = n < 10000 ? Math.round(n * 1_000_000) : Math.round(n);
  return stip >= 0 ? stip : 0;
}

// Carica stipendi.js esistente e estrai STIPENDI_BY_ID
let existing = {};
if (fs.existsSync(stipendiPath)) {
  const content = fs.readFileSync(stipendiPath, 'utf8');
  const match = content.match(/var\s+STIPENDI_BY_ID\s*=\s*(\{[\s\S]*\});/);
  if (match) {
    try {
      existing = JSON.parse(match[1]);
    } catch (e) {
      console.warn('Impossibile parsare stipendi.js, si parte da vuoto.');
    }
  }
}

if (!fs.existsSync(xlsxPath)) {
  console.error('File Excel non trovato:', xlsxPath);
  process.exit(1);
}

let XLSX;
try {
  XLSX = require('xlsx');
} catch (e) {
  console.error('Installa il pacchetto xlsx: npm install xlsx');
  process.exit(1);
}

const wb = XLSX.readFile(xlsxPath);
const firstSheet = wb.SheetNames[0];
const ws = wb.Sheets[firstSheet];
const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

if (!data.length) {
  console.error('Foglio Excel vuoto.');
  process.exit(1);
}

const header = (data[0] || []).map(h => String(h || '').trim());
const lower = header.map(h => h.toLowerCase());
const idCol = lower.findIndex(h => h === 'id' || h === 'ide' || h === 'uid');
const stipCol = lower.findIndex(h => h === 'stipendio' || h === 'ing' || h === 'salario' || h === 'salary');

if (idCol < 0) {
  console.error('Colonna ID non trovata. Intestazioni:', header);
  process.exit(1);
}
if (stipCol < 0) {
  console.error('Colonna Stipendio/ING non trovata. Intestazioni:', header);
  process.exit(1);
}

const updated = { ...existing };
let rows = 0;
let zeros = 0;

for (let i = 1; i < data.length; i++) {
  const row = data[i] || [];
  const id = String(row[idCol] != null ? row[idCol] : '').trim();
  if (!id) continue;
  rows++;
  const rawStip = row[stipCol];
  const stip = parseStipendio(rawStip);
  if (stip === 0) zeros++;
  updated[id] = stip;
}

const jsContent =
  '// Stipendi FMTO — generato da build-stipendi-aggiornati.js + build-stipendi-svincolati.js (svincolati da xlsx)\n' +
  'var STIPENDI_BY_ID = ' + JSON.stringify(updated) + ';\n';

fs.writeFileSync(stipendiPath, jsContent, 'utf8');
console.log('Aggiornati stipendi da', xlsxPath);
console.log('Righe svincolati elaborate:', rows, '(celle vuote → 0:', zeros + ')');
console.log('Totale voci in stipendi.js:', Object.keys(updated).length);
console.log('Scritto', stipendiPath);
