import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { construireArbre, type PosteNoeud } from '@/lib/organigramme'
import type { Poste } from '@/payload-types'
import { PORTRAITS, POSTES } from '@/seed/data/organigramme'

describe('contenu de départ de l’organigramme (spec §3.3)', () => {
  it('10 postes : clé, intitulés FR et EN, parent et nom public', () => {
    expect(POSTES.map((p) => [p.cle, p.intitule.fr, p.intitule.en, p.parent, p.nom])).toEqual([
      ['poste-01', 'Présidente', 'President', null, 'Laurence Ndong'],
      ['poste-02', 'Vice-président', 'Vice-President', 'poste-01', 'Jean-Baptiste Mboumba'],
      ['poste-03', 'Secrétaire générale', 'Secretary-General', 'poste-01', 'Clarisse Nzé Obiang'],
      ['poste-04', 'Trésorier', 'Treasurer', 'poste-01', 'Rodrigue Mintsa Ella'],
      ['poste-05', 'Secrétaire général adjoint', 'Deputy Secretary-General', 'poste-03', 'Hervé Koumba Ondo'],
      ['poste-06', 'Trésorière adjointe', 'Deputy Treasurer', 'poste-04', 'Prisca Mabika'],
      ['poste-07', 'Chargé des projets et actions', 'Projects and Initiatives Officer', 'poste-03', 'Fabrice Ondo Mba'],
      ['poste-08', 'Chargée de la jeunesse et du sport', 'Youth and Sport Officer', 'poste-03', 'Sandrine Ekomi'],
      ['poste-09', 'Chargée de la communication', 'Communications Officer', 'poste-03', 'Aurélie Bivigou'],
      ['poste-10', 'Chargé des adhésions et de la vie associative', 'Membership and Community Officer', 'poste-03', 'Steeve Nziengui'],
    ])
  })

  it('chaque parent est déclaré avant ses enfants ; une seule racine', () => {
    const vus = new Set<string>()
    for (const p of POSTES) {
      if (p.parent) expect(vus.has(p.parent), p.cle).toBe(true)
      vus.add(p.cle)
    }
    expect(POSTES.filter((p) => p.parent === null)).toHaveLength(1)
  })

  it('arbre attendu, frères dans l’ordre du tableau', () => {
    const num = (cle: string) => Number(cle.slice(-2))
    const postes = POSTES.map((p) => ({ id: num(p.cle), parent: p.parent ? num(p.parent) : null, ordre: p.ordre, intitule: p.intitule.fr }) as unknown as Poste)
    const forme = (n: PosteNoeud[]): unknown[] => n.map((x) => [x.poste.id, forme(x.enfants)])
    expect(forme(construireArbre(postes))).toEqual([
      [1, [[2, []], [3, [[5, []], [7, []], [8, []], [9, []], [10, []]]], [4, [[6, []]]]]],
    ])
  })

  it('textes FR et EN renseignés, apostrophe typographique', () => {
    const textes = [
      ...POSTES.flatMap((p) => [p.intitule.fr, p.intitule.en, p.mission.fr, p.mission.en, p.nom]),
      ...Object.values(PORTRAITS).flatMap((x) => [x.credit, x.alt.fr, x.alt.en, x.source ?? '']),
    ]
    for (const t of textes) expect(t, t).not.toContain("'")
    for (const p of POSTES) for (const t of [p.intitule.fr, p.intitule.en, p.mission.fr, p.mission.en]) expect(t.trim().length).toBeGreaterThan(0)
  })

  it('portraits : fichiers présents, seul le poste 1 est réel', () => {
    for (const p of POSTES) expect(fs.existsSync(path.join(process.cwd(), 'src/seed/images/organigramme', p.fichier)), p.fichier).toBe(true)
    expect(POSTES.filter((p) => p.portrait === 'reel').map((p) => p.cle)).toEqual(['poste-01'])
    expect(PORTRAITS.reel).toMatchObject({ credit: 'Terre d’Avenir KOMO-KANGO', droitsConfirmes: true, provisoire: false })
    expect(PORTRAITS.ia).toMatchObject({ credit: 'Portrait généré par IA — provisoire', provisoire: true })
  })
})
