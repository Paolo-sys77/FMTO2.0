/** URL dati svincolati legacy (non più usato con Supabase, lasciato per compatibilità eventuale)
 *  Puoi lasciarlo così o rimuoverlo se non usi più i file locali.
 */
var SVINCOLATI_DATA_URL = 'svincolati.json';

/** Configurazione Supabase per svincolati (usata da scouting.html)
 *  Sostituisci SUPABASE_ANON_KEY con la tua chiave anon pubblica dal progetto Supabase.
 */
var SUPABASE_URL = 'https://mmbqekchrorobqwitisv.supabase.co';
var SUPABASE_ANON_KEY = 'INSERISCI_CHIAVE_ANON_SUPABASE';
// Nome tabella Supabase con gli svincolati (nel tuo progetto è \"Fmto 2.0\")
// Verrà URL-encodato nelle chiamate REST, quindi gli spazi non sono un problema.
var SVINCOLATI_TABLE = 'Fmto 2.0';
