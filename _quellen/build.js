// Erzeugt api/_intern.js aus _quellen/intern.html (der Eigentümerbereich wird nur nach Anmeldung ausgeliefert).
// Nach Änderungen ausführen: node _quellen/build.js
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, 'intern.html'), 'utf8');
fs.writeFileSync(path.join(__dirname, '..', 'api', '_intern.js'),
  '// Automatisch erzeugt aus _quellen/intern.html – nicht direkt bearbeiten.\nmodule.exports = ' + JSON.stringify(html) + ';\n');
console.log('api/_intern.js geschrieben');
