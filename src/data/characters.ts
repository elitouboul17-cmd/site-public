import type { Character, CharacterKind, ContinuityId } from "@/lib/types";

/**
 * Encyclopédie des personnages, équipes et organisations.
 * Les interprètes ne sont listés que par continuité (jamais fusionnés entre franchises).
 * `productions` est complété automatiquement à partir des castings (voir lib/catalog.ts).
 */

type C = Omit<Character, "kind" | "continuities"> & { kind?: CharacterKind; continuities?: ContinuityId[] };
const c = (kind: CharacterKind, ch: C): Character => ({ continuities: ["mcu", "comics"], ...ch, kind });
const fa = (comic: string, year: number) => ({ comic, year });

export const CHARACTERS: Character[] = [
  /* ───── Héros ───── */
  c("heros", {
    id: "iron-man", name: "Iron Man", civilName: "Tony Stark", aliases: ["Anthony Edward Stark"],
    firstAppearance: { ...fa("Tales of Suspense #39", 1963), mcuProductionId: "iron-man" },
    portrayals: [{ person: "Robert Downey Jr.", continuity: "mcu" }],
    abilities: ["Génie de l'ingénierie", "Armures motorisées", "Intelligence artificielle (J.A.R.V.I.S., F.R.I.D.A.Y.)"],
    affiliations: ["avengers-team", "stark-industries"], allies: ["war-machine", "pepper-potts", "spider-man", "hulk"],
    enemies: ["thanos", "ultron"], relations: [{ characterId: "pepper-potts", nature: "Épouse" }, { characterId: "captain-america", nature: "Coéquipier puis rival (Civil War)" }],
    description: "Industriel et inventeur, Tony Stark construit sa première armure en captivité. Son histoire ouvre le MCU en 2008.",
    matchTerms: ["Tony Stark", "Iron Man"],
  }),
  c("heros", {
    id: "captain-america", name: "Captain America", civilName: "Steve Rogers", aliases: ["Nomad"],
    firstAppearance: { ...fa("Captain America Comics #1", 1941), mcuProductionId: "captain-america-first-avenger" },
    portrayals: [{ person: "Chris Evans", continuity: "mcu" }],
    abilities: ["Sérum du super-soldat", "Bouclier en vibranium", "Tactique et commandement"],
    affiliations: ["avengers-team", "shield"], allies: ["winter-soldier", "falcon", "black-widow", "peggy-carter"], enemies: ["red-skull", "hydra", "thanos"],
    relations: [{ characterId: "winter-soldier", nature: "Ami d'enfance" }, { characterId: "falcon", nature: "Transmet le bouclier" }],
    description: "Jeune homme frêle de Brooklyn devenu super-soldat pendant la Seconde Guerre mondiale.",
    matchTerms: ["Steve Rogers", "Captain America"],
  }),
  c("heros", {
    id: "thor", name: "Thor", civilName: "Thor Odinson",
    firstAppearance: { ...fa("Journey into Mystery #83", 1962), mcuProductionId: "thor" },
    portrayals: [{ person: "Chris Hemsworth", continuity: "mcu" }],
    abilities: ["Maîtrise de la foudre", "Force surhumaine", "Mjolnir puis Stormbreaker"],
    affiliations: ["avengers-team", "guardians-team"], allies: ["valkyrie", "hulk", "jane-foster"], enemies: ["hela", "thanos"],
    relations: [{ characterId: "loki", nature: "Frère adoptif" }, { characterId: "odin", nature: "Père" }, { characterId: "hela", nature: "Sœur aînée" }],
    description: "Dieu asgardien du tonnerre, héritier du trône d'Asgard.",
    matchTerms: ["Thor"],
  }),
  c("heros", {
    id: "hulk", name: "Hulk", civilName: "Bruce Banner",
    firstAppearance: { ...fa("The Incredible Hulk #1", 1962), mcuProductionId: "incredible-hulk" },
    portrayals: [
      { person: "Edward Norton", continuity: "mcu", note: "L'Incroyable Hulk (2008)" },
      { person: "Mark Ruffalo", continuity: "mcu", note: "Depuis Avengers (2012)" },
      { person: "Eric Bana", continuity: "legacy-film", note: "Hulk (2003, Ang Lee)" },
    ],
    abilities: ["Force quasi illimitée", "Régénération", "Génie scientifique (Banner)"],
    affiliations: ["avengers-team"], allies: ["iron-man", "thor", "black-widow", "she-hulk"], enemies: ["abomination", "thaddeus-ross"],
    relations: [{ characterId: "she-hulk", nature: "Cousin de Jennifer Walters" }],
    matchTerms: ["Bruce Banner", "Hulk"],
  }),
  c("heros", {
    id: "black-widow", name: "Black Widow", civilName: "Natasha Romanoff",
    firstAppearance: { ...fa("Tales of Suspense #52", 1964), mcuProductionId: "iron-man-2" },
    portrayals: [{ person: "Scarlett Johansson", continuity: "mcu" }],
    abilities: ["Espionnage", "Arts martiaux", "Formation de la Chambre Rouge"],
    affiliations: ["avengers-team", "shield"], allies: ["hawkeye", "captain-america", "yelena-belova"],
    relations: [{ characterId: "yelena-belova", nature: "« Sœur » adoptive" }, { characterId: "hawkeye", nature: "Meilleur ami" }],
    matchTerms: ["Natasha Romanoff", "Black Widow"],
  }),
  c("heros", {
    id: "hawkeye", name: "Hawkeye", civilName: "Clint Barton", aliases: ["Ronin"],
    firstAppearance: { ...fa("Tales of Suspense #57", 1964), mcuProductionId: "thor" },
    portrayals: [{ person: "Jeremy Renner", continuity: "mcu" }],
    abilities: ["Tir à l'arc de précision", "Combat rapproché"], affiliations: ["avengers-team", "shield"], allies: ["black-widow"],
    matchTerms: ["Clint Barton", "Hawkeye", "Kate Bishop"],
  }),
  c("heros", {
    id: "spider-man", name: "Spider-Man", civilName: "Peter Parker",
    firstAppearance: { ...fa("Amazing Fantasy #15", 1962), mcuProductionId: "captain-america-civil-war" },
    portrayals: [
      { person: "Tom Holland", continuity: "mcu" },
      { person: "Tobey Maguire", continuity: "sony-spider-man", note: "Trilogie de Sam Raimi (2002-2007) ; apparaît dans No Way Home" },
      { person: "Andrew Garfield", continuity: "sony-spider-man", note: "The Amazing Spider-Man (2012-2014) ; apparaît dans No Way Home" },
      { person: "Jake Johnson", continuity: "spider-verse", note: "Peter B. Parker (voix)" },
    ],
    abilities: ["Force et agilité proportionnelles à celles d'une araignée", "Sens d'araignée", "Lance-toiles"],
    affiliations: ["avengers-team"], allies: ["iron-man", "doctor-strange", "miles-morales"], enemies: ["green-goblin", "venom"],
    relations: [{ characterId: "iron-man", nature: "Mentor" }],
    matchTerms: ["Spider-Man", "Peter Parker", "Spidey"],
  }),
  c("heros", {
    id: "miles-morales", name: "Spider-Man (Miles Morales)", civilName: "Miles Morales",
    firstAppearance: fa("Ultimate Fallout #4", 2011), continuities: ["spider-verse", "games", "comics"],
    portrayals: [{ person: "Shameik Moore", continuity: "spider-verse", note: "Voix" }],
    abilities: ["Pouvoirs arachnéens", "Venom Blast", "Camouflage"], allies: ["spider-man"],
    matchTerms: ["Miles Morales", "Spider-Verse"],
  }),
  c("heros", {
    id: "doctor-strange", name: "Doctor Strange", civilName: "Stephen Strange", aliases: ["Sorcier suprême"],
    firstAppearance: { ...fa("Strange Tales #110", 1963), mcuProductionId: "doctor-strange" },
    portrayals: [{ person: "Benedict Cumberbatch", continuity: "mcu" }],
    abilities: ["Arts mystiques", "Cape de lévitation", "Œil d'Agamotto (Pierre du Temps)"],
    affiliations: ["avengers-team", "masters-of-mystic-arts"], allies: ["wong", "spider-man", "scarlet-witch"],
    relations: [{ characterId: "wong", nature: "Allié et successeur au titre de Sorcier suprême" }],
    matchTerms: ["Doctor Strange", "Stephen Strange", "Docteur Strange"],
  }),
  c("heros", {
    id: "black-panther", name: "Black Panther", civilName: "T'Challa",
    firstAppearance: { ...fa("Fantastic Four #52", 1966), mcuProductionId: "captain-america-civil-war" },
    portrayals: [{ person: "Chadwick Boseman", continuity: "mcu", note: "Décédé en 2020" }],
    abilities: ["Herbe en forme de cœur", "Combinaison en vibranium"], affiliations: ["avengers-team", "wakanda"],
    allies: ["shuri", "okoye", "captain-america"], enemies: ["killmonger"], relations: [{ characterId: "shuri", nature: "Sœur" }],
    matchTerms: ["Black Panther", "T'Challa", "Wakanda"],
  }),
  c("heros", {
    id: "shuri", name: "Shuri", firstAppearance: { ...fa("Black Panther #2", 2005), mcuProductionId: "black-panther" },
    portrayals: [{ person: "Letitia Wright", continuity: "mcu" }],
    abilities: ["Génie scientifique", "Black Panther (Wakanda Forever)"], affiliations: ["wakanda"], allies: ["black-panther", "okoye"],
    relations: [{ characterId: "black-panther", nature: "Frère" }], matchTerms: ["Shuri"],
  }),
  c("secondaire", {
    id: "okoye", name: "Okoye", firstAppearance: { ...fa("Black Panther #1", 1998), mcuProductionId: "black-panther" },
    portrayals: [{ person: "Danai Gurira", continuity: "mcu" }], affiliations: ["wakanda"], allies: ["black-panther", "shuri"], matchTerms: ["Okoye"],
  }),
  c("heros", {
    id: "captain-marvel", name: "Captain Marvel", civilName: "Carol Danvers", aliases: ["Vers"],
    firstAppearance: { ...fa("Marvel Super-Heroes #13", 1968), mcuProductionId: "captain-marvel" },
    portrayals: [{ person: "Brie Larson", continuity: "mcu" }],
    abilities: ["Absorption et projection d'énergie", "Vol", "Force surhumaine"], affiliations: ["avengers-team"],
    allies: ["nick-fury", "ms-marvel", "talos"], matchTerms: ["Captain Marvel", "Carol Danvers"],
  }),
  c("heros", {
    id: "ms-marvel", name: "Miss Marvel", civilName: "Kamala Khan", firstAppearance: { ...fa("Captain Marvel #14", 2013), mcuProductionId: "ms-marvel" },
    portrayals: [{ person: "Iman Vellani", continuity: "mcu" }], allies: ["captain-marvel"], matchTerms: ["Kamala Khan", "Ms. Marvel", "Miss Marvel"],
  }),
  c("heros", {
    id: "ant-man", name: "Ant-Man", civilName: "Scott Lang", firstAppearance: { ...fa("The Avengers #181", 1979), mcuProductionId: "ant-man" },
    portrayals: [{ person: "Paul Rudd", continuity: "mcu" }], abilities: ["Particules Pym (réduction/agrandissement)"],
    affiliations: ["avengers-team"], allies: ["wasp", "hank-pym"], enemies: ["kang"], matchTerms: ["Ant-Man", "Scott Lang"],
  }),
  c("heros", {
    id: "wasp", name: "La Guêpe", civilName: "Hope van Dyne", aliases: ["The Wasp"], firstAppearance: { mcuProductionId: "ant-man" },
    portrayals: [{ person: "Evangeline Lilly", continuity: "mcu" }], allies: ["ant-man", "hank-pym"],
    relations: [{ characterId: "hank-pym", nature: "Père" }],
    description: "Dans les comics, le titre de la Guêpe est d'abord porté par Janet van Dyne (Tales to Astonish #44, 1963).",
    matchTerms: ["Hope van Dyne", "The Wasp"],
  }),
  c("secondaire", {
    id: "hank-pym", name: "Hank Pym", civilName: "Henry Pym", firstAppearance: { ...fa("Tales to Astonish #27", 1962), mcuProductionId: "ant-man" },
    portrayals: [{ person: "Michael Douglas", continuity: "mcu" }], allies: ["ant-man", "wasp"], matchTerms: ["Hank Pym"],
  }),
  c("heros", {
    id: "scarlet-witch", name: "La Sorcière rouge", civilName: "Wanda Maximoff", aliases: ["Scarlet Witch"],
    firstAppearance: { ...fa("The X-Men #4", 1964), mcuProductionId: "avengers-age-of-ultron" },
    portrayals: [{ person: "Elizabeth Olsen", continuity: "mcu" }], abilities: ["Magie du Chaos", "Télékinésie", "Altération de la réalité"],
    affiliations: ["avengers-team"], allies: ["vision"], relations: [{ characterId: "vision", nature: "Compagnon" }],
    matchTerms: ["Wanda Maximoff", "Scarlet Witch", "Sorcière rouge"],
  }),
  c("heros", {
    id: "vision", name: "Vision", firstAppearance: { ...fa("The Avengers #57", 1968), mcuProductionId: "avengers-age-of-ultron" },
    portrayals: [{ person: "Paul Bettany", continuity: "mcu" }], abilities: ["Pierre de l'Esprit (jusqu'en 2018)", "Contrôle de densité"],
    affiliations: ["avengers-team"], relations: [{ characterId: "scarlet-witch", nature: "Compagne" }, { characterId: "ultron", nature: "Créé à partir du corps conçu par Ultron" }],
    matchTerms: ["Vision", "VisionQuest"],
  }),
  c("heros", {
    id: "falcon", name: "Falcon / Captain America", civilName: "Sam Wilson", firstAppearance: { ...fa("Captain America #117", 1969), mcuProductionId: "captain-america-winter-soldier" },
    portrayals: [{ person: "Anthony Mackie", continuity: "mcu" }], abilities: ["Ailes en vibranium", "Bouclier (depuis 2021)"],
    affiliations: ["avengers-team"], allies: ["captain-america", "winter-soldier"], matchTerms: ["Sam Wilson", "Falcon"],
  }),
  c("anti-heros", {
    id: "winter-soldier", name: "Le Soldat de l'hiver", civilName: "James Buchanan « Bucky » Barnes", aliases: ["Bucky", "White Wolf"],
    firstAppearance: { ...fa("Captain America Comics #1", 1941), mcuProductionId: "captain-america-first-avenger" },
    portrayals: [{ person: "Sebastian Stan", continuity: "mcu" }], abilities: ["Bras cybernétique", "Formation d'assassin"],
    affiliations: ["thunderbolts-team"], allies: ["captain-america", "falcon"], enemies: ["hydra"], matchTerms: ["Bucky Barnes", "Winter Soldier"],
  }),
  c("anti-heros", {
    id: "yelena-belova", name: "Yelena Belova", firstAppearance: { ...fa("Inhumans #5", 1999), mcuProductionId: "black-widow" },
    portrayals: [{ person: "Florence Pugh", continuity: "mcu" }], affiliations: ["thunderbolts-team"], allies: ["black-widow"], matchTerms: ["Yelena Belova", "Yelena"],
  }),
  c("heros", {
    id: "star-lord", name: "Star-Lord", civilName: "Peter Quill", firstAppearance: { ...fa("Marvel Preview #4", 1976), mcuProductionId: "guardians-of-the-galaxy" },
    portrayals: [{ person: "Chris Pratt", continuity: "mcu" }], affiliations: ["guardians-team"], allies: ["gamora", "rocket", "groot", "drax"], matchTerms: ["Star-Lord", "Peter Quill"],
  }),
  c("heros", {
    id: "gamora", name: "Gamora", firstAppearance: { ...fa("Strange Tales #180", 1975), mcuProductionId: "guardians-of-the-galaxy" },
    portrayals: [{ person: "Zoe Saldaña", continuity: "mcu" }], affiliations: ["guardians-team"],
    relations: [{ characterId: "thanos", nature: "Fille adoptive" }, { characterId: "nebula", nature: "Sœur adoptive" }], matchTerms: ["Gamora"],
  }),
  c("heros", {
    id: "rocket", name: "Rocket", firstAppearance: { ...fa("Marvel Preview #7", 1976), mcuProductionId: "guardians-of-the-galaxy" },
    portrayals: [{ person: "Bradley Cooper", continuity: "mcu", note: "Voix" }], affiliations: ["guardians-team"], allies: ["groot"], matchTerms: ["Rocket Raccoon", "Rocket"],
  }),
  c("heros", {
    id: "groot", name: "Groot", firstAppearance: { ...fa("Tales to Astonish #13", 1960), mcuProductionId: "guardians-of-the-galaxy" },
    portrayals: [{ person: "Vin Diesel", continuity: "mcu", note: "Voix" }], affiliations: ["guardians-team"], allies: ["rocket"], matchTerms: ["Groot"],
  }),
  c("heros", {
    id: "drax", name: "Drax le Destructeur", firstAppearance: { ...fa("Iron Man #55", 1973), mcuProductionId: "guardians-of-the-galaxy" },
    portrayals: [{ person: "Dave Bautista", continuity: "mcu" }], affiliations: ["guardians-team"], enemies: ["thanos"], matchTerms: ["Drax"],
  }),
  c("anti-heros", {
    id: "nebula", name: "Nebula", firstAppearance: { ...fa("The Avengers #257", 1985), mcuProductionId: "guardians-of-the-galaxy" },
    portrayals: [{ person: "Karen Gillan", continuity: "mcu" }], affiliations: ["guardians-team"],
    relations: [{ characterId: "thanos", nature: "Fille adoptive" }, { characterId: "gamora", nature: "Sœur adoptive" }], matchTerms: ["Nebula"],
  }),
  c("heros", {
    id: "shang-chi", name: "Shang-Chi", firstAppearance: { ...fa("Special Marvel Edition #15", 1973), mcuProductionId: "shang-chi" },
    portrayals: [{ person: "Simu Liu", continuity: "mcu" }], abilities: ["Arts martiaux", "Dix Anneaux"], matchTerms: ["Shang-Chi"],
  }),
  c("heros", {
    id: "moon-knight", name: "Moon Knight", civilName: "Marc Spector", aliases: ["Steven Grant", "Mr. Knight"],
    firstAppearance: { ...fa("Werewolf by Night #32", 1975), mcuProductionId: "moon-knight" },
    portrayals: [{ person: "Oscar Isaac", continuity: "mcu" }], matchTerms: ["Moon Knight", "Marc Spector"],
  }),
  c("heros", {
    id: "she-hulk", name: "She-Hulk", civilName: "Jennifer Walters", firstAppearance: { ...fa("The Savage She-Hulk #1", 1980), mcuProductionId: "she-hulk" },
    portrayals: [{ person: "Tatiana Maslany", continuity: "mcu" }], relations: [{ characterId: "hulk", nature: "Cousine de Bruce Banner" }], matchTerms: ["She-Hulk", "Jennifer Walters"],
  }),
  c("heros", {
    id: "daredevil", name: "Daredevil", civilName: "Matt Murdock",
    firstAppearance: { ...fa("Daredevil #1", 1964), mcuProductionId: "spider-man-no-way-home" },
    continuities: ["mcu", "marvel-television", "legacy-film", "comics"],
    portrayals: [
      { person: "Charlie Cox", continuity: "marvel-television", note: "Netflix (2015-2018)" },
      { person: "Charlie Cox", continuity: "mcu", note: "Depuis No Way Home (2021)" },
      { person: "Ben Affleck", continuity: "legacy-film", note: "Daredevil (2003)" },
    ],
    abilities: ["Sens surdéveloppés", "Arts martiaux"], enemies: ["kingpin"], allies: ["punisher"], affiliations: ["defenders-team"],
    matchTerms: ["Daredevil", "Matt Murdock"],
  }),
  c("anti-heros", {
    id: "punisher", name: "Le Punisher", civilName: "Frank Castle", firstAppearance: fa("The Amazing Spider-Man #129", 1974),
    continuities: ["mcu", "marvel-television", "comics"],
    portrayals: [{ person: "Jon Bernthal", continuity: "marvel-television" }, { person: "Jon Bernthal", continuity: "mcu", note: "Daredevil: Born Again" }],
    matchTerms: ["Punisher", "Frank Castle"],
  }),
  c("heros", {
    id: "luke-cage", name: "Luke Cage", firstAppearance: fa("Luke Cage, Hero for Hire #1", 1972), continuities: ["marvel-television", "comics"],
    portrayals: [{ person: "Mike Colter", continuity: "marvel-television" }], affiliations: ["defenders-team"], matchTerms: ["Luke Cage"],
  }),
  c("heros", {
    id: "echo", name: "Echo", civilName: "Maya Lopez", firstAppearance: { ...fa("Daredevil #9", 1999), mcuProductionId: "hawkeye" },
    portrayals: [{ person: "Alaqua Cox", continuity: "mcu" }], enemies: ["kingpin"], matchTerms: ["Maya Lopez", "Echo"],
  }),
  c("heros", {
    id: "ironheart", name: "Ironheart", civilName: "Riri Williams", firstAppearance: { ...fa("Invincible Iron Man #7", 2016), mcuProductionId: "black-panther-wakanda-forever" },
    portrayals: [{ person: "Dominique Thorne", continuity: "mcu" }], matchTerms: ["Ironheart", "Riri Williams"],
  }),
  c("anti-heros", {
    id: "deadpool", name: "Deadpool", civilName: "Wade Wilson", firstAppearance: fa("The New Mutants #98", 1991),
    continuities: ["fox-xmen", "mcu", "comics"],
    portrayals: [
      { person: "Ryan Reynolds", continuity: "fox-xmen", note: "X-Men Origins: Wolverine, Deadpool 1 et 2" },
      { person: "Ryan Reynolds", continuity: "mcu", note: "Deadpool & Wolverine (2024)" },
    ],
    abilities: ["Facteur auto-guérisseur", "Brise le quatrième mur"], allies: ["wolverine"], matchTerms: ["Deadpool", "Wade Wilson"],
  }),
  c("heros", {
    id: "wolverine", name: "Wolverine", civilName: "Logan / James Howlett", firstAppearance: fa("The Incredible Hulk #180-181", 1974),
    continuities: ["fox-xmen", "mcu", "animation", "comics", "games"],
    portrayals: [
      { person: "Hugh Jackman", continuity: "fox-xmen", note: "De X-Men (2000) à Logan (2017)" },
      { person: "Hugh Jackman", continuity: "mcu", note: "Variante dans Deadpool & Wolverine (2024)" },
    ],
    abilities: ["Griffes en adamantium", "Facteur auto-guérisseur"], affiliations: ["x-men-team"], matchTerms: ["Wolverine", "Logan"],
  }),
  c("heros", {
    id: "professor-x", name: "Professeur X", civilName: "Charles Xavier", firstAppearance: fa("The X-Men #1", 1963),
    continuities: ["fox-xmen", "animation", "comics"],
    portrayals: [{ person: "Patrick Stewart", continuity: "fox-xmen" }, { person: "James McAvoy", continuity: "fox-xmen", note: "Version jeune" }],
    abilities: ["Télépathie"], affiliations: ["x-men-team"], relations: [{ characterId: "magneto", nature: "Ami et adversaire" }], matchTerms: ["Charles Xavier", "Professor X", "Professeur X"],
  }),
  c("anti-heros", {
    id: "magneto", name: "Magneto", civilName: "Erik Lehnsherr", firstAppearance: fa("The X-Men #1", 1963),
    continuities: ["fox-xmen", "animation", "comics"],
    portrayals: [{ person: "Ian McKellen", continuity: "fox-xmen" }, { person: "Michael Fassbender", continuity: "fox-xmen", note: "Version jeune" }],
    abilities: ["Contrôle du magnétisme"], relations: [{ characterId: "professor-x", nature: "Ami et adversaire" }], matchTerms: ["Magneto"],
  }),
  c("heros", {
    id: "storm", name: "Tornade", civilName: "Ororo Munroe", aliases: ["Storm"], firstAppearance: fa("Giant-Size X-Men #1", 1975),
    continuities: ["fox-xmen", "animation", "comics"], portrayals: [{ person: "Halle Berry", continuity: "fox-xmen" }],
    abilities: ["Contrôle du climat"], affiliations: ["x-men-team"], matchTerms: ["Ororo Munroe", "Storm"],
  }),
  c("heros", {
    id: "jean-grey", name: "Jean Grey", aliases: ["Phénix", "Marvel Girl"], firstAppearance: fa("The X-Men #1", 1963),
    continuities: ["fox-xmen", "animation", "comics"], portrayals: [{ person: "Famke Janssen", continuity: "fox-xmen" }],
    abilities: ["Télépathie", "Télékinésie", "Force Phénix"], affiliations: ["x-men-team"], matchTerms: ["Jean Grey", "Phoenix"],
  }),
  c("heros", {
    id: "mister-fantastic", name: "Mister Fantastic", civilName: "Reed Richards", firstAppearance: { ...fa("The Fantastic Four #1", 1961), mcuProductionId: "fantastic-four-first-steps" },
    continuities: ["mcu", "fox-ff", "comics"], portrayals: [{ person: "Pedro Pascal", continuity: "mcu", note: "Terre-828" }],
    abilities: ["Corps élastique", "Génie scientifique"], affiliations: ["fantastic-four-team"], matchTerms: ["Reed Richards", "Mister Fantastic"],
  }),
  c("heros", {
    id: "invisible-woman", name: "La Femme invisible", civilName: "Sue Storm", firstAppearance: { ...fa("The Fantastic Four #1", 1961), mcuProductionId: "fantastic-four-first-steps" },
    continuities: ["mcu", "fox-ff", "comics"], portrayals: [{ person: "Vanessa Kirby", continuity: "mcu", note: "Terre-828" }],
    abilities: ["Invisibilité", "Champs de force"], affiliations: ["fantastic-four-team"], matchTerms: ["Sue Storm", "Invisible Woman"],
  }),
  c("heros", {
    id: "human-torch", name: "La Torche humaine", civilName: "Johnny Storm", firstAppearance: { ...fa("The Fantastic Four #1", 1961), mcuProductionId: "fantastic-four-first-steps" },
    continuities: ["mcu", "fox-ff", "comics"], portrayals: [{ person: "Joseph Quinn", continuity: "mcu", note: "Terre-828" }],
    abilities: ["Contrôle du feu", "Vol"], affiliations: ["fantastic-four-team"], matchTerms: ["Johnny Storm", "Human Torch"],
  }),
  c("heros", {
    id: "the-thing", name: "La Chose", civilName: "Ben Grimm", firstAppearance: { ...fa("The Fantastic Four #1", 1961), mcuProductionId: "fantastic-four-first-steps" },
    continuities: ["mcu", "fox-ff", "comics"], portrayals: [{ person: "Ebon Moss-Bachrach", continuity: "mcu", note: "Terre-828" }],
    abilities: ["Force surhumaine", "Peau minérale"], affiliations: ["fantastic-four-team"], matchTerms: ["Ben Grimm", "The Thing"],
  }),
  c("heros", {
    id: "blade", name: "Blade", civilName: "Eric Brooks", firstAppearance: fa("The Tomb of Dracula #10", 1973), continuities: ["legacy-film", "comics", "mcu"],
    portrayals: [{ person: "Wesley Snipes", continuity: "legacy-film", note: "Trilogie Blade (1998-2004)" }],
    description: "Un film Blade pour le MCU est en développement depuis 2019 ; aucune date n'est confirmée.", matchTerms: ["Blade"],
  }),
  c("secondaire", {
    id: "war-machine", name: "War Machine", civilName: "James « Rhodey » Rhodes", firstAppearance: { ...fa("Iron Man #118", 1979), mcuProductionId: "iron-man" },
    portrayals: [{ person: "Terrence Howard", continuity: "mcu", note: "Iron Man (2008)" }, { person: "Don Cheadle", continuity: "mcu", note: "Depuis Iron Man 2" }],
    affiliations: ["avengers-team"], allies: ["iron-man"], matchTerms: ["War Machine", "James Rhodes", "Rhodey"],
  }),
  c("secondaire", {
    id: "pepper-potts", name: "Pepper Potts", civilName: "Virginia Potts", aliases: ["Rescue"], firstAppearance: { ...fa("Tales of Suspense #45", 1963), mcuProductionId: "iron-man" },
    portrayals: [{ person: "Gwyneth Paltrow", continuity: "mcu" }], affiliations: ["stark-industries"], relations: [{ characterId: "iron-man", nature: "Époux" }], matchTerms: ["Pepper Potts"],
  }),
  c("secondaire", {
    id: "nick-fury", name: "Nick Fury", firstAppearance: { ...fa("Sgt. Fury and his Howling Commandos #1", 1963), mcuProductionId: "iron-man" },
    portrayals: [{ person: "Samuel L. Jackson", continuity: "mcu" }], affiliations: ["shield"], allies: ["captain-marvel", "talos"], matchTerms: ["Nick Fury"],
  }),
  c("secondaire", {
    id: "phil-coulson", name: "Phil Coulson", firstAppearance: { mcuProductionId: "iron-man" }, continuities: ["mcu", "marvel-television", "comics"],
    portrayals: [{ person: "Clark Gregg", continuity: "mcu" }, { person: "Clark Gregg", continuity: "marvel-television", note: "Agents of S.H.I.E.L.D." }],
    affiliations: ["shield"], description: "Personnage créé pour le MCU, intégré ensuite aux comics.", matchTerms: ["Phil Coulson", "Coulson"],
  }),
  c("secondaire", {
    id: "peggy-carter", name: "Peggy Carter", firstAppearance: { ...fa("Tales of Suspense #75", 1966), mcuProductionId: "captain-america-first-avenger" },
    continuities: ["mcu", "marvel-television", "comics"], portrayals: [{ person: "Hayley Atwell", continuity: "mcu" }, { person: "Hayley Atwell", continuity: "marvel-television", note: "Agent Carter" }],
    affiliations: ["shield"], relations: [{ characterId: "captain-america", nature: "Amour de Steve Rogers" }], matchTerms: ["Peggy Carter", "Agent Carter"],
  }),
  c("secondaire", {
    id: "jane-foster", name: "Jane Foster", aliases: ["La Puissante Thor"], firstAppearance: { ...fa("Journey into Mystery #84", 1962), mcuProductionId: "thor" },
    portrayals: [{ person: "Natalie Portman", continuity: "mcu" }], relations: [{ characterId: "thor", nature: "Compagne" }], matchTerms: ["Jane Foster"],
  }),
  c("secondaire", {
    id: "odin", name: "Odin", firstAppearance: { ...fa("Journey into Mystery #86", 1962), mcuProductionId: "thor" },
    portrayals: [{ person: "Anthony Hopkins", continuity: "mcu" }], relations: [{ characterId: "thor", nature: "Fils" }, { characterId: "loki", nature: "Fils adoptif" }, { characterId: "hela", nature: "Fille" }],
    matchTerms: ["Odin"],
  }),
  c("heros", {
    id: "valkyrie", name: "Valkyrie", firstAppearance: { ...fa("The Avengers #83", 1970), mcuProductionId: "thor-ragnarok" },
    portrayals: [{ person: "Tessa Thompson", continuity: "mcu" }], allies: ["thor"], matchTerms: ["Valkyrie"],
  }),
  c("secondaire", {
    id: "wong", name: "Wong", firstAppearance: { ...fa("Strange Tales #110", 1963), mcuProductionId: "doctor-strange" },
    portrayals: [{ person: "Benedict Wong", continuity: "mcu" }], affiliations: ["masters-of-mystic-arts"], allies: ["doctor-strange"], matchTerms: ["Wong"],
  }),
  c("secondaire", {
    id: "talos", name: "Talos", firstAppearance: { mcuProductionId: "captain-marvel" }, portrayals: [{ person: "Ben Mendelsohn", continuity: "mcu" }],
    allies: ["nick-fury", "captain-marvel"], description: "Skrull, allié de Nick Fury.", matchTerms: ["Talos", "Skrull"],
  }),
  c("secondaire", {
    id: "the-watcher", name: "Le Gardien", civilName: "Uatu", aliases: ["The Watcher"], firstAppearance: { ...fa("The Fantastic Four #13", 1963), mcuProductionId: "what-if" },
    portrayals: [{ person: "Jeffrey Wright", continuity: "mcu", note: "Voix (What If...?)" }], matchTerms: ["Uatu", "The Watcher"],
  }),
  c("anti-heros", {
    id: "agatha-harkness", name: "Agatha Harkness", firstAppearance: { ...fa("Fantastic Four #94", 1970), mcuProductionId: "wandavision" },
    portrayals: [{ person: "Kathryn Hahn", continuity: "mcu" }], enemies: ["scarlet-witch"], matchTerms: ["Agatha Harkness", "Agatha"],
  }),
  c("anti-heros", {
    id: "loki", name: "Loki", civilName: "Loki Laufeyson", aliases: ["Dieu de la Malice"],
    firstAppearance: { ...fa("Journey into Mystery #85", 1962), mcuProductionId: "thor" },
    portrayals: [{ person: "Tom Hiddleston", continuity: "mcu" }], abilities: ["Magie et illusions", "Métamorphose"],
    relations: [{ characterId: "thor", nature: "Frère adoptif" }, { characterId: "odin", nature: "Père adoptif" }],
    affiliations: ["tva"], matchTerms: ["Loki"],
  }),

  /* ───── Vilains ───── */
  c("vilain", {
    id: "thanos", name: "Thanos", aliases: ["Le Titan fou"], firstAppearance: { ...fa("The Invincible Iron Man #55", 1973), mcuProductionId: "avengers" },
    portrayals: [{ person: "Josh Brolin", continuity: "mcu", note: "Capture de performance (depuis 2015 ; Damion Poitier dans la scène post-générique d'Avengers)" }],
    abilities: ["Force colossale", "Gant de l'Infini"], enemies: ["iron-man", "thor", "captain-america"],
    relations: [{ characterId: "gamora", nature: "Fille adoptive" }, { characterId: "nebula", nature: "Fille adoptive" }],
    matchTerms: ["Thanos"],
  }),
  c("vilain", {
    id: "ultron", name: "Ultron", firstAppearance: { ...fa("The Avengers #55", 1968), mcuProductionId: "avengers-age-of-ultron" },
    portrayals: [{ person: "James Spader", continuity: "mcu" }], enemies: ["iron-man", "vision"], matchTerms: ["Ultron"],
  }),
  c("vilain", {
    id: "red-skull", name: "Crâne Rouge", civilName: "Johann Schmidt", aliases: ["Red Skull"], firstAppearance: { ...fa("Captain America Comics #7", 1941), mcuProductionId: "captain-america-first-avenger" },
    portrayals: [{ person: "Hugo Weaving", continuity: "mcu", note: "First Avenger" }, { person: "Ross Marquand", continuity: "mcu", note: "Infinity War, Endgame" }],
    affiliations: ["hydra"], enemies: ["captain-america"], matchTerms: ["Red Skull", "Crâne Rouge"],
  }),
  c("vilain", {
    id: "hela", name: "Hela", firstAppearance: { ...fa("Journey into Mystery #102", 1964), mcuProductionId: "thor-ragnarok" },
    portrayals: [{ person: "Cate Blanchett", continuity: "mcu" }], relations: [{ characterId: "thor", nature: "Frère cadet" }, { characterId: "odin", nature: "Père" }], matchTerms: ["Hela"],
  }),
  c("vilain", {
    id: "killmonger", name: "Erik Killmonger", civilName: "N'Jadaka", firstAppearance: { ...fa("Jungle Action #6", 1973), mcuProductionId: "black-panther" },
    portrayals: [{ person: "Michael B. Jordan", continuity: "mcu" }], enemies: ["black-panther"], matchTerms: ["Killmonger"],
  }),
  c("vilain", {
    id: "zemo", name: "Baron Zemo", civilName: "Helmut Zemo", firstAppearance: { ...fa("Captain America #168", 1973), mcuProductionId: "captain-america-civil-war" },
    portrayals: [{ person: "Daniel Brühl", continuity: "mcu" }], enemies: ["captain-america"], matchTerms: ["Zemo"],
  }),
  c("vilain", {
    id: "abomination", name: "Abomination", civilName: "Emil Blonsky", firstAppearance: { ...fa("Tales to Astonish #90", 1967), mcuProductionId: "incredible-hulk" },
    portrayals: [{ person: "Tim Roth", continuity: "mcu" }], enemies: ["hulk"], matchTerms: ["Abomination", "Emil Blonsky"],
  }),
  c("vilain", {
    id: "thaddeus-ross", name: "Thaddeus Ross", aliases: ["Hulk rouge", "Thunderbolt Ross"], firstAppearance: { ...fa("The Incredible Hulk #1", 1962), mcuProductionId: "incredible-hulk" },
    portrayals: [{ person: "William Hurt", continuity: "mcu", note: "2008-2021, décédé en 2022" }, { person: "Harrison Ford", continuity: "mcu", note: "Depuis Brave New World (2025)" }],
    enemies: ["hulk"], matchTerms: ["Thaddeus Ross", "Red Hulk", "Hulk rouge"],
  }),
  c("vilain", {
    id: "kang", name: "Kang le Conquérant", aliases: ["Celui qui demeure", "He Who Remains"], firstAppearance: { ...fa("The Avengers #8", 1964), mcuProductionId: "loki" },
    portrayals: [{ person: "Jonathan Majors", continuity: "mcu", note: "Loki, Quantumania ; Marvel Studios s'est séparé de l'acteur en décembre 2023" }],
    enemies: ["ant-man", "loki"], matchTerms: ["Kang", "He Who Remains"],
  }),
  c("vilain", {
    id: "doctor-doom", name: "Docteur Fatalis", civilName: "Victor von Fatalis (Victor von Doom)", aliases: ["Doctor Doom"],
    firstAppearance: { ...fa("The Fantastic Four #5", 1962), mcuProductionId: "avengers-doomsday" },
    continuities: ["mcu", "fox-ff", "comics"],
    portrayals: [{ person: "Robert Downey Jr.", continuity: "mcu", note: "Annoncé pour Avengers: Doomsday" }],
    enemies: ["mister-fantastic"], matchTerms: ["Doctor Doom", "Docteur Fatalis", "Victor von Doom"],
  }),
  c("vilain", {
    id: "galactus", name: "Galactus", firstAppearance: { ...fa("The Fantastic Four #48", 1966), mcuProductionId: "fantastic-four-first-steps" },
    continuities: ["mcu", "fox-ff", "comics"], portrayals: [{ person: "Ralph Ineson", continuity: "mcu" }],
    relations: [{ characterId: "silver-surfer", nature: "Héraut" }], matchTerms: ["Galactus"],
  }),
  c("anti-heros", {
    id: "silver-surfer", name: "Le Surfer d'argent", aliases: ["Silver Surfer"], firstAppearance: { ...fa("The Fantastic Four #48", 1966), mcuProductionId: "fantastic-four-first-steps" },
    continuities: ["mcu", "fox-ff", "comics"],
    portrayals: [{ person: "Julia Garner", continuity: "mcu", note: "Shalla-Bal (Terre-828)" }],
    description: "Dans les comics, Norrin Radd est le Surfer d'argent historique ; le MCU a confié le rôle à Shalla-Bal.",
    relations: [{ characterId: "galactus", nature: "Maître" }], matchTerms: ["Silver Surfer", "Surfer d'argent"],
  }),
  c("anti-heros", {
    id: "namor", name: "Namor", firstAppearance: { ...fa("Motion Picture Funnies Weekly #1", 1939), mcuProductionId: "black-panther-wakanda-forever" },
    portrayals: [{ person: "Tenoch Huerta Mejía", continuity: "mcu" }], matchTerms: ["Namor", "Talokan"],
  }),
  c("vilain", {
    id: "kingpin", name: "Le Caïd", civilName: "Wilson Fisk", aliases: ["Kingpin"], firstAppearance: { ...fa("The Amazing Spider-Man #50", 1967), mcuProductionId: "hawkeye" },
    continuities: ["mcu", "marvel-television", "comics"],
    portrayals: [{ person: "Vincent D'Onofrio", continuity: "marvel-television" }, { person: "Vincent D'Onofrio", continuity: "mcu" }],
    enemies: ["daredevil", "echo"], matchTerms: ["Kingpin", "Wilson Fisk"],
  }),
  c("vilain", {
    id: "green-goblin", name: "Le Bouffon vert", civilName: "Norman Osborn", aliases: ["Green Goblin"], firstAppearance: fa("The Amazing Spider-Man #14", 1964),
    continuities: ["sony-spider-man", "mcu", "comics"],
    portrayals: [{ person: "Willem Dafoe", continuity: "sony-spider-man" }, { person: "Willem Dafoe", continuity: "mcu", note: "Via le multivers dans No Way Home" }],
    enemies: ["spider-man"], matchTerms: ["Green Goblin", "Norman Osborn", "Bouffon vert"],
  }),
  c("anti-heros", {
    id: "venom", name: "Venom", civilName: "Eddie Brock", firstAppearance: fa("The Amazing Spider-Man #300", 1988), continuities: ["sony-ssu", "sony-spider-man", "comics", "games"],
    portrayals: [{ person: "Tom Hardy", continuity: "sony-ssu" }, { person: "Topher Grace", continuity: "sony-spider-man", note: "Spider-Man 3" }],
    enemies: ["spider-man"], matchTerms: ["Venom", "Eddie Brock"],
  }),

  /* ───── Équipes et organisations ───── */
  c("equipe", {
    id: "avengers-team", name: "Avengers", continuities: ["mcu", "comics", "animation", "games"],
    firstAppearance: { ...fa("The Avengers #1", 1963), mcuProductionId: "avengers" },
    description: "Équipe de super-héros fondée pour affronter les menaces qu'aucun héros ne peut combattre seul.",
    matchTerms: ["Avengers"],
  }),
  c("equipe", {
    id: "guardians-team", name: "Les Gardiens de la Galaxie", firstAppearance: { mcuProductionId: "guardians-of-the-galaxy" }, matchTerms: ["Guardians of the Galaxy", "Gardiens de la Galaxie"],
  }),
  c("equipe", {
    id: "x-men-team", name: "X-Men", continuities: ["fox-xmen", "animation", "comics", "mcu"], firstAppearance: fa("The X-Men #1", 1963),
    description: "Mutants réunis par Charles Xavier. Leur intégration au MCU est annoncée par Marvel Studios (reboot en développement).",
    matchTerms: ["X-Men", "mutant", "mutants"],
  }),
  c("equipe", {
    id: "fantastic-four-team", name: "Les Quatre Fantastiques", continuities: ["mcu", "fox-ff", "comics"],
    firstAppearance: { ...fa("The Fantastic Four #1", 1961), mcuProductionId: "fantastic-four-first-steps" }, matchTerms: ["Fantastic Four", "4 Fantastiques", "Quatre Fantastiques"],
  }),
  c("equipe", {
    id: "thunderbolts-team", name: "Thunderbolts", firstAppearance: { ...fa("The Incredible Hulk #449", 1997), mcuProductionId: "thunderbolts" }, matchTerms: ["Thunderbolts"],
  }),
  c("equipe", {
    id: "defenders-team", name: "The Defenders", continuities: ["marvel-television", "comics"], matchTerms: ["Defenders"],
  }),
  c("organisation", {
    id: "shield", name: "S.H.I.E.L.D.", continuities: ["mcu", "marvel-television", "comics"], firstAppearance: { ...fa("Strange Tales #135", 1965), mcuProductionId: "iron-man" },
    description: "Agence de renseignement et de maintien de la paix dirigée par Nick Fury.", matchTerms: ["S.H.I.E.L.D.", "SHIELD"],
  }),
  c("organisation", {
    id: "hydra", name: "HYDRA", continuities: ["mcu", "marvel-television", "comics"], firstAppearance: { mcuProductionId: "captain-america-first-avenger" },
    description: "Organisation née comme division scientifique nazie, infiltrée dans le S.H.I.E.L.D. dans le MCU.", matchTerms: ["HYDRA"],
  }),
  c("organisation", {
    id: "tva", name: "Tribunal des Variations Anachroniques (TVA)", continuities: ["mcu", "comics"], firstAppearance: { mcuProductionId: "loki" },
    description: "Organisation hors du temps chargée de préserver la chronologie.", matchTerms: ["TVA", "Time Variance Authority"],
  }),
  c("organisation", { id: "stark-industries", name: "Stark Industries", firstAppearance: { mcuProductionId: "iron-man" }, matchTerms: ["Stark Industries"] }),
  c("organisation", { id: "wakanda", name: "Wakanda", description: "Nation africaine technologiquement avancée grâce au vibranium.", firstAppearance: { mcuProductionId: "captain-america-civil-war" }, matchTerms: ["Wakanda"] }),
  c("organisation", { id: "masters-of-mystic-arts", name: "Maîtres des arts mystiques", firstAppearance: { mcuProductionId: "doctor-strange" }, matchTerms: ["Kamar-Taj"] }),
];
