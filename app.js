// Interface : cases à cocher (panneau de gauche) + rendu du CV (aperçu A4 à droite).

// Les données du CV viennent de data.js : si elles manquent, on le dit au lieu d'afficher une page blanche.
if (typeof CV === "undefined" || typeof PROFILES === "undefined" || typeof LANGUAGE_LEVELS === "undefined") {
  showFatal("Erreur : data.js est absent ou incomplet (CV, PROFILES et LANGUAGE_LEVELS sont attendus). / data.js is missing or incomplete (CV, PROFILES and LANGUAGE_LEVELS are expected).");
  throw new Error("data.js : CV, PROFILES ou LANGUAGE_LEVELS manquant");
}

// Le stockage est dans une variable pour que les tests puissent le remplacer (sans toucher aux vraies données).
let storageBackend = null;
try {
  storageBackend = window.localStorage;
} catch (err) {
  console.warn("Stockage local indisponible :", err);
}

const STORAGE_KEY = "cv-modulaire-v2";
const PHOTO_KEY = "cv-modulaire-photo-v1"; // la photo a sa propre clé : inutile de la réécrire à chaque case cochée

const PHOTO_MAX_SIDE = 800; // px : réduit la photo importée pour tenir dans le stockage local
const PHOTO_QUALITY = 0.85;
const CONFIGS_KEY = "cv-modulaire-configs-v1";
// edits[langue][clé] = texte modifié ; la clé identifie un texte du CV (ex. "exp-dsin:title").
const DEFAULT_LEVEL = "B2";
// Profil « Vide » ajouté aux profils des données, sans modifier l'objet PROFILES.
const ALL_PROFILES = { ...PROFILES, empty: { label: { fr: "Vide", en: "Empty" }, ids: [] } };

// Données d'origine : les ajouts de l'utilisateur sont fusionnés par-dessus à chaque changement (applyCustom).
// Ce que les fonctions de validate.js ont besoin de savoir sur les données du CV (calculé à chaque appel : CV change avec les ajouts).
function dataContext() {
  return {
    levelItemIds: CV.languages.items.filter((l) => l.level).map((l) => l.id),
    levelOptions: LANGUAGE_LEVELS,
    listIds: BASE.lists.map((l) => l.id),
    jobIds: BASE.experience.map((j) => j.id),
    editBases: new Set([...collectIds(true), "subtitle", ...CV.summary.variants.map((v) => v.key)]),
  };
}

const BASE = { summary: CV.summary, experience: CV.experience, education: CV.education, lists: CV.lists, languages: CV.languages };

const state = { custom: [], identity: { name: "", address: "", phone: "", email: "" }, contact: { address: true, phone: true, email: true, github: true }, github: "", configs: [], blocked: new Set(), saveFailed: false, lang: "fr", checked: new Set(), levels: {}, showPhoto: true, onePage: false, showSubtitle: true, titleColor: DEFAULT_TITLE_COLOR, photo: null, photoChoice: CV.photos.length > 0 ? CV.photos[0].id : "", summaryChoice: CV.summary.variants[0].id, edits: { fr: {}, en: {} } };

// --- Sauvegarde locale (facultative : le CV marche sans) ---
// Tout ce qui constitue la progression (sélection + textes + photo importée).
function fullState() {
  return { lang: state.lang, checked: [...state.checked], levels: state.levels, showPhoto: state.showPhoto, onePage: state.onePage, showSubtitle: state.showSubtitle, titleColor: state.titleColor, photo: state.photo, photoChoice: state.photoChoice, summaryChoice: state.summaryChoice, contact: state.contact, github: state.github, edits: state.edits, custom: state.custom, identity: state.identity };
}

// Ce que garde une configuration : la sélection, plus le contenu des éléments ajoutés cochés
// (pour pouvoir les retrouver s'ils ont été supprimés depuis). Textes modifiés, identité et photo restent globaux.
function snapshot() {
  const { photo, edits, custom, identity, ...selection } = fullState();
  return { ...selection, levels: { ...selection.levels }, contact: { ...selection.contact }, customItems: custom.map((c) => ({ ...c })), customPhoto: Boolean(photo) };
}

function setSaveStatus(ok) {
  state.saveFailed = !ok;
  const status = typeof document === "undefined" ? null : document.getElementById("save-status");
  if (status) {
    const failure = state.blocked.size > 0 ? UI_TEXT.saveBlocked : UI_TEXT.saveError;
    status.textContent = ok ? UI_TEXT.saveOk[state.lang] : failure[state.lang];
    status.classList.toggle("error", !ok);
  }
}

// Sauvegarde différée pour la frappe : évite d'écrire à chaque touche, mais garantit l'écriture avant la fermeture.
const SAVE_DELAY_MS = 500;
let saveTimer = null;
function saveStateSoon() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveState, SAVE_DELAY_MS);
}

// Message à l'utilisateur dans une zone annoncée par les lecteurs d'écran (à la place de window.alert).
function notify(text, isError) {
  const zone = typeof document === "undefined" ? null : document.getElementById("notice");
  if (!zone) return;
  zone.textContent = text;
  zone.classList.toggle("error", Boolean(isError));
}

function saveState() {
  clearTimeout(saveTimer);
  saveTimer = null;
  if (state.blocked.has(STORAGE_KEY)) return setSaveStatus(false);
  try {
    const { photo, ...progress } = fullState();
    storageBackend.setItem(STORAGE_KEY, JSON.stringify(progress));
    setSaveStatus(true);
  } catch (err) {
    console.warn("Sauvegarde locale impossible :", err);
    setSaveStatus(false);
  }
}

function savePhoto() {
  try {
    if (state.photo) storageBackend.setItem(PHOTO_KEY, state.photo);
    else storageBackend.removeItem(PHOTO_KEY);
  } catch (err) {
    console.warn("Sauvegarde de la photo impossible :", err);
    setSaveStatus(false);
  }
}

function saveConfigs() {
  if (state.blocked.has(CONFIGS_KEY)) return setSaveStatus(false);
  try {
    storageBackend.setItem(CONFIGS_KEY, JSON.stringify(state.configs));
    setSaveStatus(true);
  } catch (err) {
    console.warn("Sauvegarde des configurations impossible :", err);
    setSaveStatus(false);
  }
}

// Copie brute d'une clé illisible : on ne l'écrase jamais sans en avoir gardé une trace.
const CORRUPT_SUFFIX = "-corrompu";
function backupRaw(key, raw) {
  try {
    storageBackend.setItem(key + CORRUPT_SUFFIX, raw);
    return true;
  } catch (err) {
    console.warn("Copie de la clé illisible impossible :", key, err);
    return false;
  }
}

