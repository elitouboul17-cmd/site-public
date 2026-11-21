import type { BehindTheScenes, BtsCategory } from "@/lib/types";

const w = (title: string, label = "Wikipédia (EN)") => ({ label, url: `https://en.wikipedia.org/wiki/${title}` });

export const BTS_CATEGORIES: { id: BtsCategory; label: string; keywords: string[] }[] = [
  { id: "realisation", label: "Réalisation", keywords: ["director", "réalisateur", "réalisatrice", "directing"] },
  { id: "scenario", label: "Scénario", keywords: ["screenplay", "writer", "scénario", "script"] },
  { id: "direction-artistique", label: "Direction artistique", keywords: ["production design", "art director", "direction artistique"] },
  { id: "cinematographie", label: "Cinématographie", keywords: ["cinematographer", "cinematography", "directeur de la photographie"] },
  { id: "cameras-eclairage", label: "Caméras et éclairage", keywords: ["imax", "camera", "caméra", "lighting", "éclairage"] },
  { id: "montage", label: "Montage", keywords: ["editor", "editing", "montage", "monteur"] },
  { id: "effets-visuels", label: "Effets visuels", keywords: ["vfx", "visual effects", "effets visuels"] },
  { id: "cgi-compositing", label: "CGI et compositing", keywords: ["cgi", "compositing", "digital double"] },
  { id: "motion-capture", label: "Motion capture", keywords: ["motion capture", "performance capture", "mocap"] },
  { id: "musique", label: "Musique et composition", keywords: ["score", "composer", "compositeur", "soundtrack", "bande originale"] },
  { id: "design-sonore", label: "Design sonore", keywords: ["sound design", "sound editing", "mixage", "design sonore"] },
  { id: "costumes", label: "Costumes", keywords: ["costume", "suit design"] },
  { id: "decors", label: "Décors", keywords: ["set design", "décors", "production designer"] },
  { id: "cascades", label: "Cascades", keywords: ["stunt", "cascade", "fight choreograph"] },
  { id: "storyboards", label: "Storyboards", keywords: ["storyboard", "previs", "prévisualisation"] },
  { id: "concept-art", label: "Concept art", keywords: ["concept art", "visual development"] },
  { id: "making-of", label: "Making-of", keywords: ["behind the scenes", "making of", "making-of", "coulisses", "assembled"] },
  { id: "interviews", label: "Interviews", keywords: ["interview", "entretien"] },
  { id: "scenes-coupees", label: "Scènes coupées", keywords: ["deleted scene", "scène coupée", "scènes coupées", "cut scene"] },
];

/**
 * Fiches « Coulisses ». Seuls des faits de production documentés publiquement sont décrits,
 * avec la source consultable. Aucune citation n'est reproduite sans source directe.
 * Les nouveautés (interviews, featurettes, scènes coupées) arrivent via l'ingestion d'actualités,
 * classées par mots-clés de catégorie (voir BTS_CATEGORIES).
 */
