// Lance les tests en ligne de commande, sans paquet : `node tests/run.mjs`.
// Les scripts de l'application sont des scripts classiques (pas des modules) : on les charge dans un même
// contexte `vm`, ce qui reproduit le fonctionnement du navigateur (variables globales partagées).
import vm from "node:vm";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const silent = { ...console, warn: () => {} }; // les avertissements attendus (données corrompues) ne servent à rien ici
const context = vm.createContext({ console: silent, setTimeout, clearTimeout });

for (const file of ["data.js", "i18n.js", "validate.js", "app.js", "tests/cases.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file });
}

const results = vm.runInContext("runTests()", context);
for (const r of results) console.log((r.ok ? "ok    " : "ÉCHEC ") + r.name + (r.ok ? "" : "\n    " + r.error));
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} tests réussis`);
process.exit(failed === 0 ? 0 : 1);
