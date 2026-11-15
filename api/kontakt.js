// Turgut Realty Gate – Kontaktformular (Vercel Serverless Function)
// Nimmt das Formular von kontakt.html entgegen und schickt die Anfrage per SMTP
// an info@trg-immobilien.de. Es wird nichts gespeichert.
// Environment Variables in Vercel: SMTP_USER, SMTP_PASS (optional SMTP_HOST, SMTP_PORT, MAIL_TO).

const nodemailer = require('nodemailer');

const ANLIEGEN = ['Kostenfreie Bewertung', 'Verkauf', 'Ankauf / Suchprofil', 'Vermietung', 'Kapitalanlage', 'Off-Market-Vermittlung', 'Sonstiges'];

function sauber(v, max) {
  if (Array.isArray(v)) v = v.join(', ');
  return String(v || '').replace(/[\r\n\0]+/g, ' ').trim().slice(0, max);
}

function lesen(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (c) => { raw += c; if (raw.length > 100000) req.destroy(); });
    req.on('end', () => resolve(Object.fromEntries(new URLSearchParams(raw))));
    req.on('error', reject);
  });
}

function weiter(res, ziel) {
  res.statusCode = 303;
  res.setHeader('Location', ziel);
  res.end();
}

function fehler(res, status, text) {
  const t = text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end('<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
    + '<meta name="robots" content="noindex"><title>Anfrage nicht gesendet | Turgut Realty Gate</title>'
    + '<link rel="stylesheet" href="/assets/style.css"></head><body><main class="legal"><div class="wrap">'
    + '<h1 class="page-title">Anfrage nicht gesendet</h1><p class="subline">' + t + '</p>'
    + '<p style="margin-top:24px">Sie erreichen uns auch direkt unter 0176 80030389 oder info@trg-immobilien.de.</p>'
    + '<p style="margin-top:32px"><a class="btn btn--ghost" href="/kontakt.html">Zurück zum Formular</a></p>'
    + '</div></main></body></html>');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return weiter(res, '/kontakt.html');

  let f;
  try { f = await lesen(req); } catch (e) { return fehler(res, 400, 'Das Formular konnte nicht gelesen werden.'); }

  // Spamschutz: verstecktes Feld muss leer sein, Formular nicht schneller als 3 Sekunden ausgefüllt
  const ts = Number(f.ts || 0);
  if (f.website || (ts > 0 && Date.now() / 1000 - ts < 3)) return weiter(res, '/danke.html');

  const name = sauber(f.name, 120);
  const email = sauber(f.email, 160);
  const telefon = sauber(f.telefon, 40);
  const anliegen = ANLIEGEN.includes(sauber(f.anliegen, 60)) ? sauber(f.anliegen, 60) : 'Sonstiges';
  const objekt = sauber(f.objekt, 120);
  const nachricht = String(f.nachricht || '').replace(/\0/g, '').trim().slice(0, 5000);

  if (!name || !nachricht) return fehler(res, 422, 'Bitte füllen Sie Name und Nachricht aus.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fehler(res, 422, 'Bitte geben Sie eine gültige E-Mail-Adresse an.');
  if (!f.datenschutz) return fehler(res, 422, 'Bitte bestätigen Sie die Datenschutzhinweise.');

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return fehler(res, 500, 'Der Versand ist noch nicht eingerichtet.');

  const jetzt = new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' });
  const text = 'Neue Anfrage über trg-immobilien.de\nEingegangen: ' + jetzt + '\n\n'
    + 'Anliegen:  ' + anliegen + '\n'
    + 'Name:      ' + name + '\n'
    + 'E-Mail:    ' + email + '\n'
    + 'Telefon:   ' + (telefon || '–') + '\n'
    + 'Objekt:    ' + (objekt || '–') + '\n\n'
    + 'Nachricht:\n' + nachricht + '\n\n—\nDatenschutzhinweise bestätigt.\n';

  const port = Number(process.env.SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.strato.de', port, secure: port === 465, auth: { user, pass },
  });

  try {
    await transporter.sendMail({
      from: { name: 'Turgut Realty Gate Webseite', address: user },
      to: process.env.MAIL_TO || user,
      replyTo: { name, address: email },
      subject: 'Anfrage: ' + anliegen + ' – ' + name,
      text,
    });
  } catch (e) {
    console.error('Mailversand fehlgeschlagen:', e && e.message);
    return fehler(res, 500, 'Ihre Nachricht konnte gerade nicht versendet werden. Bitte versuchen Sie es später erneut.');
  }
  return weiter(res, '/danke.html');
};
