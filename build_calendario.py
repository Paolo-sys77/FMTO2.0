# Legge calendario 26_1.xlsx (A=Data, B=Giorno, C-E=Griglia, G=Mercato) e genera calendario-26_1.js
# Uso: python build_calendario.py

import json
import zipfile
import xml.etree.ElementTree as ET
import re
from datetime import datetime, timedelta

XLSX = "calendario 26_1.xlsx"
OUT_JS = "calendario-26_1.js"
NS = {"main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}

def excel_date(serial):
    if not serial or not str(serial).replace(".", "").isdigit():
        return ""
    try:
        n = int(float(serial))
        return (datetime(1899, 12, 30) + timedelta(days=n)).strftime("%d/%m/%Y")
    except Exception:
        return str(serial)

def get_shared_strings(z):
    with z.open("xl/sharedStrings.xml") as f:
        root = ET.parse(f).getroot()
        strings = []
        for si in root.findall("main:si", NS):
            t = si.find("main:t", NS)
            if t is not None and t.text:
                strings.append(t.text)
            else:
                parts = []
                for r in si.findall("main:r", NS):
                    t2 = r.find("main:t", NS)
                    if t2 is not None and t2.text:
                        parts.append(t2.text)
                strings.append("".join(parts) if parts else "")
        return strings

def col_index(ref):
    # A1 -> (0, 0), B2 -> (1, 1), G1 -> (6, 0)
    m = re.match(r"^([A-Z]+)(\d+)$", ref)
    if not m:
        return -1, -1
    col, row = m.group(1), int(m.group(2))
    c = 0
    for ch in col:
        c = c * 26 + (ord(ch) - ord("A") + 1)
    return c - 1, row - 1

def main():
    with zipfile.ZipFile(XLSX, "r") as z:
        strings = get_shared_strings(z)
        with z.open("xl/worksheets/sheet1.xml") as f:
            root = ET.parse(f).getroot()
            sheet_data = root.find("main:sheetData", NS)
            if sheet_data is None:
                sheet_data = root.find(".//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}sheetData")
            rows_by_num = {}
            for row in sheet_data.findall("main:row", NS) if sheet_data is not None else []:
                r = int(row.get("r", 0))
                rows_by_num[r] = {}
                for c in row.findall("main:c", NS):
                    ref = c.get("r", "")
                    ci, ri = col_index(ref)
                    if ci < 0:
                        continue
                    v = c.find("main:v", NS)
                    val = v.text if v is not None and v.text else ""
                    if c.get("t") == "s" and val.isdigit():
                        idx = int(val)
                        val = strings[idx] if idx < len(strings) else ""
                    rows_by_num[r][ci] = val

    max_row = max(rows_by_num.keys()) if rows_by_num else 0
    # Prima riga (r=1) = intestazioni
    header = rows_by_num.get(1, {})
    header_griglia = [
        header.get(2, "Campionato"),
        header.get(3, "Coppa FMTO"),
        header.get(4, "Coppe Europee"),
    ]
    out_rows = []
    for r in range(2, max_row + 1):
        row = rows_by_num.get(r, {})
        data_val = row.get(0, "")
        if isinstance(data_val, str) and data_val.isdigit():
            data_val = excel_date(data_val)
        giorno = (row.get(1) or "").strip()
        griglia = [
            (row.get(2) or "").strip(),
            (row.get(3) or "").strip(),
            (row.get(4) or "").strip(),
        ]
        mercato = (row.get(6) or "").strip()
        out_rows.append({
            "data": data_val,
            "giorno": giorno,
            "griglia": griglia,
            "mercato": mercato,
        })

    out = {"headerGriglia": header_griglia, "rows": out_rows}
    js = "// Calendario attività Stagione 26_1 — generato da build_calendario.py\nvar CALENDARIO_26_1 = " + json.dumps(out, ensure_ascii=False, indent=2) + ";\n"
    with open(OUT_JS, "w", encoding="utf-8") as f:
        f.write(js)
    print("Scritto", len(out_rows), "righe in", OUT_JS)

if __name__ == "__main__":
    main()
