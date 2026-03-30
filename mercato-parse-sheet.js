/**
 * Legge il primo foglio mercato: colonne GIOCATORE, CEDENTE, CESSIONARIA (ordine qualsiasi),
 * poi colonne «tipo scambio» dall’indice dopo max(GIO,CED,CESS) fino alla colonna COSTO/CR (esclusa),
 * poi COSTO CR, poi note. Supporta più colonne tipo/note e seconda riga intestazioni.
 */
const XLSX = require('xlsx');

function normH(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function colIndex(headers, candidates, fallbackIdx) {
  const H = headers.map((h) => normH(h));
  for (let k = 0; k < candidates.length; k++) {
    const want = normH(candidates[k]);
    const i = H.findIndex((h) => h === want || h.includes(want) || want.includes(h));
    if (i >= 0) return i;
  }
  return fallbackIdx;
}

function cell(line, i) {
  if (i == null || i < 0) return '';
  return line[i] != null && line[i] !== '' ? String(line[i]).trim() : '';
}

function looksLikePlayerName(s) {
  const t = String(s || '').trim();
  return t.length > 2 && /[A-Za-zÀ-ÿ]/.test(t);
}

/** Etichetta unendo riga 1 e riga 2 intestazione per colonna c */
function headLabel(h0, h1, c, dataStart) {
  const a = cell(h0, c);
  const b = dataStart === 2 ? cell(h1, c) : '';
  if (a && b) return a + ' – ' + b;
  return a || b || '';
}

/**
 * @returns {{ rows: Array, intestazioni: { tipo: string[], costo: string, note: string[], headerRows: number } | null }}
 */
function parseMercatoRows(wb) {
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  if (!raw.length) return { rows: [], intestazioni: null };

  const h0 = raw[0];
  const h1 = raw.length > 1 ? raw[1] : [];

  let dataStart = 1;
  if (h1.length && !looksLikePlayerName(h1[0])) {
    dataStart = 2;
  }

  const iG = colIndex(h0, ['GIOCATORE'], 0);
  const iCess = colIndex(h0, ['CESSIONARIA'], 1);
  const iCed = colIndex(h0, ['CEDENTE'], 2);
  const afterTeamCols = Math.max(iG, iCed, iCess);

  let iCosto = colIndex(
    h0,
    ['COSTO CR', 'COSTO IN CR', 'COSTO (CR)', 'CR', 'COSTO'],
    Math.min(4, Math.max(afterTeamCols + 1, 3))
  );
  if (iCosto <= iCed) iCosto = iCed + 1;
  if (iCosto <= iCess) iCosto = iCess + 1;
  if (iCosto <= iCed) iCosto = Math.min(iCed + 2, 99);
  if (iCosto <= afterTeamCols) {
    iCosto = colIndex(
      h0,
      ['COSTO CR', 'COSTO IN CR', 'COSTO (CR)', 'CR', 'COSTO'],
      afterTeamCols + 1
    );
  }

  const sheetWidth = Math.max(
    h0.length,
    h1.length,
    ...raw.slice(dataStart).map((r) => (r && r.length) || 0)
  );

  /** Colonne «tipo scambio»: dopo l’ultima tra GIOCATORE / CEDENTE / CESSIONARIA, fino a (esclusa) COSTO CR. */
  const tipoCols = [];
  for (let c = afterTeamCols + 1; c < iCosto && c < sheetWidth; c++) {
    tipoCols.push(c);
  }
  if (tipoCols.length === 0 && afterTeamCols + 1 < iCosto) {
    for (let c = afterTeamCols + 1; c < iCosto; c++) tipoCols.push(c);
  }
  if (tipoCols.length === 0 && afterTeamCols + 1 < sheetWidth) {
    tipoCols.push(afterTeamCols + 1);
  }

  const noteCols = [];
  for (let c = iCosto + 1; c < sheetWidth; c++) {
    noteCols.push(c);
  }
  if (noteCols.length === 0 && iCosto + 1 < sheetWidth) {
    noteCols.push(iCosto + 1);
  }

  const tipoLabels = tipoCols.map((c) => headLabel(h0, h1, c, dataStart)).map((lab, j) => lab || 'Tipo (' + (j + 1) + ')');
  const costoLabel = headLabel(h0, h1, iCosto, dataStart) || 'Costo (CR)';
  const noteLabels = noteCols.map((c) => headLabel(h0, h1, c, dataStart)).map((lab, j) => lab || 'Note (' + (j + 1) + ')');

  const intestazioni = {
    headerRows: dataStart,
    tipo: tipoLabels,
    costo: costoLabel,
    note: noteLabels,
  };

  const out = [];
  for (let r = dataStart; r < raw.length; r++) {
    const line = raw[r];
    const giocatore = cell(line, iG);
    const cessionaria = cell(line, iCess);
    const cedente = cell(line, iCed);

    const tipoRighe = tipoCols.map((c) => cell(line, c));
    const costoCr = cell(line, iCosto);
    const noteRighe = noteCols.map((c) => cell(line, c));

    const TIPO_SCAMBIO = tipoRighe.filter(Boolean).join('\n');
    const NOTE = noteRighe.filter(Boolean).join('\n');

    if (!giocatore && !cedente && !cessionaria) continue;

    out.push({
      GIOCATORE: giocatore,
      CESSIONARIA: cessionaria,
      CEDENTE: cedente,
      TIPO_SCAMBIO,
      COSTO_CR: costoCr,
      NOTE,
      TIPO_RIGHE: tipoRighe,
      NOTE_RIGHE: noteRighe,
      _row: r + 1,
    });
  }

  return { rows: out, intestazioni };
}

module.exports = { parseMercatoRows };
