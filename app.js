// Interface : cases à cocher (panneau de gauche) + rendu du CV (aperçu A4 à droite).

const STORAGE_KEY = "cv-modulaire-v2";
const UI_TEXT = {
  subtitle: { fr: "Sous-titre (objectif recherché)", en: "Subtitle (what you are looking for)" },
  language: { fr: "Langue", en: "Language" },
  profiles: { fr: "Profils", en: "Profiles" },
  content: { fr: "Contenu du CV", en: "CV content" },
  export: { fr: "Exporter en PDF", en: "Export as PDF" },
  hint: {
    fr: "Dans la fenêtre d'impression, choisis « Enregistrer au format PDF » et désactive les en-têtes/pieds de page.",
    en: "In the print dialog, choose “Save as PDF” and turn off headers and footers.",
  },
  contactLabel: { fr: "Coordonnées", en: "Contact details" },
  contactFields: {
    address: { fr: "Adresse", en: "Address" },
    phone: { fr: "Téléphone", en: "Phone" },
    email: { fr: "E-mail", en: "E-mail" },
    github: { fr: "GitHub", en: "GitHub" },
  },
  githubPlaceholder: { fr: "github.com/pseudo", en: "github.com/username" },
  hideContact: { fr: "Masquer toutes les coordonnées", en: "Hide all contact details" },
  showContact: { fr: "Afficher toutes les coordonnées", en: "Show all contact details" },
  configsLabel: { fr: "Configurations", en: "Configurations" },
  configsHint: {
    fr: "Ta progression est enregistrée automatiquement dans ce navigateur. Une configuration garde la sélection actuelle (cases, langue, niveaux, photo, présentation) sous un nom. Les textes modifiés sont permanents et communs à toutes les configurations.",
    en: "Your progress is saved automatically in this browser. A configuration stores the current selection (checkboxes, language, levels, photo, summary) under a name. Edited texts are permanent and shared by all configurations.",
  },
  configName: { fr: "Nom de la configuration", en: "Configuration name" },
  configSave: { fr: "Enregistrer", en: "Save" },
  configLoad: { fr: "Charger", en: "Load" },
  configDelete: { fr: "Supprimer", en: "Delete" },
  configOverwrite: { fr: "Une configuration porte déjà ce nom. La remplacer ?", en: "A configuration with this name already exists. Replace it?" },
  configDeleteConfirm: { fr: "Supprimer cette configuration ?", en: "Delete this configuration?" },
  configMissing: { fr: "{n} élément(s) de cette configuration n'existent plus et ont été ignorés.", en: "{n} item(s) of this configuration no longer exist and were ignored." },
  configFull: { fr: "Nombre maximum de configurations atteint.", en: "Maximum number of configurations reached." },
  backupExport: { fr: "Exporter une sauvegarde", en: "Export a backup" },
  backupImport: { fr: "Importer une sauvegarde", en: "Import a backup" },
  importConfirm: { fr: "Remplacer ta progression et tes configurations actuelles par cette sauvegarde ?", en: "Replace your current progress and configurations with this backup?" },
  importError: { fr: "Sauvegarde invalide ou illisible.", en: "Invalid or unreadable backup." },
  saveOk: { fr: "Progression enregistrée automatiquement.", en: "Progress saved automatically." },
  saveBlocked: { fr: "Sauvegarde locale illisible et impossible à copier : l'enregistrement est désactivé pour ne rien écraser.", en: "Local save is unreadable and cannot be copied: saving is disabled so nothing is overwritten." },
  saveError: { fr: "Enregistrement impossible (stockage plein ou bloqué par le navigateur).", en: "Cannot save (storage full or blocked by the browser)." },
  editLabel: { fr: "Textes", en: "Texts" },
  editHint: {
    fr: "Clique sur un texte du CV pour le modifier. Les modifications sont permanentes (enregistrées dans ce navigateur), séparément pour le français et l'anglais.",
    en: "Click any text in the CV to edit it. Changes are permanent (saved in this browser), separately for French and English.",
  },
  resetTexts: { fr: "Rétablir les textes d'origine", en: "Restore original texts" },
  confirmReset: { fr: "Rétablir tous les textes d'origine (français uniquement) ?", en: "Restore all original texts (English only)?" },
  summaryText: { fr: "Texte de présentation", en: "Summary text" },
  photo: { fr: "Photo", en: "Photo" },
  showPhoto: { fr: "Afficher la photo", en: "Show photo" },
  titleColor: { fr: "Couleur des titres", en: "Heading colour" },
  resetColor: { fr: "Couleur d'origine", en: "Default colour" },
  onePage: { fr: "Tenir sur une page (réduit la taille)", en: "Fit on one page (shrinks size)" },
  layout: { fr: "Mise en page", en: "Layout" },
  importPhoto: { fr: "Importer une autre photo", en: "Import another photo" },
  photoChoices: { fr: "Photos proposées", en: "Provided photos" },
  photoError: { fr: "Fichier image invalide ou illisible.", en: "Invalid or unreadable image file." },
  add: { fr: "+ Ajouter", en: "+ Add" },
  addBullet: { fr: "+ Puce", en: "+ Bullet" },
  addSubmit: { fr: "Ajouter", en: "Add" },
  remove: { fr: "Supprimer", en: "Remove" },
  removeConfirm: { fr: "Supprimer cet élément ajouté ?", en: "Remove this added item?" },
  addError: { fr: "Ajout impossible (champ manquant ou limite atteinte).", en: "Cannot add (missing field or limit reached)." },
  addHint: {
    fr: "Le texte est utilisé en français et en anglais : passe dans l'autre langue et clique sur le texte dans le CV pour le traduire.",
    en: "The text is used in both French and English: switch language and click the text in the CV to translate it.",
  },
  multilineHint: { fr: "Une ligne = une puce.", en: "One line = one bullet." },
  fields: {
    title: { fr: "Intitulé", en: "Title" },
    org: { fr: "Structure / lieu (facultatif)", en: "Organisation / place (optional)" },
    dates: { fr: "Dates (facultatif)", en: "Dates (optional)" },
    detail: { fr: "Détail (facultatif)", en: "Detail (optional)" },
    label: { fr: "Libellé", en: "Label" },
    text: { fr: "Texte (facultatif)", en: "Text (optional)" },
    bulletText: { fr: "Texte de la puce", en: "Bullet text" },
    language: { fr: "Langue", en: "Language" },
    level: { fr: "Avec niveau (curseur B1 à C2)", en: "With level (B1 to C2 slider)" },
    summaryText: { fr: "Nouveau texte de présentation", en: "New summary text" },
  },
  identityLabel: { fr: "Identité", en: "Identity" },
  flagged: { fr: "à confirmer", en: "to confirm" },
  sections: {
    summary: { fr: "Présentation", en: "Summary" },
    experience: { fr: "Expérience", en: "Experience" },
    education: { fr: "Études", en: "Education" },
    languages: { fr: "Langues", en: "Languages" },
  },
};
UI_TEXT.contactFields.name = { fr: "Nom", en: "Name" };

