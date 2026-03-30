const fs = require("fs");

// Leggi il CSV
const csv = fs.readFileSync("svincolati.csv", "utf-8");
const lines = csv.split("\n");
const headers = lines[0].split(",");

console.log(`Righe: ${lines.length - 1}`);
console.log(`Colonne: ${headers}`);