/** Parquet svincolati letto nel browser con DuckDB-WASM (nessuna conversione a JS in build).
 *  Percorso relativo al sito, es. data/svincolati.parquet. Stringa vuota = non usare Parquet.
 */
var SVINCOLATI_PARQUET_URL = 'data/svincolati.parquet';

/** Opzionale: true = scouting svincolati usa anche Supabase (anche con Parquet). Se omesso: con Parquet non si chiama Supabase. */
// var SVINCOLATI_USE_SUPABASE = true;

/** File JSON svincolati (fallback se Parquet e/o Supabase non disponibili).
 *  Su GitHub Pages: pubblica svincolati.json nella root oppure imposta un URL assoluto.
 */
var SVINCOLATI_DATA_URL = 'svincolati.json';

/** Configurazione Supabase (area riservata / watchlist; svincolati in scouting solo se sopra decommenti SVINCOLATI_USE_SUPABASE).
 */
var SUPABASE_URL = 'https://mmbqekchrorobqwitisv.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tYnFla2Nocm9yb2Jxd2l0aXN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NDcyMTMsImV4cCI6MjA4OTIyMzIxM30.JacFrD7Y3-RE8uxlHZyx6U0w6z2lY07IrIdZfGfSMTI';
var SVINCOLATI_TABLE = 'Svincolati';

/** Tabella Supabase per sincronizzazione watchlist (cross-device).
 *  Richiede una tabella con chiave unica su sq_id (vedi README/istruzioni).
 */
var WATCHLIST_TABLE = 'watchlists';