import type { ContinuityId } from "@/lib/types";

/**
 * Identité visuelle de chaque production : 3 couleurs [principale, secondaire, accent]
 * et une courte description de l'ambiance. Couleurs choisies d'après l'univers visuel
 * de chaque œuvre (costumes, décors, symboles) — aucune ressource officielle n'est reprise.
 */
export interface ProductionTheme {
  colors: [string, string, string];
  mood: string;
}

const t = (c1: string, c2: string, c3: string, mood: string): ProductionTheme => ({ colors: [c1, c2, c3], mood });

export const PRODUCTION_THEMES: Record<string, ProductionTheme> = {
  /* ───── Phase 1 ───── */
  "iron-man": t("#b3121c", "#e3b341", "#7dd3fc", "Rouge et or de l'armure, bleu du réacteur ARK"),
  "incredible-hulk": t("#3f8f2f", "#6b3fa0", "#9ca3af", "Vert gamma et violet du pantalon déchiré"),
  "iron-man-2": t("#b3121c", "#e3b341", "#aeb7c2", "Rouge et or d'Iron Man, argent de War Machine"),
  thor: t("#a3172a", "#c9d1d9", "#d4a72c", "Cape écarlate, acier de Mjolnir, or d'Asgard"),
  "captain-america-first-avenger": t("#1f3a8a", "#f1f5f9", "#c8102e", "Bleu, blanc et rouge du bouclier"),
  avengers: t("#2563eb", "#c8102e", "#d4a72c", "Bleu du Tesseract, rouge et or de l'équipe"),

  /* ───── Phase 2 ───── */
  "iron-man-3": t("#b3121c", "#e3b341", "#f97316", "Rouge et or, flammes d'Extremis"),
  "thor-the-dark-world": t("#7f1d1d", "#dc2626", "#57534e", "Rouge sombre de l'Éther, ténèbres de Svartalfheim"),
  "captain-america-winter-soldier": t("#1e3a8a", "#94a3b8", "#c8102e", "Bleu furtif, acier du bras bionique, rouge du Soldat"),
  "guardians-of-the-galaxy": t("#f97316", "#db2777", "#14b8a6", "Orange, magenta et turquoise rétro de la cassette"),
  "avengers-age-of-ultron": t("#cbd5e1", "#ef4444", "#2563eb", "Argent d'Ultron, rouge de ses yeux, bleu de la Pierre"),
  "ant-man": t("#dc2626", "#9ca3af", "#111827", "Rouge et argent du costume, noir du micro-monde"),

  /* ───── Phase 3 ───── */
  "captain-america-civil-war": t("#1d4ed8", "#f1f5f9", "#b91c1c", "Bleu contre rouge : l'équipe divisée"),
  "doctor-strange": t("#f59e0b", "#0d9488", "#4f46e5", "Mandalas dorés, vert de l'Œil d'Agamotto, indigo mystique"),
  "guardians-of-the-galaxy-vol-2": t("#ec4899", "#fbbf24", "#22d3ee", "Rose et or d'Ego, néons cosmiques"),
  "spider-man-homecoming": t("#dc2626", "#1d4ed8", "#111827", "Rouge et bleu du costume, nuit new-yorkaise"),
  "thor-ragnarok": t("#a855f7", "#2dd4bf", "#f97316", "Néons violet, turquoise et orange de Sakaar"),
  "black-panther": t("#7c3aed", "#d4a017", "#111827", "Violet du vibranium, or royal, noir de la Panthère"),
  "avengers-infinity-war": t("#6d28d9", "#d4a017", "#b91c1c", "Violet de Thanos, or du Gant de l'Infini"),
  "ant-man-and-the-wasp": t("#dc2626", "#facc15", "#111827", "Rouge d'Ant-Man, jaune de la Guêpe"),
  "captain-marvel": t("#dc2626", "#1e3a8a", "#fbbf24", "Rouge, bleu et or de l'étoile de Carol Danvers"),
  "avengers-endgame": t("#b91c1c", "#f8fafc", "#d4a017", "Rouge et blanc des combinaisons quantiques, or du Gant"),
  "spider-man-far-from-home": t("#dc2626", "#111827", "#22c55e", "Rouge et noir du costume furtif, vert des illusions de Mysterio"),

  /* ───── Phase 4 ───── */
  wandavision: t("#dc2626", "#0ea5e9", "#facc15", "Rouge chaos de Wanda, couleurs pastel des sitcoms"),
  "falcon-and-the-winter-soldier": t("#1e40af", "#94a3b8", "#c8102e", "Bleu, acier et rouge de l'héritage du bouclier"),
  loki: t("#166534", "#d4af37", "#b45309", "Vert de Loki, or asgardien, orange du TVA"),
  "black-widow": t("#1c1917", "#b91c1c", "#e7e5e4", "Noir de l'espionne, rouge du sablier"),
  "what-if": t("#f59e0b", "#0f766e", "#7c3aed", "Or et turquoise cosmiques du Gardien"),
  "shang-chi": t("#b91c1c", "#d4a017", "#0f766e", "Rouge et or, jade de Ta Lo"),
  eternals: t("#d4a017", "#0369a1", "#f97316", "Or des Célestes, bleu de l'éternité, lever de soleil"),
  hawkeye: t("#7e22ce", "#111827", "#e2e8f0", "Violet de Hawkeye, nuits enneigées de New York"),
  "spider-man-no-way-home": t("#dc2626", "#d4a017", "#2563eb", "Rouge et or du costume intégré, bleu du multivers"),
  "moon-knight": t("#e2e8f0", "#ca8a04", "#1e3a8a", "Blanc lunaire, or égyptien, bleu nuit"),
  "doctor-strange-multiverse-of-madness": t("#b91c1c", "#f59e0b", "#7c3aed", "Rouge de la Sorcière, magie orange, violet du multivers"),
  "ms-marvel": t("#dc2626", "#2563eb", "#facc15", "Rouge, bleu et éclair jaune de Kamala"),
  "thor-love-and-thunder": t("#db2777", "#d4a017", "#38bdf8", "Rose glam, or d'Omnipotence City, ciel électrique"),
  "i-am-groot": t("#92400e", "#65a30d", "#fbbf24", "Écorce, feuillage et soleil"),
  "she-hulk": t("#22c55e", "#9333ea", "#f1f5f9", "Vert et violet de She-Hulk, blanc du tribunal"),
  "werewolf-by-night": t("#e5e7eb", "#1f2937", "#991b1b", "Noir et blanc des films de monstres, sang rouge"),
  "black-panther-wakanda-forever": t("#e5e7eb", "#0e7490", "#7c3aed", "Blanc du deuil, bleu de Talokan, violet du vibranium"),
  "guardians-holiday-special": t("#b91c1c", "#15803d", "#fbbf24", "Rouge et vert de Noël, guirlandes dorées"),

  /* ───── Phase 5 ───── */
  "ant-man-quantumania": t("#c026d3", "#22d3ee", "#dc2626", "Magenta et cyan du royaume quantique"),
  "guardians-of-the-galaxy-vol-3": t("#ea580c", "#7c3aed", "#0ea5e9", "Orange, violet et bleu de la dernière mission"),
  "secret-invasion": t("#4d7c0f", "#3f3f46", "#a3e635", "Vert Skrull et gris de l'espionnage"),
  "the-marvels": t("#7c3aed", "#f59e0b", "#dc2626", "Violet cosmique, or et rouge des trois héroïnes"),
  echo: t("#b91c1c", "#111827", "#0d9488", "Rouge et noir, turquoise de l'héritage choctaw"),
  "deadpool-and-wolverine": t("#b91c1c", "#facc15", "#1d4ed8", "Rouge de Deadpool, jaune et bleu de Wolverine"),
  "agatha-all-along": t("#6b21a8", "#16a34a", "#111827", "Violet d'Agatha, vert de la Route des sorcières"),
  "your-friendly-neighborhood-spider-man": t("#dc2626", "#2563eb", "#facc15", "Couleurs franches de bande dessinée"),
  "captain-america-brave-new-world": t("#1e40af", "#e2e8f0", "#dc2626", "Bleu et blanc du nouveau Captain, rouge du Hulk rouge"),
  "daredevil-born-again": t("#991b1b", "#1c1917", "#f59e0b", "Rouge sang de Daredevil, noir de Hell's Kitchen"),
  thunderbolts: t("#52525b", "#d4d4d8", "#eab308", "Gris des anti-héros, éclair jaune"),
  ironheart: t("#dc2626", "#d4a017", "#7c3aed", "Rouge et or de l'armure, violet de la magie"),
  "eyes-of-wakanda": t("#d4a017", "#7c3aed", "#111827", "Or et violet du Wakanda"),
  "marvel-zombies": t("#65a30d", "#7f1d1d", "#6b7280", "Vert maladif, rouge sang, gris cendré"),

  /* ───── Phase 6 ───── */
  "fantastic-four-first-steps": t("#2563eb", "#f1f5f9", "#f97316", "Bleu et blanc rétro-futuristes, orange de la Chose"),
  "wonder-man": t("#b91c1c", "#d4a017", "#111827", "Rouge et or des projecteurs d'Hollywood"),
  "spider-man-brand-new-day": t("#dc2626", "#1d4ed8", "#e2e8f0", "Rouge et bleu d'un nouveau départ"),
  "avengers-doomsday": t("#166534", "#9ca3af", "#22c55e", "Vert de Fatalis et métal de son armure"),
  "avengers-secret-wars": t("#7c3aed", "#d4a017", "#dc2626", "Violet multiversel, or et rouge des Avengers"),
  visionquest: t("#be123c", "#15803d", "#facc15", "Rouge, vert et jaune de Vision"),

  /* ───── Marvel Television ───── */
  "agents-of-shield": t("#1e3a8a", "#94a3b8", "#e2e8f0", "Bleu et argent du S.H.I.E.L.D."),
  "agent-carter": t("#b91c1c", "#1e3a8a", "#d4a017", "Rouge à lèvres et chapeau, années 1940"),
  "daredevil-netflix": t("#7f1d1d", "#1c1917", "#dc2626", "Rouge sombre et noir de Hell's Kitchen"),
  "jessica-jones": t("#6d28d9", "#111827", "#a1a1aa", "Violet néo-noir"),
  "luke-cage": t("#eab308", "#111827", "#b45309", "Jaune et noir de Harlem"),
  "iron-fist": t("#15803d", "#d4a017", "#111827", "Vert et or du poing d'acier"),
  "the-defenders": t("#b91c1c", "#eab308", "#6d28d9", "Les couleurs des quatre héros réunis"),
  "the-punisher-netflix": t("#111827", "#e5e7eb", "#7f1d1d", "Noir et blanc du crâne"),
  inhumans: t("#1e3a8a", "#d4a017", "#9ca3af", "Bleu et or d'Attilan"),
  runaways: t("#c026d3", "#0ea5e9", "#facc15", "Couleurs vives de Los Angeles"),
  "cloak-and-dagger": t("#1e3a8a", "#f8fafc", "#111827", "Ombre et lumière"),

  /* ───── Fox ───── */
  "x-men-2000": t("#1e3a8a", "#facc15", "#111827", "Bleu et jaune des X-Men, cuir noir"),
  x2: t("#1e3a8a", "#94a3b8", "#facc15", "Bleu glacé, acier et jaune"),
  "x-men-last-stand": t("#b91c1c", "#1e3a8a", "#f97316", "Rouge du Phénix"),
  "x-men-origins-wolverine": t("#facc15", "#92400e", "#9ca3af", "Jaune et brun de Wolverine, adamantium"),
  "x-men-first-class": t("#1e40af", "#facc15", "#e5e7eb", "Bleu et jaune des années 1960"),
  "the-wolverine": t("#b91c1c", "#f8fafc", "#111827", "Rouge et blanc du Japon"),
  "x-men-days-of-future-past": t("#4b5563", "#7c3aed", "#facc15", "Gris des Sentinelles, violet du futur"),
  deadpool: t("#b91c1c", "#111827", "#f8fafc", "Rouge et noir de Deadpool"),
  "x-men-apocalypse": t("#1e40af", "#d4a017", "#7c3aed", "Bleu et or d'Apocalypse"),
  logan: t("#a16207", "#57534e", "#9ca3af", "Sable du désert, griffes d'acier"),
  "deadpool-2": t("#b91c1c", "#facc15", "#111827", "Rouge de Deadpool, jaune de X-Force"),
  "dark-phoenix": t("#ea580c", "#b91c1c", "#facc15", "Flammes du Phénix"),
  "the-new-mutants": t("#0f766e", "#7f1d1d", "#a1a1aa", "Vert d'hôpital, rouge de l'ours démon"),
  "fantastic-four-2005": t("#1d4ed8", "#f1f5f9", "#f97316", "Bleu et blanc des 4 Fantastiques"),
  "fantastic-four-silver-surfer": t("#cbd5e1", "#1d4ed8", "#f97316", "Argent du Surfer, bleu des 4 Fantastiques"),
  fant4stic: t("#1e3a8a", "#475569", "#f97316", "Bleu sombre et gris"),
  "daredevil-2003": t("#7f1d1d", "#111827", "#dc2626", "Cuir rouge sombre"),

  /* ───── Sony ───── */
  "spider-man-2002": t("#dc2626", "#1d4ed8", "#16a34a", "Rouge et bleu, vert du Bouffon"),
  "spider-man-2": t("#dc2626", "#1d4ed8", "#a16207", "Rouge et bleu, bronze du Docteur Octopus"),
  "spider-man-3": t("#111827", "#dc2626", "#d6d3d1", "Costume noir du symbiote, sable de l'Homme-Sable"),
  "amazing-spider-man": t("#dc2626", "#1e3a8a", "#16a34a", "Rouge et bleu, vert du Lézard"),
  "amazing-spider-man-2": t("#dc2626", "#1e3a8a", "#38bdf8", "Rouge et bleu, électricité d'Electro"),
  venom: t("#111827", "#f8fafc", "#b91c1c", "Noir et blanc du symbiote"),
  "venom-let-there-be-carnage": t("#111827", "#b91c1c", "#f8fafc", "Noir de Venom, rouge de Carnage"),
  morbius: t("#1e3a8a", "#7f1d1d", "#111827", "Bleu nuit et rouge sang"),
  "madame-web": t("#b91c1c", "#d4a017", "#1e3a8a", "Rouge et or des toiles du destin"),
  "venom-the-last-dance": t("#111827", "#f8fafc", "#d4a017", "Noir et blanc, or du désert"),
  "kraven-the-hunter": t("#78350f", "#d4a017", "#15803d", "Fauve, or et vert de la jungle"),
  "into-the-spider-verse": t("#db2777", "#06b6d4", "#facc15", "Magenta, cyan et jaune de l'impression comics"),
  "across-the-spider-verse": t("#db2777", "#2563eb", "#f97316", "Aquarelles de Gwen, bleu de Miguel, orange de Mumbattan"),
  "beyond-the-spider-verse": t("#db2777", "#06b6d4", "#111827", "Magenta et cyan, noir du Spot"),

  /* ───── Anciens films ───── */
  "howard-the-duck": t("#2563eb", "#f8fafc", "#f97316", "Costume bleu et plumes blanches"),
  "blade-1998": t("#111827", "#b91c1c", "#9ca3af", "Noir, rouge sang et argent"),
  "blade-2": t("#111827", "#b91c1c", "#1e3a8a", "Noir, rouge sang et bleu nuit"),
  "blade-trinity": t("#111827", "#b91c1c", "#f97316", "Noir, rouge sang et orange"),
  "hulk-2003": t("#3f8f2f", "#a16207", "#6b3fa0", "Vert gamma, désert, violet"),
  "ghost-rider": t("#f97316", "#111827", "#facc15", "Flammes de l'enfer"),

  /* ───── Animation ───── */
  "x-men-animated-series": t("#facc15", "#1d4ed8", "#dc2626", "Jaune, bleu et rouge des années 1990"),
  "spider-man-animated-1994": t("#dc2626", "#1d4ed8", "#111827", "Rouge et bleu des années 1990"),
  "spectacular-spider-man": t("#dc2626", "#1d4ed8", "#facc15", "Rouge, bleu et jaune pop"),
  "avengers-emh": t("#1d4ed8", "#dc2626", "#facc15", "Couleurs primaires des Avengers"),
  "x-men-97": t("#facc15", "#1d4ed8", "#ec4899", "Jaune et bleu des X-Men, néons des années 1990"),

  /* ───── Jeux vidéo ───── */
  "marvels-spider-man-2018": t("#dc2626", "#f8fafc", "#1d4ed8", "Araignée blanche sur rouge"),
  "marvels-spider-man-miles-morales": t("#111827", "#dc2626", "#facc15", "Noir et rouge, éclairs bioélectriques"),
  "marvels-spider-man-2": t("#dc2626", "#111827", "#f8fafc", "Rouge de Peter, noir du symbiote"),
  "marvels-avengers-game": t("#1d4ed8", "#dc2626", "#94a3b8", "Couleurs des Avengers"),
  "marvels-guardians-game": t("#f97316", "#7c3aed", "#14b8a6", "Néons rétro des Gardiens"),
  "marvels-midnight-suns": t("#7c3aed", "#f97316", "#111827", "Violet mystique et flammes"),
  "marvel-rivals": t("#facc15", "#7c3aed", "#dc2626", "Jaune électrique et violet"),
  "marvel-ultimate-alliance-3": t("#1d4ed8", "#d4a017", "#7c3aed", "Bleu, or et violet de l'Ordre noir"),
  "marvels-wolverine": t("#facc15", "#1d4ed8", "#9ca3af", "Jaune, bleu et adamantium"),

  /* ───── Comics ───── */
  "captain-america-comics-1": t("#1f3a8a", "#f1f5f9", "#c8102e", "Bleu, blanc et rouge de 1941"),
  "fantastic-four-1": t("#2563eb", "#facc15", "#dc2626", "Couleurs primaires des débuts"),
  "amazing-fantasy-15": t("#dc2626", "#1d4ed8", "#facc15", "Rouge et bleu de 1962"),
  "avengers-1-1963": t("#16a34a", "#dc2626", "#facc15", "Vert de Hulk, rouge et or"),
  "x-men-1-1963": t("#facc15", "#1d4ed8", "#dc2626", "Jaune et bleu des premiers X-Men"),
  "infinity-gauntlet": t("#d4a017", "#6d28d9", "#16a34a", "Or du Gant et couleurs des Gemmes"),
  "civil-war-comic": t("#1d4ed8", "#dc2626", "#e5e7eb", "Bleu contre rouge"),
  "secret-wars-1984": t("#7c3aed", "#facc15", "#2563eb", "Couleurs vives du Battleworld"),
};

