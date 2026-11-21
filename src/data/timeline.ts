import type { TimelineEra, TimelineEvent, Universe } from "@/lib/types";

const w = (title: string) => ({ label: "Wikipédia (EN)", url: `https://en.wikipedia.org/wiki/${title}` });
const OFFICIAL_TIMELINE = {
  label: "Marvel Studios : The Official Timeline (Anthony Breznican, Amy Ratcliffe, Rebecca Theodore-Vachon, 2023)",
  url: "https://en.wikipedia.org/wiki/Marvel_Cinematic_Universe_timeline",
};

/**
 * Chronologie NARRATIVE du MCU (ordre des événements dans l'histoire).
 * À ne pas confondre avec l'ordre de sortie, géré séparément (page « Chronologie des sorties »).
 * Certaines datations internes du MCU sont incohérentes entre productions : elles sont signalées (`disputed`).
 */
export const ERAS: TimelineEra[] = [
  { id: "origines", label: "Origines cosmiques", period: "Avant le Big Bang → Antiquité", description: "Création des Pierres d'Infinité, Célestes, Éternels." },
  { id: "seconde-guerre", label: "Seconde Guerre mondiale", period: "1942 – 1945", description: "Captain America, HYDRA et la Strategic Scientific Reserve." },
  { id: "guerre-froide", label: "Fondation du S.H.I.E.L.D.", period: "1946 – 1995", description: "Peggy Carter, Howard Stark, la guerre Kree-Skrull." },
  { id: "heros-modernes", label: "L'ère des héros", period: "2008 – 2015", description: "Iron Man, l'Initiative Avengers, la bataille de New York, la chute du S.H.I.E.L.D., Ultron." },
  { id: "fracture", label: "Fracture et guerre de l'Infini", period: "2016 – 2018", description: "Accords de Sokovie, Wakanda, Thanos." },
  { id: "blip", label: "Le Blip", period: "2018 – 2023", description: "La moitié de la vie disparaît, puis revient." },
  { id: "post-blip", label: "L'après-Blip et le multivers", period: "2023 – …", description: "Héritage des Avengers, ouverture du multivers." },
];