const PHOTO_MAX_SIDE = 800; // px : réduit la photo importée pour tenir dans le stockage local
const PHOTO_QUALITY = 0.85;
const CONFIGS_KEY = "cv-modulaire-configs-v1";
const MAX_CONFIGS = 30;
const MAX_CONFIG_NAME = 40;
const MAX_BACKUP_BYTES = 10 * 1024 * 1024;
const MAX_EDIT_LENGTH = 2000;
// edits[langue][clé] = texte modifié ; la clé identifie un texte du CV (ex. "exp-dsin:title").
const CONTACT_FIELDS = ["address", "phone", "email", "github"];
const GITHUB_MAX_LENGTH = 100;
// Violet foncé d'origine des titres ; la couleur est validée avant d'être appliquée au CSS.
const MAX_CUSTOM = 200;
const MAX_FIELD_LENGTH = 200; // champs d'une seule ligne dans les formulaires d'ajout
const MAX_IDENTITY_LENGTH = 100;
const IDENTITY_FIELDS = ["name", "address", "phone", "email"];
const CUSTOM_ID = /^c[a-z0-9]{4,12}$/;
const DEFAULT_LEVEL = "B2";
// Champs conservés pour chaque type d'élément ajouté, et champ obligatoire.
const CUSTOM_FIELDS = {
  exp: ["title", "org", "dates", "flag"],
  bullet: ["text"],
  edu: ["title", "org", "dates", "detail"],
  item: ["label", "text", "dates", "flag"],
  lang: ["text"],
  summary: ["text", "label"],
};
// Chaque champ `x` a une variante anglaise facultative `xEn` : sans elle, le texte vaut pour les deux langues.
const CUSTOM_REQUIRED = { exp: "title", bullet: "text", edu: "title", item: "label", lang: "text", summary: "text" };

// Profil vide, défini ici pour ne pas toucher aux données d'origine.
PROFILES.empty = { label: { fr: "Vide", en: "Empty" }, ids: [] };

// Données d'origine : les ajouts de l'utilisateur sont fusionnés par-dessus à chaque changement (applyCustom).
const BASE = { summary: CV.summary, experience: CV.experience, education: CV.education, lists: CV.lists, languages: CV.languages };

const DEFAULT_TITLE_COLOR = "#5b4391";
const HEX_COLOR = /^#[0-9a-f]{6}$/i;
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
  const status = document.getElementById("save-status");
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
  const zone = document.getElementById("notice");
  if (!zone) return;
  zone.textContent = text;
  zone.classList.toggle("error", Boolean(isError));
}

function saveState() {
  clearTimeout(saveTimer);
  saveTimer = null;
  if (state.blocked.has(STORAGE_KEY)) return setSaveStatus(false);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fullState()));
    setSaveStatus(true);
  } catch (err) {
    console.warn("Sauvegarde locale impossible :", err);
    setSaveStatus(false);
  }
}

