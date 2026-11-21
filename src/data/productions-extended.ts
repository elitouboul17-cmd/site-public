import type { ContinuityId, Production, ProductionKind } from "@/lib/types";

/**
 * Univers Marvel étendu : productions HORS continuité MCU (ou de canonicité discutée).
 * Chaque production porte sa propre `continuity` : elles ne sont jamais fusionnées avec le MCU.
 */

type E = Omit<Production, "dateCertainty" | "status"> & Partial<Pick<Production, "dateCertainty" | "status">>;
const x = (p: E): Production => ({ dateCertainty: "officielle", status: "sorti", ...p });

const film = (
  id: string,
  title: string,
  originalTitle: string,
  continuity: ContinuityId,
  releaseDate: string | undefined,
  directors: string[],
  extra: Partial<Production> = {},
  kind: ProductionKind = "film",
) =>
  x({
    id,
    title,
    originalTitle,
    continuity,
    kind,
    releaseDate,
    directors,
    dateCertainty: releaseDate ? "officielle" : "inconnue",
    ...extra,
  });

const wiki = (en: string, fr?: string) => ({ wikipedia: { en, fr } });

export const EXTENDED_PRODUCTIONS: Production[] = [
  /* ───── Marvel Television (ABC, Netflix, Hulu, Freeform) ───── */
  x({
    id: "agents-of-shield", title: "Marvel : Les Agents du S.H.I.E.L.D.", originalTitle: "Agents of S.H.I.E.L.D.",
    kind: "serie", continuity: "marvel-television", releaseDate: "2013-09-24", endDate: "2020-08-12", seasons: 7,
    platform: "ABC", studios: ["Marvel Television", "ABC Studios"],
    synopsis: "L'agent Phil Coulson dirige une équipe du S.H.I.E.L.D. chargée des affaires impliquant l'inexpliqué.",
    cast: [["Clark Gregg", "Phil Coulson", "phil-coulson"], ["Ming-Na Wen", "Melinda May"], ["Chloe Bennet", "Daisy Johnson / Quake"]],
    ...wiki("Agents_of_S.H.I.E.L.D.", "Marvel_:_Les_Agents_du_SHIELD"),
    tags: ["Canonicité MCU discutée"],
  }),
  x({
    id: "agent-carter", title: "Agent Carter", originalTitle: "Agent Carter", kind: "serie", continuity: "marvel-television",
    releaseDate: "2015-01-06", endDate: "2016-03-01", seasons: 2, platform: "ABC", studios: ["Marvel Television", "ABC Studios"],
    synopsis: "En 1946, Peggy Carter travaille pour la Strategic Scientific Reserve tout en aidant secrètement Howard Stark.",
    cast: [["Hayley Atwell", "Peggy Carter", "peggy-carter"], ["James D'Arcy", "Edwin Jarvis"]],
    ...wiki("Agent_Carter_(TV_series)", "Agent_Carter"),
  }),
  x({
    id: "daredevil-netflix", title: "Marvel's Daredevil", originalTitle: "Daredevil", kind: "serie", continuity: "marvel-television",
    releaseDate: "2015-04-10", endDate: "2018-10-19", seasons: 3, platform: "Netflix", studios: ["Marvel Television", "ABC Studios"],
    synopsis: "À Hell's Kitchen, l'avocat aveugle Matt Murdock combat le crime la nuit.",
    writers: ["Drew Goddard"],
    cast: [["Charlie Cox", "Matt Murdock / Daredevil", "daredevil"], ["Vincent D'Onofrio", "Wilson Fisk", "kingpin"], ["Deborah Ann Woll", "Karen Page"], ["Jon Bernthal", "Frank Castle (saison 2)", "punisher"]],
    ...wiki("Daredevil_(TV_series)", "Daredevil_(série_télévisée)"),
  }),
  x({
    id: "jessica-jones", title: "Marvel's Jessica Jones", originalTitle: "Jessica Jones", kind: "serie", continuity: "marvel-television",
    releaseDate: "2015-11-20", endDate: "2019-06-14", seasons: 3, platform: "Netflix", studios: ["Marvel Television", "ABC Studios"],
    synopsis: "Ancienne super-héroïne devenue détective privée à New York, Jessica Jones affronte son passé.",
    writers: ["Melissa Rosenberg"],
    cast: [["Krysten Ritter", "Jessica Jones"], ["David Tennant", "Kilgrave"], ["Mike Colter", "Luke Cage", "luke-cage"]],
    ...wiki("Jessica_Jones_(TV_series)", "Jessica_Jones_(série_télévisée)"),
  }),
  x({
    id: "luke-cage", title: "Marvel's Luke Cage", originalTitle: "Luke Cage", kind: "serie", continuity: "marvel-television",
    releaseDate: "2016-09-30", endDate: "2018-06-22", seasons: 2, platform: "Netflix", studios: ["Marvel Television", "ABC Studios"],
    synopsis: "Doté d'une peau impénétrable, Luke Cage protège le quartier de Harlem.",
    writers: ["Cheo Hodari Coker"],
    cast: [["Mike Colter", "Luke Cage", "luke-cage"], ["Mahershala Ali", "Cornell « Cottonmouth » Stokes"]],
    ...wiki("Luke_Cage_(TV_series)", "Luke_Cage_(série_télévisée)"),
  }),
  x({
    id: "iron-fist", title: "Marvel's Iron Fist", originalTitle: "Iron Fist", kind: "serie", continuity: "marvel-television",
    releaseDate: "2017-03-17", endDate: "2018-09-07", seasons: 2, platform: "Netflix", studios: ["Marvel Television", "ABC Studios"],
    synopsis: "Danny Rand revient à New York après des années de disparition, maître des arts martiaux et du poing d'acier.",
    cast: [["Finn Jones", "Danny Rand / Iron Fist"]],
    ...wiki("Iron_Fist_(TV_series)", "Iron_Fist_(série_télévisée)"),
  }),
  x({
    id: "the-defenders", title: "Marvel's The Defenders", originalTitle: "The Defenders", kind: "serie", continuity: "marvel-television",
    releaseDate: "2017-08-18", seasons: 1, episodes: 8, platform: "Netflix", studios: ["Marvel Television", "ABC Studios"],
    synopsis: "Daredevil, Jessica Jones, Luke Cage et Iron Fist s'unissent contre l'organisation de la Main.",
    cast: [["Charlie Cox", "Matt Murdock", "daredevil"], ["Krysten Ritter", "Jessica Jones"], ["Mike Colter", "Luke Cage", "luke-cage"], ["Finn Jones", "Danny Rand"], ["Sigourney Weaver", "Alexandra Reid"]],
    ...wiki("The_Defenders_(miniseries)", "The_Defenders_(mini-série,_2017)"),
  }),
  x({
    id: "the-punisher-netflix", title: "Marvel's The Punisher", originalTitle: "The Punisher", kind: "serie", continuity: "marvel-television",
    releaseDate: "2017-11-17", endDate: "2019-01-18", seasons: 2, platform: "Netflix", studios: ["Marvel Television", "ABC Studios"],
    synopsis: "Frank Castle, ancien Marine, mène une guerre implacable contre ceux qui ont tué sa famille.",
    cast: [["Jon Bernthal", "Frank Castle / le Punisher", "punisher"]],
    ...wiki("The_Punisher_(TV_series)", "The_Punisher_(série_télévisée)"),
  }),
  x({
    id: "inhumans", title: "Marvel's Inhumans", originalTitle: "Inhumans", kind: "serie", continuity: "marvel-television",
    releaseDate: "2017-09-29", seasons: 1, episodes: 8, platform: "ABC", studios: ["Marvel Television", "ABC Studios", "IMAX"],
    synopsis: "La famille royale des Inhumains, chassée de la cité lunaire d'Attilan, se réfugie à Hawaï.",
    ...wiki("Inhumans_(TV_series)", "Inhumans_(série_télévisée)"),
  }),
  x({
    id: "runaways", title: "Marvel's Runaways", originalTitle: "Runaways", kind: "serie", continuity: "marvel-television",
    releaseDate: "2017-11-21", endDate: "2019-12-13", seasons: 3, platform: "Hulu", studios: ["Marvel Television", "ABC Signature Studios"],
    synopsis: "Six adolescents découvrent que leurs parents dirigent une organisation criminelle.",
    writers: ["Josh Schwartz", "Stephanie Savage"],
    ...wiki("Runaways_(TV_series)", "Runaways_(série_télévisée)"),
  }),
  x({
    id: "cloak-and-dagger", title: "Marvel's Cloak & Dagger", originalTitle: "Cloak & Dagger", kind: "serie", continuity: "marvel-television",
    releaseDate: "2018-06-07", endDate: "2019-05-30", seasons: 2, platform: "Freeform", studios: ["Marvel Television", "ABC Signature Studios"],
    synopsis: "À La Nouvelle-Orléans, deux adolescents aux pouvoirs complémentaires se découvrent liés.",
    ...wiki("Cloak_&_Dagger_(TV_series)", "Cloak_and_Dagger_(série_télévisée)"),
  }),

  /* ───── Fox : X-Men ───── */
  film("x-men-2000", "X-Men", "X-Men", "fox-xmen", "2000-07-14", ["Bryan Singer"], {
    studios: ["20th Century Fox"],
    synopsis: "Le professeur Charles Xavier et ses élèves mutants s'opposent à Magneto et à sa Confrérie.",
    cast: [["Hugh Jackman", "Logan / Wolverine", "wolverine"], ["Patrick Stewart", "Charles Xavier", "professor-x"], ["Ian McKellen", "Erik Lehnsherr / Magneto", "magneto"], ["Halle Berry", "Ororo Munroe / Tornade", "storm"], ["Famke Janssen", "Jean Grey", "jean-grey"]],
    composers: ["Michael Kamen"],
    ...wiki("X-Men_(film)", "X-Men_(film)"),
  }),
  film("x2", "X-Men 2", "X2", "fox-xmen", "2003-05-02", ["Bryan Singer"], {
    studios: ["20th Century Fox"], composers: ["John Ottman"],
    cast: [["Hugh Jackman", "Logan / Wolverine", "wolverine"], ["Patrick Stewart", "Charles Xavier", "professor-x"], ["Ian McKellen", "Magneto", "magneto"]],
    ...wiki("X2_(film)", "X-Men_2"),
  }),
  film("x-men-last-stand", "X-Men : L'Affrontement final", "X-Men: The Last Stand", "fox-xmen", "2006-05-26", ["Brett Ratner"], {
    studios: ["20th Century Fox"], composers: ["John Powell"], ...wiki("X-Men:_The_Last_Stand", "X-Men_:_L'Affrontement_final"),
  }),
  film("x-men-origins-wolverine", "X-Men Origins : Wolverine", "X-Men Origins: Wolverine", "fox-xmen", "2009-05-01", ["Gavin Hood"], {
    studios: ["20th Century Fox"], composers: ["Harry Gregson-Williams"],
    cast: [["Hugh Jackman", "Logan / Wolverine", "wolverine"], ["Ryan Reynolds", "Wade Wilson", "deadpool"]],
    ...wiki("X-Men_Origins:_Wolverine", "X-Men_Origins:_Wolverine"),
  }),
  film("x-men-first-class", "X-Men : Le Commencement", "X-Men: First Class", "fox-xmen", "2011-06-03", ["Matthew Vaughn"], {
    studios: ["20th Century Fox"], composers: ["Henry Jackman"],
    cast: [["James McAvoy", "Charles Xavier", "professor-x"], ["Michael Fassbender", "Erik Lehnsherr / Magneto", "magneto"], ["Jennifer Lawrence", "Raven Darkhölme / Mystique"]],
    ...wiki("X-Men:_First_Class", "X-Men_:_Le_Commencement"),
  }),
  film("the-wolverine", "Wolverine : Le Combat de l'immortel", "The Wolverine", "fox-xmen", "2013-07-26", ["James Mangold"], {
    studios: ["20th Century Fox"], composers: ["Marco Beltrami"], ...wiki("The_Wolverine_(film)", "Wolverine_:_Le_Combat_de_l'immortel"),
  }),
  film("x-men-days-of-future-past", "X-Men: Days of Future Past", "X-Men: Days of Future Past", "fox-xmen", "2014-05-23", ["Bryan Singer"], {
    studios: ["20th Century Fox"], composers: ["John Ottman"], ...wiki("X-Men:_Days_of_Future_Past", "X-Men:_Days_of_Future_Past"),
  }),
  film("deadpool", "Deadpool", "Deadpool", "fox-xmen", "2016-02-12", ["Tim Miller"], {
    studios: ["20th Century Fox"], composers: ["Tom Holkenborg"], writers: ["Rhett Reese", "Paul Wernick"],
    cast: [["Ryan Reynolds", "Wade Wilson / Deadpool", "deadpool"]],
    ...wiki("Deadpool_(film)", "Deadpool_(film)"),
  }),
  film("x-men-apocalypse", "X-Men : Apocalypse", "X-Men: Apocalypse", "fox-xmen", "2016-05-27", ["Bryan Singer"], {
    studios: ["20th Century Fox"], composers: ["John Ottman"], ...wiki("X-Men:_Apocalypse", "X-Men:_Apocalypse"),
  }),
  film("logan", "Logan", "Logan", "fox-xmen", "2017-03-03", ["James Mangold"], {
    studios: ["20th Century Fox"], composers: ["Marco Beltrami"],
    cast: [["Hugh Jackman", "Logan / Wolverine", "wolverine"], ["Patrick Stewart", "Charles Xavier", "professor-x"], ["Dafne Keen", "Laura / X-23"]],
    ...wiki("Logan_(film)", "Logan_(film)"),
  }),
  film("deadpool-2", "Deadpool 2", "Deadpool 2", "fox-xmen", "2018-05-18", ["David Leitch"], {
    studios: ["20th Century Fox"], composers: ["Tyler Bates"], cast: [["Ryan Reynolds", "Wade Wilson / Deadpool", "deadpool"], ["Josh Brolin", "Cable"]],
    ...wiki("Deadpool_2", "Deadpool_2"),
  }),
  film("dark-phoenix", "X-Men : Dark Phoenix", "Dark Phoenix", "fox-xmen", "2019-06-07", ["Simon Kinberg"], {
    studios: ["20th Century Fox"], composers: ["Hans Zimmer"], ...wiki("Dark_Phoenix_(film)", "X-Men:_Dark_Phoenix"),
  }),
  film("the-new-mutants", "Les Nouveaux Mutants", "The New Mutants", "fox-xmen", "2020-08-28", ["Josh Boone"], {
    studios: ["20th Century Studios"], ...wiki("The_New_Mutants_(film)", "Les_Nouveaux_Mutants_(film)"),
  }),

  /* ───── Fox : Fantastic Four & autres ───── */
  film("fantastic-four-2005", "Les 4 Fantastiques", "Fantastic Four", "fox-ff", "2005-07-08", ["Tim Story"], {
    studios: ["20th Century Fox"], ...wiki("Fantastic_Four_(2005_film)", "Les_Quatre_Fantastiques_(film,_2005)"),
  }),
  film("fantastic-four-silver-surfer", "Les 4 Fantastiques et le Surfer d'argent", "Fantastic Four: Rise of the Silver Surfer", "fox-ff", "2007-06-15", ["Tim Story"], {
    studios: ["20th Century Fox"], ...wiki("Fantastic_Four:_Rise_of_the_Silver_Surfer", "Les_Quatre_Fantastiques_et_le_Surfer_d'argent"),
  }),
  film("fant4stic", "Les 4 Fantastiques (2015)", "Fantastic Four", "fox-ff", "2015-08-07", ["Josh Trank"], {
    studios: ["20th Century Fox"], ...wiki("Fantastic_Four_(2015_film)", "Les_4_Fantastiques_(film,_2015)"),
  }),
  film("daredevil-2003", "Daredevil", "Daredevil", "legacy-film", "2003-02-14", ["Mark Steven Johnson"], {
    studios: ["20th Century Fox", "Regency Enterprises"], cast: [["Ben Affleck", "Matt Murdock / Daredevil", "daredevil"]],
    ...wiki("Daredevil_(film)", "Daredevil_(film)"),
  }),

  /* ───── Sony : Spider-Man (avant l'accord avec Marvel Studios) ───── */
  film("spider-man-2002", "Spider-Man", "Spider-Man", "sony-spider-man", "2002-05-03", ["Sam Raimi"], {
    studios: ["Columbia Pictures", "Marvel Enterprises"], composers: ["Danny Elfman"],
    cast: [["Tobey Maguire", "Peter Parker / Spider-Man", "spider-man"], ["Willem Dafoe", "Norman Osborn / le Bouffon vert", "green-goblin"], ["Kirsten Dunst", "Mary Jane Watson"]],
    ...wiki("Spider-Man_(2002_film)", "Spider-Man_(film)"),
  }),
  film("spider-man-2", "Spider-Man 2", "Spider-Man 2", "sony-spider-man", "2004-06-30", ["Sam Raimi"], {
    studios: ["Columbia Pictures", "Marvel Enterprises"], composers: ["Danny Elfman"],
    cast: [["Tobey Maguire", "Peter Parker / Spider-Man", "spider-man"], ["Alfred Molina", "Otto Octavius / Docteur Octopus"]],
    ...wiki("Spider-Man_2", "Spider-Man_2"),
  }),
  film("spider-man-3", "Spider-Man 3", "Spider-Man 3", "sony-spider-man", "2007-05-04", ["Sam Raimi"], {
    studios: ["Columbia Pictures", "Marvel Studios"], composers: ["Christopher Young"], ...wiki("Spider-Man_3", "Spider-Man_3"),
  }),
  film("amazing-spider-man", "The Amazing Spider-Man", "The Amazing Spider-Man", "sony-spider-man", "2012-07-03", ["Marc Webb"], {
    studios: ["Columbia Pictures", "Marvel Entertainment"], composers: ["James Horner"],
    cast: [["Andrew Garfield", "Peter Parker / Spider-Man", "spider-man"], ["Emma Stone", "Gwen Stacy"], ["Rhys Ifans", "Curt Connors / le Lézard"]],
    ...wiki("The_Amazing_Spider-Man_(2012_film)", "The_Amazing_Spider-Man_(film)"),
  }),
  film("amazing-spider-man-2", "The Amazing Spider-Man : Le Destin d'un héros", "The Amazing Spider-Man 2", "sony-spider-man", "2014-05-02", ["Marc Webb"], {
    studios: ["Columbia Pictures", "Marvel Entertainment"], composers: ["Hans Zimmer"], ...wiki("The_Amazing_Spider-Man_2", "The_Amazing_Spider-Man_:_Le_Destin_d'un_héros"),
  }),

  /* ───── Sony's Spider-Man Universe ───── */
  film("venom", "Venom", "Venom", "sony-ssu", "2018-10-05", ["Ruben Fleischer"], {
    studios: ["Columbia Pictures", "Marvel Entertainment"], composers: ["Ludwig Göransson"], cast: [["Tom Hardy", "Eddie Brock / Venom", "venom"]],
    ...wiki("Venom_(2018_film)", "Venom_(film,_2018)"),
  }),
  film("venom-let-there-be-carnage", "Venom : Let There Be Carnage", "Venom: Let There Be Carnage", "sony-ssu", "2021-10-01", ["Andy Serkis"], {
    studios: ["Columbia Pictures", "Marvel Entertainment"], cast: [["Tom Hardy", "Eddie Brock / Venom", "venom"], ["Woody Harrelson", "Cletus Kasady / Carnage"]],
    ...wiki("Venom:_Let_There_Be_Carnage", "Venom:_Let_There_Be_Carnage"),
  }),
  film("morbius", "Morbius", "Morbius", "sony-ssu", "2022-04-01", ["Daniel Espinosa"], {
    studios: ["Columbia Pictures", "Marvel Entertainment"], cast: [["Jared Leto", "Michael Morbius"]], ...wiki("Morbius_(film)", "Morbius_(film)"),
  }),
  film("madame-web", "Madame Web", "Madame Web", "sony-ssu", "2024-02-14", ["S. J. Clarkson"], {
    studios: ["Columbia Pictures", "Marvel Entertainment"], ...wiki("Madame_Web_(film)", "Madame_Web_(film)"),
  }),
  film("venom-the-last-dance", "Venom : The Last Dance", "Venom: The Last Dance", "sony-ssu", "2024-10-25", ["Kelly Marcel"], {
    studios: ["Columbia Pictures", "Marvel Entertainment"], cast: [["Tom Hardy", "Eddie Brock / Venom", "venom"]], ...wiki("Venom:_The_Last_Dance", "Venom:_The_Last_Dance"),
  }),
  film("kraven-the-hunter", "Kraven the Hunter", "Kraven the Hunter", "sony-ssu", "2024-12-13", ["J. C. Chandor"], {
    studios: ["Columbia Pictures", "Marvel Entertainment"], cast: [["Aaron Taylor-Johnson", "Sergei Kravinoff / Kraven"]], ...wiki("Kraven_the_Hunter_(film)", "Kraven_the_Hunter_(film)"),
  }),

  /* ───── Spider-Verse (animation Sony) ───── */
  film("into-the-spider-verse", "Spider-Man : New Generation", "Spider-Man: Into the Spider-Verse", "spider-verse", "2018-12-14", ["Bob Persichetti", "Peter Ramsey", "Rodney Rothman"], {
    studios: ["Sony Pictures Animation", "Columbia Pictures"], composers: ["Daniel Pemberton"], writers: ["Phil Lord", "Rodney Rothman"],
    cast: [["Shameik Moore", "Miles Morales (voix)", "miles-morales"], ["Jake Johnson", "Peter B. Parker (voix)", "spider-man"], ["Hailee Steinfeld", "Gwen Stacy (voix)"]],
    synopsis: "L'adolescent Miles Morales devient Spider-Man et rencontre d'autres Spider-héros venus d'univers parallèles.",
    ...wiki("Spider-Man:_Into_the_Spider-Verse", "Spider-Man:_New_Generation"),
  }, "film-anime"),
  film("across-the-spider-verse", "Spider-Man : Across the Spider-Verse", "Spider-Man: Across the Spider-Verse", "spider-verse", "2023-06-02", ["Joaquim Dos Santos", "Kemp Powers", "Justin K. Thompson"], {
    studios: ["Sony Pictures Animation", "Columbia Pictures"], composers: ["Daniel Pemberton"], writers: ["Phil Lord", "Christopher Miller", "David Callaham"],
    cast: [["Shameik Moore", "Miles Morales (voix)", "miles-morales"], ["Oscar Isaac", "Miguel O'Hara / Spider-Man 2099 (voix)"]],
    ...wiki("Spider-Man:_Across_the_Spider-Verse", "Spider-Man:_Across_the_Spider-Verse"),
  }, "film-anime"),
  film("beyond-the-spider-verse", "Spider-Man : Beyond the Spider-Verse", "Spider-Man: Beyond the Spider-Verse", "spider-verse", "2027-06-18", [], {
    status: "annonce", studios: ["Sony Pictures Animation"], ...wiki("Spider-Man:_Beyond_the_Spider-Verse", "Spider-Man:_Beyond_the_Spider-Verse"),
  }, "film-anime"),

  /* ───── Anciens films Marvel ───── */
  film("howard-the-duck", "Howard… une nouvelle race de héros", "Howard the Duck", "legacy-film", "1986-08-01", ["Willard Huyck"], {
    studios: ["Lucasfilm", "Universal Pictures"], ...wiki("Howard_the_Duck_(film)", "Howard..._une_nouvelle_race_de_héros"),
  }),
  film("blade-1998", "Blade", "Blade", "legacy-film", "1998-08-21", ["Stephen Norrington"], {
    studios: ["New Line Cinema", "Marvel Enterprises"], cast: [["Wesley Snipes", "Eric Brooks / Blade", "blade"]], writers: ["David S. Goyer"],
    synopsis: "Mi-homme mi-vampire, Blade traque les vampires qui contrôlent secrètement la ville.",
    ...wiki("Blade_(1998_film)", "Blade_(film,_1998)"),
  }),
  film("blade-2", "Blade II", "Blade II", "legacy-film", "2002-03-22", ["Guillermo del Toro"], {
    studios: ["New Line Cinema", "Marvel Enterprises"], cast: [["Wesley Snipes", "Blade", "blade"]], ...wiki("Blade_II", "Blade_2"),
  }),
  film("blade-trinity", "Blade: Trinity", "Blade: Trinity", "legacy-film", "2004-12-08", ["David S. Goyer"], {
    studios: ["New Line Cinema", "Marvel Enterprises"], cast: [["Wesley Snipes", "Blade", "blade"]], ...wiki("Blade:_Trinity", "Blade:_Trinity"),
  }),
  film("hulk-2003", "Hulk", "Hulk", "legacy-film", "2003-06-20", ["Ang Lee"], {
    studios: ["Universal Pictures", "Marvel Enterprises"], composers: ["Danny Elfman"], cast: [["Eric Bana", "Bruce Banner", "hulk"]],
    ...wiki("Hulk_(film)", "Hulk_(film)"),
  }),
  film("ghost-rider", "Ghost Rider", "Ghost Rider", "legacy-film", "2007-02-16", ["Mark Steven Johnson"], {
    studios: ["Columbia Pictures", "Marvel Studios"], cast: [["Nicolas Cage", "Johnny Blaze / Ghost Rider"]], ...wiki("Ghost_Rider_(2007_film)", "Ghost_Rider_(film)"),
  }),

  /* ───── Séries animées (hors MCU) ───── */
  x({
    id: "x-men-animated-series", title: "X-Men (série animée)", originalTitle: "X-Men: The Animated Series", kind: "serie-animee",
    continuity: "animation", releaseDate: "1992-10-31", endDate: "1997-09-20", seasons: 5, platform: "Fox Kids",
    synopsis: "Les X-Men de Charles Xavier protègent un monde qui les craint et les rejette.",
    ...wiki("X-Men:_The_Animated_Series", "X-Men_(série_télévisée_d'animation)"),
  }),
  x({
    id: "spider-man-animated-1994", title: "Spider-Man, l'homme-araignée", originalTitle: "Spider-Man: The Animated Series", kind: "serie-animee",
    continuity: "animation", releaseDate: "1994-11-19", endDate: "1998-01-31", seasons: 5, platform: "Fox Kids",
    ...wiki("Spider-Man:_The_Animated_Series", "Spider-Man,_l'homme-araignée"),
  }),
  x({
    id: "spectacular-spider-man", title: "Spectacular Spider-Man", originalTitle: "The Spectacular Spider-Man", kind: "serie-animee",
    continuity: "animation", releaseDate: "2008-03-08", endDate: "2009-11-18", seasons: 2,
    ...wiki("The_Spectacular_Spider-Man_(TV_series)", "Spectacular_Spider-Man_(série_télévisée_d'animation)"),
  }),
  x({
    id: "avengers-emh", title: "Avengers : L'Équipe des super-héros", originalTitle: "The Avengers: Earth's Mightiest Heroes", kind: "serie-animee",
    continuity: "animation", releaseDate: "2010-09-22", endDate: "2012-11-11", seasons: 2,
    ...wiki("The_Avengers:_Earth's_Mightiest_Heroes", "Avengers_:_L'Équipe_des_super-héros"),
  }),
  x({
    id: "x-men-97", title: "X-Men '97", originalTitle: "X-Men '97", kind: "serie-animee", continuity: "animation",
    releaseDate: "2024-03-20", seasons: 2, episodes: 19, platform: "Disney+", studios: ["Marvel Studios Animation"],
    synopsis: "Suite de la série animée de 1992, reprenant après la disparition de Charles Xavier.",
    composers: ["The Newton Brothers"],
    ...wiki("X-Men_'97", "X-Men_'97"),
    connections: [{ productionId: "x-men-animated-series", nature: "Suite directe (même continuité animée)." }],
    tags: ["Produit par Marvel Studios, hors continuité MCU"],
  }),

  /* ───── Jeux vidéo ───── */
  film("marvels-spider-man-2018", "Marvel's Spider-Man", "Marvel's Spider-Man", "games", "2018-09-07", [], {
    studios: ["Insomniac Games", "Sony Interactive Entertainment"], platform: "PlayStation 4",
    synopsis: "Jeu d'action en monde ouvert : un Peter Parker expérimenté protège New York.",
    ...wiki("Spider-Man_(2018_video_game)", "Marvel's_Spider-Man"),
  }, "jeu-video"),
  film("marvels-spider-man-miles-morales", "Marvel's Spider-Man: Miles Morales", "Marvel's Spider-Man: Miles Morales", "games", "2020-11-12", [], {
    studios: ["Insomniac Games", "Sony Interactive Entertainment"], platform: "PlayStation 4 / PlayStation 5",
    ...wiki("Spider-Man:_Miles_Morales", "Marvel's_Spider-Man:_Miles_Morales"),
  }, "jeu-video"),
  film("marvels-spider-man-2", "Marvel's Spider-Man 2", "Marvel's Spider-Man 2", "games", "2023-10-20", [], {
    studios: ["Insomniac Games", "Sony Interactive Entertainment"], platform: "PlayStation 5",
    ...wiki("Spider-Man_2_(2023_video_game)", "Marvel's_Spider-Man_2"),
  }, "jeu-video"),
  film("marvels-avengers-game", "Marvel's Avengers", "Marvel's Avengers", "games", "2020-09-04", [], {
    studios: ["Crystal Dynamics", "Square Enix"], ...wiki("Marvel's_Avengers_(video_game)", "Marvel's_Avengers_(jeu_vidéo)"),
  }, "jeu-video"),
  film("marvels-guardians-game", "Marvel's Guardians of the Galaxy", "Marvel's Guardians of the Galaxy", "games", "2021-10-26", [], {
    studios: ["Eidos-Montréal", "Square Enix"], ...wiki("Guardians_of_the_Galaxy_(video_game)", "Les_Gardiens_de_la_Galaxie_(jeu_vidéo)"),
  }, "jeu-video"),
  film("marvels-midnight-suns", "Marvel's Midnight Suns", "Marvel's Midnight Suns", "games", "2022-12-02", [], {
    studios: ["Firaxis Games", "2K"], ...wiki("Marvel's_Midnight_Suns", "Marvel's_Midnight_Suns"),
  }, "jeu-video"),
  film("marvel-rivals", "Marvel Rivals", "Marvel Rivals", "games", "2024-12-06", [], {
    studios: ["NetEase Games"], synopsis: "Jeu de tir en équipe (hero shooter) gratuit, en ligne.", ...wiki("Marvel_Rivals", "Marvel_Rivals"),
  }, "jeu-video"),
  film("marvel-ultimate-alliance-3", "Marvel Ultimate Alliance 3: The Black Order", "Marvel Ultimate Alliance 3: The Black Order", "games", "2019-07-19", [], {
    studios: ["Team Ninja", "Nintendo"], platform: "Nintendo Switch", ...wiki("Marvel_Ultimate_Alliance_3:_The_Black_Order", "Marvel_Ultimate_Alliance_3:_The_Black_Order"),
  }, "jeu-video"),
  film("marvels-wolverine", "Marvel's Wolverine", "Marvel's Wolverine", "games", "2026-09-15", [], {
    studios: ["Insomniac Games", "Sony Interactive Entertainment"], platform: "PlayStation 5",
    ...wiki("Marvel's_Wolverine", "Marvel's_Wolverine"),
  }, "jeu-video"),

  /* ───── Comics fondateurs (dates de couverture) ───── */
  film("captain-america-comics-1", "Captain America Comics #1", "Captain America Comics #1", "comics", "1941-03", [], {
    studios: ["Timely Comics"], writers: ["Joe Simon", "Jack Kirby"], characters: ["captain-america", "winter-soldier"],
    synopsis: "Première apparition de Captain America et de Bucky, créés par Joe Simon et Jack Kirby.",
    ...wiki("Captain_America_Comics"),
  }, "comic"),
  film("fantastic-four-1", "Fantastic Four #1", "The Fantastic Four #1", "comics", "1961-11", [], {
    studios: ["Marvel Comics"], writers: ["Stan Lee", "Jack Kirby"], characters: ["mister-fantastic", "invisible-woman", "human-torch", "the-thing"],
    synopsis: "Naissance des Quatre Fantastiques et point de départ de l'« âge Marvel » des comics.",
    ...wiki("The_Fantastic_Four_(comic_book)"),
  }, "comic"),
  film("amazing-fantasy-15", "Amazing Fantasy #15", "Amazing Fantasy #15", "comics", "1962-08", [], {
    studios: ["Marvel Comics"], writers: ["Stan Lee", "Steve Ditko"], characters: ["spider-man"],
    synopsis: "Première apparition de Spider-Man.",
    ...wiki("Amazing_Fantasy", "Amazing_Fantasy"),
  }, "comic"),
  film("avengers-1-1963", "The Avengers #1", "The Avengers #1", "comics", "1963-09", [], {
    studios: ["Marvel Comics"], writers: ["Stan Lee", "Jack Kirby"], characters: ["iron-man", "thor", "hulk", "ant-man", "wasp", "loki"],
    synopsis: "Formation des Avengers face à Loki.",
    ...wiki("The_Avengers_(comic_book)"),
  }, "comic"),
  film("x-men-1-1963", "The X-Men #1", "The X-Men #1", "comics", "1963-09", [], {
    studios: ["Marvel Comics"], writers: ["Stan Lee", "Jack Kirby"], characters: ["professor-x", "magneto", "jean-grey"],
    synopsis: "Première apparition des X-Men et de Magneto.",
    ...wiki("X-Men_(comic_book)"),
  }, "comic"),
  film("infinity-gauntlet", "The Infinity Gauntlet", "The Infinity Gauntlet", "comics", "1991-07", [], {
    studios: ["Marvel Comics"], writers: ["Jim Starlin"], characters: ["thanos"],
    synopsis: "Mini-série en six numéros où Thanos réunit les Gemmes de l'Infini. Source d'inspiration d'Infinity War et Endgame.",
    ...wiki("The_Infinity_Gauntlet", "Le_Gant_de_l'Infini"),
    connections: [{ productionId: "avengers-infinity-war", nature: "Inspiration revendiquée de l'arc de Thanos." }],
  }, "comic"),
  film("civil-war-comic", "Civil War", "Civil War", "comics", "2006-07", [], {
    studios: ["Marvel Comics"], writers: ["Mark Millar"], characters: ["iron-man", "captain-america"],
    synopsis: "Crossover sur la loi de recensement des surhumains qui divise les héros.",
    ...wiki("Civil_War_(comics)", "Civil_War_(comics)"),
    connections: [{ productionId: "captain-america-civil-war", nature: "Adaptation libre (Accords de Sokovie au lieu de la loi de recensement)." }],
  }, "comic"),
  film("secret-wars-1984", "Secret Wars (1984)", "Marvel Super Heroes Secret Wars", "comics", "1984-05", [], {
    studios: ["Marvel Comics"], writers: ["Jim Shooter"], characters: ["doctor-doom"],
    synopsis: "Le Beyonder enlève héros et vilains sur le Battleworld.",
    ...wiki("Secret_Wars", "Les_Guerres_secrètes"),
  }, "comic"),
];