// Lit une clé JSON. Si elle est illisible et qu'on ne peut pas en garder une copie,
// on bloque son écriture pour ne pas détruire ce qu'elle contient.
function readKey(key) {
  let raw = null;
  try {
    raw = storageBackend.getItem(key);
  } catch (err) {
    console.warn("Stockage local inaccessible :", err);
    return null;
  }
  if (raw === null) return null;
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.warn("Clé illisible :", key, err);
    if (!backupRaw(key, raw)) state.blocked.add(key);
    return null;
  }
}

// Niveau par défaut de chaque langue qui en a un, puis niveaux sauvegardés (filtrés).
function defaultLevels() {
  const levels = {};
  CV.languages.items.filter((l) => l.level).forEach((l) => { levels[l.id] = l.level; });
  return levels;
}

// Libellé de secours d'une variante sans nom : début du texte, coupé entre deux mots.
function shortLabel(text, max = 30) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const space = cut.lastIndexOf(" ");
  return (space > 0 ? cut.slice(0, space) : cut) + "…";
}

// Reconstruit CV.* = données d'origine + ajouts.
function applyCustom() {
  const same = (value) => ({ fr: value, en: value });
  const pair = (c, field) => ({ fr: c[field], en: c[field + "En"] || c[field] });
  const optional = (c, field) => (c[field] || c[field + "En"] ? pair(c, field) : undefined);
  const of = (kind) => state.custom.filter((c) => c.kind === kind);

  const jobs = BASE.experience.map((j) => ({ ...j, bullets: [...j.bullets] }));
  of("exp").forEach((c) => jobs.push({ id: c.id, custom: true, title: pair(c, "title"), org: optional(c, "org"), dates: optional(c, "dates"), flag: optional(c, "flag"), bullets: [] }));
  of("bullet").forEach((c) => {
    const job = jobs.find((j) => j.id === c.parent);
    if (job) job.bullets.push({ id: c.id, custom: true, text: pair(c, "text") });
  });
  CV.experience = jobs;

  CV.education = [
    ...BASE.education,
    ...of("edu").map((c) => ({ id: c.id, custom: true, title: pair(c, "title"), org: optional(c, "org"), dates: pair(c, "dates"), detail: pair(c, "detail") })),
  ];

  CV.lists = BASE.lists.map((list) => ({
    ...list,
    items: [
      ...list.items,
      ...of("item").filter((c) => c.list === list.id).map((c) => ({ id: c.id, custom: true, bullets: c.bullets, label: pair(c, "label"), text: pair(c, "text"), dates: optional(c, "dates"), flag: optional(c, "flag") })),
    ],
  }));

  CV.languages = {
    ...BASE.languages,
    items: [...BASE.languages.items, ...of("lang").map((c) => ({ id: c.id, custom: true, text: pair(c, "text"), level: c.level ? DEFAULT_LEVEL : undefined }))],
  };

  CV.summary = {
    ...BASE.summary,
    variants: [
      ...BASE.summary.variants,
      ...of("summary").map((c) => ({ id: c.id, custom: true, key: "summary-" + c.id, label: optional(c, "label") || same(shortLabel(c.text)), text: pair(c, "text") })),
    ],
  };
}

// Applique une sauvegarde (progression complète ou configuration) après validation.
// Les champs absents (ex. `edits` dans une configuration) laissent l'état actuel intact.
function applySaved(saved) {
  if (!saved || typeof saved !== "object") return false;
  if ((saved.lang !== "fr" && saved.lang !== "en") || !Array.isArray(saved.checked)) return false;
  state.lang = saved.lang;
  if (saved.custom !== undefined) {
    state.custom = validCustom(saved.custom, dataContext());
    applyCustom();
  }
  const known = new Set(collectIds(true));
  state.checked = new Set(validIds(saved.checked).filter((id) => known.has(id)));
  if (saved.identity !== undefined) state.identity = validIdentity(saved.identity);
  state.levels = { ...defaultLevels(), ...validLevels(saved.levels, dataContext()) };
  if (saved.edits !== undefined) state.edits = validEdits(saved.edits, dataContext());
  if (typeof saved.showPhoto === "boolean") state.showPhoto = saved.showPhoto;
  if (typeof saved.onePage === "boolean") state.onePage = saved.onePage;
  if (typeof saved.showSubtitle === "boolean") state.showSubtitle = saved.showSubtitle;
  state.titleColor = validColor(saved.titleColor, state.titleColor);
  Object.assign(state.contact, validContact(saved.contact));
  if (saved.github !== undefined) state.github = validGithub(saved.github);
  if (CV.photos.some((p) => p.id === saved.photoChoice)) state.photoChoice = saved.photoChoice;
  if (CV.summary.variants.some((v) => v.id === saved.summaryChoice)) state.summaryChoice = saved.summaryChoice;
  const photo = validPhoto(saved.photo);
  if (photo) state.photo = photo;
  return true;
}

// Photo : clé dédiée. Une ancienne sauvegarde la gardait dans la progression : on la déplace.
function loadPhoto() {
  let stored = null;
  try {
    stored = validPhoto(storageBackend.getItem(PHOTO_KEY));
  } catch (err) {
    console.warn("Lecture de la photo impossible :", err);
  }
  if (stored) state.photo = stored;
  else if (state.photo) savePhoto();
}

// Chaque clé est lue séparément : une progression corrompue ne doit pas faire perdre les configurations.
function loadState() {
  state.levels = defaultLevels();
  state.edits = validEdits(null);
  const saved = readKey(STORAGE_KEY);
  const restored = applySaved(saved);
  if (saved !== null && !restored && !backupRaw(STORAGE_KEY, JSON.stringify(saved))) state.blocked.add(STORAGE_KEY);
  loadPhoto();
  state.configs = validConfigs(readKey(CONFIGS_KEY), dataContext());
  if (!restored) applyProfile("all");
}

// --- Liste de tous les ids, pour le profil « Tout » ---
// Les éléments avec `flag` (à confirmer / profil particulier) ne sont jamais cochés d'office.
function collectIds(withFlagged) {
  const keep = (item) => withFlagged || !item.flag;
  const ids = [CV.summary.id, CV.languages.id];
  CV.experience.filter(keep).forEach((e) => ids.push(e.id, ...e.bullets.map((b) => b.id)));
  CV.education.forEach((e) => ids.push(e.id));
  CV.languages.items.forEach((l) => ids.push(l.id));
  CV.lists.forEach((list) => list.items.filter(keep).forEach((i) => ids.push(i.id)));
  return ids;
}
const allIds = () => collectIds(false);

function applyProfile(key) {
  const profile = ALL_PROFILES[key];
  state.checked = new Set(profile.ids === "all" ? allIds() : profile.ids);
}