export const BEHIND_THE_SCENES: BehindTheScenes[] = [
  {
    id: "thanos-capture", title: "Thanos : capture de performance et apprentissage automatique", category: "motion-capture",
    productionIds: ["avengers-infinity-war", "avengers-endgame"], personIds: ["Josh Brolin"],
    summary: "Josh Brolin a joué Thanos sur le plateau en capture de performance (corps et visage). Digital Domain et Weta Digital ont transposé son jeu sur le personnage numérique ; Digital Domain a notamment utilisé son système de capture faciale Masquerade, fondé sur l'apprentissage automatique.",
    sources: [w("Avengers:_Infinity_War"), w("Thanos_(Marvel_Cinematic_Universe)")],
  },
  {
    id: "infinity-war-imax", title: "Infinity War et Endgame, tournés en caméras numériques IMAX", category: "cameras-eclairage",
    productionIds: ["avengers-infinity-war", "avengers-endgame"], personIds: ["Trent Opaloch", "Anthony Russo", "Joe Russo"],
    summary: "Les deux films ont été tournés à la suite, avec des caméras ARRI Alexa IMAX 2D, ce qui en fait les premiers longs métrages hollywoodiens tournés intégralement avec des caméras numériques IMAX. Le chef opérateur est Trent Opaloch.",
    sources: [w("Avengers:_Infinity_War"), w("Avengers:_Endgame")],
  },
  {
    id: "quantumania-stagecraft", title: "Quantumania et le plateau virtuel StageCraft", category: "effets-visuels",
    productionIds: ["ant-man-quantumania"], personIds: ["Peyton Reed"],
    summary: "Le royaume quantique de Quantumania a été en grande partie filmé avec la technologie StageCraft d'Industrial Light & Magic : des murs d'écrans LED affichant les décors numériques en temps réel autour des acteurs.",
    sources: [w("Ant-Man_and_the_Wasp:_Quantumania")],
  },
  {
    id: "skinny-steve", title: "« Skinny Steve » : rétrécir Chris Evans", category: "cgi-compositing",
    productionIds: ["captain-america-first-avenger"], personIds: ["Chris Evans", "Joe Johnston"],
    summary: "Pour montrer Steve Rogers avant le sérum, le studio Lola Visual Effects a réduit numériquement la silhouette de Chris Evans, en s'appuyant sur le corps d'une doublure (Leander Deeny) pour certains plans.",
    sources: [w("Captain_America:_The_First_Avenger")],
  },
  {
    id: "hulk-ruffalo", title: "Mark Ruffalo, premier Hulk en capture de performance", category: "motion-capture",
    productionIds: ["avengers"], personIds: ["Mark Ruffalo", "Joss Whedon"],
    summary: "Pour Avengers (2012), Mark Ruffalo a interprété Hulk lui-même en capture de performance, ILM construisant le Hulk numérique à partir de son visage et de son jeu.",
    sources: [w("The_Avengers_(2012_film)"), w("Hulk_(Marvel_Cinematic_Universe)")],
  },
  {
    id: "black-panther-costumes", title: "Black Panther : costumes de Ruth E. Carter", category: "costumes",
    productionIds: ["black-panther"], personIds: ["Ruth E. Carter"],
    summary: "La costumière Ruth E. Carter a remporté l'Oscar de la meilleure création de costumes pour Black Panther, devenant la première personne afro-américaine récompensée dans cette catégorie.",
    sources: [w("Black_Panther_(film)"), w("Ruth_E._Carter")],
  },
  {
    id: "black-panther-decors", title: "Black Panther : concevoir le Wakanda", category: "decors",
    productionIds: ["black-panther"], personIds: ["Hannah Beachler"],
    summary: "La cheffe décoratrice Hannah Beachler a conçu le Wakanda et remporté, avec Jay Hart, l'Oscar des meilleurs décors : première personne afro-américaine récompensée dans cette catégorie.",
    sources: [w("Black_Panther_(film)"), w("Hannah_Beachler")],
  },
  {
    id: "black-panther-musique", title: "Black Panther : la partition de Ludwig Göransson", category: "musique",
    productionIds: ["black-panther", "black-panther-wakanda-forever"], personIds: ["Ludwig Göransson"],
    summary: "Ludwig Göransson a mené des recherches musicales en Afrique (notamment au Sénégal) pour composer la musique du film, récompensée par l'Oscar de la meilleure musique de film.",
    sources: [w("Black_Panther_(film_score)"), w("Ludwig_Göransson")],
  },
  {
    id: "ragnarok-improvisation", title: "Thor : Ragnarok, un tournage ouvert à l'improvisation", category: "realisation",
    productionIds: ["thor-ragnarok"], personIds: ["Taika Waititi"],
    summary: "Taika Waititi a encouragé l'improvisation des acteurs pendant le tournage ; le réalisateur a lui-même prêté sa voix et son jeu en capture de mouvement à Korg.",
    sources: [w("Thor:_Ragnarok")],
  },
  {
    id: "iron-man-improvisation", title: "Iron Man : un scénario réécrit sur le plateau", category: "scenario",
    productionIds: ["iron-man"], personIds: ["Jon Favreau", "Robert Downey Jr."],
    summary: "Le tournage d'Iron Man a commencé sans scénario définitif ; de nombreuses scènes ont été retravaillées ou improvisées par Jon Favreau et Robert Downey Jr. au fil du tournage.",
    sources: [w("Iron_Man_(2008_film)")],
  },
  {
    id: "wandavision-public", title: "WandaVision : un épisode tourné devant un public", category: "realisation",
    productionIds: ["wandavision"], personIds: ["Matt Shakman"],
    summary: "Le premier épisode, hommage aux sitcoms des années 1950, a été tourné en noir et blanc devant un public, à la manière des séries de l'époque. Matt Shakman a réalisé tous les épisodes.",
    sources: [w("WandaVision")],
  },
  {
    id: "werewolf-noir-blanc", title: "Werewolf by Night : l'hommage aux films d'horreur classiques", category: "cinematographie",
    productionIds: ["werewolf-by-night"], personIds: ["Michael Giacchino"],
    summary: "Michael Giacchino, compositeur de longue date du MCU, réalise ici sa première production. Elle est présentée presque entièrement en noir et blanc, en hommage aux films de monstres des années 1930-1940.",
    sources: [w("Werewolf_by_Night_(TV_special)")],
  },
  {
    id: "spider-verse-style", title: "Spider-Verse : animer comme une bande dessinée", category: "cgi-compositing",
    productionIds: ["into-the-spider-verse", "across-the-spider-verse"], personIds: ["Bob Persichetti", "Peter Ramsey", "Rodney Rothman"],
    summary: "Spider-Man : New Generation mélange animation 3D et techniques graphiques de la bande dessinée (trames de points, hachures, lignes de mouvement) et anime Miles par moments à une cadence réduite pour traduire son inexpérience. Le film a remporté l'Oscar du meilleur film d'animation.",
    sources: [w("Spider-Man:_Into_the_Spider-Verse")],
  },
  {
    id: "gotg-awesome-mix", title: "Les Gardiens : l'Awesome Mix au cœur du récit", category: "musique",
    productionIds: ["guardians-of-the-galaxy", "guardians-of-the-galaxy-vol-2", "guardians-of-the-galaxy-vol-3"], personIds: ["James Gunn", "Tyler Bates"],
    summary: "Les chansons de la cassette de Peter Quill sont intégrées à la narration. James Gunn faisait diffuser certains morceaux sur le plateau pendant les prises.",
    sources: [w("Guardians_of_the_Galaxy:_Awesome_Mix_Vol._1")],
  },
  {
    id: "rocket-sean-gunn", title: "Rocket : la référence de jeu de Sean Gunn", category: "motion-capture",
    productionIds: ["guardians-of-the-galaxy", "guardians-of-the-galaxy-vol-3"], personIds: ["Bradley Cooper"],
    summary: "Si Bradley Cooper prête sa voix à Rocket, Sean Gunn a joué le personnage sur le plateau comme référence physique pour les acteurs et les animateurs.",
    sources: [w("Rocket_Raccoon_(Marvel_Cinematic_Universe)")],
  },
  {
    id: "shang-chi-bus", title: "Shang-Chi : la séquence du bus", category: "cascades",
    productionIds: ["shang-chi"], personIds: ["Destin Daniel Cretton", "Simu Liu"],
    summary: "Les combats du film ont été conçus par l'équipe de Brad Allan (ancien membre de l'équipe de cascadeurs de Jackie Chan), coordinateur des cascades et réalisateur de seconde équipe. Simu Liu a effectué une grande partie de ses cascades. Le film est dédié à Brad Allan, décédé en 2021.",
    sources: [w("Shang-Chi_and_the_Legend_of_the_Ten_Rings"), w("Brad_Allan")],
  },
  {
    id: "meinerding-design", title: "Ryan Meinerding et le développement visuel de Marvel Studios", category: "concept-art",
    productionIds: ["iron-man", "captain-america-first-avenger", "avengers"], personIds: [],
    summary: "Ryan Meinerding, à la tête du développement visuel de Marvel Studios, a conçu de nombreuses apparences de personnages du MCU, dont les armures d'Iron Man et le costume de Captain America.",
    sources: [w("Ryan_Meinerding")],
  },
  {
    id: "winter-soldier-thriller", title: "Le Soldat de l'hiver : un thriller politique des années 1970", category: "realisation",
    productionIds: ["captain-america-winter-soldier"], personIds: ["Anthony Russo", "Joe Russo"],
    summary: "Les frères Russo ont cité les thrillers politiques des années 1970 comme modèle et privilégié les effets pratiques ; la présence de Robert Redford, figure de ce genre, prolonge cet hommage.",
    sources: [w("Captain_America:_The_Winter_Soldier")],
  },
  {
    id: "russo-montage", title: "Jeffrey Ford, monteur de la saga des Russo", category: "montage",
    productionIds: ["captain-america-winter-soldier", "captain-america-civil-war", "avengers-infinity-war", "avengers-endgame"], personIds: ["Jeffrey Ford"],
    summary: "Jeffrey Ford a monté Le Soldat de l'hiver, Civil War, Infinity War et Endgame (ces deux derniers avec Matthew Schmidt).",
    sources: [w("Jeffrey_Ford_(film_editor)")],
  },
  {
    id: "doctor-strange-vfx", title: "Doctor Strange : la dimension miroir", category: "effets-visuels",
    productionIds: ["doctor-strange"], personIds: ["Scott Derrickson"],
    summary: "Les effets kaléidoscopiques de la dimension miroir ont valu au film une nomination à l'Oscar des meilleurs effets visuels.",
    sources: [w("Doctor_Strange_(2016_film)")],
  },
  {
    id: "assembled", title: "Marvel Studios: Assembled, la série documentaire officielle", category: "making-of",
    productionIds: ["wandavision", "falcon-and-the-winter-soldier", "loki", "black-widow", "shang-chi"], personIds: [],
    summary: "Série documentaire de Disney+ consacrée au making-of des productions Marvel Studios, épisode par épisode. Source officielle à privilégier pour les coulisses.",
    sources: [w("Marvel_Studios:_Assembled")],
  },
  {
    id: "rachel-morrison", title: "Rachel Morrison, directrice de la photographie de Black Panther", category: "cinematographie",
    productionIds: ["black-panther"], personIds: ["Rachel Morrison"],
    summary: "Rachel Morrison, première femme nommée à l'Oscar de la meilleure photographie (pour Mudbound), a signé l'image de Black Panther.",
    sources: [w("Rachel_Morrison")],
  },
];
