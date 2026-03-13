// Build stipendi.js dai nuovi dati "stipendi aggiornati.csv" (ID;ING)
// - CSV separato da punto e virgola, con decimali separati da virgola (es. 2,4)
// - Colonne: ID ; ING  (ING = ingaggio in milioni)
// - Converte ING (milioni €) in valore interno stipendio:
//     stipendio = ING * 1.000.000  (es. 9,9 -> 9.900.000)

const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, 'stipendi aggiornati.csv');
const outPath = path.join(__dirname, 'stipendi.js');

function parseIngToStipendio(ingStr) {
  if (!ingStr) return null;
  const cleaned = String(ingStr).trim().replace(',', '.');
  const ing = parseFloat(cleaned);
  if (isNaN(ing)) return null;
  // ING è espresso in milioni di euro → riportiamo al valore pieno in euro
  const stipendio = Math.round(ing * 1_000_000);
  return stipendio > 0 ? stipendio : null;
}

if (!fs.existsSync(csvPath)) {
  console.error('File "stipendi aggiornati.csv" non trovato in', csvPath);
  process.exit(1);
}

const raw = fs.readFileSync(csvPath, 'utf8');
const lines = raw.split(/\r?\n/).filter(l => l.trim());
if (lines.length < 2) {
  console.error('CSV "stipendi aggiornati.csv" troppo corto (meno di 2 righe).');
  process.exit(1);
}

const headerParts = lines[0].split(';').map(h => h.trim());
const lower = headerParts.map(h => h.toLowerCase());
const idIdx = lower.findIndex(h => h === 'id' || h === 'ide');
const ingIdx = lower.findIndex(h => h === 'ing' || h === 'stipendio');

if (idIdx < 0 || ingIdx < 0) {
  console.error('CSV deve avere colonne "ID" e "ING". Intestazioni trovate:', headerParts);
  process.exit(1);
}

const STIPENDI_BY_ID = {};
let rows = 0;
let valid = 0;

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue;
  const parts = line.split(';');
  if (parts.length <= Math.max(idIdx, ingIdx)) continue;
  rows++;

  const id = String(parts[idIdx]).trim();
  const ingStr = parts[ingIdx];
  const stip = parseIngToStipendio(ingStr);
  if (!id || stip == null) continue;

  STIPENDI_BY_ID[id] = stip;
  valid++;
}

console.log('Righe lette da "stipendi aggiornati.csv":', rows);
console.log('Stipendi validi generati:', valid);

const jsContent =
  '// Stipendi FMTO — generato da build-stipendi-aggiornati.js (match su id)\n' +
  'var STIPENDI_BY_ID = ' + JSON.stringify(STIPENDI_BY_ID) + ';\n';

fs.writeFileSync(outPath, jsContent, 'utf8');
console.log('Scritto', outPath, 'con', Object.keys(STIPENDI_BY_ID).length, 'stipendi.');

