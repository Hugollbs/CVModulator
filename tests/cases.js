// Tests sans dépendance. Ce fichier est chargé après data.js, i18n.js, validate.js et app.js, par :
//   - tests.html (dans un navigateur) ;
//   - tests/run.mjs (en ligne de commande : `node tests/run.mjs`).
// Ils remplacent le stockage par un faux (storageBackend) : les vraies données du navigateur ne sont jamais touchées.

const tests = [];
const test = (name, fn) => tests.push({ name, fn });

function assert(condition, message) {
  if (!condition) throw new Error(message || "assertion fausse");
}

function same(actual, expected, message) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error((message || "valeurs différentes") + "\n    obtenu  : " + a + "\n    attendu : " + e);
}

// Faux localStorage ; `refuse(clé)` permet de simuler un stockage plein sur certaines clés.
function fakeStorage(initial = {}, refuse = () => false) {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => (Object.hasOwn(data, key) ? data[key] : null),
    setItem: (key, value) => {
      if (refuse(key)) throw new Error("stockage plein");
      data[key] = String(value);
    },
    removeItem: (key) => { delete data[key]; },
  };
}

// Remet l'application dans son état de départ, avec le stockage donné.
function resetApp(storage) {
  storageBackend = storage;
  state.custom = [];
  applyCustom();
  state.configs = [];
  state.blocked = new Set();
  state.photo = null;
  state.lang = "fr";
  state.identity = { name: "", address: "", phone: "", email: "" };
  state.github = "";
  state.edits = validEdits(null);
  state.levels = defaultLevels();
  state.hidden = new Set();
  applyProfile("all");
}

const PIXEL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/yQALCAABAAEBAREA/8wABgAQEAX/2gAIAQEAAD8A0s8g/9k=";

// --- Nettoyage des chaînes ---
test("cleanLine retire les caractères de contrôle et tronque", () => {
  same(cleanLine("  a\tb\nc\u0000d  ", 50), "a b c d");
  same(cleanLine("abcdef", 3), "abc");
});

test("cleanLine retire les surcharges bidi et les caractères de largeur nulle", () => {
  same(cleanLine("fdp.exe‮txt", 50), "fdp.exetxt");
  same(cleanLine("a​b‏c⁦d﻿e", 50), "abcde");
});

test("cleanLines garde les sauts de ligne et supprime les lignes vides", () => {
  same(cleanLines("un\n\n  deux ‮\ntrois", 100), "un\ndeux\ntrois");
});

// --- Validation ---
const ctx = () => dataContext();

test("validCustom refuse type inconnu, id invalide, doublon, champ obligatoire absent, parent inconnu", () => {
  const valid = { id: "cabcd1234", kind: "exp", title: "Stage" };
  const result = validCustom([
    valid,
    { ...valid },
    { id: "cabcd5678", kind: "inconnu", title: "x" },
    { id: "PAS-UN-ID", kind: "exp", title: "x" },
    { id: "cabcd0001", kind: "exp", title: "" },
    { id: "cabcd0002", kind: "bullet", text: "puce", parent: "n-existe-pas" },
    { id: "cabcd0003", kind: "bullet", text: "puce", parent: "cabcd1234" },
  ], ctx());
  same(result.map((c) => c.id), ["cabcd1234", "cabcd0003"]);
});

test("validCustom : le texte d'une présentation tient sur une ligne, celui d'un item garde ses lignes", () => {
  const [summary, item] = validCustom([
    { id: "cabcd0001", kind: "summary", text: "ligne 1\nligne 2" },
    { id: "cabcd0002", kind: "item", label: "x", text: "a\nb", list: "tech" },
  ], ctx());
  same(summary.text, "ligne 1 ligne 2");
  same(item.text, "a\nb");
});

test("validCustom applique une seule limite par type de champ", () => {
  const [entry] = validCustom([{ id: "cabcd0001", kind: "edu", title: "t".repeat(500), detail: "d".repeat(5000) }], ctx());
  same(entry.title.length, LIMITS.line);
  same(entry.detail.length, LIMITS.text);
});

test("validEdits ignore __proto__, les textes trop longs et les ids qui n'existent plus", () => {
  const saved = JSON.parse('{"fr":{"__proto__":"x","subtitle":"ok","exp-dev:title":"Titre\\u202E","disparu:title":"orphelin","subtitle2":"x"},"en":{"subtitle":"' + "a".repeat(LIMITS.text + 1) + '"}}');
  const result = validEdits(saved, ctx());
  same(Object.keys(result.fr), ["subtitle", "exp-dev:title"]);
  same(result.fr["exp-dev:title"], "Titre");
  same(Object.keys(result.en), []);
});

