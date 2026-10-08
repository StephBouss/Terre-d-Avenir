import type { SeedAlbumPhotoKey } from './types'

export type AlbumPhotoSet = {
  /** Slug de l’album auquel appartiennent les photos. */
  albumSlug: string
  /** Dossier sous src/seed/images/albums/. */
  dir: string
  common: { credit: string; source: string; datePrise?: string; droitsConfirmes: boolean; droitsNote: string; provisoire: boolean; galerie: boolean }
  lieu: { fr: string; en: string }
  photos: { key: SeedAlbumPhotoKey; file: string; altFr: string; altEn: string }[]
}

export const ALBUM_PHOTO_SETS: AlbumPhotoSet[] = [
  {
    albumSlug: "kafele-nianame-2026-09",
    dir: "kafele-nianame",
    common: {
      credit: "Terre d’Avenir KOMO-KANGO",
      source: "Page Facebook de l’association (publication du 4 septembre 2026)",
      datePrise: "2026-09-04",
      droitsConfirmes: true,
      droitsNote: "Photos publiées par l’association sur sa page Facebook ; droits de diffusion confirmés par l’association le 6 octobre 2026.",
      provisoire: false,
      galerie: false,
    },
    lieu: { fr: "Kafélé et Nianame, Komo-Kango", en: "Kafélé and Nianame, Komo-Kango" },
    photos: [
      { key: "kafele-1", file: "photo-1.jpg", altFr: "Poignée de main lors de la remise d’un document, sous la tente de la cérémonie", altEn: "Handshake as a document is handed over under the ceremony tent" },
      { key: "kafele-2", file: "photo-2.jpg", altFr: "Les invités assis sous la tente pendant la cérémonie de réception des travaux", altEn: "Guests seated under the tent during the handover ceremony" },
      { key: "kafele-3", file: "photo-3.jpg", altFr: "Visite d’une salle du dispensaire réhabilité, en présence du personnel soignant", altEn: "Visit of a room in the rehabilitated health centre, with the medical staff" },
      { key: "kafele-4", file: "photo-4.jpg", altFr: "Photo de groupe des participants devant le bâtiment réhabilité", altEn: "Group photo of the participants in front of the rehabilitated building" },
      { key: "kafele-5", file: "photo-5.jpg", altFr: "Des élèves rassemblés en plein air, assis à leurs tables-bancs", altEn: "Pupils gathered outdoors, seated at their desks" },
      { key: "kafele-6", file: "photo-6.jpg", altFr: "Le bâtiment réhabilité, aux murs jaune et gris et au toit bleu", altEn: "The rehabilitated building, with yellow and grey walls and a blue roof" },
    ],
  },
  {
    albumSlug: "tournoi-football-2026-08",
    dir: "tournoi-football-2026-08",
    common: {
      credit: "Terre d’Avenir KOMO-KANGO",
      source: "Page Facebook de l’association (publication du 26 août 2026)",
      datePrise: "2026-08-26",
      droitsConfirmes: true,
      droitsNote: "Photos publiées par l’association sur sa page Facebook ; droits de diffusion confirmés par l’association le 7 octobre 2026.",
      provisoire: false,
      galerie: false,
    },
    lieu: { fr: "Komo-Kango", en: "Komo-Kango" },
    photos: [
      { key: "tournoi-1", file: "photo-1.jpg", altFr: "Joueurs, arbitres et invités alignés sur la pelouse avant la finale", altEn: "Players, referees and guests lined up on the pitch before the final" },
      { key: "tournoi-2", file: "photo-2.jpg", altFr: "Une invitée tient le ballon du match, entourée de joueurs et d’officiels", altEn: "A guest holds the match ball, surrounded by players and officials" },
      { key: "tournoi-3", file: "photo-3.jpg", altFr: "Coup d’envoi de la finale, devant les joueurs alignés et les tribunes", altEn: "Kick-off of the final, in front of the lined-up players and the stands" },
      { key: "tournoi-4", file: "photo-4.jpg", altFr: "Salut aux joueurs en maillot rose avant la rencontre", altEn: "Greeting the players in pink shirts before the match" },
      { key: "tournoi-5", file: "photo-5.jpg", altFr: "Photo de groupe de l’équipe en maillot bleu clair et des invités, sous la banderole du tournoi", altEn: "Group photo of the team in light blue and the guests, under the tournament banner" },
      { key: "tournoi-6", file: "photo-6.jpg", altFr: "Photo de groupe de l’équipe en maillot rose et des invités", altEn: "Group photo of the team in pink and the guests" },
    ],
  },
  {
    albumSlug: "rencontre-populations-2026-08",
    dir: "rencontre-populations-2026-08",
    common: {
      credit: "Terre d’Avenir KOMO-KANGO",
      source: "Page Facebook de l’association (publication du 19 août 2026)",
      datePrise: "2026-08-19",
      droitsConfirmes: true,
      droitsNote: "Photos publiées par l’association sur sa page Facebook ; droits de diffusion confirmés par l’association le 7 octobre 2026.",
      provisoire: false,
      galerie: false,
    },
    lieu: { fr: "Komo-Kango", en: "Komo-Kango" },
    photos: [
      { key: "rencontre-1", file: "photo-1.jpg", altFr: "Échange en plein air avec un groupe d’habitants et de responsables, devant un bâtiment", altEn: "Outdoor exchange with a group of residents and officials, in front of a building" },
      { key: "rencontre-2", file: "photo-2.jpg", altFr: "Poignée de main lors de l’accueil, dans une cour pavée", altEn: "Handshake on arrival, in a paved courtyard" },
      { key: "rencontre-3", file: "photo-3.jpg", altFr: "Une discussion animée avec des participants attentifs", altEn: "A lively discussion with attentive participants" },
      { key: "rencontre-4", file: "photo-4.jpg", altFr: "Moment d’écoute au sein d’un groupe de participants", altEn: "A moment of listening within a group of participants" },
      { key: "rencontre-5", file: "photo-5.jpg", altFr: "Une accolade chaleureuse entre deux participantes", altEn: "A warm embrace between two participants" },
    ],
  },
  {
    // Photos publiques d’illustration (docs/superpowers/plans/2026-10-08-contenu-kango.md) : provisoires, à remplacer.
    albumSlug: "kango",
    dir: "kango",
    common: {
      credit: "Photo publique d’illustration (à remplacer)",
      source: "Photos publiques transmises par l’association le 8 octobre 2026 ; logo « Gabon Développement » retiré par recadrage",
      droitsConfirmes: false,
      droitsNote: "Photos publiques utilisées pour illustrer la page Découvrir Kango ; droits non confirmés, à remplacer par des photos de l’association.",
      provisoire: true,
      galerie: false,
    },
    lieu: { fr: "Kango, Komo-Kango", en: "Kango, Komo-Kango" },
    photos: [
      { key: "kango-1", file: "photo-1.jpg", altFr: "Vue sur Kango, la forêt et le fleuve Komo", altEn: "View over Kango, the forest and the Komo River" },
      { key: "kango-2", file: "photo-2.jpg", altFr: "Maisons neuves au toit rouge, à Kango", altEn: "New red-roofed houses in Kango" },
      { key: "kango-3", file: "photo-3.jpg", altFr: "Vue aérienne d’un quartier de Kango, entre route et forêt", altEn: "Aerial view of a Kango neighbourhood, between road and forest" },
      { key: "kango-4", file: "photo-4.jpg", altFr: "Église aux murs jaunes sur les hauteurs de Kango", altEn: "Yellow-walled church on the heights of Kango" },
      { key: "kango-5", file: "photo-5.jpg", altFr: "Pont sur le fleuve Komo, vu depuis une embarcation", altEn: "Bridge over the Komo River, seen from a boat" },
    ],
  },
]
