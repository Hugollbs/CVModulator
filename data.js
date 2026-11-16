// Modèle vide de l'application : aucune donnée personnelle.
// Le contenu de chaque utilisateur est ajouté depuis le site (bouton « + Ajouter »),
// enregistré dans son navigateur, et peut être exporté / importé en JSON (« sauvegarde »).
// Chaque texte existe en français (fr) et en anglais (en).

// Niveaux proposés par le curseur des langues (un item avec `level` = niveau par défaut).
const LANGUAGE_LEVELS = ["B1", "B2", "C1", "C2"];

const CV = {
  name: "VOTRE NOM",
  // Aucune photo fournie : chacun importe la sienne.
  photos: [],
  subtitle: { fr: "Votre objectif (cliquez pour modifier)", en: "Your goal (click to edit)" },
  contact: {
    address: { fr: "", en: "" },
    phone: "",
    email: "",
  },

  summary: {
    id: "summary",
    variants: [
      {
        id: "default",
        key: "summary",
        label: { fr: "Présentation d'origine", en: "Original summary" },
        text: {
          fr: "Présentez-vous en quelques lignes (cliquez pour modifier).",
          en: "Introduce yourself in a few lines (click to edit).",
        },
      },
    ],
  },

  experience: [],
  education: [],

  languages: {
    id: "languages",
    items: [],
  },

  // Sections génériques « libellé : texte ». Mêmes `id` que dans l'application d'origine :
  // les ajouts et les sauvegardes s'y rattachent.
  lists: [
    { id: "tech", title: { fr: "COMPÉTENCES TECHNIQUES", en: "TECHNICAL SKILLS" }, items: [] },
    { id: "projects", title: { fr: "PROJETS PERSONNELS", en: "PERSONAL PROJECTS" }, items: [] },
    { id: "assoc", title: { fr: "ENGAGEMENTS ASSOCIATIFS", en: "COMMUNITY INVOLVEMENT" }, items: [] },
    { id: "hobbies", title: { fr: "SPORT ET LOISIRS", en: "SPORTS AND INTERESTS" }, items: [] },
  ],

  // Libellés de l'interface et des titres de section.
  labels: {
    experience: { fr: "EXPÉRIENCE PROFESSIONNELLE", en: "WORK EXPERIENCE" },
    education: { fr: "ÉTUDES", en: "EDUCATION" },
    extra: { fr: "INFORMATIONS COMPLÉMENTAIRES", en: "ADDITIONAL INFORMATION" },
    languages: { fr: "Langues", en: "Languages" },
  },
};

// Profils prédéfinis : `all` = tout cocher sauf les éléments avec `flag`.
const PROFILES = {
  all: { label: { fr: "Tout", en: "Everything" }, ids: "all" },
};