export const TIMELINE: TimelineEvent[] = [
  {
    id: "pierres-infinite", eraId: "origines", when: "Avant le Big Bang", title: "Naissance des six Pierres d'Infinité",
    description: "Six singularités antérieures à l'univers sont condensées en lingots : Espace, Esprit, Réalité, Pouvoir, Temps et Âme.",
    productionIds: ["guardians-of-the-galaxy", "avengers-endgame"], spoiler: false, sources: [w("Infinity_Stones"), OFFICIAL_TIMELINE],
  },
  {
    id: "eternels-arrivee", eraId: "origines", when: "5000 av. J.-C.", title: "Arrivée des Éternels en Mésopotamie",
    description: "Les Éternels sont envoyés sur Terre par le Céleste Arishem pour protéger l'humanité des Déviants.",
    productionIds: ["eternals"], spoiler: false, sources: [w("Eternals_(film)")],
  },
  {
    id: "steve-rogers-serum", eraId: "seconde-guerre", when: "1943", title: "Steve Rogers devient le super-soldat",
    description: "Le programme du Dr Abraham Erskine transforme Steve Rogers. Il devient Captain America.",
    productionIds: ["captain-america-first-avenger"], spoiler: false, sources: [w("Captain_America:_The_First_Avenger")],
  },
  {
    id: "steve-arctique", eraId: "seconde-guerre", when: "1945", title: "Captain America disparaît dans l'Arctique",
    description: "Pour empêcher le Valkyrie de Crâne Rouge d'atteindre les États-Unis, Steve Rogers fait s'écraser l'appareil dans les glaces.",
    productionIds: ["captain-america-first-avenger"], spoiler: true, sources: [w("Captain_America:_The_First_Avenger")],
  },
  {
    id: "carter-ssr", eraId: "guerre-froide", when: "1946", title: "Peggy Carter à la SSR",
    description: "Peggy Carter poursuit son travail d'agent à la Strategic Scientific Reserve (série Agent Carter, canonicité MCU discutée).",
    productionIds: ["agent-carter"], spoiler: false, disputed: "Série Marvel Television : son intégration au canon MCU n'est pas tranchée explicitement par Marvel Studios.",
    sources: [w("Agent_Carter_(TV_series)")],
  },
  {
    id: "captain-marvel-1995", eraId: "guerre-froide", when: "1995", title: "Carol Danvers et la guerre Kree-Skrull",
    description: "Carol Danvers découvre son passé terrien. Nick Fury imagine l'« Initiative Avengers ».",
    productionIds: ["captain-marvel"], spoiler: false, sources: [w("Captain_Marvel_(film)")],
  },
  {
    id: "tony-iron-man", eraId: "heros-modernes", when: "2008 (datation discutée)", title: "« Je suis Iron Man »",
    description: "Tony Stark révèle publiquement être Iron Man.",
    productionIds: ["iron-man"], spoiler: false,
    disputed: "La chronologie officielle place Iron Man en 2010 ; le film a été conçu comme contemporain de sa sortie (2008). Spider-Man: Homecoming a renforcé l'incohérence avec son carton « 8 ans plus tard ».",
    sources: [w("Iron_Man_(2008_film)"), OFFICIAL_TIMELINE],
  },
  {
    id: "bataille-new-york", eraId: "heros-modernes", when: "2012", title: "Bataille de New York",
    description: "Les Avengers repoussent l'invasion Chitauri menée par Loki. Premier contact public avec une menace extraterrestre.",
    productionIds: ["avengers"], spoiler: false, sources: [w("The_Avengers_(2012_film)")],
  },
  {
    id: "chute-shield", eraId: "heros-modernes", when: "2014", title: "Chute du S.H.I.E.L.D.",
    description: "L'infiltration d'HYDRA au sein du S.H.I.E.L.D. est révélée ; l'agence est démantelée.",
    productionIds: ["captain-america-winter-soldier", "agents-of-shield"], spoiler: true, sources: [w("Captain_America:_The_Winter_Soldier")],
  },
  {
    id: "sokovie", eraId: "heros-modernes", when: "2015", title: "Bataille de Sokovie",
    description: "Ultron soulève une ville de Sokovie dans les airs. Naissance de Vision.",
    productionIds: ["avengers-age-of-ultron"], spoiler: true, sources: [w("Avengers:_Age_of_Ultron")],
  },
  {
    id: "accords-sokovie", eraId: "fracture", when: "2016", title: "Accords de Sokovie",
    description: "117 pays signent un texte encadrant les Avengers. L'équipe se divise.",
    productionIds: ["captain-america-civil-war", "black-widow"], spoiler: false, sources: [w("Captain_America:_Civil_War")],
  },
  {
    id: "wakanda-ouverture", eraId: "fracture", when: "2016", title: "Le Wakanda s'ouvre au monde",
    description: "T'Challa annonce à l'ONU que le Wakanda partagera ses ressources et son savoir.",
    productionIds: ["black-panther"], spoiler: true, sources: [w("Black_Panther_(film)")],
  },
  {
    id: "snap", eraId: "fracture", when: "2018", title: "Le claquement de doigts de Thanos",
    description: "Thanos réunit les six Pierres d'Infinité et efface la moitié de toute vie dans l'univers.",
    productionIds: ["avengers-infinity-war"], spoiler: true, sources: [w("Avengers:_Infinity_War")],
  },
  {
    id: "blip-retour", eraId: "blip", when: "2023", title: "Le retour des disparus",
    description: "Grâce au « casse temporel », les Avengers ramènent les victimes du claquement de doigts cinq ans après leur disparition.",
    productionIds: ["avengers-endgame"], spoiler: true, sources: [w("Avengers:_Endgame")],
  },
  {
    id: "loki-tva", eraId: "post-blip", when: "Hors du temps", title: "La chronologie sacrée se ramifie",
    description: "Les événements de la saison 1 de Loki provoquent la ramification de la chronologie et l'émergence du multivers.",
    productionIds: ["loki"], spoiler: true, sources: [w("Loki_(TV_series)")],
  },
  {
    id: "identite-spider-man", eraId: "post-blip", when: "2024", title: "L'identité de Spider-Man révélée… puis oubliée",
    description: "Le sort du Docteur Strange ouvre des brèches multiverselles. Pour les refermer, le monde entier oublie qui est Peter Parker.",
    productionIds: ["spider-man-far-from-home", "spider-man-no-way-home"], spoiler: true, sources: [w("Spider-Man:_No_Way_Home")],
  },
  {
    id: "maitre-evolution", eraId: "post-blip", when: "2026", title: "Les Gardiens contre le Maître de l'Évolution",
    description: "Les Gardiens affrontent le créateur de Rocket ; l'équipe prend ensuite des chemins séparés.",
    productionIds: ["guardians-of-the-galaxy-vol-3"], spoiler: true, sources: [w("Guardians_of_the_Galaxy_Vol._3")],
  },
];

/**
 * Univers et désignations. N'apparaissent ici que des connexions montrées à l'écran
 * ou confirmées par Marvel Studios / les studios concernés.
 */