const isOn = (id) => state.checked.has(id);
// Texte dans la langue active ; repli sur le français, puis chaîne vide, pour qu'une donnée incomplète
// n'empêche pas d'afficher le reste du CV.
const warnedTexts = new Set();
function t(obj) {
  const value = obj && obj[state.lang];
  if (typeof value === "string") return value;
  const warning = "Texte manquant (" + state.lang + ") : " + JSON.stringify(obj);
  if (!warnedTexts.has(warning)) {
    warnedTexts.add(warning);
    console.warn(warning);
  }
  return obj && typeof obj.fr === "string" ? obj.fr : "";
}

// --- Petites fonctions de création de HTML (textContent : pas d'injection) ---
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function textWithBreaks(parent, text) {
  text.split("\n").forEach((line, i) => {
    if (i > 0) parent.appendChild(document.createElement("br"));
    parent.appendChild(document.createTextNode(line));
  });
}

// --- Textes modifiables (contenteditable) ---
const hasEdit = (key) => Object.hasOwn(state.edits[state.lang], key);

// Crée un élément dont le texte peut être modifié directement dans le CV.
// `name` : clé de UI_TEXT.editNames, pour le nom accessible (lecteurs d'écran).
function editable(tag, className, key, original, name) {
  const node = el(tag, (className ? className + " " : "") + "edit");
  textWithBreaks(node, hasEdit(key) ? state.edits[state.lang][key] : original);
  node.contentEditable = "true";
  node.tabIndex = 0; // accessible au clavier (Tab), puis on tape directement
  node.setAttribute("role", "textbox");
  node.setAttribute("aria-label", UI_TEXT.editNames[name][state.lang]);
  node.dataset.key = key;
  node.dataset.original = original;
  return node;
}

function readText(node) {
  const clone = node.cloneNode(true);
  clone.querySelectorAll("br").forEach((br) => br.replaceWith("\n"));
  return clone.textContent.trim();
}

function setupEditing() {
  const cv = document.getElementById("cv");
  const target = (event) => (event.target instanceof Element ? event.target.closest("[data-key]") : null);

  cv.addEventListener("input", (event) => {
    const node = target(event);
    if (!node) return;
    const text = cleanEdit(readText(node)).trim();
    if (text === "" || text === node.dataset.original || text.length > LIMITS.text) delete state.edits[state.lang][node.dataset.key];
    else state.edits[state.lang][node.dataset.key] = text;
    saveStateSoon();
  });

  // Fermeture de l'onglet en pleine édition : on écrit ce qui est en attente.
  window.addEventListener("pagehide", () => {
    if (saveTimer !== null) saveState();
  });

  // Un texte vidé revient à l'original ; on sauvegarde quand on quitte le champ.
  cv.addEventListener("focusout", (event) => {
    const node = target(event);
    if (!node) return;
    if (!hasEdit(node.dataset.key)) {
      node.replaceChildren();
      textWithBreaks(node, node.dataset.original);
    }
    saveState();
  });

  cv.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && target(event)) {
      event.preventDefault();
      event.target.blur();
    }
  });

  // Collage en texte brut : pas de mise en forme venue d'ailleurs.
  cv.addEventListener("paste", (event) => {
    if (!target(event)) return;
    event.preventDefault();
    const text = event.clipboardData.getData("text/plain").replace(/\s*\n\s*/g, " ");
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    selection.deleteFromDocument();
    selection.getRangeAt(0).insertNode(document.createTextNode(text));
    selection.collapseToEnd();
    event.target.dispatchEvent(new Event("input", { bubbles: true }));
  });

  document.getElementById("reset-texts").addEventListener("click", () => {
    if (!window.confirm(UI_TEXT.confirmReset[state.lang])) return;
    state.edits[state.lang] = Object.create(null);
    saveState();
    renderCV();
  });
}

// --- Configurations nommées et sauvegarde de secours ---
function renderConfigs() {
  const list = document.getElementById("config-list");
  list.replaceChildren();
  state.configs.forEach((config, index) => {
    const item = el("li", "config-item");
    item.appendChild(el("span", "config-name", config.name));
    const load = UI_TEXT.configLoad[state.lang];
    const del = UI_TEXT.configDelete[state.lang];
    item.append(
      chip(load, () => loadConfig(index), { label: load + " : " + config.name }),
      chip(del, () => deleteConfig(index), { label: del + " : " + config.name }),
    );
    list.appendChild(item);
  });
}

function refreshAll() {
  renderToolbar();
  renderControls();
  renderCV();
}

function saveConfig() {
  const input = document.getElementById("config-name");
  const name = input.value.trim().slice(0, LIMITS.configName);
  if (!name) return;
  const existing = state.configs.findIndex((c) => c.name === name);
  if (existing >= 0) {
    if (!window.confirm(UI_TEXT.configOverwrite[state.lang])) return;
    state.configs[existing].data = snapshot();
  } else {
    if (state.configs.length >= MAX_CONFIGS) {
      notify(UI_TEXT.configFull[state.lang], true);
      return;
    }
    state.configs.push({ name, data: snapshot() });
  }
  saveConfigs();
  input.value = "";
  renderConfigs();
}

// Remet les éléments ajoutés cochés dans la configuration (et les expériences parentes de leurs puces)
// qui ont été supprimés depuis son enregistrement.
function restoreCustom(data) {
  const items = data.customItems || [];
  const wanted = new Set(data.checked);
  items.forEach((c) => { if (c.kind === "bullet" && wanted.has(c.id)) wanted.add(c.parent); });
  const have = new Set(state.custom.map((c) => c.id));
  const missing = items.filter((c) => wanted.has(c.id) && !have.has(c.id));
  if (missing.length === 0) return;
  state.custom = validCustom([...state.custom, ...missing], dataContext());
  applyCustom();
}

// Partie « données » du chargement d'une configuration (sans toucher à l'écran) ; renvoie null si elle est invalide,
// sinon le nombre d'éléments cochés qui n'existent plus.
function applyConfig(index) {
  const config = state.configs[index];
  if (!config) return null;
  restoreCustom(config.data);
  const known = new Set(collectIds(true));
  const unknown = config.data.checked.filter((id) => !known.has(id)).length;
  return applySaved(config.data) ? unknown : null;
}

function loadConfig(index) {
  const unknown = applyConfig(index);
  if (unknown === null) return;
  saveState();
  refreshAll();
  if (unknown > 0) notify(UI_TEXT.configMissing[state.lang].replace("{n}", String(unknown)), true);
}

function deleteConfig(index) {
  if (!window.confirm(UI_TEXT.configDeleteConfirm[state.lang])) return;
  state.configs.splice(index, 1);
  saveConfigs();
  renderConfigs();
}

function buildBackup() {
  return { app: "cv-modulaire", version: 1, state: fullState(), configs: state.configs };
}