function saveConfigs() {
  if (state.blocked.has(CONFIGS_KEY)) return setSaveStatus(false);
  try {
    localStorage.setItem(CONFIGS_KEY, JSON.stringify(state.configs));
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
    localStorage.setItem(key + CORRUPT_SUFFIX, raw);
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
    raw = localStorage.getItem(key);
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

function validLevels(saved) {
  const result = {};
  if (!saved || typeof saved !== "object") return result;
  CV.languages.items.filter((l) => l.level).forEach((l) => {
    if (LANGUAGE_LEVELS.includes(saved[l.id])) result[l.id] = saved[l.id];
  });
  return result;
}

// Ne garde que des chaînes de longueur raisonnable ; objet sans prototype pour ignorer "__proto__".
function validEdits(saved) {
  const result = { fr: Object.create(null), en: Object.create(null) };
  if (!saved || typeof saved !== "object") return result;
  ["fr", "en"].forEach((lang) => {
    Object.entries(saved[lang] || {}).forEach(([key, text]) => {
      if (key !== "__proto__" && typeof text === "string" && text.length <= MAX_EDIT_LENGTH) result[lang][key] = text;
    });
  });
  return result;
}

// Ne garde que les booléens des champs de coordonnées connus.
// Lien GitHub saisi à la main : texte court sur une ligne, sans caractères de contrôle.
function validGithub(value) {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, GITHUB_MAX_LENGTH);
}

function validContact(saved) {
  const result = {};
  if (!saved || typeof saved !== "object") return result;
  CONTACT_FIELDS.forEach((field) => {
    if (typeof saved[field] === "boolean") result[field] = saved[field];
  });
  return result;
}

// Texte d'une ligne : sans caractères de contrôle. Texte multiligne : on garde les sauts de ligne.
const cleanLine = (value, max) => value.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);
const cleanLines = (value, max) => value.split("\n").map((line) => cleanLine(line, max)).filter(Boolean).join("\n").slice(0, max);

function validIdentity(saved) {
  const result = { name: "", address: "", phone: "", email: "" };
  if (!saved || typeof saved !== "object") return result;
  IDENTITY_FIELDS.forEach((field) => {
    if (typeof saved[field] === "string") result[field] = cleanLine(saved[field], MAX_IDENTITY_LENGTH);
  });
  return result;
}

// Ne garde que les ajouts bien formés (type connu, id unique, champ obligatoire, parent existant).
function validCustom(saved) {
  if (!Array.isArray(saved)) return [];
  const baseListIds = BASE.lists.map((l) => l.id);
  const seen = new Set();
  const result = [];
  saved.slice(0, MAX_CUSTOM).forEach((raw) => {
    if (!raw || typeof raw !== "object" || typeof raw.id !== "string" || typeof raw.kind !== "string") return;
    if (!Object.hasOwn(CUSTOM_FIELDS, raw.kind) || !CUSTOM_ID.test(raw.id) || seen.has(raw.id)) return;
    const entry = { id: raw.id, kind: raw.kind };
    CUSTOM_FIELDS[raw.kind].forEach((field) => {
      const multiline = raw.kind === "item" && field === "text";
      [field, field + "En"].forEach((key) => {
        const value = typeof raw[key] === "string" ? raw[key] : "";
        entry[key] = multiline ? cleanLines(value, MAX_EDIT_LENGTH) : cleanLine(value, MAX_EDIT_LENGTH);
      });
    });
    if (entry[CUSTOM_REQUIRED[raw.kind]] === "") return;
    if (raw.kind === "item") {
      if (!baseListIds.includes(raw.list)) return;
      entry.list = raw.list;
      entry.bullets = raw.bullets === true;
    }
    if (raw.kind === "bullet") {
      const parentOk = BASE.experience.some((j) => j.id === raw.parent) || result.some((c) => c.kind === "exp" && c.id === raw.parent);
      if (!parentOk) return;
      entry.parent = raw.parent;
    }
    if (raw.kind === "lang") entry.level = raw.level === true;
    seen.add(raw.id);
    result.push(entry);
  });
  return result;
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
      ...of("summary").map((c) => ({ id: c.id, custom: true, key: "summary-" + c.id, label: optional(c, "label") || same(c.text.slice(0, 30)), text: pair(c, "text") })),
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
    state.custom = validCustom(saved.custom);
    applyCustom();
  }
  const known = new Set(collectIds(true));
  state.checked = new Set(saved.checked.filter((id) => typeof id === "string" && known.has(id)));
  if (saved.identity !== undefined) state.identity = validIdentity(saved.identity);
  state.levels = { ...defaultLevels(), ...validLevels(saved.levels) };
  if (saved.edits !== undefined) state.edits = validEdits(saved.edits);
  if (typeof saved.showPhoto === "boolean") state.showPhoto = saved.showPhoto;
  if (typeof saved.onePage === "boolean") state.onePage = saved.onePage;
  if (typeof saved.showSubtitle === "boolean") state.showSubtitle = saved.showSubtitle;
  if (typeof saved.titleColor === "string" && HEX_COLOR.test(saved.titleColor)) state.titleColor = saved.titleColor;
  Object.assign(state.contact, validContact(saved.contact));
  if (saved.github !== undefined) state.github = validGithub(saved.github);
  if (CV.photos.some((p) => p.id === saved.photoChoice)) state.photoChoice = saved.photoChoice;
  if (CV.summary.variants.some((v) => v.id === saved.summaryChoice)) state.summaryChoice = saved.summaryChoice;
  if (typeof saved.photo === "string" && saved.photo.startsWith("data:image/")) state.photo = saved.photo;
  return true;
}

