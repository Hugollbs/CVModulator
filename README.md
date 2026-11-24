# CV modulaire

*English version below / [Jump to English](#english)*

Application web pour composer un CV sur mesure : on coche les éléments à afficher, on choisit la langue (français / anglais), et on exporte le résultat en PDF au format A4.

Aucun serveur, aucune dépendance, aucune étape de build : c'est du HTML, du CSS et du JavaScript pur.

**[Essayer la démo en ligne](https://hugollbs.github.io/CVModulator/)** (le CV affiché est un exemple fictif)

![Aperçu de CV modulaire : panneau de contrôle à gauche, CV A4 à droite](docs/apercu-fr.png)

Version anglaise : [aperçu](docs/apercu-en.png).

## Utilisation

1. Ouvrir `index.html` dans un navigateur (double-clic, ou `python3 -m http.server` puis http://localhost:8000).
2. Ajouter son contenu avec les boutons « + Ajouter » (expériences, études, compétences, langues…). Les textes se modifient en cliquant dessus (ou avec Tab, puis en tapant ; Entrée valide).
3. Cocher / décocher les éléments, choisir la langue, importer une photo (JPEG, PNG ou WebP, 8 Mo maximum) : une fenêtre permet de la recadrer (paysage, carré ou portrait 3:4, zoom, déplacement à la souris, au doigt ou aux flèches du clavier).
4. Cliquer sur « Exporter en PDF » (voir ci-dessous).

## Export PDF

Le bouton ouvre la fenêtre d'impression du navigateur. Réglages à choisir :

- Destination : « Enregistrer au format PDF ».
- Format de papier : **A4**, marges : **aucune** (la mise en page gère déjà les marges du CV).
- Échelle : 100 %.
- **Désactiver « En-têtes et pieds de page »** (sinon la date et l'adresse de la page s'impriment sur le CV).
- Activer « Graphiques d'arrière-plan » si les couleurs des titres n'apparaissent pas.

L'option « Tenir sur une page » réduit la taille du texte jusqu'à 50 % ; si cela ne suffit pas, un avertissement s'affiche sous le bouton d'export et il faut décocher des éléments.

## Fonctionnalités

- Contenu bilingue (chaque texte existe en français et en anglais).
- Profils : des préréglages, plus les tiens. « Créer » enregistre la sélection actuelle (cases cochées, langue, niveaux de langue, photo, présentation, ainsi que le contenu des éléments ajoutés qu'elle utilise). Le × supprime un profil créé ; sur un préréglage, il le masque seulement (« Rétablir les profils masqués » le fait revenir).
- Photo : import avec recadrage, cadre à hauteur fixe dont la largeur suit le format (une photo verticale laisse plus de place au texte). Le × efface la photo importée du navigateur, ou masque une photo proposée.
- Mise en page aux conventions d'un CV : une colonne (lisible par les logiciels de tri de candidatures), titres de section en capitales espacées, dates alignées, tiret demi-cadratin.
- Sauvegarde automatique dans le navigateur, export / import en JSON (section repliable « Sauvegarde »).
- Aperçu A4 en direct.

## Confidentialité

Tes données restent dans ton navigateur (`localStorage`). Elles ne sont envoyées nulle part : la page interdit toute requête réseau (Content-Security-Policy) ; même les polices (Inter, Newsreader, licence OFL) sont hébergées avec le site, dans `fonts/`.

**Attention : ton adresse, ton numéro de téléphone et ta photo sont stockés en clair** dans `localStorage` (donc lisibles par toute personne qui utilise ce navigateur avec ta session) et dans le fichier JSON de sauvegarde. Ne partage pas ce fichier, et n'utilise pas l'application avec des données personnelles sur un ordinateur partagé.

Le dépôt ne contient aucune donnée personnelle : `data.js` contient un CV d'exemple entièrement fictif (Camille Martin), à remplacer par le tien. Pense à utiliser l'export JSON pour sauvegarder ton CV, car vider les données du navigateur l'efface. Si une sauvegarde locale est illisible, l'application en garde une copie brute (clés `…-corrompu`) au lieu de l'écraser.

## Tests

Sans dépendance : `node tests/run.mjs` (Node 20 ou plus), ou ouvrir `tests.html` dans le navigateur (via `python3 -m http.server`). Les tests vérifient la validation, le nettoyage des chaînes, le chargement d'un état corrompu, l'aller-retour export / import, le calcul du recadrage et la gestion des profils et des photos masqués. Ils sont lancés automatiquement par GitHub Actions.

## Licence

[MIT](LICENSE).

## Structure

| Fichier | Rôle |
|---|---|
| `index.html` | Structure de la page (panneau de contrôle + aperçu) et Content-Security-Policy |
| `style.css` | Mise en forme de l'interface et du CV imprimé, déclaration des polices |
| `data.js` | CV d'exemple fictif, libellés, profils prédéfinis |
| `i18n.js` | Textes de l'interface (français / anglais) et séparateurs |
| `validate.js` | Validation et nettoyage des données (fonctions pures) |
| `app.js` | Logique : état, stockage, rendu, édition, profils, recadrage de la photo, export |
| `fonts/` | Polices Inter et Newsreader (licence OFL) hébergées avec le site |
| `tests/`, `tests.html` | Tests sans dépendance |

Règle de sécurité : le code n'utilise jamais `innerHTML` (ni équivalent) avec des données de l'utilisateur ; tout passe par `textContent` / `createTextNode`.

---

<a id="english"></a>

# CV modulaire (English)

A dependency-free web app to build a tailored CV: tick the items you want, pick a language (French / English) and export an A4 PDF. Plain HTML, CSS and JavaScript, no build step.

**[Live demo](https://hugollbs.github.io/CVModulator/)** (the CV shown is a fictional example)

## Usage

1. Open `index.html` in a browser (double-click, or `python3 -m http.server` then http://localhost:8000).
2. Add your content with the "+ Add" buttons; click any text in the CV to edit it (or Tab to it and type; Enter confirms).
3. Tick / untick items, choose the language, import a photo (JPEG, PNG or WebP, 8 MB max) and crop it (landscape, square or 3:4 portrait, zoom, drag or arrow keys).
4. Save the current selection as a named profile ("Create"); × deletes a profile you created, and only hides a built-in one. Export / import a JSON backup from the "Backup" section.
5. Click "Export as PDF" and, in the print dialog, choose "Save as PDF", paper size A4, no margins, scale 100%, **headers and footers off**.

## Privacy

Everything stays in your browser (`localStorage`); the page forbids network requests (Content-Security-Policy); even the fonts (Inter, Newsreader, OFL licence) are served with the site, from `fonts/`. **Your address, phone number and photo are stored in plain text** in `localStorage` and in the exported JSON backup: do not share that file and avoid using the app with personal data on a shared computer.

## Tests

No dependency: `node tests/run.mjs` (Node 20+), or open `tests.html` through a local server. They run on every push with GitHub Actions.

## License

[MIT](LICENSE).