function exportBackup() {
  const url = URL.createObjectURL(new Blob([JSON.stringify(buildBackup())], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "cv-modulaire-sauvegarde.json";
  link.click();
  URL.revokeObjectURL(url);
}

// Un import remplace TOUT (comme le dit la confirmation) : les clés absentes du fichier reviennent à leur valeur d'origine.
function emptyProgress() {
  return {
    custom: [],
    identity: {},
    edits: {},
    github: "",
    showPhoto: true,
    onePage: false,
    showSubtitle: true,
    titleColor: DEFAULT_TITLE_COLOR,
    contact: { address: true, phone: true, email: true, github: true },
    photoChoice: CV.photos.length > 0 ? CV.photos[0].id : "",
    summaryChoice: CV.summary.variants[0].id,
  };
}

function applyBackup(backup) {
  if (!backup || backup.app !== "cv-modulaire") return false;
  // La photo importée n'est remplacée que si la sauvegarde est valide (elle peut ne pas en contenir).
  const previousPhoto = state.photo;
  state.photo = null;
  if (!applySaved({ ...emptyProgress(), ...backup.state })) {
    state.photo = previousPhoto;
    return false;
  }
  state.configs = validConfigs(backup.configs, dataContext());
  return true;
}

async function importBackup(file) {
  try {
    if (file.size > MAX_BACKUP_BYTES) throw new Error("fichier trop volumineux");
    const backup = JSON.parse(await file.text());
    if (!backup || backup.app !== "cv-modulaire") throw new Error("format inconnu");
    if (!window.confirm(UI_TEXT.importConfirm[state.lang])) return;
    if (!applyBackup(backup)) throw new Error("progression invalide");
    saveState();
    savePhoto();
    saveConfigs();
    refreshAll();
  } catch (err) {
    console.warn("Import de sauvegarde impossible :", err);
    notify(UI_TEXT.importError[state.lang], true);
  }
}

function setupConfigs() {
  document.getElementById("config-save").addEventListener("click", saveConfig);
  document.getElementById("config-name").addEventListener("keydown", (event) => {
    if (event.key === "Enter") saveConfig();
  });
  document.getElementById("backup-export").addEventListener("click", exportBackup);
  const file = document.getElementById("backup-file");
  document.getElementById("backup-import").addEventListener("click", () => file.click());
  file.addEventListener("change", async () => {
    if (file.files[0]) await importBackup(file.files[0]);
    file.value = "";
  });
}

// --- Panneau de contrôle ---
// Les contrôles sont construits par renderControls (quand la structure change : langue, ajout, suppression,
// chargement d'une configuration). Quand seul l'état change (case cochée, profil, photo...), syncControls
// met simplement à jour les cases, les boutons grisés et les états « pressé » : rien n'est reconstruit,
// donc les blocs ouverts et les textes en cours de saisie restent en place.
const syncers = [];
const onSync = (fn) => { fn(); syncers.push(fn); };
const syncControls = () => syncers.forEach((sync) => sync());

// Bouton arrondi. `opts.pressed` / `opts.disabled` : fonctions relues à chaque syncControls ; `opts.label` : nom accessible.
function chip(text, onClick, opts = {}) {
  const btn = el("button", "chip", text);
  btn.type = "button";
  if (opts.label) btn.setAttribute("aria-label", opts.label);
  btn.addEventListener("click", onClick);
  if (opts.pressed || opts.disabled) {
    onSync(() => {
      if (opts.pressed) btn.setAttribute("aria-pressed", String(opts.pressed()));
      if (opts.disabled) btn.disabled = opts.disabled();
    });
  }
  return btn;
}

// Case à cocher : `get` lit l'état, `set` l'écrit. `opts` : className, flag (mention « à confirmer »), enabled (fonction).
function checkbox(label, get, set, opts = {}) {
  const wrapper = el("label", opts.className ? "check " + opts.className : "check");
  const input = document.createElement("input");
  input.type = "checkbox";
  input.addEventListener("change", () => set(input.checked));
  wrapper.append(input, el("span", "", label));
  if (opts.flag) wrapper.appendChild(el("em", "badge", UI_TEXT.flagged[state.lang] + " : " + t(opts.flag)));
  onSync(() => {
    input.checked = get();
    input.disabled = opts.enabled ? !opts.enabled() : false;
  });
  return wrapper;
}

// Case liée à un élément du CV (son id est dans state.checked).
function itemCheckbox(id, label, opts) {
  return checkbox(label, () => isOn(id), (on) => {
    if (on) state.checked.add(id);
    else state.checked.delete(id);
    saveState();
    renderCV();
    syncControls();
  }, opts);
}

// Case liée à un booléen de l'état (target[key]).
function stateCheckbox(label, target, key, opts) {
  return checkbox(label, () => target[key], (on) => {
    target[key] = on;
    saveState();
    renderCV();
    syncControls();
  }, opts);
}

function textInput({ value, max, label, placeholder, onInput }) {
  const input = document.createElement("input");
  input.type = "text";
  input.className = "text-input";
  input.maxLength = max;
  input.value = value;
  if (placeholder) input.placeholder = placeholder;
  input.setAttribute("aria-label", label);
  input.addEventListener("input", () => onInput(input.value));
  return input;
}

function group(title) {
  const section = el("section", "group");
  section.appendChild(el("h3", "", title));
  return section;
}

// --- Ajout et suppression d'éléments par l'utilisateur ---
function pageTitle() {
  const lang = state.lang;
  return SEPARATORS.pageTitle[lang] + (state.identity.name || CV.name) + SEPARATORS.pageTitleLang[lang] + lang.toUpperCase();
}

function newCustomId() {
  let id;
  do { id = "c" + Math.random().toString(36).slice(2, 10); } while (state.custom.some((c) => c.id === id));
  return id;
}

// Formulaire qui vient d'être validé : on ne lui rend pas ses anciennes valeurs après la reconstruction.
let submittedForm = null;

// Ajoute un élément (coché d'office). La validation est celle du chargement : un ajout invalide est refusé.
function addCustom(entry) {
  const id = newCustomId();
  const next = validCustom([...state.custom, { id, ...entry }], dataContext());
  if (next.length !== state.custom.length + 1) return false;
  state.custom = next;
  applyCustom();
  state.checked.add(id);
  if (entry.kind === "lang" && entry.level) state.levels[id] = DEFAULT_LEVEL;
  saveState();
  renderControls();
  renderCV();
  return true;
}

function removeCustom(id) {
  if (!window.confirm(UI_TEXT.removeConfirm[state.lang])) return;
  const removed = state.custom.filter((c) => c.id === id || c.parent === id).map((c) => c.id);
  state.custom = state.custom.filter((c) => !removed.includes(c.id));
  applyCustom();
  removed.forEach((gone) => {
    state.checked.delete(gone);
    delete state.levels[gone];
    ["fr", "en"].forEach((lang) => {
      Object.keys(state.edits[lang]).filter((key) => key === gone || key.startsWith(gone + ":")).forEach((key) => delete state.edits[lang][key]);
    });
  });
  if (!CV.summary.variants.some((v) => v.id === state.summaryChoice)) state.summaryChoice = CV.summary.variants[0].id;
  saveState();
  renderControls();
  renderCV();
}

// Bouton « Supprimer », seulement sur les éléments ajoutés (les données d'origine se décochent).
// Le nom de l'élément est dans le nom accessible : sinon tous les boutons s'appellent « Supprimer ».
function removeButton(id, name) {
  const label = UI_TEXT.remove[state.lang];
  return chip(label, (event) => {
    event.preventDefault();
    removeCustom(id);
  }, { label: label + " : " + name });
}

// Formulaire repliable. `key` identifie le formulaire quand le panneau est reconstruit.
// `fields` : { name, label, type, required?, textarea?, checkbox? } ; `onAdd` reçoit { name: valeur } et renvoie false si l'ajout est refusé.
function addForm(key, summaryLabel, fields, onAdd, hint) {
  const box = el("details", "add");
  box.dataset.form = key;
  box.appendChild(el("summary", "chip", summaryLabel));
  const form = document.createElement("form");
  const inputs = {};
  fields.forEach((field) => {
    const label = el("label", field.checkbox ? "check" : "field");
    const input = document.createElement(field.textarea ? "textarea" : "input");
    if (field.checkbox) input.type = "checkbox";
    else {
      input.className = "text-input";
      if (field.textarea) input.rows = 3;
      else input.type = "text";
      input.maxLength = FIELD_TYPES[field.type].max;
      input.required = Boolean(field.required);
    }
    label.append(...(field.checkbox ? [input, el("span", "", field.label[state.lang])] : [el("span", "", field.label[state.lang]), input]));
    form.appendChild(label);
    inputs[field.name] = input;
  });
  if (hint) form.appendChild(el("p", "hint", hint));
  const error = el("p", "error");
  error.setAttribute("role", "alert");
  const submit = el("button", "chip", UI_TEXT.addSubmit[state.lang]);
  submit.type = "submit";
  form.append(error, submit);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = {};
    fields.forEach((field) => { values[field.name] = field.checkbox ? inputs[field.name].checked : inputs[field.name].value; });
    submittedForm = key;
    const ok = onAdd(values);
    submittedForm = null;
    error.textContent = ok ? "" : UI_TEXT.addError[state.lang];
  });
  box.appendChild(form);
  return box;
}