// Liste de configurations lue depuis le stockage ou un fichier : on ne garde que les entrées valides.
function validConfigs(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((c) => c && typeof c.name === "string" && c.name.trim() !== "" && c.name.length <= MAX_CONFIG_NAME
      && c.data && (c.data.lang === "fr" || c.data.lang === "en") && Array.isArray(c.data.checked))
    .slice(0, MAX_CONFIGS)
    .map((c) => ({ name: c.name.trim(), data: {
      lang: c.data.lang,
      checked: c.data.checked.filter((id) => typeof id === "string"),
      levels: validLevels(c.data.levels),
      showPhoto: c.data.showPhoto !== false,
      onePage: c.data.onePage === true,
      showSubtitle: c.data.showSubtitle !== false,
      titleColor: typeof c.data.titleColor === "string" && HEX_COLOR.test(c.data.titleColor) ? c.data.titleColor : DEFAULT_TITLE_COLOR,
      photoChoice: c.data.photoChoice,
      summaryChoice: c.data.summaryChoice,
      contact: validContact(c.data.contact),
      github: c.data.github === undefined ? undefined : validGithub(c.data.github),
      customItems: validCustom(c.data.customItems),
      customPhoto: c.data.customPhoto === true,
    } }));
}

// Chaque clé est lue séparément : une progression corrompue ne doit pas faire perdre les configurations.
function loadState() {
  state.levels = defaultLevels();
  state.edits = validEdits(null);
  const saved = readKey(STORAGE_KEY);
  const restored = applySaved(saved);
  if (saved !== null && !restored && !backupRaw(STORAGE_KEY, JSON.stringify(saved))) state.blocked.add(STORAGE_KEY);
  state.configs = validConfigs(readKey(CONFIGS_KEY));
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
  const profile = PROFILES[key];
  state.checked = new Set(profile.ids === "all" ? allIds() : profile.ids);
}

