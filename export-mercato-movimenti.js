/**
 * Rigenera solo mercato-movimenti.js da Excel (non modifica players.js).
 * Uso: node export-mercato-movimenti.js
 */
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { parseMercatoRows } = require('./mercato-parse-sheet');

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

const XLSX_PATH = resolveMercatoXlsxPath();
if (!fs.existsSync(XLSX_PATH)) {
  console.error('File Excel non trovato. Metti mercato 26_2.xlsx (o mercato 26_.xlsx) nella cartella del sito.');
  process.exit(1);
}

const wb = XLSX.readFile(XLSX_PATH);
const { rows, intestazioni } = parseMercatoRows(wb);
const righe = rows.map((row) => ({
  n: row._row,
  giocatore: row.GIOCATORE,
  cedente: row.CEDENTE,
  cessionaria: row.CESSIONARIA,
  tipo: row.TIPO_SCAMBIO || '',
  tipoRighe: Array.isArray(row.TIPO_RIGHE) ? row.TIPO_RIGHE : [],
  costoCr: row.COSTO_CR || '',
  note: row.NOTE || '',
  noteRighe: Array.isArray(row.NOTE_RIGHE) ? row.NOTE_RIGHE : [],
}));

const payload = {
  fonte: path.basename(XLSX_PATH),
  generatoIso: new Date().toISOString(),
  intestazioni: intestazioni || null,
  righe,
};
fs.writeFileSync(
  path.join(__dirname, 'mercato-movimenti.js'),
  'window.MERCATO_MOVIMENTI = ' + JSON.stringify(payload) + ';\n',
  'utf8'
);
console.log('mercato-movimenti.js aggiornato:', righe.length, 'righe da', XLSX_PATH);
