# Contenu validé : album et actualité « Finale du 2e tournoi de football »

- **Validé par l’utilisateur le 2026-10-07**, textes tels quels. Les droits de diffusion des 6 photos sont confirmés par l’association.
- **Source :** publication Facebook de l'association du 26 août 2026. La capture « thème » est conservée hors git, dans `.superpowers/contenus/tournoi-football-2026-08/theme-publication-facebook.png`.
- **Photos d'origine :** `.superpowers/contenus/tournoi-football-2026-08/photo-1.jpg` à `photo-6.jpg`. Elles sont à copier dans `src/seed/images/albums/tournoi-football-2026-08/` sous le même nom.
- **Faits utilisés, et seulement ceux-là :**
  - le texte de la publication : coup d'envoi de la finale donné par la Marraine, Madame Laurence Ndong, et par le Ministre en charge des Sports, Monsieur Paul Ulrich Kessany ;
  - la banderole visible sur les photos : « 2e édition Tournoi de Football Komo-Kango, du 08 au 26 août 2026 ».
- **Rien d'inventé :** ni vainqueur, ni score, ni lieu de la finale.

Les textes ci-dessous sont à reprendre **mot pour mot**.

## Actualité

Cette actualité est distincte de l'actualité existante `tournoi-komo-kango-terre-davenir`, qui annonce le lancement le 8 août.

| Champ | FR | EN |
|---|---|---|
| slug | `tournoi-football-finale-2026` | (identique) |
| order | juste après `kafele-nianame-rehabilitation` : la finale (26 août) précède dans la liste l'annonce du lancement (8 août) | — |
| date | `2026-08-26` | — |
| title | 2e tournoi de football Komo-Kango Terre d'Avenir : la finale | 2nd Komo-Kango Terre d'Avenir football tournament: the final |
| category | Sport | *(même valeur EN que l'actualité `tournoi-komo-kango-terre-davenir` dans `en.ts`)* |
| dateLabel | 26 août 2026 | 26 August 2026 |
| excerpt | Le coup d'envoi de la finale de la 2e édition a été donné par la Marraine du tournoi, Madame Laurence Ndong, et par le Ministre en charge des Sports, Monsieur Paul Ulrich Kessany. | The kick-off of the final of the 2nd edition was given by the tournament's patron, Mrs Laurence Ndong, and by the Minister in charge of Sports, Mr Paul Ulrich Kessany. |
| source.label | Sur Facebook | *(même valeur EN que pour Kafélé)* |
| source.url | `FACEBOOK_URL` | `FACEBOOK_URL` |
| image | photo-3 (le coup d'envoi) | — |
| album | l'album ci-dessous | — |

**Texte FR** (`body` : paragraphes séparés par une ligne vide) :

```
Le 26 août 2026, la finale de la 2e édition du tournoi de football Komo-Kango Terre d'Avenir a clôturé une compétition ouverte le 8 août.

Le coup d'envoi a été donné par la Marraine du tournoi, Madame Laurence Ndong, Ministre de la Fonction publique et du Renforcement des capacités et Présidente de l'association, aux côtés de son collègue Ministre en charge des Sports, Monsieur Paul Ulrich Kessany.

Avant la rencontre, les deux équipes finalistes, les arbitres et les invités se sont alignés sur la pelouse, devant un public venu nombreux dans les tribunes.
```

**Texte EN** :

```
On 26 August 2026, the final of the 2nd edition of the Komo-Kango Terre d'Avenir football tournament brought to a close a competition that opened on 8 August.

The kick-off was given by the tournament's patron, Mrs Laurence Ndong, Minister of the Civil Service and Capacity Building and President of the association, alongside her fellow Minister in charge of Sports, Mr Paul Ulrich Kessany.

Before the match, the two finalist teams, the referees and the guests lined up on the pitch, in front of a large crowd in the stands.
```

## Album

| Champ | FR | EN |
|---|---|---|
| slug | `tournoi-football-2026-08` | (identique) |
| order | `1` (après l'album Kafélé, `0`, plus récent) | — |
| date | `2026-08-26` | — |
| title | 2e tournoi de football Komo-Kango Terre d'Avenir : la finale | 2nd Komo-Kango Terre d'Avenir football tournament: the final |
| dateLabel | 26 août 2026 | 26 August 2026 |
| description | Finale de la 2e édition du tournoi de football Komo-Kango Terre d'Avenir, le 26 août 2026. | Final of the 2nd edition of the Komo-Kango Terre d'Avenir football tournament, on 26 August 2026. |
| cover | photo-3 | — |
| photos | photo-1 à photo-6, dans cet ordre | — |

**Ordre des albums :** les albums sont triés par `order`, puis par date décroissante. Le plus récent est en tête : Kafélé à `0`, tournoi à `1`. C'est cohérent avec les actualités.

## Photos

Champs communs aux 6 photos :

| Champ | Valeur |
|---|---|
| `credit` | Terre d'Avenir KOMO-KANGO |
| `source` | Page Facebook de l'association (publication du 26 août 2026) |
| `lieu` (FR / EN) | Komo-Kango / Komo-Kango |
| `datePrise` | `2026-08-26` |
| `droitsConfirmes` | `true` |
| `droitsNote` | Photos publiées par l'association sur sa page Facebook ; droits de diffusion confirmés par l'association le 7 octobre 2026. |
| `galerie` | `false` |
| `provisoire` | `false` |

Texte alternatif de chaque photo. Il décrit la scène sans nommer personne.

| Fichier | `alt` FR | `alt` EN |
|---|---|---|
| photo-1.jpg | Joueurs, arbitres et invités alignés sur la pelouse avant la finale | Players, referees and guests lined up on the pitch before the final |
| photo-2.jpg | Une invitée tient le ballon du match, entourée de joueurs et d'officiels | A guest holds the match ball, surrounded by players and officials |
| photo-3.jpg | Coup d'envoi de la finale, devant les joueurs alignés et les tribunes | Kick-off of the final, in front of the lined-up players and the stands |
| photo-4.jpg | Salut aux joueurs en maillot rose avant la rencontre | Greeting the players in pink shirts before the match |
| photo-5.jpg | Photo de groupe de l'équipe en maillot bleu clair et des invités, sous la banderole du tournoi | Group photo of the team in light blue and the guests, under the tournament banner |
| photo-6.jpg | Photo de groupe de l'équipe en maillot rose et des invités | Group photo of the team in pink and the guests |