const isOn = (id) => state.checked.has(id);
const t = (obj) => obj[state.lang];

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
function editable(tag, className, key, original) {
  const node = el(tag, (className ? className + " " : "") + "edit");
  textWithBreaks(node, hasEdit(key) ? state.edits[state.lang][key] : original);
  node.contentEditable = "true";
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
    const text = readText(node);
    if (text === "" || text === node.dataset.original || text.length > MAX_EDIT_LENGTH) delete state.edits[state.lang][node.dataset.key];
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
    const load = el("button", "chip", UI_TEXT.configLoad[state.lang]);
    load.type = "button";
    load.addEventListener("click", () => loadConfig(index));
    const del = el("button", "chip", UI_TEXT.configDelete[state.lang]);
    del.type = "button";
    del.addEventListener("click", () => deleteConfig(index));
    item.append(load, del);
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
  const name = input.value.trim().slice(0, MAX_CONFIG_NAME);
  if (!name) return;
  const existing = state.configs.findIndex((c) => c.name === name);
  if (existing >= 0) {
    if (!window.confirm(UI_TEXT.configOverwrite[state.lang])) return;
    state.configs[existing].data = snapshot();
  } else {
    if (state.configs.length >= MAX_CONFIGS) {
      window.alert(UI_TEXT.configFull[state.lang]);
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
  state.custom = validCustom([...state.custom, ...missing]);
  applyCustom();
}

function loadConfig(index) {
  const config = state.configs[index];
  if (!config) return;
  restoreCustom(config.data);
  const known = new Set(collectIds(true));
  const unknown = config.data.checked.filter((id) => !known.has(id)).length;
  if (!applySaved(config.data)) return;
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
  state.configs = validConfigs(backup.configs);
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
function checkbox(id, label, extraClass, flag) {
  const wrapper = el("label", "check " + (extraClass || ""));
  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = isOn(id);
  input.addEventListener("change", () => {
    if (input.checked) state.checked.add(id);
    else state.checked.delete(id);
    saveState();
    renderCV();
    renderControls();
  });
  wrapper.append(input, el("span", "", label));
  if (flag) {
    const badge = el("em", "badge", UI_TEXT.flagged[state.lang] + " : " + t(flag));
    wrapper.appendChild(badge);
  }
  return wrapper;
}

function group(title) {
  const section = el("section", "group");
  section.appendChild(el("h3", "", title));
  return section;
}

// --- Ajout et suppression d'éléments par l'utilisateur ---
function pageTitle() {
  return "CV - " + (state.identity.name || CV.name) + " - " + state.lang.toUpperCase();
}

function newCustomId() {
  let id;
  do { id = "c" + Math.random().toString(36).slice(2, 10); } while (state.custom.some((c) => c.id === id));
  return id;
}

// Ajoute un élément (coché d'office). La validation est celle du chargement : un ajout invalide est refusé.
function addCustom(entry) {
  const id = newCustomId();
  const next = validCustom([...state.custom, { id, ...entry }]);
  if (next.length !== state.custom.length + 1) {
    window.alert(UI_TEXT.addError[state.lang]);
    return false;
  }
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
function removeButton(id) {
  const btn = el("button", "chip", UI_TEXT.remove[state.lang]);
  btn.type = "button";
  btn.addEventListener("click", (event) => {
    event.preventDefault();
    removeCustom(id);
  });
  return btn;
}

// Formulaire repliable. `fields` : { name, label, required?, multiline?, checkbox? } ; `onAdd` reçoit { name: valeur }.
function addForm(summaryLabel, fields, onAdd, hint) {
  const box = el("details", "add");
  box.appendChild(el("summary", "chip", summaryLabel));
  const form = document.createElement("form");
  const inputs = {};
  fields.forEach((field) => {
    const label = el("label", field.checkbox ? "check" : "field");
    const input = document.createElement(field.multiline ? "textarea" : "input");
    if (field.checkbox) input.type = "checkbox";
    else {
      input.className = "text-input";
      if (field.multiline) input.rows = 3;
      else input.type = "text";
      input.maxLength = field.multiline ? MAX_EDIT_LENGTH : MAX_FIELD_LENGTH;
      input.required = Boolean(field.required);
    }
    label.append(...(field.checkbox ? [input, el("span", "", field.label[state.lang])] : [el("span", "", field.label[state.lang]), input]));
    form.appendChild(label);
    inputs[field.name] = input;
  });
  if (hint) form.appendChild(el("p", "hint", hint));
  const submit = el("button", "chip", UI_TEXT.addSubmit[state.lang]);
  submit.type = "submit";
  form.appendChild(submit);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = {};
    fields.forEach((field) => { values[field.name] = field.checkbox ? inputs[field.name].checked : inputs[field.name].value; });
    onAdd(values);
  });
  box.appendChild(form);
  return box;
}

const FIELD = (name, required, multiline) => ({ name, label: UI_TEXT.fields[name], required, multiline });

// Curseur de niveau : ne reconstruit que le CV, pour ne pas perdre le focus pendant le glissement.
function levelSlider(item, enabled) {
  const wrapper = el("div", "level");
  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = "0";
  slider.max = String(LANGUAGE_LEVELS.length - 1);
  slider.step = "1";
  slider.value = String(LANGUAGE_LEVELS.indexOf(state.levels[item.id]));
  slider.disabled = !enabled;
  slider.setAttribute("aria-label", t(item.text));
  const value = el("span", "level-value", state.levels[item.id]);
  slider.addEventListener("input", () => {
    state.levels[item.id] = LANGUAGE_LEVELS[Number(slider.value)];
    value.textContent = state.levels[item.id];
    saveState();
    renderCV();
  });
  wrapper.append(el("span", "level-end", LANGUAGE_LEVELS[0]), slider, el("span", "level-end", LANGUAGE_LEVELS[LANGUAGE_LEVELS.length - 1]), value);
  return wrapper;
}

// Redimensionne l'image importée et la renvoie en data URL JPEG.
function readPhoto(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) return reject(new Error("not an image"));
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, PHOTO_MAX_SIDE / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", PHOTO_QUALITY));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("unreadable image"));
    };
    img.src = url;
  });
}

function layoutControls() {
  const box = group(UI_TEXT.layout[state.lang]);
  const label = el("label", "check");
  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = state.onePage;
  input.addEventListener("change", () => {
    state.onePage = input.checked;
    saveState();
    renderCV();
  });
  label.append(input, el("span", "", UI_TEXT.onePage[state.lang]));
  box.appendChild(label);

  const subtitle = el("label", "check");
  const subtitleInput = document.createElement("input");
  subtitleInput.type = "checkbox";
  subtitleInput.checked = state.showSubtitle;
  subtitleInput.addEventListener("change", () => {
    state.showSubtitle = subtitleInput.checked;
    saveState();
    renderCV();
  });
  subtitle.append(subtitleInput, el("span", "", UI_TEXT.subtitle[state.lang]));
  box.appendChild(subtitle);

  const color = el("label", "check");
  const picker = document.createElement("input");
  picker.type = "color";
  picker.value = state.titleColor;
  picker.addEventListener("input", () => {
    state.titleColor = picker.value;
    saveState();
    renderCV();
  });
  const reset = el("button", "chip", UI_TEXT.resetColor[state.lang]);
  reset.type = "button";
  reset.addEventListener("click", () => {
    state.titleColor = DEFAULT_TITLE_COLOR;
    picker.value = DEFAULT_TITLE_COLOR;
    saveState();
    renderCV();
  });
  color.append(picker, el("span", "", UI_TEXT.titleColor[state.lang]), reset);
  box.appendChild(color);
  return box;
}