// Avant de reconstruire le panneau : état ouvert/fermé et valeurs saisies de chaque formulaire d'ajout.
function captureForms(panel) {
  const saved = new Map();
  panel.querySelectorAll("details.add[data-form]").forEach((box) => {
    const fields = [...box.querySelectorAll("input, textarea")];
    saved.set(box.dataset.form, { open: box.open, values: fields.map((f) => (f.type === "checkbox" ? f.checked : f.value)) });
  });
  return saved;
}

function restoreForms(panel, saved, skipKey) {
  panel.querySelectorAll("details.add[data-form]").forEach((box) => {
    const previous = saved.get(box.dataset.form);
    if (!previous || box.dataset.form === skipKey) return;
    box.open = previous.open;
    [...box.querySelectorAll("input, textarea")].forEach((f, i) => {
      if (f.type === "checkbox") f.checked = previous.values[i];
      else f.value = previous.values[i];
    });
  });
}

const FIELD = (name, required, type = "line", textarea = false) => ({ name, label: UI_TEXT.fields[name], required, type, textarea });

// Curseur de niveau : ne reconstruit que le CV, pour ne pas perdre le focus pendant le glissement.
function levelSlider(item, enabled) {
  const wrapper = el("div", "level");
  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = "0";
  slider.max = String(LANGUAGE_LEVELS.length - 1);
  slider.step = "1";
  slider.setAttribute("aria-label", t(item.text));
  const value = el("span", "level-value");
  const show = () => {
    const level = state.levels[item.id];
    slider.value = String(LANGUAGE_LEVELS.indexOf(level));
    slider.setAttribute("aria-valuetext", level); // « B2 » plutôt que « 1 »
    value.textContent = level;
  };
  slider.addEventListener("input", () => {
    state.levels[item.id] = LANGUAGE_LEVELS[Number(slider.value)];
    show();
    saveStateSoon();
    renderCV();
  });
  wrapper.append(el("span", "level-end", LANGUAGE_LEVELS[0]), slider, el("span", "level-end", LANGUAGE_LEVELS[LANGUAGE_LEVELS.length - 1]), value);
  onSync(() => {
    slider.disabled = !enabled();
    show();
  });
  return wrapper;
}

// Erreur de photo avec un code, pour afficher un message précis à l'utilisateur.
function photoError(code) {
  const err = new Error("photo : " + code);
  err.code = code;
  return err;
}

function photoErrorText(err) {
  if (err.code === "type") return UI_TEXT.photoType[state.lang];
  if (err.code === "size") return UI_TEXT.photoSize[state.lang].replace("{mb}", String(MAX_PHOTO_FILE_BYTES / (1024 * 1024)));
  return UI_TEXT.photoError[state.lang];
}

// Redimensionne l'image importée et la renvoie en data URL JPEG. Le passage par un canvas ré-encode
// l'image : ce qu'on stocke est toujours un JPEG que l'on a produit nous-mêmes.
function readPhoto(file) {
  return new Promise((resolve, reject) => {
    // Contrôles avant tout décodage : on ne charge pas un fichier inutilement lourd ou d'un type non prévu.
    if (!PHOTO_TYPES.includes(file.type)) return reject(photoError("type"));
    if (file.size > MAX_PHOTO_FILE_BYTES) return reject(photoError("size"));
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, PHOTO_MAX_SIDE / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      const result = validPhoto(canvas.toDataURL("image/jpeg", PHOTO_QUALITY));
      if (result) resolve(result);
      else reject(photoError("size"));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(photoError("unreadable"));
    };
    img.src = url;
  });
}

function layoutControls() {
  const box = group(UI_TEXT.layout[state.lang]);
  box.appendChild(stateCheckbox(UI_TEXT.onePage[state.lang], state, "onePage"));
  box.appendChild(stateCheckbox(UI_TEXT.subtitle[state.lang], state, "showSubtitle"));

  const color = el("label", "check");
  const picker = document.createElement("input");
  picker.type = "color";
  picker.addEventListener("input", () => {
    state.titleColor = picker.value;
    saveStateSoon();
    renderCV();
  });
  const reset = chip(UI_TEXT.resetColor[state.lang], () => {
    state.titleColor = DEFAULT_TITLE_COLOR;
    saveState();
    renderCV();
    syncControls();
  });
  color.append(picker, el("span", "", UI_TEXT.titleColor[state.lang]), reset);
  onSync(() => { picker.value = state.titleColor; });
  box.appendChild(color);
  return box;
}

