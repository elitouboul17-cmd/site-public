/**
 * Musique : chansons emblématiques utilisées dans les productions.
 *
 * Les compositeurs des musiques originales viennent déjà des fiches de productions
 * (champ `composers`, vérifié contre Wikipédia). Ici ne figurent que des chansons dont
 * la présence dans l'œuvre est notoire et documentée (section « Music » / « Soundtrack »
 * de l'article Wikipédia de la production, lié sur chaque fiche).
 *
 * Aucun lien d'écoute n'est inventé : l'application génère des liens de RECHERCHE vers
 * Spotify, YouTube Music, Deezer et Apple Music (voir src/lib/music.ts), qui ne peuvent
 * pas pointer vers une mauvaise page.
 */
export interface FeaturedTrack {
  title: string;
  artist: string;
  /** Rôle dans l'œuvre : « Chanson originale », « Thème », « Chanson du film »… */
  role: string;
}

export const FEATURED_TRACKS: Record<string, FeaturedTrack[]> = {
  "iron-man": [{ title: "Back in Black", artist: "AC/DC", role: "Chanson du film" }],
  avengers: [{ title: "The Avengers", artist: "Alan Silvestri", role: "Thème de l'équipe" }],
  "guardians-of-the-galaxy": [
    { title: "Hooked on a Feeling", artist: "Blue Swede", role: "Awesome Mix Vol. 1" },
    { title: "Come and Get Your Love", artist: "Redbone", role: "Awesome Mix Vol. 1" },
    { title: "Ain't No Mountain High Enough", artist: "Marvin Gaye & Tammi Terrell", role: "Awesome Mix Vol. 1" },
  ],
  "guardians-of-the-galaxy-vol-2": [
    { title: "Mr. Blue Sky", artist: "Electric Light Orchestra", role: "Awesome Mix Vol. 2" },
    { title: "The Chain", artist: "Fleetwood Mac", role: "Awesome Mix Vol. 2" },
    { title: "Brandy (You're a Fine Girl)", artist: "Looking Glass", role: "Awesome Mix Vol. 2" },
  ],
  "guardians-of-the-galaxy-vol-3": [
    { title: "Do You Realize??", artist: "The Flaming Lips", role: "Awesome Mix Vol. 3" },
    { title: "Dog Days Are Over", artist: "Florence + The Machine", role: "Awesome Mix Vol. 3" },
  ],
  "thor-ragnarok": [{ title: "Immigrant Song", artist: "Led Zeppelin", role: "Chanson du film" }],
  "black-panther": [
    { title: "All the Stars", artist: "Kendrick Lamar & SZA", role: "Black Panther: The Album" },
    { title: "Wakanda", artist: "Ludwig Göransson", role: "Musique originale" },
  ],
  "black-panther-wakanda-forever": [{ title: "Lift Me Up", artist: "Rihanna", role: "Chanson originale" }],
  "captain-marvel": [{ title: "Just a Girl", artist: "No Doubt", role: "Chanson du film" }],
  "avengers-endgame": [{ title: "Portals", artist: "Alan Silvestri", role: "Musique originale" }],
  wandavision: [{ title: "Agatha All Along", artist: "Kristen Anderson-Lopez & Robert Lopez", role: "Chanson originale" }],
  "deadpool-and-wolverine": [{ title: "Bye Bye Bye", artist: "NSYNC", role: "Chanson du film" }],
  "into-the-spider-verse": [{ title: "Sunflower", artist: "Post Malone & Swae Lee", role: "Chanson du film" }],
};
