/**
 * Genera:
 * - svincolati-data.js (primi 1000) per pagina Squadre
 * - svincolati-scouting.js (TUTTI i giocatori del file) per Scouting → Solo svincolati
 * Esegui: node build-svincolati-inline.js
 */

const fs = require('fs');
const path = require('path');

const MAX_PAGE = 1000;
const dir = __dirname;
const jsonPath = path.join(dir, 'svincolati.json');
const outData = path.join(dir, 'svincolati-data.js');
const outScouting = path.join(dir, 'svincolati-scouting.js');

let list = [];
if (fs.existsSync(jsonPath)) {
  try {
    const raw = fs.readFileSync(jsonPath, 'utf8');
    const data = JSON.parse(raw);
    list = Array.isArray(data) ? data : (data && (data.players || data.data)) || [];
  } catch (e) {
    console.error('Errore lettura svincolati.json:', e.message);
  }
}

const first1000 = list.slice(0, MAX_PAGE);
fs.writeFileSync(outData, 'window.SVINCOLATI_INLINE = ' + JSON.stringify(first1000) + ';\n', 'utf8');
console.log('Scritto svincolati-data.js con', first1000.length, 'giocatori (max', MAX_PAGE, ').');

fs.writeFileSync(outScouting, 'window.SVINCOLATI_SCOUTING = ' + JSON.stringify(list) + ';\n', 'utf8');
console.log('Scritto svincolati-scouting.js con', list.length, 'giocatori (tutti dal file).');