function photoControls() {
  const box = group(UI_TEXT.photo[state.lang]);
  box.appendChild(stateCheckbox(UI_TEXT.showPhoto[state.lang], state, "showPhoto"));

  const message = el("p", "error");
  message.setAttribute("role", "alert");
  const file = document.createElement("input");
  file.type = "file";
  file.accept = PHOTO_TYPES.join(",");
  file.hidden = true;
  file.addEventListener("change", async () => {
    message.textContent = "";
    if (!file.files[0]) return;
    try {
      state.photo = await readPhoto(file.files[0]);
      savePhoto();
      saveState();
      renderCV();
      syncControls();
    } catch (err) {
      console.warn("Import de photo impossible :", err);
      message.textContent = photoErrorText(err);
    }
    file.value = "";
  });
  const noPhoto = () => !state.showPhoto;
  const actions = el("div", "photo-actions");
  actions.append(chip(UI_TEXT.importPhoto[state.lang], () => file.click(), { disabled: noPhoto }), file);

  // Photos fournies : en choisir une remplace la photo importée.
  const choices = el("div", "photo-actions");
  CV.photos.forEach((photo) => {
    choices.appendChild(chip(t(photo.label), () => {
      state.photoChoice = photo.id;
      state.photo = null;
      savePhoto();
      saveState();
      renderCV();
      syncControls();
    }, { disabled: noPhoto, pressed: () => !state.photo && state.photoChoice === photo.id }));
  });
  box.append(el("p", "label", UI_TEXT.photoChoices[state.lang]), choices, actions, message);
  return box;
}

function contactControls() {
  const box = group(UI_TEXT.contactLabel[state.lang]);
  CONTACT_FIELDS.forEach((field) => {
    box.appendChild(stateCheckbox(UI_TEXT.contactFields[field][state.lang], state.contact, field));
  });

  IDENTITY_FIELDS.forEach((field) => {
    box.appendChild(textInput({
      value: state.identity[field],
      max: LIMITS.identity,
      label: UI_TEXT.contactFields[field][state.lang],
      placeholder: field === "name" ? CV.name : field === "address" ? t(CV.contact.address) : CV.contact[field],
      onInput: (value) => {
        state.identity[field] = cleanLine(value, LIMITS.identity);
        document.title = pageTitle();
        saveStateSoon();
        renderCV();
      },
    }));
  });
  box.appendChild(textInput({
    value: state.github,
    max: LIMITS.github,
    label: UI_TEXT.contactFields.github[state.lang],
    placeholder: UI_TEXT.githubPlaceholder[state.lang],
    onInput: (value) => {
      state.github = validGithub(value);
      saveStateSoon();
      renderCV();
    },
  }));

  const anyShown = () => CONTACT_FIELDS.some((field) => state.contact[field]);
  const toggle = chip("", () => {
    const show = !anyShown();
    CONTACT_FIELDS.forEach((field) => { state.contact[field] = show; });
    saveState();
    renderCV();
    syncControls();
  });
  onSync(() => { toggle.textContent = (anyShown() ? UI_TEXT.hideContact : UI_TEXT.showContact)[state.lang]; });
  box.appendChild(el("div", "options")).appendChild(toggle);
  return box;
}

function summaryControls() {
  const summary = group(UI_TEXT.sections.summary[state.lang]);
  summary.appendChild(itemCheckbox(CV.summary.id, UI_TEXT.sections.summary[state.lang]));
  const variants = el("div", "options");
  CV.summary.variants.forEach((variant) => {
    variants.appendChild(chip(t(variant.label), () => {
      state.summaryChoice = variant.id;
      saveState();
      renderCV();
      syncControls();
    }, { disabled: () => !isOn(CV.summary.id), pressed: () => state.summaryChoice === variant.id }));
    if (variant.custom) variants.appendChild(removeButton(variant.id, t(variant.label)));
  });
  summary.append(el("p", "label", UI_TEXT.summaryText[state.lang]), variants);
  const fields = [{ ...FIELD("variantLabel", true), name: "label" }, { ...FIELD("summaryText", true, "long", true), name: "text" }];
  const hint = UI_TEXT.addHint[state.lang] + " " + UI_TEXT.singleLineHint[state.lang];
  summary.appendChild(addForm("summary", UI_TEXT.add[state.lang], fields, (v) => addCustom({ kind: "summary", label: v.label, text: v.text }), hint));
  return summary;
}

function experienceControls() {
  const exp = group(UI_TEXT.sections.experience[state.lang]);
  CV.experience.forEach((job) => {
    const jobBox = itemCheckbox(job.id, t(job.title), { className: "parent", flag: job.flag });
    if (job.custom) jobBox.appendChild(removeButton(job.id, t(job.title)));
    exp.appendChild(jobBox);
    job.bullets.forEach((b) => {
      const box = itemCheckbox(b.id, t(b.text), { className: "child", enabled: () => isOn(job.id) });
      if (b.custom) box.appendChild(removeButton(b.id, t(b.text)));
      exp.appendChild(box);
    });
    exp.appendChild(addForm("bullet-" + job.id, UI_TEXT.addBullet[state.lang], [{ ...FIELD("bulletText", true, "long"), name: "text" }], (v) => addCustom({ kind: "bullet", parent: job.id, text: v.text }), UI_TEXT.singleLineHint[state.lang]));
  });
  exp.appendChild(addForm("exp", UI_TEXT.add[state.lang], [FIELD("title", true), FIELD("org"), FIELD("dates")], (v) => addCustom({ kind: "exp", ...v }), UI_TEXT.addHint[state.lang]));
  return exp;
}

function educationControls() {
  const edu = group(UI_TEXT.sections.education[state.lang]);
  CV.education.forEach((e) => {
    const box = itemCheckbox(e.id, t(e.title));
    if (e.custom) box.appendChild(removeButton(e.id, t(e.title)));
    edu.appendChild(box);
  });
  edu.appendChild(addForm("edu", UI_TEXT.add[state.lang], [FIELD("title", true), FIELD("org"), FIELD("dates"), FIELD("detail", false, "long")], (v) => addCustom({ kind: "edu", ...v }), UI_TEXT.addHint[state.lang]));
  return edu;
}

function listControls(list) {
  const box = group(t(list.title));
  list.items.forEach((item) => {
    const itemBox = itemCheckbox(item.id, t(item.label), { flag: item.flag });
    if (item.custom) itemBox.appendChild(removeButton(item.id, t(item.label)));
    box.appendChild(itemBox);
  });
  const hint = UI_TEXT.addHint[state.lang] + " " + UI_TEXT.multilineHint[state.lang];
  box.appendChild(addForm("list-" + list.id, UI_TEXT.add[state.lang], [FIELD("label", true), FIELD("dates"), FIELD("text", false, "multiline", true)], (v) => addCustom({ kind: "item", list: list.id, ...v }), hint));
  return box;
}

