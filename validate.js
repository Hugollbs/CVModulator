// Validation et nettoyage des données qui entrent dans l'application (stockage local, fichier de sauvegarde, formulaires).
// Fonctions pures : aucun accès au DOM, à localStorage ni à `state`. Les données de l'application
// (ids connus, niveaux de langue) arrivent par le paramètre `ctx`, ce qui permet de les tester sans navigateur.

// Une seule longueur maximale par type de champ.
const LIMITS = { line: 200, text: 2000, identity: 100, github: 100, configName: 40, id: 64 };
const MAX_CHECKED = 1000; // nombre d'ids cochés conservés
const MAX_CUSTOM = 200; // éléments ajoutés par l'utilisateur
const MAX_CONFIGS = 30;
const MAX_BACKUP_BYTES = 10 * 1024 * 1024;

// Types de champ : `line` = une ligne courte, `long` = texte plus long mais sur une seule ligne
// (les retours à la ligne deviennent des espaces), `multiline` = plusieurs lignes conservées.
const FIELD_TYPES = {
  line: { max: LIMITS.line },
  long: { max: LIMITS.text },
  multiline: { max: LIMITS.text, keepLines: true },
};

// Champs conservés pour chaque type d'élément ajouté. Chaque champ `x` a une variante anglaise
// facultative `xEn` : sans elle, le texte vaut pour les deux langues.
const CUSTOM_FIELDS = {
  exp: { title: "line", org: "line", dates: "line", flag: "line" },
  bullet: { text: "long" },
  edu: { title: "line", org: "line", dates: "line", detail: "long" },
  item: { label: "line", text: "multiline", dates: "line", flag: "line" },
  lang: { text: "line" },
  summary: { text: "long", label: "line" },
};
const CUSTOM_REQUIRED = { exp: "title", bullet: "text", edu: "title", item: "label", lang: "text", summary: "text" };

const CONTACT_FIELDS = ["address", "phone", "email", "github"];
const IDENTITY_FIELDS = ["name", "address", "phone", "email"];
const CUSTOM_ID = /^c[a-z0-9]{4,12}$/;
const HEX_COLOR = /^#[0-9a-f]{6}$/i;
const DEFAULT_TITLE_COLOR = "#5b4391"; // violet foncé d'origine des titres

// Photo : seulement des images raster, déjà ré-encodées par l'application.
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_PHOTO_FILE_BYTES = 8 * 1024 * 1024; // refusé avant même de décoder l'image
const MAX_PHOTO_CHARS = 3 * 1024 * 1024; // taille de la data URL stockée
const PHOTO_DATA_URL = /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/;

// --- Nettoyage des chaînes ---
// Caractères de contrôle (sauf \n pour les textes multilignes) et caractères invisibles :
// largeur nulle et surcharges bidirectionnelles (qui permettent d'afficher un texte autre que celui stocké).
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;
const CONTROL_CHARS_KEEP_NEWLINE = /[\u0000-\u0009\u000b-\u001f\u007f]/g;
const INVISIBLE_CHARS = /[؜᠎​-‏‪-‮⁠-⁤⁦-⁩﻿]/g;

const cleanLine = (value, max) => value.replace(INVISIBLE_CHARS, "").replace(CONTROL_CHARS, " ").trim().slice(0, max);
const cleanLines = (value, max) => value.split("\n").map((line) => cleanLine(line, max)).filter(Boolean).join("\n").slice(0, max);
// Texte modifié dans le CV : on garde les sauts de ligne, on ne coupe pas (la longueur est vérifiée à part).
const cleanEdit = (value) => value.replace(INVISIBLE_CHARS, "").replace(CONTROL_CHARS_KEEP_NEWLINE, " ");

function cleanField(value, type) {
  const { max, keepLines } = FIELD_TYPES[type];
  return keepLines ? cleanLines(value, max) : cleanLine(value, max);
}

// --- Valeurs simples ---
function validIds(list) {
  if (!Array.isArray(list)) return [];
  return list.filter((id) => typeof id === "string" && id.length <= LIMITS.id).slice(0, MAX_CHECKED);
}

function validColor(value, fallback) {
  return typeof value === "string" && HEX_COLOR.test(value) ? value : fallback;
}

// Renvoie la photo si c'est une data URL raster de taille raisonnable, sinon null.
function validPhoto(value) {
  if (typeof value !== "string" || value.length > MAX_PHOTO_CHARS) return null;
  return PHOTO_DATA_URL.test(value) ? value : null;
}

