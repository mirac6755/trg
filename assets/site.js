/* Turgut Realty Gate – Menü und Einwilligungsverwaltung (§ 25 TDDDG, Art. 6 Abs. 1 lit. a DSGVO)
   Google Analytics und Google Maps werden erst nach ausdrücklicher Einwilligung geladen. */
(function () {
  'use strict';

  // Google-Analytics-4-Mess-ID eintragen (z. B. "G-AB12CD34EF"). Solange leer, wird nichts geladen.
  var GA_ID = '';
  var KEY = 'trg-consent-v1';
  var MAP_SRC = 'https://www.google.com/maps?q=Kolpingstra%C3%9Fe+4,+68165+Mannheim&z=15&output=embed';

  /* ---------- Menü ---------- */
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  if (btn && nav) {
    var setMenu = function (open) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
      nav.classList.toggle('open', open);
      var sh = document.querySelector('.site-head'); if (sh) sh.classList.toggle('menu-on', open);
      document.body.classList.toggle('menu-open', open);
    };
    btn.addEventListener('click', function () { setMenu(btn.getAttribute('aria-expanded') !== 'true'); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }

  /* ---------- Titelfoto (Pfad im data-photo-Attribut von .stage-bg) ---------- */
  var bg = document.querySelector('.stage-bg[data-photo]');
  if (bg && bg.getAttribute('data-photo')) {
    bg.classList.add('photo');
    bg.style.backgroundImage = 'url("' + bg.getAttribute('data-photo') + '")';
  }

  /* ---------- Neue Seite immer oben beginnen (außer bei Sprungmarke) ---------- */
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
  if (!location.hash) window.scrollTo(0, 0);
  window.addEventListener('pageshow', function () { if (!location.hash) window.scrollTo(0, 0); });
  document.addEventListener('click', function (e) {
    var l = e.target.closest('a[href]');
    if (!l || l.target === '_blank') return;
    var h = l.getAttribute('href');
    if (/^(https?:|mailto:|tel:|#)/.test(h)) return;
    // Link auf die aktuell geöffnete Seite: nur nach oben scrollen
    var here = location.pathname.split('/').pop() || 'index.html';
    var to = h.split('#')[0] || here;
    if (to === here || (to === './' && here === 'index.html')) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  });

  /* ---------- Logo in die Kopfzeile, sobald das große Logo im Titelbild hinter der Leiste verschwunden ist ---------- */
  var stage = document.querySelector('.stage .mark');
  var siteHead = document.querySelector('.site-head');
  if (stage && siteHead) {
    document.documentElement.classList.add('has-stage');
    var check = function () {
      var r = stage.getBoundingClientRect();
      siteHead.classList.toggle('show-mark', r.bottom <= siteHead.offsetHeight + 1);
    };
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    check();
  }



  /* ---------- Motto und Logo an feste Stellen im Foto setzen (Häuser bleiben frei) ---------- */
  // Foto 2276 x 1509 px, "cover" oben ausgerichtet. Motto-Mitte bei y 565, Logo-Oberkante am Betonfundament bei y 790.
  var IMG_W = 2276, IMG_H = 1509, CLAIM_Y = 565, MARK_Y = 790;
  // Handy-Foto 1020 x 2217 px: Motto knapp über den Baumkronen (y 785), Logo unter dem Betonfundament (y 1115).
  var M_W = 1020, M_H = 2217, M_CLAIM_Y = 785, M_MARK_Y = 1115;
  var fitToPhoto = function () {
    var stg = document.querySelector('.stage'), nm = document.querySelector('.stage-name'), cl = document.querySelector('.stage-claim');
    if (!stg || !nm || !cl || !logo) return;
    [nm, cl, logo].forEach(function (e) { e.style.transform = ''; });
    var mob = window.innerWidth <= 640, W = mob ? M_W : IMG_W, H = mob ? M_H : IMG_H;
    var claimY = mob ? M_CLAIM_Y : CLAIM_Y, markY = mob ? M_MARK_Y : MARK_Y;
    var sr = stg.getBoundingClientRect(), s = Math.max(sr.width / W, sr.height / H);
    var hh = (document.querySelector('.site-head') || {}).offsetHeight || 80;
    var c = cl.getBoundingClientRect(), n = nm.getBoundingClientRect(), m = logo.getBoundingClientRect();
    var dText = (sr.top + claimY * s) - (c.top + c.height / 2);
    dText = Math.max(dText, sr.top + hh + 24 - n.top);                 // Name nie unter die Menüleiste
    var dMark = (sr.top + markY * s) - m.top;
    dMark = Math.max(dMark, c.bottom + dText + 24 - m.top);            // Logo nie ins Motto
    var offerEl = document.querySelector('.stage-offer');
    var floor = offerEl ? offerEl.getBoundingClientRect().top - 16 : sr.bottom - 30;
    dMark = Math.min(dMark, floor - m.bottom);                          // Logo über dem 50-%-Siegel lassen
    nm.style.transform = cl.style.transform = 'translateY(' + Math.round(dText) + 'px)';
    logo.style.transform = 'translateY(' + Math.round(dMark) + 'px)';
  };

  /* ---------- Titelbild: Positionen bei Größenänderung neu setzen ---------- */
  var offer = document.querySelector('.stage-offer'), logo = document.querySelector('.stage .mark');
  if (offer && logo) {
    var placeOffer = function () {
      fitToPhoto();
      // 50-%-Knopf ist jetzt fest unten rechts über dem WhatsApp-Knopf – keine Positionierung mehr nötig
    };
    window.addEventListener('resize', placeOffer);
    window.addEventListener('load', placeOffer);
    placeOffer();
  }

  /* ---------- Kontaktformular: Anliegen aus dem Link vorauswählen (?anliegen=bewertung) ---------- */
  var topic = document.getElementById('f-topic');
  if (topic) {
    var want = (location.search.match(/[?&]anliegen=([a-z]+)/) || [])[1];
    var map = { bewertung: 'Kostenfreie Bewertung', verkauf: 'Verkauf', suchprofil: 'Ankauf / Suchprofil', vermietung: 'Vermietung' };
    if (want && map[want]) topic.value = map[want];
  }

  /* ---------- Ersparnisrechner: übliche Gesamtprovision 7,14 %, bei uns rund die Hälfte ---------- */
  var calcs = document.querySelectorAll('[data-calc]');
  var eur = function (v) { return Math.round(v).toLocaleString('de-DE') + ' €'; };
  for (var c = 0; c < calcs.length; c++) (function (box) {
    var range = box.querySelector('input[type=range]');
    var out = function (k) { return box.querySelector('[data-out="' + k + '"]'); };
    var upd = function () {
      var price = Number(range.value), usual = price * 0.0714, ours = usual / 2;
      out('price').textContent = price.toLocaleString('de-DE') + ' €';
      out('usual').textContent = eur(usual);
      out('ours').textContent = eur(ours);
      out('save').textContent = eur(usual - ours);
    };
    range.addEventListener('input', upd);
    upd();
  })(calcs[c]);

  /* ---------- Menüleiste: auf dem Titelbild durchsichtig, danach grün ---------- */
  var stageBox = document.querySelector('.stage') || document.querySelector('.page-hero');
  var bar = document.querySelector('.site-head');
  if (stageBox && bar) {
    document.documentElement.classList.add('photo-top');
    var past = function () { bar.classList.toggle('past-stage', stageBox.getBoundingClientRect().bottom <= bar.offsetHeight); };
    window.addEventListener('scroll', past, { passive: true });
    window.addEventListener('resize', past);
    past();
  }

  /* ---------- WhatsApp-Knopf erst nach dem Herunterscrollen ---------- */
  var scrolled = function () { document.documentElement.classList.toggle('scrolled', window.scrollY > 120); };
  window.addEventListener('scroll', scrolled, { passive: true });
  scrolled();

  var y = document.querySelectorAll('[data-year]');
  for (var i = 0; i < y.length; i++) y[i].textContent = new Date().getFullYear();

  /* ---------- Einwilligung ---------- */
  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; }
  }
  function write(c) {
    c.ts = new Date().toISOString();
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {}
  }

  function loadAnalytics() {
    if (!GA_ID || window.__gaLoaded) return;
    window.__gaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { anonymize_ip: true });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
    document.head.appendChild(s);
  }

  function loadMaps() {
    var boxes = document.querySelectorAll('.map');
    for (var i = 0; i < boxes.length; i++) {
      if (boxes[i].querySelector('iframe')) continue;
      var f = document.createElement('iframe');
      f.src = MAP_SRC;
      f.title = 'Karte: Kolpingstraße 4, 68165 Mannheim';
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      boxes[i].innerHTML = '';
      boxes[i].appendChild(f);
    }
  }

  function apply(c) {
    if (!c) return;
    if (c.analytics) loadAnalytics();
    if (c.maps) loadMaps();
  }

  var banner = document.getElementById('consent');
  var optA = document.getElementById('c-analytics');
  var optM = document.getElementById('c-maps');

  function openBanner(details) {
    if (!banner) return;
    var c = read() || {};
    if (optA) optA.checked = !!c.analytics;
    if (optM) optM.checked = !!c.maps;
    banner.classList.add('show');
    banner.classList.toggle('details', !!details);
  }
  function closeBanner() { if (banner) banner.classList.remove('show', 'details'); }

  function decide(c) {
    var before = read() || {};
    write(c);
    closeBanner();
    // Widerruf einer zuvor erteilten Einwilligung: Seite neu laden, damit geladene Dienste entfernt sind
    if ((before.analytics && !c.analytics) || (before.maps && !c.maps)) { location.reload(); return; }
    apply(c);
  }

  if (banner) {
    banner.addEventListener('click', function (e) {
      var a = e.target.closest('[data-consent]');
      if (!a) return;
      var v = a.getAttribute('data-consent');
      if (v === 'all') decide({ analytics: true, maps: true });
      else if (v === 'none') decide({ analytics: false, maps: false });
      else if (v === 'more') banner.classList.add('details');
      else if (v === 'save') decide({ analytics: !!(optA && optA.checked), maps: !!(optM && optM.checked) });
    });
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-open-consent]')) { e.preventDefault(); openBanner(true); }
    if (e.target.closest('[data-load-map]')) {
      e.preventDefault();
      var c = read() || { analytics: false };
      c.maps = true;
      write(c);
      loadMaps();
    }
  });

  var current = read();
  if (current) apply(current); else openBanner(false);
})();
