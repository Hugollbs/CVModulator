// Exemple de démonstration : le personnage et ses données sont entièrement fictifs.
// Chaque utilisateur remplace ce contenu depuis le site (bouton « + Ajouter », clic sur un texte),
// enregistré dans son navigateur, et peut être exporté / importé en JSON (« sauvegarde »).
// Chaque texte existe en français (fr) et en anglais (en).

// Niveaux proposés par le curseur des langues (un item avec `level` = niveau par défaut).
const LANGUAGE_LEVELS = ["B1", "B2", "C1", "C2"];

const CV = {
  name: "CAMILLE MARTIN",
  // Aucune photo fournie : chacun importe la sienne.
  photos: [],
  subtitle: { fr: "Étudiante en informatique, à la recherche d'un stage de 6 mois en développement web", en: "Computer science student looking for a 6-month web development internship" },
  contact: {
    address: { fr: "Lyon", en: "Lyon" },
    phone: "06 00 00 00 00",
    email: "camille.martin@example.com",
  },

  summary: {
    id: "summary",
    variants: [
      {
        id: "default",
        key: "summary",
        label: { fr: "Présentation d'origine", en: "Original summary" },
        text: {
          fr: "Étudiante en 3e année de licence informatique, passionnée par le développement web et les outils qui simplifient le quotidien. Je cherche un stage pour mettre en pratique mes projets et progresser en équipe.",
          en: "Third-year computer science undergraduate, passionate about web development and tools that make everyday life easier. I am looking for an internship to apply my projects and grow within a team.",
        },
      },
    ],
  },

  experience: [
    {
      id: "exp-dev",
      title: { fr: "Stagiaire développeuse web", en: "Web developer intern" },
      org: { fr: "Atelier Pixel, Lyon", en: "Atelier Pixel, Lyon" },
      dates: { fr: "Juil. - août 2025", en: "Jul. - Aug. 2025" },
      bullets: [
        { id: "exp-dev-1", text: { fr: "Refonte du site vitrine d'un client (HTML, CSS, JavaScript).", en: "Redesigned a client's showcase website (HTML, CSS, JavaScript)." } },
        { id: "exp-dev-2", text: { fr: "Correction de 25 anomalies d'affichage sur mobile.", en: "Fixed 25 mobile display issues." } },
      ],
    },
    {
      id: "exp-soutien",
      title: { fr: "Tutrice en mathématiques", en: "Maths tutor" },
      org: { fr: "Association Réussir ensemble, Lyon", en: "Réussir ensemble association, Lyon" },
      dates: { fr: "2024 - 2025", en: "2024 - 2025" },
      bullets: [
        { id: "exp-soutien-1", text: { fr: "Accompagnement hebdomadaire de 4 lycéens en difficulté.", en: "Weekly support for 4 struggling high-school students." } },
      ],
    },
  ],
  education: [
    {
      id: "edu-licence",
      title: { fr: "Licence Informatique", en: "BSc in Computer Science" },
      org: { fr: "Université de Lyon", en: "University of Lyon" },
      dates: { fr: "2023 - 2026", en: "2023 - 2026" },
      detail: { fr: "Algorithmique, bases de données, programmation web, réseaux.", en: "Algorithms, databases, web programming, networks." },
    },
    {
      id: "edu-bac",
      title: { fr: "Baccalauréat général, spécialités Maths et NSI", en: "High-school diploma, Maths and Computer Science tracks" },
      org: { fr: "Lycée Ampère, Lyon", en: "Lycée Ampère, Lyon" },
      dates: { fr: "2023", en: "2023" },
      detail: { fr: "Mention très bien.", en: "With highest honours." },
    },
  ],

  languages: {
    id: "languages",
    items: [
      { id: "lang-fr", text: { fr: "Français (langue maternelle)", en: "French: native" } },
      { id: "lang-en", text: { fr: "Anglais", en: "English" }, level: "C1" },
      { id: "lang-es", text: { fr: "Espagnol", en: "Spanish" }, level: "B1" },
    ],
  },

  // Sections génériques « libellé : texte ». Mêmes `id` que dans l'application d'origine :
  // les ajouts et les sauvegardes s'y rattachent.
  lists: [
    { id: "tech", title: { fr: "COMPÉTENCES TECHNIQUES", en: "TECHNICAL SKILLS" }, items: [
      { id: "tech-web", label: { fr: "Web", en: "Web" }, text: { fr: "HTML, CSS, JavaScript, Svelte", en: "HTML, CSS, JavaScript, Svelte" } },
      { id: "tech-lang", label: { fr: "Langages", en: "Languages" }, text: { fr: "Python, Java, C, SQL", en: "Python, Java, C, SQL" } },
      { id: "tech-tools", label: { fr: "Outils", en: "Tools" }, text: { fr: "Git, Linux, Docker", en: "Git, Linux, Docker" } },
    ]  },
    { id: "projects", title: { fr: "PROJETS PERSONNELS", en: "PERSONAL PROJECTS" }, items: [
      { id: "proj-todo", label: { fr: "Application de suivi d'habitudes", en: "Habit tracker app" }, text: { fr: "Application web en JavaScript, données stockées dans le navigateur.", en: "JavaScript web app, data stored in the browser." } },
      { id: "proj-quiz", label: { fr: "Générateur de quiz", en: "Quiz generator" }, text: { fr: "Script Python qui crée des questionnaires à partir de fichiers texte.", en: "Python script that builds quizzes from text files." } },
    ]  },
    { id: "assoc", title: { fr: "ENGAGEMENTS ASSOCIATIFS", en: "COMMUNITY INVOLVEMENT" }, items: [
      { id: "assoc-info", label: { fr: "Trésorière du club informatique", en: "Treasurer of the computer club" }, text: { fr: "Gestion d'un budget de 2 000 € et organisation de 3 ateliers.", en: "Managed a €2,000 budget and organised 3 workshops." } },
    ]  },
    { id: "hobbies", title: { fr: "SPORT ET LOISIRS", en: "SPORTS AND INTERESTS" }, items: [
      { id: "hobby-sport", label: { fr: "Course à pied", en: "Running" }, text: { fr: "Un semi-marathon en 2025.", en: "One half-marathon in 2025." } },
      { id: "hobby-music", label: { fr: "Piano", en: "Piano" }, text: { fr: "8 ans de pratique.", en: "8 years of practice." } },
    ]  },
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