// Niveaux de langue sauvegardés, filtrés (ctx.levelItemIds : langues avec curseur ; ctx.levelOptions : niveaux permis).
function validLevels(saved, ctx) {
  const result = {};
  if (!saved || typeof saved !== "object") return result;
  ctx.levelItemIds.forEach((id) => {
    if (ctx.levelOptions.includes(saved[id])) result[id] = saved[id];
  });
  return result;
}

// Textes modifiés : chaînes de longueur raisonnable, dont l'id existe encore (ctx.editBases).
// Objet sans prototype pour ignorer "__proto__".
function validEdits(saved, ctx) {
  const result = { fr: Object.create(null), en: Object.create(null) };
  if (!saved || typeof saved !== "object") return result;
  ["fr", "en"].forEach((lang) => {
    Object.entries(saved[lang] || {}).forEach(([key, text]) => {
      if (key === "__proto__" || typeof text !== "string" || text.length > LIMITS.text) return;
      if (ctx && !ctx.editBases.has(key.split(":")[0])) return;
      result[lang][key] = cleanEdit(text);
    });
  });
  return result;
}

// Lien GitHub saisi à la main : texte court sur une ligne.
function validGithub(value) {
  return typeof value === "string" ? cleanLine(value, LIMITS.github) : "";
}

// Ne garde que les booléens des champs de coordonnées connus.
function validContact(saved) {
  const result = {};
  if (!saved || typeof saved !== "object") return result;
  CONTACT_FIELDS.forEach((field) => {
    if (typeof saved[field] === "boolean") result[field] = saved[field];
  });
  return result;
}

function validIdentity(saved) {
  const result = { name: "", address: "", phone: "", email: "" };
  if (!saved || typeof saved !== "object") return result;
  IDENTITY_FIELDS.forEach((field) => {
    if (typeof saved[field] === "string") result[field] = cleanLine(saved[field], LIMITS.identity);
  });
  return result;
}

// Ne garde que les ajouts bien formés (type connu, id unique, champ obligatoire, parent existant).
// ctx.listIds : sections génériques d'origine ; ctx.jobIds : expériences d'origine.
function validCustom(saved, ctx) {
  if (!Array.isArray(saved)) return [];
  const seen = new Set();
  const result = [];
  saved.slice(0, MAX_CUSTOM).forEach((raw) => {
    if (!raw || typeof raw !== "object" || typeof raw.id !== "string" || typeof raw.kind !== "string") return;
    if (!Object.hasOwn(CUSTOM_FIELDS, raw.kind) || !CUSTOM_ID.test(raw.id) || seen.has(raw.id)) return;
    const entry = { id: raw.id, kind: raw.kind };
    Object.entries(CUSTOM_FIELDS[raw.kind]).forEach(([field, type]) => {
      [field, field + "En"].forEach((key) => {
        entry[key] = cleanField(typeof raw[key] === "string" ? raw[key] : "", type);
      });
    });
    if (entry[CUSTOM_REQUIRED[raw.kind]] === "") return;
    if (raw.kind === "item") {
      if (!ctx.listIds.includes(raw.list)) return;
      entry.list = raw.list;
      entry.bullets = raw.bullets === true;
    }
    if (raw.kind === "bullet") {
      const parentOk = ctx.jobIds.includes(raw.parent) || result.some((c) => c.kind === "exp" && c.id === raw.parent);
      if (!parentOk) return;
      entry.parent = raw.parent;
    }
    if (raw.kind === "lang") entry.level = raw.level === true;
    seen.add(raw.id);
    result.push(entry);
  });
  return result;
}

// Liste de configurations lue depuis le stockage ou un fichier : on ne garde que les entrées valides.
function validConfigs(raw, ctx) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((c) => c && typeof c.name === "string" && c.name.trim() !== "" && c.name.length <= LIMITS.configName
      && c.data && (c.data.lang === "fr" || c.data.lang === "en") && Array.isArray(c.data.checked))
    .slice(0, MAX_CONFIGS)
    .map((c) => ({ name: c.name.trim(), data: {
      lang: c.data.lang,
      checked: validIds(c.data.checked),
      levels: validLevels(c.data.levels, ctx),
      showPhoto: c.data.showPhoto !== false,
      onePage: c.data.onePage === true,
      showSubtitle: c.data.showSubtitle !== false,
      titleColor: validColor(c.data.titleColor, DEFAULT_TITLE_COLOR),
      photoChoice: c.data.photoChoice,
      summaryChoice: c.data.summaryChoice,
      contact: validContact(c.data.contact),
      github: c.data.github === undefined ? undefined : validGithub(c.data.github),
      customItems: validCustom(c.data.customItems, ctx),
      customPhoto: c.data.customPhoto === true,
    } }));
}