export const UNIVERSES: Universe[] = [
  {
    id: "earth-616-mcu", designation: "Terre-616", name: "Univers principal du MCU", continuity: "mcu",
    description: "Univers de la « chronologie sacrée ». La désignation 616 est employée à l'écran dans Doctor Strange in the Multiverse of Madness. Les guides officiels plus anciens utilisaient Terre-199999.",
    productionIds: ["iron-man", "avengers", "avengers-endgame", "spider-man-no-way-home"],
    confirmedLinks: [
      { universeId: "earth-838", via: "Voyage de Strange et America Chavez", productionId: "doctor-strange-multiverse-of-madness" },
      { universeId: "raimi-universe", via: "Sort de Strange (personnages amenés dans le MCU)", productionId: "spider-man-no-way-home" },
      { universeId: "webb-universe", via: "Sort de Strange (personnages amenés dans le MCU)", productionId: "spider-man-no-way-home" },
      { universeId: "ssu-universe", via: "Eddie Brock transporté puis renvoyé (scènes post-génériques)", productionId: "spider-man-no-way-home" },
      { universeId: "earth-10005", via: "TVA / le Vide", productionId: "deadpool-and-wolverine" },
    ],
    sources: [w("Doctor_Strange_in_the_Multiverse_of_Madness"), w("Multiverse_(Marvel_Cinematic_Universe)")],
  },
  {
    id: "earth-838", designation: "Terre-838", name: "Univers des Illuminati", continuity: "mcu",
    description: "Univers visité dans Doctor Strange in the Multiverse of Madness, protégé par les Illuminati.",
    productionIds: ["doctor-strange-multiverse-of-madness"], sources: [w("Doctor_Strange_in_the_Multiverse_of_Madness")],
  },
  {
    id: "earth-828", designation: "Terre-828", name: "Univers des 4 Fantastiques", continuity: "mcu",
    description: "Univers rétro-futuriste de The Fantastic Four: First Steps.",
    productionIds: ["fantastic-four-first-steps"], sources: [w("The_Fantastic_Four:_First_Steps")],
  },
  {
    id: "earth-10005", designation: "Terre-10005", name: "Univers des X-Men de la Fox", continuity: "fox-xmen",
    description: "Désignation donnée dans Deadpool & Wolverine à l'univers de Deadpool, rattachant ainsi les films Fox au multivers du MCU.",
    productionIds: ["deadpool", "deadpool-2", "logan", "deadpool-and-wolverine"],
    notes: "Les films Fox restent une continuité distincte : seule leur existence en tant qu'univers parallèle est confirmée.",
    sources: [w("Deadpool_&_Wolverine")],
  },
  {
    id: "raimi-universe", designation: "Non précisée à l'écran", name: "Univers de la trilogie Spider-Man de Sam Raimi", continuity: "sony-spider-man",
    description: "Univers de Tobey Maguire. Relié au MCU par No Way Home.",
    productionIds: ["spider-man-2002", "spider-man-2", "spider-man-3"], sources: [w("Spider-Man:_No_Way_Home")],
  },
  {
    id: "webb-universe", designation: "Non précisée à l'écran", name: "Univers des films The Amazing Spider-Man", continuity: "sony-spider-man",
    description: "Univers d'Andrew Garfield. Relié au MCU par No Way Home.",
    productionIds: ["amazing-spider-man", "amazing-spider-man-2"], sources: [w("Spider-Man:_No_Way_Home")],
  },
  {
    id: "ssu-universe", designation: "Non précisée à l'écran", name: "Sony's Spider-Man Universe", continuity: "sony-ssu",
    description: "Univers de Venom. Eddie Brock est brièvement transporté dans le MCU (Venom: Let There Be Carnage / No Way Home).",
    productionIds: ["venom", "venom-let-there-be-carnage", "morbius", "venom-the-last-dance"], sources: [w("Venom:_Let_There_Be_Carnage")],
  },
  {
    id: "earth-1610", designation: "Terre-1610", name: "Univers de Miles Morales (Spider-Verse)", continuity: "spider-verse",
    description: "Univers d'origine de Miles Morales dans Spider-Man : New Generation. Continuité d'animation distincte de Sony Pictures Animation.",
    productionIds: ["into-the-spider-verse", "across-the-spider-verse"], sources: [w("Spider-Man:_Into_the_Spider-Verse")],
  },
  {
    id: "what-if-multiverse", designation: "Multiples", name: "Univers de What If...?", continuity: "mcu",
    description: "Univers alternatifs observés par le Gardien, variations des événements du MCU.",
    productionIds: ["what-if", "marvel-zombies"], sources: [w("What_If...?_(TV_series)")],
  },
];
