/**
 * Legge "calendario 26_1.xlsx" — Calendario attività giornaliere.
 * Struttura foglio: A = Data, B = Giorno settimana, C-E = Griglia giornate (campionato/coppe), G = Mercato
 *
 * Uso: npm install xlsx   poi   node build-calendario.js
 */

const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const XLSX_PATH = path.join(DIR, 'calendario 26_1.xlsx');
const OUT_JS = path.join(DIR, 'calendario-26_1.js');

function cellStr(val) {
  if (val == null || val === '') return '';
  if (typeof val === 'object' && val instanceof Date) return val.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return String(val).trim();
}

function run() {
  if (!fs.existsSync(XLSX_PATH)) {
    console.error('File non trovato:', XLSX_PATH);
    console.error('Inserisci "calendario 26_1.xlsx" nella cartella del sito e riesegui.');
    process.exit(1);
  }

  let XLSX;
  try {
    XLSX = require('xlsx');
  } catch (e) {
    console.error('Installa xlsx: npm install xlsx');
    process.exit(1);
  }

  const wb = XLSX.readFile(XLSX_PATH, { cellDates: true });
  const firstSheet = wb.SheetNames[0];
  const ws = wb.Sheets[firstSheet];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: false });

  if (!data.length) {
    console.error('Foglio vuoto.');
    process.exit(1);
  }

  // Prima riga = intestazioni (A=Data, B=Giorno, C,D,E=Griglia giornate, G=Mercato)
  const header = data[0].map(c => cellStr(c));
  const rows = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const dataVal = row[0];
    const giorno = cellStr(row[1]);
    const griglia = [
      cellStr(row[2]),
      cellStr(row[3]),
      cellStr(row[4])
    ];
    const mercato = cellStr(row[6]); // colonna G = indice 6

    rows.push({
      data: dataVal != null && dataVal !== '' ? cellStr(dataVal) : '',
      giorno: giorno,
      griglia: griglia,
      mercato: mercato
    });
  }

  // Etichette colonne C, D, E (dalla prima riga del foglio)
  const headerGriglia = [
    header[2] || 'Giornata 1',
    header[3] || 'Giornata 2',
    header[4] || 'Giornata 3'
  ];

  const out = {
    headerGriglia: headerGriglia,
    rows: rows
  };

  const js = '// Calendario attività Stagione 26_1 — generato da build-calendario.js\nvar CALENDARIO_26_1 = ' + JSON.stringify(out, null, 2) + ';\n';
  fs.writeFileSync(OUT_JS, js, 'utf8');
  console.log('Scritto', rows.length, 'righe in', OUT_JS);
}

run();
