const fs = require('fs');
const src = fs.readFileSync('svincolati-csv.js', 'utf8');
const match = src.match(/(?:const|var|let)\s+SVINCOLATI_EXTRA\s*=\s*(\[[\s\S]*\])/);
if (!match) { console.log('ERRORE: variabile non trovata'); process.exit(1); }
const json = JSON.stringify(JSON.parse(match[1]));
fs.writeFileSync('svincolati.json', json);
console.log('OK - svincolati.json creato');