function photoControls() {
  const box = group(UI_TEXT.photo[state.lang]);

  const toggle = el("label", "check");
  const show = document.createElement("input");
  show.type = "checkbox";
  show.checked = state.showPhoto;
  show.addEventListener("change", () => {
    state.showPhoto = show.checked;
    saveState();
    renderControls();
    renderCV();
  });
  toggle.append(show, el("span", "", UI_TEXT.showPhoto[state.lang]));
  box.appendChild(toggle);

  const actions = el("div", "photo-actions");
  const file = document.createElement("input");
  file.type = "file";
  file.accept = "image/*";
  file.hidden = true;
  const message = el("p", "error");
  file.addEventListener("change", async () => {
    message.textContent = "";
    if (!file.files[0]) return;
    try {
      state.photo = await readPhoto(file.files[0]);
      saveState();
      renderControls();
      renderCV();
    } catch (err) {
      console.warn("Import de photo impossible :", err);
      message.textContent = UI_TEXT.photoError[state.lang];
    }
    file.value = "";
  });
  const importBtn = el("button", "chip", UI_TEXT.importPhoto[state.lang]);
  importBtn.type = "button";
  importBtn.disabled = !state.showPhoto;
  importBtn.addEventListener("click", () => file.click());
  actions.append(importBtn, file);

  // Photos fournies : en choisir une remplace la photo importée.
  const choices = el("div", "photo-actions");
  CV.photos.forEach((photo) => {
    const btn = el("button", "chip", t(photo.label));
    btn.type = "button";
    btn.disabled = !state.showPhoto;
    btn.setAttribute("aria-pressed", String(!state.photo && state.photoChoice === photo.id));
    btn.addEventListener("click", () => {
      state.photoChoice = photo.id;
      state.photo = null;
      saveState();
      renderControls();
      renderCV();
    });
    choices.appendChild(btn);
  });
  box.append(el("p", "label", UI_TEXT.photoChoices[state.lang]), choices, actions, message);
  return box;
}

function contactControls() {
  const box = group(UI_TEXT.contactLabel[state.lang]);
  CONTACT_FIELDS.forEach((field) => {
    const label = el("label", "check");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = state.contact[field];
    input.addEventListener("change", () => {
      state.contact[field] = input.checked;
      saveState();
      renderControls();
      renderCV();
    });
    label.append(input, el("span", "", UI_TEXT.contactFields[field][state.lang]));
    box.appendChild(label);
  });

  IDENTITY_FIELDS.forEach((field) => {
    const input = document.createElement("input");
    input.type = "text";
    input.className = "text-input";
    input.maxLength = MAX_IDENTITY_LENGTH;
    input.value = state.identity[field];
    input.placeholder = field === "name" ? CV.name : field === "address" ? t(CV.contact.address) : CV.contact[field];
    input.setAttribute("aria-label", UI_TEXT.contactFields[field][state.lang]);
    input.addEventListener("input", () => {
      state.identity[field] = cleanLine(input.value, MAX_IDENTITY_LENGTH);
      document.title = pageTitle();
      saveState();
      renderCV();
    });
    box.appendChild(input);
  });

  const github = document.createElement("input");
  github.type = "text";
  github.className = "text-input";
  github.maxLength = GITHUB_MAX_LENGTH;
  github.value = state.github;
  github.placeholder = UI_TEXT.githubPlaceholder[state.lang];
  github.addEventListener("input", () => {
    state.github = validGithub(github.value);
    saveState();
    renderCV();
  });
  box.appendChild(github);

  const anyShown = CONTACT_FIELDS.some((field) => state.contact[field]);
  const toggle = el("button", "chip", (anyShown ? UI_TEXT.hideContact : UI_TEXT.showContact)[state.lang]);
  toggle.type = "button";
  toggle.addEventListener("click", () => {
    CONTACT_FIELDS.forEach((field) => { state.contact[field] = !anyShown; });
    saveState();
    renderControls();
    renderCV();
  });
  box.appendChild(el("div", "options", "")).appendChild(toggle);
  return box;
}