test("validPhoto n'accepte que des images raster en base64", () => {
  assert(validPhoto(PIXEL) === PIXEL, "un JPEG valide doit passer");
  assert(validPhoto("data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=") === null, "le SVG doit être refusé");
  assert(validPhoto("data:image/jpeg;base64,<script>") === null, "du texte non base64 doit être refusé");
  assert(validPhoto("data:image/png;base64," + "A".repeat(MAX_PHOTO_CHARS)) === null, "une photo trop grosse doit être refusée");
  assert(validPhoto(42) === null);
});

test("validIds et validColor", () => {
  same(validIds(["a", 3, "x".repeat(LIMITS.id + 1), "b"]), ["a", "b"]);
  same(validIds("pas un tableau"), []);
  same(validColor("#AABBCC", "#000000"), "#AABBCC");
  same(validColor("rouge", "#000000"), "#000000");
});

// --- Chargement d'un état corrompu ---
test("une progression corrompue ne fait pas perdre les configurations", () => {
  const config = { name: "Stage", data: { lang: "fr", checked: ["exp-dev"] } };
  const storage = fakeStorage({ [STORAGE_KEY]: "{pas du json", [CONFIGS_KEY]: JSON.stringify([config]) });
  resetApp(storage);
  loadState();
  same(state.configs.map((c) => c.name), ["Stage"]);
  assert(storage.data[STORAGE_KEY + CORRUPT_SUFFIX] === "{pas du json", "la clé illisible doit être copiée");
});

test("des configurations corrompues ne sont jamais écrasées sans copie", () => {
  const storage = fakeStorage({ [CONFIGS_KEY]: "[{cassé" });
  resetApp(storage);
  loadState();
  same(state.configs, []);
  assert(storage.data[CONFIGS_KEY + CORRUPT_SUFFIX] === "[{cassé", "copie brute attendue");
  saveConfigs();
  assert(storage.data[CONFIGS_KEY] === "[]", "l'écriture est permise une fois la copie faite");
});

test("si la copie de secours est impossible, l'écriture est bloquée", () => {
  const storage = fakeStorage({ [CONFIGS_KEY]: "[{cassé" }, (key) => key.endsWith(CORRUPT_SUFFIX));
  resetApp(storage);
  loadState();
  assert(state.blocked.has(CONFIGS_KEY), "la clé doit être bloquée");
  saveConfigs();
  assert(storage.data[CONFIGS_KEY] === "[{cassé", "la clé illisible ne doit pas être réécrite");
});

test("une ancienne sauvegarde avec photo est migrée vers la clé de la photo", () => {
  const old = { lang: "fr", checked: ["summary"], photo: PIXEL };
  const storage = fakeStorage({ [STORAGE_KEY]: JSON.stringify(old) });
  resetApp(storage);
  loadState();
  assert(state.photo === PIXEL, "la photo doit être lue");
  assert(storage.data[PHOTO_KEY] === PIXEL, "la photo doit avoir sa propre clé");
  saveState();
  assert(!storage.data[STORAGE_KEY].includes("data:image"), "la progression ne contient plus la photo");
});

// --- Sauvegarde, export / import ---
function fillState() {
  state.lang = "en";
  state.identity.name = "Test Nom";
  state.github = "github.com/test";
  state.checked.delete("exp-soutien");
  state.levels["lang-en"] = "C2";
  state.edits.fr["exp-dev:title"] = "Titre modifié";
  state.photo = PIXEL;
  state.custom = validCustom([
    { id: "cabcd0001", kind: "exp", title: "Mon stage", titleEn: "My internship", dates: "2026" },
    { id: "cabcd0002", kind: "bullet", text: "Une puce", parent: "cabcd0001" },
    { id: "cabcd0003", kind: "item", list: CV.lists[0].id, label: "Engagement", text: "a\nb\nc" },
  ], ctx());
  applyCustom();
  state.checked.add("cabcd0001");
  state.checked.add("cabcd0002");
  state.checked.add("cabcd0003");
  state.hidden.add("cabcd0003-2");
}