/** Repli par franchise pour une production sans identité dédiée. */
export const CONTINUITY_THEMES: Record<ContinuityId, ProductionTheme> = {
  mcu: t("#e62429", "#d4a017", "#7dd3fc", "Rouge et or du MCU"),
  "marvel-television": t("#1e3a8a", "#94a3b8", "#e62429", "Bleu et acier"),
  "fox-xmen": t("#1e3a8a", "#facc15", "#111827", "Bleu et jaune des X-Men"),
  "fox-ff": t("#1d4ed8", "#f1f5f9", "#f97316", "Bleu et blanc"),
  "sony-spider-man": t("#dc2626", "#1d4ed8", "#111827", "Rouge et bleu"),
  "sony-ssu": t("#111827", "#f8fafc", "#b91c1c", "Noir et blanc"),
  "spider-verse": t("#db2777", "#06b6d4", "#facc15", "Magenta et cyan"),
  "legacy-film": t("#7f1d1d", "#111827", "#9ca3af", "Rouge sombre"),
  animation: t("#facc15", "#1d4ed8", "#dc2626", "Couleurs primaires"),
  comics: t("#dc2626", "#facc15", "#1d4ed8", "Couleurs d'impression"),
  games: t("#7c3aed", "#22d3ee", "#facc15", "Néons"),
};
