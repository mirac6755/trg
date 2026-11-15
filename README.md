# trg-immobilien.de

Statische Website (HTML/CSS/JS) mit einer Vercel-Funktion für das Kontaktformular (`api/kontakt.js`).
Die Domain liegt bei STRATO, gehostet wird bei Vercel.

## Einmalig bei Vercel einrichten
1. Bei vercel.com anmelden → **Add New… → Project** → GitHub-Repository `mirac6755/trg` importieren.
2. Framework Preset: **Other** · Build Command leer lassen.
3. **Settings → Environment Variables:**
   | Name | Wert |
   | --- | --- |
   | `SMTP_USER` | `info@trg-immobilien.de` |
   | `SMTP_PASS` | Passwort dieses Postfachs bei STRATO |
   Optional: `SMTP_HOST` (Standard `smtp.strato.de`), `SMTP_PORT` (Standard `465`), `MAIL_TO` (Empfänger).
4. Danach **Deployments → … → Redeploy**.

## Domain verbinden
1. Vercel: **Settings → Domains** → `trg-immobilien.de` und `www.trg-immobilien.de` hinzufügen.
2. STRATO-Kundenlogin → Domains → trg-immobilien.de → **DNS-Einstellungen**:
   - Alte Lovable-Einträge (A-Record auf Lovable-IP, TXT „lovable“) entfernen.
   - Die Einträge eintragen, die Vercel anzeigt (in der Regel A-Record `@` → `76.76.21.21`
     und CNAME `www` → `cname.vercel-dns.com`).
   - **MX-Einträge nicht ändern** – sonst funktioniert die E-Mail nicht mehr.
3. Vercel richtet das SSL-Zertifikat automatisch ein.

## Änderungen
Datei in GitHub bearbeiten → Commit → Vercel veröffentlicht automatisch in ca. 1 Minute.

## Google
- Analytics: Mess-ID in `assets/site.js` bei `GA_ID` eintragen. Wird erst nach Einwilligung geladen.
- Search Console: Bestätigungscode im auskommentierten `<meta name="google-site-verification">` in `index.html`
  eintragen, danach `sitemap.xml` einreichen.

## Objekte einstellen
In `objekte.html` liegt eine auskommentierte Vorlage inkl. der Pflichtangaben zum Energieausweis (§ 87 GEG).
Bilder nach `assets/img/`.

## Hinweis
`kontakt.php` und `.htaccess` sind nur für klassisches Webhosting (z. B. STRATO-Webspace) gedacht und werden
bei Vercel nicht verwendet (`.vercelignore`).

## Eigentümerbereich (trg-immobilien.de/intern)
Geschützter Bereich mit Werkzeugen: Vergleichs-, Ertrags- und Sachwertverfahren, gewichteter
Abgleich mit Preisempfehlung, Provisions-, Nebenkosten-, Rendite- und Finanzierungsrechner sowie
Checklisten (Unterlagen, GEG-Pflichtangaben, Geldwäschegesetz, Abschluss).
Eingaben werden nur im Browser gespeichert, nicht auf dem Server.

In Vercel unter **Settings → Environment Variables** eintragen und danach neu deployen:
| Name | Wert |
| --- | --- |
| `INTERN_USER` | Benutzername, z. B. `mirac` |
| `INTERN_PASS` | langes, sicheres Passwort |
| `INTERN_SECRET` | lange Zufallszeichenkette (mind. 32 Zeichen) |
| `INTERN_NAME` | optional: Anrede, z. B. `Herr Turgut` |

Weitere Zugänge: `INTERN_USER_2` / `INTERN_PASS_2` / `INTERN_NAME_2` usw. (bis `_5`).
Bereich ändern: `_quellen/intern.html` bearbeiten, dann `node _quellen/build.js` ausführen.