function languageControls() {
  const langs = group(UI_TEXT.sections.languages[state.lang]);
  const enabled = () => isOn(CV.languages.id);
  langs.appendChild(itemCheckbox(CV.languages.id, t(CV.labels.languages), { className: "parent" }));
  CV.languages.items.forEach((l) => {
    const box = itemCheckbox(l.id, t(l.text), { className: "child", enabled });
    if (l.custom) box.appendChild(removeButton(l.id, t(l.text)));
    langs.appendChild(box);
    if (l.level) langs.appendChild(levelSlider(l, () => enabled() && isOn(l.id)));
  });
  const fields = [{ ...FIELD("language", true), name: "text" }, { name: "level", label: UI_TEXT.fields.level, checkbox: true }];
  langs.appendChild(addForm("lang", UI_TEXT.add[state.lang], fields, (v) => addCustom({ kind: "lang", ...v }), UI_TEXT.addHint[state.lang]));
  return langs;
}

function renderControls() {
  const panel = document.getElementById("controls");
  const scroller = panel.closest(".sidebar");
  const scrollTop = scroller.scrollTop;
  const forms = captureForms(panel);
  syncers.length = 0;
  panel.replaceChildren();

  panel.appendChild(el("h2", "", UI_TEXT.content[state.lang]));
  panel.append(layoutControls(), photoControls(), contactControls(), summaryControls(), experienceControls(), educationControls());
  CV.lists.forEach((list) => panel.appendChild(listControls(list)));
  panel.appendChild(languageControls());

  restoreForms(panel, forms, submittedForm);
  scroller.scrollTop = scrollTop;
}

function renderToolbar() {
  const lang = state.lang;
  const setText = (id, text) => { document.getElementById(id).textContent = text; };
  setText("label-language", UI_TEXT.language[lang]);
  setText("label-profiles", UI_TEXT.profiles[lang]);
  setText("label-configs", UI_TEXT.configsLabel[lang]);
  setText("configs-hint", UI_TEXT.configsHint[lang]);
  setText("config-save", UI_TEXT.configSave[lang]);
  setText("backup-export", UI_TEXT.backupExport[lang]);
  setText("backup-import", UI_TEXT.backupImport[lang]);
  setText("backup-note", UI_TEXT.backupNote[lang]);
  setText("label-edit", UI_TEXT.editLabel[lang]);
  setText("edit-hint", UI_TEXT.editHint[lang]);
  setText("reset-texts", UI_TEXT.resetTexts[lang]);
  setText("export-btn", UI_TEXT.export[lang]);
  setText("export-hint", UI_TEXT.hint[lang]);
  const configName = document.getElementById("config-name");
  configName.placeholder = UI_TEXT.configName[lang];
  configName.setAttribute("aria-label", UI_TEXT.configName[lang]);
  configName.maxLength = LIMITS.configName;
  setSaveStatus(!state.saveFailed);
  renderConfigs();
  document.documentElement.lang = lang;
  document.title = pageTitle();

  document.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.dataset.lang === lang));
  });

  // Un profil est une action (il coche un lot d'éléments), pas un état : pas d'aria-pressed.
  const profileBox = document.getElementById("profiles");
  profileBox.replaceChildren();
  Object.keys(ALL_PROFILES).forEach((key) => {
    profileBox.appendChild(chip(t(ALL_PROFILES[key].label), () => {
      applyProfile(key);
      saveState();
      renderCV();
      syncControls();
    }));
  });
}

// --- Rendu du CV ---
function row(titleNode, datesNode, orgNode) {
  const r = el("div", "row");
  const heading = el("h4");
  heading.appendChild(titleNode);
  if (orgNode) heading.appendChild(orgNode);
  r.append(heading, datesNode);
  return r;
}

// Dates modifiables, ou cellule vide si l'élément n'a pas de dates.
function datesNode(key, dates) {
  return dates ? editable("span", "dates", key, dates, "dates") : el("span", "dates");
}

// Structure et lieu sur la même ligne que l'intitulé (même modèle pour expériences et études).
function orgInline(item) {
  if (!item.org) return null;
  const wrap = el("span", "org");
  wrap.append(document.createTextNode(SEPARATORS.org[state.lang]), editable("span", "", item.id + ":org", t(item.org), "org"));
  return wrap;
}

// Ligne commune aux expériences et aux études : intitulé, structure, dates.
function entryRow(item) {
  return row(editable("span", "", item.id + ":title", t(item.title), "title"), datesNode(item.id + ":dates", item.dates ? t(item.dates) : ""), orgInline(item));
}