test("aller-retour export / import : la progression est identique", () => {
  resetApp(fakeStorage());
  fillState();
  state.configs = [{ name: "Ma config", data: snapshot() }];
  const exported = JSON.stringify(buildBackup());

  resetApp(fakeStorage());
  assert(applyBackup(JSON.parse(exported)), "l'import doit réussir");
  same(JSON.stringify(buildBackup()), exported);
});

test("un import remplace tout : les clés absentes du fichier reviennent à zéro", () => {
  resetApp(fakeStorage());
  fillState();
  assert(applyBackup({ app: "cv-modulaire", version: 1, state: { lang: "fr", checked: ["summary"] }, configs: [] }));
  same(state.custom, []);
  same(state.identity.name, "");
  same(Object.keys(state.edits.fr), []);
  same(state.github, "");
  same([...state.checked], ["summary"]);
});

test("un fichier invalide est refusé sans rien modifier", () => {
  resetApp(fakeStorage());
  fillState();
  const before = JSON.stringify(buildBackup());
  assert(!applyBackup({ app: "autre" }));
  assert(!applyBackup({ app: "cv-modulaire", state: { lang: "de", checked: [] } }));
  same(JSON.stringify(buildBackup()), before);
});

test("charger une configuration restaure un élément ajouté supprimé depuis", () => {
  resetApp(fakeStorage());
  fillState();
  const config = { name: "c", data: snapshot() };
  state.custom = [];
  applyCustom();
  state.configs = validConfigs([config], ctx());
  applyConfig(0);
  assert(state.custom.some((c) => c.id === "cabcd0001"), "l'expérience doit revenir");
  assert(state.custom.some((c) => c.id === "cabcd0002"), "sa puce aussi");
  assert(state.checked.has("cabcd0002"));
});

test("charger une configuration ne touche pas à la photo importée", () => {
  resetApp(fakeStorage());
  state.photo = PIXEL;
  state.configs = validConfigs([{ name: "c", data: { lang: "fr", checked: ["summary"], customPhoto: false } }], ctx());
  applyConfig(0);
  assert(state.photo === PIXEL, "la photo doit rester");
});

// --- Textes et libellés ---
test("t() renvoie le français puis une chaîne vide quand une traduction manque", () => {
  resetApp(fakeStorage());
  state.lang = "en";
  same(t({ fr: "seulement fr" }), "seulement fr");
  same(t(undefined), "");
  same(t({ en: "ok", fr: "x" }), "ok");
});

test("shortLabel coupe entre deux mots", () => {
  same(shortLabel("Étudiante en informatique à la recherche d'un stage"), "Étudiante en informatique à…");
  same(shortLabel("court"), "court");
});

test("le profil « Vide » n'est pas ajouté à l'objet PROFILES des données", () => {
  assert(!Object.hasOwn(PROFILES, "empty"));
  assert(Object.hasOwn(ALL_PROFILES, "empty"));
});

// --- Affichage des listes (projets, etc.) ---
// Sous Node il n'y a pas de document : on en fournit un minimal (juste ce que el(), editable() et row() utilisent).
// Dans tests.html, c'est le vrai document du navigateur qui sert.
function fakeDocument() {
  const makeText = (text) => ({ textContent: text, childNodes: [] });
  const makeElement = () => {
    const node = { className: "", dataset: {}, childNodes: [] };
    node.appendChild = (child) => { node.childNodes.push(child); return child; };
    node.append = (...children) => children.forEach((child) => node.appendChild(child));
    node.setAttribute = () => {};
    Object.defineProperty(node, "textContent", {
      get: () => node.childNodes.map((child) => child.textContent).join(""),
      set: (text) => { node.childNodes = [makeText(String(text))]; },
    });
    return node;
  };
  return { createElement: makeElement, createTextNode: makeText };
}

// Rend une liste contenant `item` (avec ces lignes masquées), puis remet CV et state dans leur état d'origine.
function renderOneListItem(item, hiddenLines = []) {
  const fake = typeof document === "undefined";
  if (fake) globalThis.document = fakeDocument();
  const list = CV.lists[0];
  const oldLang = state.lang;
  const oldHidden = state.hidden;
  state.lang = "fr";
  state.hidden = new Set(hiddenLines);
  list.items.push(item);
  state.checked.add(item.id);
  try {
    const container = document.createElement("div");
    renderLists(container, [list.id]);
    return container;
  } finally {
    list.items.pop();
    state.checked.delete(item.id);
    state.lang = oldLang;
    state.hidden = oldHidden;
    if (fake) delete globalThis.document;
  }
}