function renderControls() {
  const panel = document.getElementById("controls");
  panel.replaceChildren();

  panel.appendChild(el("h2", "", UI_TEXT.content[state.lang]));
  panel.appendChild(layoutControls());
  panel.appendChild(photoControls());
  panel.appendChild(contactControls());

  const summary = group(UI_TEXT.sections.summary[state.lang]);
  summary.appendChild(checkbox(CV.summary.id, UI_TEXT.sections.summary[state.lang]));
  const variants = el("div", "options");
  CV.summary.variants.forEach((variant) => {
    const btn = el("button", "chip", t(variant.label));
    btn.type = "button";
    btn.disabled = !isOn(CV.summary.id);
    btn.setAttribute("aria-pressed", String(state.summaryChoice === variant.id));
    btn.addEventListener("click", () => {
      state.summaryChoice = variant.id;
      saveState();
      renderControls();
      renderCV();
    });
    variants.appendChild(btn);
    if (variant.custom) variants.appendChild(removeButton(variant.id));
  });
  summary.append(el("p", "label", UI_TEXT.summaryText[state.lang]), variants);
  summary.appendChild(addForm(UI_TEXT.add[state.lang], [FIELD("summaryText", true, true)], (v) => addCustom({ kind: "summary", text: v.summaryText }), UI_TEXT.addHint[state.lang]));
  panel.appendChild(summary);

  const exp = group(UI_TEXT.sections.experience[state.lang]);
  CV.experience.forEach((job) => {
    const jobBox = checkbox(job.id, t(job.title), "parent", job.flag);
    if (job.custom) jobBox.appendChild(removeButton(job.id));
    exp.appendChild(jobBox);
    job.bullets.forEach((b) => {
      const box = checkbox(b.id, t(b.text), "child");
      box.querySelector("input").disabled = !isOn(job.id);
      if (b.custom) box.appendChild(removeButton(b.id));
      exp.appendChild(box);
    });
    exp.appendChild(addForm(UI_TEXT.addBullet[state.lang], [{ ...FIELD("bulletText", true), name: "text" }], (v) => addCustom({ kind: "bullet", parent: job.id, text: v.text })));
  });
  exp.appendChild(addForm(UI_TEXT.add[state.lang], [FIELD("title", true), FIELD("org"), FIELD("dates")], (v) => addCustom({ kind: "exp", ...v }), UI_TEXT.addHint[state.lang]));
  panel.appendChild(exp);

  const edu = group(UI_TEXT.sections.education[state.lang]);
  CV.education.forEach((e) => {
    const box = checkbox(e.id, t(e.title));
    if (e.custom) box.appendChild(removeButton(e.id));
    edu.appendChild(box);
  });
  edu.appendChild(addForm(UI_TEXT.add[state.lang], [FIELD("title", true), FIELD("org"), FIELD("dates"), FIELD("detail")], (v) => addCustom({ kind: "edu", ...v }), UI_TEXT.addHint[state.lang]));
  panel.appendChild(edu);

  CV.lists.forEach((list) => {
    const box = group(t(list.title));
    list.items.forEach((item) => {
      const itemBox = checkbox(item.id, t(item.label), "", item.flag);
      if (item.custom) itemBox.appendChild(removeButton(item.id));
      box.appendChild(itemBox);
    });
    box.appendChild(addForm(UI_TEXT.add[state.lang], [FIELD("label", true), FIELD("dates"), FIELD("text", false, true)], (v) => addCustom({ kind: "item", list: list.id, ...v }), UI_TEXT.addHint[state.lang] + " " + UI_TEXT.multilineHint[state.lang]));
    panel.appendChild(box);
  });

  const langs = group(UI_TEXT.sections.languages[state.lang]);
  langs.appendChild(checkbox(CV.languages.id, t(CV.labels.languages), "parent"));
  CV.languages.items.forEach((l) => {
    const box = checkbox(l.id, t(l.text), "child");
    const enabled = isOn(CV.languages.id);
    box.querySelector("input").disabled = !enabled;
    if (l.custom) box.appendChild(removeButton(l.id));
    langs.appendChild(box);
    if (l.level) langs.appendChild(levelSlider(l, enabled && isOn(l.id)));
  });
  langs.appendChild(addForm(UI_TEXT.add[state.lang], [{ ...FIELD("language", true), name: "text" }, { name: "level", label: UI_TEXT.fields.level, checkbox: true }], (v) => addCustom({ kind: "lang", ...v }), UI_TEXT.addHint[state.lang]));
  panel.appendChild(langs);
}