function renderHeader(cv) {
  const providedPhoto = CV.photos.find((p) => p.id === state.photoChoice);
  const photoSrc = state.photo || (providedPhoto && providedPhoto.src);
  const showPhoto = state.showPhoto && Boolean(photoSrc);
  const header = el("header", showPhoto ? "cv-header" : "cv-header no-photo");
  const identity = el("div", "identity");
  const name = state.identity.name || CV.name;
  identity.appendChild(el("h1", "", name));
  if (state.showSubtitle) identity.appendChild(editable("p", "subtitle", "subtitle", t(CV.subtitle), "subtitle"));
  const contactParts = [
    state.contact.address && (state.identity.address || t(CV.contact.address)),
    state.contact.phone && (state.identity.phone || CV.contact.phone),
    state.contact.email && (state.identity.email || CV.contact.email),
    state.contact.github && state.github && state.github.replace(/^https?:\/\//, ""),
  ].filter(Boolean);
  if (contactParts.length > 0) identity.appendChild(el("p", "contact", contactParts.join(SEPARATORS.contact[state.lang])));
  header.appendChild(identity);
  if (showPhoto) {
    const photo = el("img", "photo");
    photo.src = photoSrc;
    photo.alt = name;
    header.appendChild(photo);
  }
  cv.appendChild(header);

  if (isOn(CV.summary.id)) {
    const variant = CV.summary.variants.find((v) => v.id === state.summaryChoice);
    cv.appendChild(editable("p", "summary", variant.key, t(variant.text), "summary"));
  }
}

function renderExperience(cv) {
  const jobs = CV.experience.filter((j) => isOn(j.id));
  if (jobs.length === 0) return;
  const section = el("section", "cv-section");
  section.appendChild(el("h2", "", t(CV.labels.experience)));
  jobs.forEach((job) => {
    const block = el("div", "entry");
    block.appendChild(entryRow(job));
    const bullets = job.bullets.filter((b) => isOn(b.id));
    if (bullets.length > 0) {
      const ul = el("ul");
      bullets.forEach((b) => {
        const li = el("li");
        li.appendChild(editable("span", "", b.id, t(b.text), "bullet"));
        ul.appendChild(li);
      });
      block.appendChild(ul);
    }
    section.appendChild(block);
  });
  cv.appendChild(section);
}

function renderEducation(cv) {
  const items = CV.education.filter((e) => isOn(e.id));
  if (items.length === 0) return;
  const section = el("section", "cv-section");
  section.appendChild(el("h2", "", t(CV.labels.education)));
  items.forEach((e) => {
    const block = el("div", "entry");
    block.appendChild(entryRow(e));
    const detail = e.detail ? t(e.detail) : "";
    if (detail) block.appendChild(editable("p", "detail", e.id + ":detail", detail, "detail"));
    section.appendChild(block);
  });
  cv.appendChild(section);
}

function renderLists(cv, onlyIds) {
  CV.lists.filter((list) => !onlyIds || onlyIds.includes(list.id)).forEach((list) => {
    const items = list.items.filter((i) => isOn(i.id));
    if (items.length === 0) return;
    const section = el("section", "cv-section");
    section.appendChild(el("h2", "", t(list.title)));
    const ul = el("ul", "extra");
    items.forEach((item) => {
      const li = el("li");
      const text = item.text ? t(item.text) : "";
      const label = editable("strong", "", item.id + ":label", t(item.label), "label");
      // Avec des dates ou une structure (org, ex. l'environnement technique d'un projet), la ligne suit le modèle
      // des expériences : intitulé et structure à gauche, dates à droite.
      if (item.dates || item.org) li.appendChild(row(label, datesNode(item.id + ":dates", item.dates ? t(item.dates) : ""), orgInline(item)));
      else li.appendChild(label);
      if (text.includes("\n") || item.bullets) {
        const sub = el("ul", "sub");
        text.split("\n").forEach((part, i) => {
          const subItem = el("li");
          subItem.appendChild(editable("span", "", item.id + ":text" + i, part, "text"));
          sub.appendChild(subItem);
        });
        li.appendChild(sub);
      } else if (text) {
        li.appendChild(document.createTextNode(SEPARATORS.label[state.lang]));
        li.appendChild(editable("span", "", item.id + ":text", text, "text"));
      }
      ul.appendChild(li);
    });
    section.appendChild(ul);
    cv.appendChild(section);
  });
}

function renderExtra(cv) {
  const langs = isOn(CV.languages.id) ? CV.languages.items.filter((l) => isOn(l.id)) : [];
  if (langs.length === 0) return;

  const section = el("section", "cv-section");
  section.appendChild(el("h2", "", t(CV.labels.extra)));
  const ul = el("ul", "extra");
  const li = el("li");
  li.appendChild(el("strong", "", t(CV.labels.languages) + SEPARATORS.label[state.lang]));
  langs.forEach((value, i) => {
    if (i > 0) li.appendChild(document.createTextNode(", "));
    li.appendChild(editable("span", "", value.id, t(value.text), "language"));
    // Le niveau (langues) se règle avec le curseur, pas au clavier.
    if (value.level) li.appendChild(document.createTextNode(" (" + state.levels[value.id] + ")"));
  });
  ul.appendChild(li);
  section.appendChild(ul);
  cv.appendChild(section);
}

function renderCV() {
  const cv = document.getElementById("cv");
  cv.replaceChildren();
  renderHeader(cv);
  renderExperience(cv);
  renderLists(cv, ["tech"]);
  renderEducation(cv);
  renderLists(cv, CV.lists.map((l) => l.id).filter((id) => id !== "tech"));
  renderExtra(cv);
  fitOnePage(cv);
}

// Réduit le CV (zoom) jusqu'à ce qu'il tienne sur un A4. La largeur est agrandie d'autant
// pour que la page garde 210 mm à l'écran et à l'impression.
// Recherche dichotomique : environ 6 mesures au lieu d'une vingtaine de reflows.
const FIT_MIN = 0.5;
const FIT_PRECISION = 0.01;
const FIT_MARGIN_PX = 2; // marge de sécurité : une page imprimée arrondit autrement qu'à l'écran
function fitOnePage(cv) {
  cv.style.setProperty("--cv-title", state.titleColor);
  cv.classList.toggle("one-page", state.onePage);
  cv.style.setProperty("--fit", "1");
  const warning = document.getElementById("fit-warning");
  warning.textContent = "";
  if (!state.onePage) return;
  const limit = document.getElementById("a4-probe").getBoundingClientRect().height - FIT_MARGIN_PX;
  // On mesure le contenu seul (comme à l'impression, où min-height est supprimée), pas la page A4 minimale.
  cv.style.minHeight = "0";
  const fits = (fit) => {
    cv.style.setProperty("--fit", String(fit));
    return cv.scrollHeight * fit <= limit;
  };
  if (fits(1)) {
    cv.style.removeProperty("min-height");
    return;
  }
  if (!fits(FIT_MIN)) {
    warning.textContent = UI_TEXT.fitTooLong[state.lang];
    cv.style.removeProperty("min-height");
    return;
  }
  // Invariant : `low` tient sur une page, `high` non.
  let low = FIT_MIN;
  let high = 1;
  while (high - low > FIT_PRECISION) {
    const middle = (low + high) / 2;
    if (fits(middle)) low = middle;
    else high = middle;
  }
  cv.style.setProperty("--fit", String(Math.floor(low * 100) / 100));
  cv.style.removeProperty("min-height");
}

// --- Démarrage ---
// Message d'erreur lisible à la place d'une page blanche.
function showFatal(message) {
  if (typeof document === "undefined") return;
  const box = document.createElement("div");
  box.className = "fatal";
  box.setAttribute("role", "alert");
  box.textContent = message;
  document.body.prepend(box);
}

function init() {
  try {
    loadState();
    document.querySelectorAll("[data-lang]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.lang = btn.dataset.lang;
        saveState();
        renderToolbar();
        renderControls();
        renderCV();
      });
    });
    setupEditing();
    setupConfigs();
    // Demande au navigateur de ne pas effacer la progression quand il manque de place.
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
    document.getElementById("export-btn").addEventListener("click", () => window.print());
    renderToolbar();
    renderControls();
    renderCV();
    // Les polices web arrivent après le premier rendu et changent la hauteur du CV : on remesure.
    const refit = () => fitOnePage(document.getElementById("cv"));
    if (document.fonts) document.fonts.ready.then(refit);
    window.addEventListener("beforeprint", refit);
  } catch (err) {
    console.error("Démarrage impossible :", err);
    showFatal("Erreur : l'application n'a pas pu s'afficher (" + err.message + "). / The app could not be displayed.");
  }
}

// Sans page (tests en ligne de commande ou tests.html), on ne démarre pas l'interface.
if (typeof document !== "undefined" && document.getElementById("cv")) init();
