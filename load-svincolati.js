/**
 * Carica gli svincolati: prima da svincolati-data.js (funziona senza server, file://),
 * altrimenti da fetch (svincolati.json/.gz). Primi 1000 giocatori. Schede identiche alle 56 squadre.
 */
(function () {
  var SVINCOLATI_MAX = 1000;

  function setExtra(data) {
    var list = Array.isArray(data) ? data : (data && (data.players || data.data));
    if (!Array.isArray(list)) list = [];
    var first1000 = list.slice(0, SVINCOLATI_MAX);
    window.SVINCOLATI_EXTRA = first1000;
    if (typeof PLAYERS_BY_TEAM !== 'undefined') {
      PLAYERS_BY_TEAM['SVINCOLATI'] = first1000;
    }
  }

  function fail() {
    window.SVINCOLATI_EXTRA = [];
    if (typeof PLAYERS_BY_TEAM !== 'undefined') {
      PLAYERS_BY_TEAM['SVINCOLATI'] = [];
    }
    return Promise.resolve();
  }

  if (typeof window.SVINCOLATI_INLINE !== 'undefined' && Array.isArray(window.SVINCOLATI_INLINE)) {
    setExtra(window.SVINCOLATI_INLINE);
    window.SVINCOLATI_READY = Promise.resolve();
    return;
  }

  var url = (typeof SVINCOLATI_DATA_URL !== 'undefined' && SVINCOLATI_DATA_URL)
    ? SVINCOLATI_DATA_URL
    : 'svincolati.json';
  var isGz = url.toLowerCase().indexOf('.gz') !== -1;

  if (isGz) {
    window.SVINCOLATI_READY = fetch(url)
      .then(function (response) {
        if (!response.ok) throw new Error('fetch');
        if (response.headers.get('Content-Encoding') === 'gzip') {
          return response.text();
        }
        if (!response.body || typeof DecompressionStream === 'undefined') throw new Error('unsupported');
        return new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).text();
      })
      .then(function (text) { setExtra(JSON.parse(text)); })
      .catch(fail);
  } else {
    window.SVINCOLATI_READY = fetch(url)
      .then(function (r) { return r.json(); })
      .then(setExtra)
      .catch(fail);
  }
})();
