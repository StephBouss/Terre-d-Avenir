import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { NOM_EXPEDITEUR_DEFAUT, adaptateurCapture, emailAdapter, lireExpediteur, transportConfigure } from '@/lib/email/adaptateur'

describe('adaptateur e-mail', () => {
  it('lit l’expéditeur « Nom <adresse> » ou une adresse seule', () => {
    expect(lireExpediteur('Terre d’Avenir <site@exemple.org>')).toEqual({ nom: 'Terre d’Avenir', adresse: 'site@exemple.org' })
    expect(lireExpediteur('"Association" <a@b.org>')).toEqual({ nom: 'Association', adresse: 'a@b.org' })
    expect(lireExpediteur('site@exemple.org')).toEqual({ nom: NOM_EXPEDITEUR_DEFAUT, adresse: 'site@exemple.org' })
    expect(lireExpediteur('')).toBeNull()
    expect(lireExpediteur('pas une adresse')).toBeNull()
  })

  it('transport configuré : SMTP_HOST ou dossier de capture', () => {
    expect(transportConfigure({})).toBe(false)
    expect(transportConfigure({ SMTP_HOST: '  ' })).toBe(false)
    expect(transportConfigure({ SMTP_HOST: 'smtp.exemple.org' })).toBe(true)
    expect(transportConfigure({ EMAIL_CAPTURE_DIR: '.data/e2e-emails' })).toBe(true)
  })

  it('aucun adaptateur sans SMTP_HOST ni capture', () => {
    expect(emailAdapter({})).toBeUndefined()
  })

  it('la capture écrit chaque e-mail en JSON, sans rien envoyer', async () => {
    const dossier = fs.mkdtempSync(path.join(os.tmpdir(), 'capture-'))
    const adapter = adaptateurCapture(dossier)({ payload: {} as never })
    await adapter.sendEmail({ to: 'dest@exemple.org', subject: 'Sujet', text: 'Corps' })
    const fichiers = fs.readdirSync(dossier)
    expect(fichiers).toHaveLength(1)
    expect(JSON.parse(fs.readFileSync(path.join(dossier, fichiers[0]), 'utf8'))).toMatchObject({ to: 'dest@exemple.org', subject: 'Sujet', text: 'Corps' })
    expect(emailAdapter({ EMAIL_CAPTURE_DIR: dossier })).toBeTypeOf('function')
  })
})
