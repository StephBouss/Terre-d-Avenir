import path from 'node:path'
import type { Payload } from 'payload'
import { upsertMedia } from './media'

/** Portrait officiel de la Présidente (droits confirmés le 2026-10-08), relié aux réglages du site. */
export async function seedPortraitPresidente(payload: Payload, dossierSeed: string): Promise<number | string> {
  return upsertMedia(payload, {
    key: 'presidente-portrait',
    filePath: path.join(dossierSeed, 'images', 'presidente.jpg'),
    data: { credit: 'Terre d’Avenir KOMO-KANGO', provisoire: false, galerie: false, droitsConfirmes: true },
    altFr: 'Laurence Ndong, Présidente de Terre d’Avenir KOMO-KANGO',
    altEn: 'Laurence Ndong, President of Terre d’Avenir KOMO-KANGO',
  })
}
