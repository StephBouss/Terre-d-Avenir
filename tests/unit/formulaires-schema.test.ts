import { describe, expect, it } from 'vitest'
import { CODES_PAYS, estCodePays, nomPays, optionsPays } from '@/lib/formulaires/pays'
import { CLE_IDEMPOTENCE, normaliserTelephone, nouvelleCle, validerAdhesion, validerContact } from '@/lib/formulaires/schema'

const ADHESION = { nom: 'Obiang', prenoms: 'Awa', telephone: '+241 06 12 34 56', notice: true }
const CONTACT = { nom: 'Mba', email: 'visiteur@example.org', message: 'Bonjour' }

describe('téléphone international', () => {
  it('normalise les espaces, points, tirets, parenthèses et le préfixe 00', () => {
    expect(normaliserTelephone('+241 06 12 34 56')).toBe('+24106123456')
    expect(normaliserTelephone('00241 06-12-34-56')).toBe('+24106123456')
    expect(normaliserTelephone('(+33) 6.12.34.56.78')).toBe('+33612345678')
  })
  it('refuse un numéro sans indicatif, trop court ou trop long', () => {
    expect(normaliserTelephone('0612345678')).toBeNull()
    expect(normaliserTelephone('+0612345678')).toBeNull()
    expect(normaliserTelephone('+24112')).toBeNull()
    expect(normaliserTelephone('+1234567890123456')).toBeNull()
  })
})

describe('validation de l’adhésion', () => {
  it('accepte une demande minimale et normalise les données', () => {
    expect(validerAdhesion({ ...ADHESION, email: '', pays: 'ga', interets: ['sport', 'jeunesse', 'sport'] })).toEqual({
      ok: true,
      donnees: { nom: 'Obiang', prenoms: 'Awa', telephone: '+24106123456', email: null, pays: 'GA', ville: null, interets: ['jeunesse', 'sport'], motivation: null },
    })
  })
  it('accepte les noms non latins', () => {
    expect(validerAdhesion({ ...ADHESION, nom: '王', prenoms: 'Ἀλέξανδρος' }).ok).toBe(true)
  })
  it('signale chaque champ requis, et la notice non cochée', () => {
    expect(validerAdhesion({})).toEqual({ ok: false, erreurs: { nom: 'requis', prenoms: 'requis', telephone: 'requis', notice: 'notice' } })
  })
  it('formats et longueurs', () => {
    const r = validerAdhesion({ ...ADHESION, nom: 'x'.repeat(81), telephone: '0612', email: 'a@b', pays: 'XX', ville: 'v'.repeat(101), interets: ['inconnu'], motivation: 'm'.repeat(1001) })
    expect(r).toEqual({ ok: false, erreurs: { nom: 'tropLong', telephone: 'telephone', email: 'email', pays: 'invalide', ville: 'tropLong', interets: 'invalide', motivation: 'tropLong' } })
  })
  it('compte les caractères visibles : 1 000 émojis restent acceptés', () => {
    expect(validerAdhesion({ ...ADHESION, motivation: '🌳'.repeat(1000) }).ok).toBe(true)
  })
  it('ignore les caractères de contrôle et les espaces autour', () => {
    const r = validerAdhesion({ ...ADHESION, nom: '  Obi\u0000ang  ' })
    expect(r.ok && r.donnees.nom).toBe('Obiang')
  })
  it('notice : seule la valeur booléenne vraie est acceptée', () => {
    expect(validerAdhesion({ ...ADHESION, notice: 'on' }).ok).toBe(false)
  })
})

describe('validation du contact', () => {
  it('accepte un message minimal', () => {
    expect(validerContact(CONTACT)).toEqual({ ok: true, donnees: { nom: 'Mba', prenom: null, email: 'visiteur@example.org', telephone: null, organisation: null, message: 'Bonjour' } })
  })
  it('nom, e-mail et message requis ; téléphone vérifié s’il est donné', () => {
    expect(validerContact({ telephone: '06' })).toEqual({ ok: false, erreurs: { nom: 'requis', email: 'requis', telephone: 'telephone', message: 'requis' } })
  })
  it('partie locale de l’e-mail : caractères interdits refusés', () => {
    for (const email of ['a,b@x.fr', 'a<b@x.fr', 'a"b@x.fr', 'a(b)@x.fr', 'a;b@x.fr', 'a:b@x.fr', 'a\\b@x.fr', 'a>b@x.fr']) {
      expect(validerContact({ ...CONTACT, email })).toEqual({ ok: false, erreurs: { email: 'email' } })
    }
    expect(validerContact({ ...CONTACT, email: 'a.b+c@x.fr' }).ok).toBe(true)
  })
  it('message de 2 000 caractères maximum', () => {
    expect(validerContact({ ...CONTACT, message: 'm'.repeat(2001) })).toEqual({ ok: false, erreurs: { message: 'tropLong' } })
  })
})

describe('pays', () => {
  it('liste ISO 3166-1 complète, noms traduits et triés', () => {
    expect(CODES_PAYS).toHaveLength(249)
    expect(estCodePays('GA')).toBe(true)
    expect(estCodePays('XX')).toBe(false)
    expect(nomPays('DE', 'fr')).toBe('Allemagne')
    expect(nomPays('DE', 'en')).toBe('Germany')
    const fr = optionsPays('fr')
    const collateur = new Intl.Collator('fr')
    expect(fr.map((p) => p.nom)).toEqual([...fr.map((p) => p.nom)].sort(collateur.compare))
    expect(fr.find((p) => p.code === 'GA')?.nom).toBe('Gabon')
  })
})

describe('clé d’idempotence', () => {
  it('UUID v4', () => {
    expect(nouvelleCle()).toMatch(CLE_IDEMPOTENCE)
  })
})
