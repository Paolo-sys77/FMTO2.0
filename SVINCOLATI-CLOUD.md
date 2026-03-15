# Dati svincolati (JSON dalla release GitHub)

Il sito carica i dati degli svincolati dalla **release GitHub** [v1.0](https://github.com/Paolo-sys77/FMTO2.0/releases/tag/v1.0) (file `svincolati.json`). L'URL è impostato in `config.js`.

- **Produzione**: non serve fare nulla; si usa il JSON dalla release.
- **Sviluppo locale con file .js**: in `config.js` imposta:
  ```js
  var SVINCOLATI_CSV_SCRIPT_URL = 'svincolati-csv.js';
  ```
  e genera il file con `node build-svincolati.js` (il file resta in `.gitignore`).

**Per aggiornare i dati in produzione:** genera `svincolati-csv.js`, estrai l'array (stesso contenuto del JSON), salvalo come `svincolati.json` e caricalo nella release GitHub (nuova release o sostituendo l'asset nella v1.0). Poi aggiorna l'URL in `config.js` se usi un'altra release/tag.

**CORS:** GitHub permette richieste cross-origin per i file delle release; se il fetch fallisce, verifica che l'URL sia pubblico e che il JSON sia un array di oggetti giocatore.