function renderToolbar() {
  document.getElementById("label-language").textContent = UI_TEXT.language[state.lang];
  document.getElementById("label-profiles").textContent = UI_TEXT.profiles[state.lang];
  document.getElementById("label-configs").textContent = UI_TEXT.configsLabel[state.lang];
  document.getElementById("configs-hint").textContent = UI_TEXT.configsHint[state.lang];
  document.getElementById("config-name").placeholder = UI_TEXT.configName[state.lang];
  document.getElementById("config-save").textContent = UI_TEXT.configSave[state.lang];
  document.getElementById("backup-export").textContent = UI_TEXT.backupExport[state.lang];
  document.getElementById("backup-import").textContent = UI_TEXT.backupImport[state.lang];
  setSaveStatus(!state.saveFailed);
  renderConfigs();
  document.getElementById("label-edit").textContent = UI_TEXT.editLabel[state.lang];
  document.getElementById("edit-hint").textContent = UI_TEXT.editHint[state.lang];
  document.getElementById("reset-texts").textContent = UI_TEXT.resetTexts[state.lang];
  document.getElementById("export-btn").textContent = UI_TEXT.export[state.lang];
  document.getElementById("export-hint").textContent = UI_TEXT.hint[state.lang];
  document.documentElement.lang = state.lang;
  document.title = pageTitle();

  document.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.dataset.lang === state.lang));
  });

  const profileBox = document.getElementById("profiles");
  profileBox.replaceChildren();
  Object.keys(PROFILES).forEach((key) => {
    const btn = el("button", "chip", t(PROFILES[key].label));
    btn.type = "button";
    btn.addEventListener("click", () => {
      applyProfile(key);
      saveState();
      renderControls();
      renderCV();
    });
    profileBox.appendChild(btn);
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
  return dates ? editable("span", "dates", key, dates) : el("span", "dates");
}

// Structure et lieu sur la même ligne que l'intitulé (même modèle pour expériences et études).
function orgInline(item) {
  if (!item.org) return null;
  const wrap = el("span", "org");
  wrap.append(document.createTextNode(" - "), editable("span", "", item.id + ":org", t(item.org)));
  return wrap;
}

function renderHeader(cv) {
  const providedPhoto = CV.photos.find((p) => p.id === state.photoChoice);
  const photoSrc = state.photo || (providedPhoto && providedPhoto.src);
  const showPhoto = state.showPhoto && Boolean(photoSrc);
  const header = el("header", showPhoto ? "cv-header" : "cv-header no-photo");
  const identity = el("div", "identity");
  identity.appendChild(el("h1", "", state.identity.name || CV.name));
  if (state.showSubtitle) identity.appendChild(editable("p", "subtitle", "subtitle", t(CV.subtitle)));
  const contactParts = [
    state.contact.address && (state.identity.address || t(CV.contact.address)),
    state.contact.phone && (state.identity.phone || CV.contact.phone),
    state.contact.email && (state.identity.email || CV.contact.email),
    state.contact.github && state.github && state.github.replace(/^https?:\/\//, ""),
  ].filter(Boolean);
  if (contactParts.length > 0) identity.appendChild(el("p", "contact", contactParts.join(" • ")));
  header.appendChild(identity);
  if (showPhoto) {
    const photo = el("img", "photo");
    photo.src = photoSrc;
    photo.alt = "";
    header.appendChild(photo);
  }
  cv.appendChild(header);

  if (isOn(CV.summary.id)) {
    const variant = CV.summary.variants.find((v) => v.id === state.summaryChoice);
    cv.appendChild(editable("p", "summary", variant.key, t(variant.text)));
  }
}

function renderExperience(cv) {
  const jobs = CV.experience.filter((j) => isOn(j.id));
  if (jobs.length === 0) return;
  const section = el("section", "cv-section");
  section.appendChild(el("h2", "", t(CV.labels.experience)));
  jobs.forEach((job) => {
    const block = el("div", "entry");
    block.appendChild(row(editable("span", "", job.id + ":title", t(job.title)), datesNode(job.id + ":dates", job.dates ? t(job.dates) : ""), orgInline(job)));
    const bullets = job.bullets.filter((b) => isOn(b.id));
    if (bullets.length > 0) {
      const ul = el("ul");
      bullets.forEach((b) => {
        const li = el("li");
        li.appendChild(editable("span", "", b.id, t(b.text)));
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
    block.appendChild(row(editable("span", "", e.id + ":title", t(e.title)), datesNode(e.id + ":dates", t(e.dates)), orgInline(e)));
    if (t(e.detail)) block.appendChild(editable("p", "detail", e.id + ":detail", t(e.detail)));
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
      const text = t(item.text);
      const label = editable("strong", "", item.id + ":label", t(item.label));
      // Avec des dates, la ligne suit le modèle des expériences : intitulé à gauche, dates à droite.
      if (item.dates) li.appendChild(row(label, datesNode(item.id + ":dates", t(item.dates))));
      else li.appendChild(label);
      if (text.includes("\n") || item.bullets) {
        const sub = el("ul", "sub");
        text.split("\n").forEach((part, i) => {
          const subItem = el("li");
          subItem.appendChild(editable("span", "", item.id + ":text" + i, part));
          sub.appendChild(subItem);
        });
        li.appendChild(sub);
      } else if (text) {
        li.appendChild(document.createTextNode(" : "));
        li.appendChild(editable("span", "", item.id + ":text", text));
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
  const addLine = (label, values) => {
    const li = el("li");
    li.appendChild(el("strong", "", t(label) + (state.lang === "fr" ? " : " : ": ")));
    values.forEach((value, i) => {
      if (i > 0) li.appendChild(document.createTextNode(", "));
      li.appendChild(editable("span", "", value.id, t(value.text)));
      // Le niveau (langues) se règle avec le curseur, pas au clavier.
      if (value.level) li.appendChild(document.createTextNode(" (" + state.levels[value.id] + ")"));
    });
    ul.appendChild(li);
  };
  addLine(CV.labels.languages, langs);
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

// Réduit le CV (zoom) jusqu\'à ce qu\'il tienne sur un A4. La largeur est agrandie d\'autant
// pour que la page garde 210 mm à l\'écran et à l\'impression.
const FIT_MIN = 0.5;
const FIT_STEP = 0.02;
function fitOnePage(cv) {
  cv.style.setProperty("--cv-title", state.titleColor);
  cv.classList.toggle("one-page", state.onePage);
  cv.style.setProperty("--fit", "1");
  if (!state.onePage) return;
  const a4Height = document.getElementById("a4-probe").getBoundingClientRect().height;
  let fit = 1;
  cv.style.setProperty("--fit", String(fit));
  while (fit > FIT_MIN && cv.scrollHeight * fit > a4Height) {
    fit = Math.round((fit - FIT_STEP) * 100) / 100;
    cv.style.setProperty("--fit", String(fit));
  }
}

// --- Démarrage ---
function init() {
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
}

init();