// Premier nœud (en profondeur) dont la classe CSS contient `name`.
function findByClass(node, name) {
  if (String(node.className || "").split(" ").includes(name)) return node;
  for (const child of Array.from(node.childNodes)) {
    const found = findByClass(child, name);
    if (found) return found;
  }
  return null;
}

test("renderLists : l'environnement d'un projet (org) s'affiche sur la ligne de son nom", () => {
  const container = renderOneListItem({ id: "zz-proj", label: { fr: "Nom" }, org: { fr: "Env" }, text: { fr: "Phrase" }, bullets: true });
  const row = findByClass(container, "row");
  assert(row, "la ligne de titre (row) est absente");
  same(row.textContent, "Nom – Env");
  same(findByClass(container, "sub").textContent, "Phrase");
});

test("renderLists : sans org ni dates, le format « nom : texte » reste inchangé", () => {
  const container = renderOneListItem({ id: "zz-simple", label: { fr: "Nom" }, text: { fr: "Texte" } });
  assert(!findByClass(container, "row"), "pas de ligne de titre attendue");
  assert(container.textContent.includes("Nom" + SEPARATORS.label.fr + "Texte"), "format nom : texte attendu");
});

// --- Lignes masquables d'un élément de liste ---
test("itemLineIds : un id par ligne seulement quand il y en a plusieurs, dans la langue la plus longue", () => {
  same(itemLineIds({ id: "x", text: { fr: "une seule", en: "one" } }), []);
  same(itemLineIds({ id: "x" }), []);
  same(itemLineIds({ id: "x", text: { fr: "a\nb", en: "a\nb" } }), ["x-1", "x-2"]);
  same(itemLineIds({ id: "x", text: { fr: "a\nb\nc", en: "a\nb" } }), ["x-1", "x-2", "x-3"]);
});

test("renderLists : une ligne masquée disparaît, les autres gardent leur place", () => {
  const item = { id: "zz-lignes", label: { fr: "Nom" }, text: { fr: "L1\nL2\nL3" } };
  same(findByClass(renderOneListItem(item), "sub").textContent, "L1L2L3");
  same(findByClass(renderOneListItem(item, ["zz-lignes-2"]), "sub").textContent, "L1L3");
});

test("renderLists : toutes les lignes masquées, le titre reste sans sous-liste", () => {
  const item = { id: "zz-titre", label: { fr: "Nom" }, text: { fr: "L1\nL2" } };
  const container = renderOneListItem(item, ["zz-titre-1", "zz-titre-2"]);
  assert(!findByClass(container, "sub"), "aucune sous-liste attendue");
  assert(container.textContent.includes("Nom"), "le titre doit rester");
});

test("renderLists : un élément à une seule ligne n'est pas concerné par les lignes masquées", () => {
  const item = { id: "zz-une", label: { fr: "Nom" }, text: { fr: "Texte" }, bullets: true };
  same(findByClass(renderOneListItem(item, ["zz-une-1"]), "sub").textContent, "Texte");
});

test("une ancienne sauvegarde sans `hidden` laisse toutes les lignes visibles", () => {
  resetApp(fakeStorage());
  state.hidden.add("cabcd0003-2");
  assert(applySaved({ lang: "fr", checked: ["summary"] }));
  same([...state.hidden], []);
});

test("au chargement, les lignes masquées inconnues sont ignorées", () => {
  resetApp(fakeStorage());
  fillState();
  assert(applySaved({ ...fullState(), hidden: ["cabcd0003-2", "n-existe-pas-1", 42] }));
  same([...state.hidden], ["cabcd0003-2"]);
});

test("une configuration enregistre les lignes masquées", () => {
  resetApp(fakeStorage());
  fillState();
  state.configs = validConfigs([{ name: "c", data: snapshot() }], ctx());
  state.hidden = new Set();
  applyConfig(0);
  same([...state.hidden], ["cabcd0003-2"]);
});

test("un texte modifié sur l'org d'un élément de liste (id:org) est conservé au chargement", () => {
  const id = CV.lists[0].items[0].id;
  const edits = validEdits({ fr: { [id + ":org"]: "Env modifié" }, en: {} }, dataContext());
  same(edits.fr[id + ":org"], "Env modifié");
});

// --- Exécution ---
function runTests() {
  return tests.map(({ name, fn }) => {
    try {
      fn();
      return { name, ok: true };
    } catch (err) {
      return { name, ok: false, error: err.message };
    }
  });
}
