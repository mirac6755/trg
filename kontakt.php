<?php
/* Kontaktformular für STRATO-Webhosting.
   Sendet die Anfrage per E-Mail an MAIL_TO; es wird nichts auf dem Server gespeichert. */

const MAIL_TO   = 'info@trg-immobilien.de';
const MAIL_FROM = 'info@trg-immobilien.de'; // muss ein Postfach dieser Domain sein (STRATO)

function fail(string $msg, int $code = 400): void {
    http_response_code($code);
    header('Content-Type: text/html; charset=utf-8');
    $m = htmlspecialchars($msg, ENT_QUOTES, 'UTF-8');
    echo '<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
       . '<meta name="robots" content="noindex"><title>Anfrage nicht gesendet | Turgut Realty Gate</title>'
       . '<link rel="stylesheet" href="assets/style.css"></head><body><main class="legal"><div class="wrap">'
       . '<span class="eyebrow">Kontakt</span><h1 class="h2">Anfrage nicht gesendet.</h1>'
       . '<p class="lead" style="margin-top:24px">' . $m . '</p>'
       . '<p>Sie erreichen uns auch direkt unter <a class="link" href="tel:+4917680030389">0176 80030389</a> oder '
       . '<a class="link" href="mailto:info@trg-immobilien.de">info@trg-immobilien.de</a>.</p>'
       . '<p style="margin-top:32px"><a class="btn btn--ghost" href="javascript:history.back()">Zurück zum Formular</a></p>'
       . '</div></main></body></html>';
    exit;
}

function field(string $key, int $max): string {
    $v = trim((string)($_POST[$key] ?? ''));
    $v = str_replace(["\r", "\0"], '', $v);
    return mb_substr($v, 0, $max, 'UTF-8');
}
function oneLine(string $v): string { return preg_replace('/\s+/u', ' ', $v); }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { header('Location: index.html#kontakt', true, 303); exit; }

// Spamschutz: verstecktes Feld muss leer sein, Formular nicht schneller als 3 s ausgefüllt
if (!empty($_POST['website'])) { header('Location: danke.html', true, 303); exit; }
$ts = (int)($_POST['ts'] ?? 0);
if ($ts > 0 && time() - $ts < 3) { header('Location: danke.html', true, 303); exit; }

$name    = oneLine(field('name', 120));
$email   = oneLine(field('email', 160));
$tel     = oneLine(field('telefon', 40));
$topic   = oneLine(field('anliegen', 60));
$objekt  = oneLine(field('objekt', 120));
$message = field('nachricht', 5000);

if ($name === '' || $message === '') fail('Bitte füllen Sie Name und Nachricht aus.');
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) fail('Bitte geben Sie eine gültige E-Mail-Adresse an.');
if (empty($_POST['datenschutz'])) fail('Bitte bestätigen Sie die Datenschutzhinweise.');

$allowed = ['Kostenfreie Bewertung', 'Verkauf', 'Ankauf / Suchprofil', 'Vermietung', 'Kapitalanlage', 'Off-Market-Vermittlung', 'Sonstiges'];
if (!in_array($topic, $allowed, true)) $topic = 'Sonstiges';

$body = "Neue Anfrage über trg-immobilien.de\n\n"
      . "Anliegen:  $topic\n"
      . "Name:      $name\n"
      . "E-Mail:    $email\n"
      . "Telefon:   " . ($tel !== '' ? $tel : '–') . "\n"
      . "Objekt:    " . ($objekt !== '' ? $objekt : '–') . "\n\n"
      . "Nachricht:\n$message\n\n"
      . "—\nGesendet am " . date('d.m.Y \u\m H:i') . " Uhr. Datenschutzhinweise bestätigt.\n";

$subject = '=?UTF-8?B?' . base64_encode("Anfrage: $topic – $name") . '?=';
$headers = implode("\r\n", [
    'From: Turgut Realty Gate <' . MAIL_FROM . '>',
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
]);

if (!mail(MAIL_TO, $subject, $body, $headers, '-f' . MAIL_FROM)) {
    fail('Ihre Nachricht konnte gerade nicht versendet werden. Bitte versuchen Sie es später erneut.', 500);
}
header('Location: danke.html', true, 303);
