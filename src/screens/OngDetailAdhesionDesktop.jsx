import { useState } from 'react';
import { Link } from 'react-router-dom';
import SiteHeader from '@components/SiteHeader';
import SiteFooter from '@components/SiteFooter';
import SectionHeader from '@components/SectionHeader';
import GoldDivider from '@components/GoldDivider';
import Icon from '@global/Icon';
import Image from '@global/Image';
import { t } from '../lib/i18n';

export const displayName = 'L\'ONG & Adhésion — Terre d\'Avenir KOMO-KANGO';
export const screenSize = 'desktop';

export default function OngDetailScreen() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: '',
    birthDate: '',
    connection: '',
    contribution: '',
    motivation: '',
    consent: false,
  });

  const updateField = (event) => {
    const { name, value, checked, type } = event.target;
    setFormData((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleMembershipSubmit = (event) => {
    event.preventDefault();
    if (step < 3) {
      setStep((current) => current + 1);
      return;
    }

    const body = [
      `Nom : ${formData.fullName}`,
      `Email : ${formData.email}`,
      `Téléphone : ${formData.phone || 'Non renseigné'}`,
      `Lien avec le Komo-Kango : ${formData.connection}`,
      `Contribution souhaitée : ${formData.contribution}`,
      '',
      `Motivation : ${formData.motivation}`,
    ].join('\n');
    setSubmitted(true);
    window.location.href = `mailto:contact@terredavenir-komokango.org?subject=${encodeURIComponent("Demande d'adhésion")}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="bg-background font-body w-full">
      <SiteHeader activePage="ong" />

      {/* ─── HERO BANNER ─── */}
      <section className="relative py-24 overflow-hidden" style={{ background: '#003E2A', minHeight: 480 }}>
        {/* BG photo */}
        <div className="absolute inset-0 z-0">
          <Image
            ar="21:9"
            prompt="documentary photograph of green tropical forest landscape in Komo-Kango Gabon, village clearing visible, late afternoon light through canopy, no text no watermarks, palette: deep forest green, warm gold light, earthy tones"
            alt=""
            loading="eager"
            fetchPriority="high"
            className="w-full h-full object-cover"
            style={{ opacity: 0.45 }}
          />
        </div>
        {/* Overlay */}
        <div
          className="absolute inset-0 z-1"
          style={{ background: 'linear-gradient(105deg, #003E2Ae8 30%, #003E2Acc 55%, #003E2A99 100%)' }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-[1280px] mx-auto px-6">
          <span
            className="text-xs font-bold font-body uppercase"
            style={{
              letterSpacing: '0.14em',
              color: '#E6BF58',
              background: 'rgba(230,191,88,0.14)',
              border: '1px solid rgba(230,191,88,0.4)',
              borderRadius: 4,
              padding: '4px 12px',
              display: 'inline-block',
              marginBottom: 16,
            }}
          >
            {t('Qui sommes-nous')}
          </span>
          <h1 className="text-5xl font-bold text-primary-foreground font-headings mb-6" style={{ lineHeight: 1.1 }}>
            {t('Terre d\'Avenir KOMO-KANGO')}
          </h1>
          <p className="text-lg text-primary-foreground" style={{ opacity: 0.88, maxWidth: 700 }}>
            {t('Une ONG gabonaise ancrée au Komo-Kango pour la solidarité, le développement local et l\'amélioration de la qualité de vie des communautés.')}
          </p>
        </div>
      </section>

      {/* ─── MISSION & VALUES ─── */}
      <section className="bg-background py-24" id="presentation">
        <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-2 gap-20 items-start">
          <div>
            <SectionHeader
              overline={t('Notre mission')}
              title={t('Ancrer l\'engagement local')}
            />
            <p className="text-base text-foreground leading-relaxed font-body mt-6 mb-6" style={{ textAlign: 'justify' }}>
              {t('Terre d\'Avenir KOMO-KANGO a pour mission de renforcer la solidarité au sein de la communauté du Komo-Kango et de créer des ponts durables entre les habitants, la diaspora et les partenaires externes. Nous croyons que le développement durable passe par une approche inclusive, documentée et participative.')}
            </p>
            <Link to="/contact" className="text-sm font-bold text-primary flex items-center gap-2 font-body">
              {t('Lire la charte complète')} <Icon i="arrow-right" size={14} />
            </Link>
          </div>
          <div className="bg-secondary rounded-lg p-8 flex flex-col gap-6">
            <h3 className="text-2xl font-bold text-secondary-foreground font-headings">{t('Nos valeurs')}</h3>
            {[
              { icon: 'heart', label: t('Solidarité'), desc: t('Engagement collectif au service du bien commun') },
              { icon: 'target', label: t('Ancrage'), desc: t('Profond enracinement dans le territoire et ses réalités') },
              { icon: 'users', label: t('Participation'), desc: t('Implication active des habitants et ressortissants') },
              { icon: 'leaf', label: t('Durabilité'), desc: t('Actions pensées pour le long terme et l\'environnement') },
            ].map((v, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="flex items-center justify-center rounded-full w-8 h-8" style={{ background: '#E6BF5820' }}>
                    <Icon i={v.icon} size={16} className="text-primary" />
                  </div>
                </div>
                <div>
                  <p className="font-bold text-secondary-foreground text-sm">{v.label}</p>
                  <p className="text-sm text-secondary-foreground" style={{ opacity: 0.75 }}>{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HISTORY & TIMELINE ─── */}
      <section className="bg-background py-24" style={{ background: '#F7F8F4' }}>
        <div className="max-w-[1280px] mx-auto px-6">
          <SectionHeader
            overline={t('Notre parcours')}
            title={t('Fondée en 2022 au Komo-Kango')}
          />
          <div className="grid grid-cols-2 gap-16 mt-12 items-start">
            <div>
              <div className="rounded-lg overflow-hidden">
                <Image
                  ar="4:3"
                  prompt="documentary photograph of green tropical forest landscape in Komo-Kango Gabon, village clearing visible, late afternoon light through canopy, no text no watermarks, palette: deep forest green, warm gold light, earthy tones"
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex flex-col gap-8">
              <div className="relative pl-8">
                <div className="absolute left-0 top-2 w-4 h-4 rounded-full" style={{ background: '#E6BF58' }} />
                <div className="absolute left-1.5 top-6 w-1 h-24" style={{ background: 'rgba(230,191,88,0.3)' }} />
                <div>
                  <p className="text-sm font-bold text-primary uppercase tracking-widest">{t('2022 — Fondation')}</p>
                  <p className="text-base text-foreground leading-relaxed mt-1">{t('Création de Terre d\'Avenir KOMO-KANGO au cœur du Komo-Kango, en réponse aux besoins identifiés par les habitants et ressortissants.')}</p>
                </div>
              </div>

              <div className="relative pl-8">
                <div className="absolute left-0 top-2 w-4 h-4 rounded-full" style={{ background: '#E6BF5880' }} />
                <div className="absolute left-1.5 top-6 w-1 h-24" style={{ background: 'rgba(230,191,88,0.3)' }} />
                <div>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{t('2023-2024 — Développement')}</p>
                  <p className="text-base text-foreground leading-relaxed mt-1">{t('Lancement progressif des quatre axes d\'action : jeunesse, santé, sport et solidarité. Mise en place des premiers projets pilotes.')}</p>
                </div>
              </div>

              <div className="relative pl-8">
                <div className="absolute left-0 top-2 w-4 h-4 rounded-full" style={{ background: '#E6BF5880' }} />
                <div>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{t('2025+ — Pérennisation')}</p>
                  <p className="text-base text-foreground leading-relaxed mt-1">{t('Consolidation des impacts, expansion des initiatives documentées et renforcement du réseau de partenaires.')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TEAM ─── */}
      <section className="bg-background py-24" id="equipe">
        <div className="max-w-[1280px] mx-auto px-6">
          <SectionHeader
            overline={t('Notre équipe')}
            title={t('Dirigée par une présidente engagée')}
          />
          <div className="grid grid-cols-3 gap-8 mt-12">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-lg overflow-hidden mb-4" style={{ width: 240, height: 280, border: '3px solid #E6BF58' }}>
                <Image
                  ar="3:4"
                  prompt="portrait photograph of an African woman, natural outdoor setting in Gabon, warm diffused light, professional and approachable expression, green vegetation in background, no text no watermarks, palette: deep forest green, warm gold light, earthy tones"
                  alt="Illustration de portrait — visuel à valider avant publication"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-bold text-foreground font-headings">{t('La Présidente')}</h3>
              <p className="text-sm text-muted-foreground font-body mt-1">{t('Terre d\'Avenir KOMO-KANGO')}</p>
              <p className="text-sm text-foreground leading-relaxed mt-3">{t('Portrait et bio à valider avant toute publication.')}</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="rounded-lg overflow-hidden mb-4 w-48 h-48 bg-muted flex items-center justify-center">
                <Icon i="users" size={48} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground font-headings">{t('Membres actifs')}</h3>
              <p className="text-sm text-muted-foreground font-body mt-1">{t('Données à connecter')}</p>
              <p className="text-sm text-foreground leading-relaxed mt-3">{t('Habitants du Komo-Kango, ressortissants et bénévoles engagés.')}</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="rounded-lg overflow-hidden mb-4 w-48 h-48 bg-muted flex items-center justify-center">
                <Icon i="handshake" size={48} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground font-headings">{t('Partenaires')}</h3>
              <p className="text-sm text-muted-foreground font-body mt-1">{t('À documenter')}</p>
              <p className="text-sm text-foreground leading-relaxed mt-3">{t('Organisations, institutions et partenaires engagés aux côtés de l\'ONG.')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── DIVIDER ─── */}
      <div className="bg-background max-w-[1280px] mx-auto px-6 py-6">
        <GoldDivider />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ADHÉSION — MULTI-STEP FORM                                         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {/* ─── ADHESION INTRO ─── */}
      <section className="bg-background py-20" id="adhesion">
        <div className="max-w-[1280px] mx-auto px-6 text-center mb-12">
          <span
            className="text-xs font-bold font-body uppercase"
            style={{
              letterSpacing: '0.14em',
              color: '#005C38',
              background: '#E6BF5820',
              border: '1px solid #E6BF5850',
              borderRadius: 4,
              padding: '3px 10px',
              display: 'inline-block',
              marginBottom: 12,
            }}
          >
            {t('Rejoindre l\'ONG')}
          </span>
          <h2 className="text-4xl font-bold text-foreground font-headings mb-4" style={{ lineHeight: 1.15 }}>
            {t('Devenir membre de Terre d\'Avenir KOMO-KANGO')}
          </h2>
          <p className="text-lg text-muted-foreground font-body max-w-2xl mx-auto" style={{ lineHeight: 1.65 }}>
            {t('Rejoignez notre communauté d\'habitants, ressortissants et partenaires engagés pour la solidarité et le développement du Komo-Kango.')}
          </p>
        </div>

        {/* ─── ADHESION FORM — MULTI-STEP WIZARD ─── */}
        <div className="max-w-2xl mx-auto px-6">
          {/* Progress bar */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-foreground">{t(`Étape ${step} sur 3`)}</span>
              <span className="text-sm text-muted-foreground">{Math.round((step / 3) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          <form className="bg-background border border-border rounded-lg p-8 mb-8" onSubmit={handleMembershipSubmit}>
            {step === 1 && (
              <>
                <h3 className="text-2xl font-bold text-foreground font-headings mb-6">{t('Vos informations personnelles')}</h3>
                <div className="space-y-5">
                  <div>
                    <label htmlFor="member-name" className="block text-sm font-bold text-foreground mb-2">{t('Nom complet *')}</label>
                    <input
                      id="member-name"
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      required
                      value={formData.fullName}
                      onChange={updateField}
                      placeholder={t('Votre nom')}
                      className="form-control border border-border rounded-md px-4 py-3 bg-input text-foreground w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="member-email" className="block text-sm font-bold text-foreground mb-2">{t('Email *')}</label>
                    <input
                      id="member-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={updateField}
                      placeholder={t('votre.email@example.com')}
                      className="form-control border border-border rounded-md px-4 py-3 bg-input text-foreground w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="member-phone" className="block text-sm font-bold text-foreground mb-2">{t('Téléphone')}</label>
                    <input
                      id="member-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={updateField}
                      placeholder={t('+241 XX XX XX XX')}
                      className="form-control border border-border rounded-md px-4 py-3 bg-input text-foreground w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="member-gender" className="block text-sm font-bold text-foreground mb-2">{t('Genre *')}</label>
                    <select
                      id="member-gender"
                      name="gender"
                      required
                      value={formData.gender}
                      onChange={updateField}
                      className="form-control border border-border rounded-md px-4 py-3 bg-input text-foreground w-full"
                    >
                      <option value="">{t('Sélectionner')}</option>
                      <option value="Femme">{t('Femme')}</option>
                      <option value="Homme">{t('Homme')}</option>
                      <option value="Autre / non précisé">{t('Autre / ne pas préciser')}</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="member-birth-date" className="block text-sm font-bold text-foreground mb-2">{t('Date de naissance')}</label>
                    <input
                      id="member-birth-date"
                      name="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={updateField}
                      className="form-control border border-border rounded-md px-4 py-3 bg-input text-foreground w-full"
                    />
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h3 className="text-2xl font-bold text-foreground font-headings mb-6">{t('Votre engagement')}</h3>
                <div className="space-y-5">
                  <div>
                    <label htmlFor="member-connection" className="block text-sm font-bold text-foreground mb-2">{t('Votre lien avec le Komo-Kango *')}</label>
                    <select
                      id="member-connection"
                      name="connection"
                      required
                      value={formData.connection}
                      onChange={updateField}
                      className="form-control border border-border rounded-md px-4 py-3 bg-input text-foreground w-full"
                    >
                      <option value="">{t('Sélectionner')}</option>
                      <option value="Résident">{t('Résident')}</option>
                      <option value="Ressortissant / diaspora">{t('Ressortissant / diaspora')}</option>
                      <option value="Partenaire">{t('Partenaire')}</option>
                      <option value="Autre lien">{t('Autre lien')}</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="member-contribution" className="block text-sm font-bold text-foreground mb-2">{t('Comment souhaitez-vous contribuer ? *')}</label>
                    <select
                      id="member-contribution"
                      name="contribution"
                      required
                      value={formData.contribution}
                      onChange={updateField}
                      className="form-control border border-border rounded-md px-4 py-3 bg-input text-foreground w-full"
                    >
                      <option value="">{t('Sélectionner')}</option>
                      <option value="Bénévolat">{t('Bénévolat')}</option>
                      <option value="Compétences / expertise">{t('Compétences / expertise')}</option>
                      <option value="Soutien matériel ou financier">{t('Soutien matériel ou financier')}</option>
                      <option value="Participation aux actions">{t('Participation aux actions')}</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="member-motivation" className="block text-sm font-bold text-foreground mb-2">{t('Votre motivation *')}</label>
                    <textarea
                      id="member-motivation"
                      name="motivation"
                      required
                      rows="5"
                      value={formData.motivation}
                      onChange={updateField}
                      placeholder={t('Expliquez en quelques mots pourquoi vous souhaitez rejoindre l’ONG.')}
                      className="form-control border border-border rounded-md px-4 py-3 bg-input text-foreground w-full resize-y"
                    />
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h3 className="text-2xl font-bold text-foreground font-headings mb-2">{t('Vérification de votre demande')}</h3>
                <p className="text-sm text-muted-foreground mb-6">{t('Relisez les informations principales avant de préparer votre demande par email.')}</p>
                <dl className="grid grid-cols-2 gap-4 mb-6 membership-summary">
                  {[
                    [t('Nom'), formData.fullName],
                    [t('Email'), formData.email],
                    [t('Lien avec le territoire'), formData.connection],
                    [t('Contribution'), formData.contribution],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-md bg-input p-4">
                      <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</dt>
                      <dd className="mt-1 text-sm font-bold text-foreground">{value}</dd>
                    </div>
                  ))}
                </dl>
                <label className="flex items-start gap-3">
                  <input
                    name="consent"
                    type="checkbox"
                    required
                    checked={formData.consent}
                    onChange={updateField}
                    className="mt-1 h-5 w-5 flex-shrink-0"
                    style={{ accentColor: '#005C38' }}
                  />
                  <span className="text-sm leading-relaxed text-muted-foreground">
                    {t('Je confirme l’exactitude de ces informations et j’accepte qu’elles soient utilisées pour traiter ma demande d’adhésion.')}
                  </span>
                </label>
                {submitted && (
                  <p className="text-sm text-primary mt-4" role="status">
                    {t('Votre application de messagerie va s’ouvrir avec la demande préremplie.')}
                  </p>
                )}
              </>
            )}

            <div className="flex justify-between items-center mt-8 pt-6 border-t border-border gap-4">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((current) => current - 1)}
                  className="font-bold text-base px-6 py-3 rounded-md font-body text-primary border border-primary"
                >
                  {t('Retour')}
                </button>
              ) : <div />}
              <button
                type="submit"
                className="font-bold text-base px-8 py-3 rounded-md font-body text-primary-foreground flex items-center gap-2"
                style={{ background: '#005C38' }}
              >
                {step < 3 ? t('Suivant') : t('Préparer la demande')}
                <Icon i={step < 3 ? 'arrow-right' : 'send'} size={16} />
              </button>
            </div>
          </form>

          {/* Info boxes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary rounded-lg p-4 flex gap-3 items-start">
              <Icon i="info" size={18} className="text-secondary-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-secondary-foreground">{t('Données sécurisées')}</p>
                <p className="text-xs text-secondary-foreground mt-1" style={{ opacity: 0.75 }}>{t('Vos informations sont protégées et utilisées uniquement par l\'ONG.')}</p>
              </div>
            </div>
            <div className="bg-secondary rounded-lg p-4 flex gap-3 items-start">
              <Icon i="clock" size={18} className="text-secondary-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-secondary-foreground">{t('Traitement rapide')}</p>
                <p className="text-xs text-secondary-foreground mt-1" style={{ opacity: 0.75 }}>{t('Vous recevrez une réponse dans un délai de 3 à 5 jours.')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CRITERIA ─── */}
      <section className="bg-background py-20" style={{ background: '#F7F8F4' }}>
        <div className="max-w-[1280px] mx-auto px-6">
          <h2 className="text-3xl font-bold text-foreground font-headings mb-8">{t('Critères d\'adhésion')}</h2>
          <div className="grid grid-cols-2 gap-6">
            {[
              { icon: 'check-circle', title: t('Être résident ou ressortissant du Komo-Kango'), desc: t('Ou entretenir un lien fort avec le territoire et ses communautés.') },
              { icon: 'check-circle', title: t('Partager les valeurs de l\'ONG'), desc: t('Solidarité, ancrage local, participation inclusive et durabilité.') },
              { icon: 'check-circle', title: t('S\'engager à participer'), desc: t('Être disposé à contribuer aux actions et initiatives menées par l\'ONG.') },
              { icon: 'check-circle', title: t('Respecter la charte'), desc: t('Accepter les modalités d\'adhésion et le code de conduite de l\'ONG.') },
            ].map((item, i) => (
              <div key={i} className="bg-background rounded-lg p-6 border border-border">
                <div className="flex gap-3 items-start">
                  <Icon i={item.icon} size={20} className="text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BENEFITS ─── */}
      <section className="bg-background py-20">
        <div className="max-w-[1280px] mx-auto px-6">
          <h2 className="text-3xl font-bold text-foreground font-headings mb-8">{t('Avantages de l\'adhésion')}</h2>
          <div className="grid grid-cols-3 gap-6">
            {[
              { icon: 'users', title: t('Communauté'), desc: t('Accès au réseau de membres actifs et partenaires engagés.') },
              { icon: 'mail', title: t('Communications'), desc: t('Recevoir les actualités, appels à participation et mises à jour directes.') },
              { icon: 'vote', title: t('Voix participative'), desc: t('Contribuer aux décisions et orientations de l\'ONG.') },
              { icon: 'award', title: t('Reconnaissance'), desc: t('Être listé comme membre et contributeur de l\'initiative.') },
              { icon: 'book', title: t('Ressources'), desc: t('Accès à la documentation et aux compte-rendus des projets.') },
              { icon: 'heart', title: t('Impact'), desc: t('Contribution concrète au développement du Komo-Kango.') },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-3">
                <div className="flex items-center justify-center rounded-full w-12 h-12" style={{ background: '#E6BF5820' }}>
                  <Icon i={item.icon} size={22} className="text-primary" />
                </div>
                <h3 className="font-bold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

