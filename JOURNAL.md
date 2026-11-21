# Journal

## 2026-11-21 : durcissement et nettoyage de l'application
- Demande : corriger les bugs, durcir l'app et la rendre plus propre sans changer ce que voit l'utilisateur.
- Fichiers modifiés : `app.js`, `index.html`, `style.css`, `LICENSE`, `README.md` (modifiés) ; `validate.js`, `i18n.js`, `tests.html`, `tests/cases.js`, `tests/page.js`, `tests/run.mjs`, `.github/workflows/ci.yml`, `JOURNAL.md` (créés) ; `docs/apercu-en.png` (régénéré).
- Ce qui a changé :
  - Bugs : chaque clé du stockage est lue séparément (une clé illisible est copiée en `…-corrompu`, jamais écrasée) ; charger une configuration ne supprime plus la photo ; les textes tapés sont sauvegardés (debounce + `pagehide`) ; les configurations gardent le contenu des éléments ajoutés ; l'import remplace bien toute la progression ; `t()` a un repli ; le panneau n'est plus reconstruit à chaque case cochée.
  - Sécurité : photo limitée à JPEG/PNG/WebP, 8 Mo avant décodage, stockée sous sa propre clé ; Content-Security-Policy ; caractères bidi et de largeur nulle retirés ; `edits` orphelins ignorés ; une seule limite de longueur par type de champ.
  - Structure : `validate.js` (fonctions pures) et `i18n.js` extraits, scripts classiques (pas de modules, pour garder le double-clic sur `index.html`).
  - Export : ajustement « une page » par dichotomie, avertissement si 50 % ne suffit pas.
- Pourquoi ce choix : scripts classiques plutôt que modules ES, car Chrome bloque les modules en `file://`. Copie de secours plutôt que blocage total quand une clé est illisible, pour que l'application reste utilisable sans rien perdre.
- Vérification : `node tests/run.mjs` (21 tests) ; parcours testés dans Chrome headless (cocher, éditer, configuration, langue, import/export, photo, impression PDF d'une page).
- À retenir / reste à faire : activer GitHub Pages / mettre description et topics sur GitHub ; vérifier l'impression dans ton navigateur habituel.
