import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { NOM_EXPEDITEUR_DEFAUT, adaptateurCapture, emailAdapter, lireExpediteur, optionsSmtp, transportConfigure } from '@/lib/email/adaptateur'

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
    expect(transportConfigure({ SMTP_HOST: 'smtp.exemple.org', SMTP_FROM: 'site@exemple.org' })).toBe(true)
    expect(transportConfigure({ SMTP_HOST: 'smtp.exemple.org' })).toBe(false)
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
    expect(fichiers[0]).toMatch(/.json$/) // pas de reste .tmp : l’écriture est atomique (écriture puis renommage)
    expect(JSON.parse(fs.readFileSync(path.join(dossier, fichiers[0]), 'utf8'))).toMatchObject({ to: 'dest@exemple.org', subject: 'Sujet', text: 'Corps' })
    expect(emailAdapter({ EMAIL_CAPTURE_DIR: dossier })).toBeTypeOf('function')
  })

  it('la capture ne s’active que si SMTP_HOST est vide', async () => {
    const env = { EMAIL_CAPTURE_DIR: 'x', SMTP_HOST: 'h', SMTP_FROM: 'a@b.org' }
    const adaptateur = await emailAdapter(env)
    expect(adaptateur?.({ payload: {} as never }).name).toBe('nodemailer')
    expect(transportConfigure({ EMAIL_CAPTURE_DIR: 'x', SMTP_HOST: '' })).toBe(true)
    expect(transportConfigure(env)).toBe(true)
  })

  it('SMTP : produit un adaptateur nodemailer sans connexion réseau', async () => {
    const adaptateur = await emailAdapter({ SMTP_HOST: 'smtp.exemple.org', SMTP_FROM: 'Asso <site@exemple.org>' })
    const a = adaptateur?.({ payload: {} as never })
    expect(a?.name).toBe('nodemailer')
    expect(a?.defaultFromAddress).toBe('site@exemple.org')
    expect(a?.defaultFromName).toBe('Asso')
  })

  it('expéditeur calculé vide ou invalide : aucun adaptateur, transport non configuré', () => {
    expect(emailAdapter({ SMTP_HOST: 'h', SMTP_FROM: 'invalide' })).toBeUndefined()
    expect(emailAdapter({ SMTP_HOST: 'h' })).toBeUndefined()
    expect(transportConfigure({ SMTP_HOST: 'h', SMTP_FROM: 'invalide' })).toBe(false)
    expect(emailAdapter({ SMTP_HOST: 'h', SMTP_FROM: 'invalide', SMTP_USER: 'user@exemple.org' })).toBeDefined()
  })

  it('STARTTLS exigé sauf port 465 ou SMTP_INSECURE=1', () => {
    expect(optionsSmtp({ SMTP_HOST: 'h' })).toMatchObject({ port: 587, secure: false, requireTLS: true })
    expect(optionsSmtp({ SMTP_HOST: 'h', SMTP_PORT: '465' })).toMatchObject({ secure: true, requireTLS: false })
    expect(optionsSmtp({ SMTP_HOST: 'h', SMTP_PORT: '1025', SMTP_INSECURE: '1' })).toMatchObject({ requireTLS: false })
  })
})
