/**
 * Carica i dati svincolati da URL in config (JSON dalla release GitHub o .js locale).
 * Definisce window.SVINCOLATI_READY (Promise) e window.SVINCOLATI_EXTRA (array).
 */
(function () {
  var url = (typeof SVINCOLATI_CSV_SCRIPT_URL !== 'undefined' && SVINCOLATI_CSV_SCRIPT_URL)
    ? SVINCOLATI_CSV_SCRIPT_URL
    : 'svincolati-csv.js';

  if (url.toLowerCase().indexOf('.json') !== -1) {
    window.SVINCOLATI_READY = fetch(url)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        window.SVINCOLATI_EXTRA = Array.isArray(data) ? data : (data.players || data.data || []);
      })
      .catch(function () {
        window.SVINCOLATI_EXTRA = [];
        return Promise.resolve();
      });
  } else {
    document.write('<script src="' + url + '"><\/script>');
    window.SVINCOLATI_READY = Promise.resolve();
  }
})();
