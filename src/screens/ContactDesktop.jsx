import { useState } from 'react';
import { Link } from 'react-router-dom';
import SiteHeader from '@components/SiteHeader';
import SiteFooter from '@components/SiteFooter';
import GoldDivider from '@components/GoldDivider';
import Icon from '@global/Icon';
import Image from '@global/Image';
import { t } from '../lib/i18n';

export const displayName = 'Contact — Terre d\'Avenir KOMO-KANGO';
export const screenSize = 'desktop';

const subjects = [
  'Renseignement général',
  "Demande d'adhésion",
  'Partenariat',
  'Don & soutien',
  'Presse & médias',
  'Autre',
];

export default function ContactScreen() {
  const [subject, setSubject] = useState(subjects[0]);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const fullName = `${data.get('firstName')} ${data.get('lastName')}`.trim();
    const body = [
      `Nom : ${fullName}`,
      `Email : ${data.get('email')}`,
      `Téléphone / WhatsApp : ${data.get('phone') || 'Non renseigné'}`,
      `Organisation : ${data.get('organisation') || 'Non renseignée'}`,
      '',
      data.get('message'),
    ].join('\n');
    const mailto = `mailto:contact@terredavenir-komokango.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSubmitted(true);
    window.location.href = mailto;
  };

  return (
    <div className="bg-background font-body w-full">
      <SiteHeader activePage="contact" />

      {/* ─── HERO ─── */}
      <section className="relative py-24 overflow-hidden" style={{ background: '#003E2A', minHeight: 380 }}>
        <div className="absolute inset-0 z-0">
          <Image
            ar="21:9"
            prompt="wide documentary photograph of a Gabonese community gathering outdoors, tropical forest of Komo-Kango in background, golden afternoon light, warm greens and earth tones, no text no watermarks, palette: deep forest green, warm gold light, earthy tones"
            alt=""
            loading="eager"
            fetchPriority="high"
            className="w-full h-full object-cover"
            style={{ opacity: 0.38 }}
          />
        </div>
        <div className="absolute inset-0 z-1" style={{ background: 'linear-gradient(105deg, #003E2Ae8 30%, #003E2Acc 55%, #003E2A99 100%)' }} />
        <div className="relative z-10 max-w-[1280px] mx-auto px-6">
          <span
            className="text-xs font-bold font-body uppercase"
            style={{ letterSpacing: '0.14em', color: '#E6BF58', background: 'rgba(230,191,88,0.14)', border: '1px solid rgba(230,191,88,0.4)', borderRadius: 4, padding: '4px 12px', display: 'inline-block', marginBottom: 16 }}
          >
            {t('Contact')}
          </span>
          <h1 className="text-5xl font-bold text-primary-foreground font-headings mb-4" style={{ lineHeight: 1.1 }}>
            {t('Nous contacter')}
          </h1>
          <p className="text-lg text-primary-foreground" style={{ opacity: 0.88, maxWidth: 600 }}>
            {t('Vous avez une question, une proposition de partenariat, ou souhaitez rejoindre l\'ONG ? Entrons en contact.')}
          </p>
        </div>
      </section>

      {/* ─── MAIN LAYOUT ─── */}
      <section className="bg-background py-20">
        <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* LEFT — Info block */}
          <div className="lg:col-span-1 flex flex-col gap-8">
            {/* Siège social */}
            <div>
              <h2 className="text-xl font-bold text-foreground font-headings mb-5">{t('Informations')}</h2>
              <div className="flex flex-col gap-5">

                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full" style={{ background: '#E6BF5820' }}>
                    <Icon i="map-pin" size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm mb-1">{t('Siège social')}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t('Komo-Kango, Gabon')}<br />
                      {t('Adresse exacte à compléter')}<br />
                      {t('BP : À préciser')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full" style={{ background: '#E6BF5820' }}>
                    <Icon i="mail" size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm mb-1">{t('Email')}</p>
                    <a href="mailto:contact@terredavenir-komokango.org" className="text-sm font-medium break-all" style={{ color: '#005C38' }}>
                      {t('contact@terredavenir-komokango.org')}
                    </a>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full" style={{ background: '#E6BF5820' }}>
                    <Icon i="phone" size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm mb-1">{t('Téléphone')}</p>
                    <p className="text-sm text-muted-foreground">{t('+241 XX XX XX XX')}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t('Numéro à confirmer')}</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full" style={{ background: '#25D36620' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm mb-1">{t('WhatsApp')}</p>
                    <span className="text-sm font-medium" style={{ color: '#25D366' }}>
                      {t('+241 XX XX XX XX')}
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">{t('Numéro à confirmer')}</p>
                  </div>
                </div>

              </div>
            </div>

            <GoldDivider />

            {/* Social links */}
            <div>
              <h3 className="text-base font-bold text-foreground mb-4">{t('Réseaux sociaux')}</h3>
              <div className="flex flex-col gap-3">
                <a
                  href="https://www.facebook.com/profile.php?id=61573035845197"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-md font-body text-sm font-bold text-primary-foreground"
                  style={{ background: '#1877F2' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.269h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
                  </svg>
                  {t('Suivre sur Facebook')}
                  <Icon i="arrow-right" size={14} className="ml-auto" />
                </a>

                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-md font-body text-sm font-bold"
                  style={{ background: '#E9F8EE', color: '#187A38' }}
                  aria-disabled="true"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#187A38" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  {t('WhatsApp — numéro à confirmer')}
                  <Icon i="clock" size={14} className="ml-auto" />
                </div>
              </div>
            </div>

            <GoldDivider />

            {/* Quick links */}
            <div>
              <h3 className="text-base font-bold text-foreground mb-4">{t('Liens rapides')}</h3>
              <div className="flex flex-col gap-2">
                <Link
                  to="/ong#adhesion"
                  className="flex items-center gap-3 px-4 py-3 rounded-md font-body text-sm font-bold"
                  style={{ background: '#E6BF58', color: '#003E2A' }}
                >
                  <Icon i="user-plus" size={16} />
                  {t('Faire une demande d\'adhésion')}
                  <Icon i="arrow-right" size={14} className="ml-auto" />
                </Link>
                <a
                  href="#contact-form"
                  onClick={() => setSubject('Partenariat')}
                  className="flex items-center gap-3 px-4 py-3 rounded-md font-body text-sm font-bold border border-border text-foreground"
                >
                  <Icon i="handshake" size={16} className="text-primary" />
                  {t('Proposer un partenariat')}
                  <Icon i="arrow-right" size={14} className="ml-auto text-muted-foreground" />
                </a>
                <Link
                  to="/actualites"
                  className="flex items-center gap-3 px-4 py-3 rounded-md font-body text-sm font-bold border border-border text-foreground"
                >
                  <Icon i="newspaper" size={16} className="text-primary" />
                  {t('Voir les actualités')}
                  <Icon i="arrow-right" size={14} className="ml-auto text-muted-foreground" />
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT — Contact form */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-foreground font-headings mb-7">{t('Envoyer un message')}</h2>

            <form id="contact-form" className="bg-background border border-border rounded-lg p-8 flex flex-col gap-6" onSubmit={handleSubmit}>

              {/* Subject tabs */}
              <fieldset>
                <legend className="block text-sm font-bold text-foreground mb-3">{t('Objet de votre message *')}</legend>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((label) => (
                    <button
                      key={label}
                      type="button"
                      aria-pressed={subject === label}
                      onClick={() => setSubject(label)}
                      className="px-4 py-2 rounded-md text-sm font-body font-medium"
                      style={
                        subject === label
                          ? { background: '#005C38', color: '#fff' }
                          : { background: '#F7F8F4', color: '#666', border: '1px solid #e8e8e8' }
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Name + First name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="contact-last-name" className="block text-sm font-bold text-foreground mb-2">{t('Nom *')}</label>
                  <input
                    id="contact-last-name"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    placeholder={t('Votre nom')}
                    className="form-control border border-border rounded-md px-4 py-3 bg-input text-foreground font-body w-full"
                  />
                </div>
                <div>
                  <label htmlFor="contact-first-name" className="block text-sm font-bold text-foreground mb-2">{t('Prénom *')}</label>
                  <input
                    id="contact-first-name"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    placeholder={t('Votre prénom')}
                    className="form-control border border-border rounded-md px-4 py-3 bg-input text-foreground font-body w-full"
                  />
                </div>
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-bold text-foreground mb-2">{t('Email *')}</label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder={t('votre@email.com')}
                    className="form-control border border-border rounded-md px-4 py-3 bg-input text-foreground font-body w-full"
                  />
                </div>
                <div>
                  <label htmlFor="contact-phone" className="block text-sm font-bold text-foreground mb-2">{t('Téléphone / WhatsApp')}</label>
                  <input
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder={t('+241 XX XX XX XX')}
                    className="form-control border border-border rounded-md px-4 py-3 bg-input text-foreground font-body w-full"
                  />
                </div>
              </div>

              {/* Organisation */}
              <div>
                <label htmlFor="contact-organisation" className="block text-sm font-bold text-foreground mb-2">{t('Organisation (si applicable)')}</label>
                <input
                  id="contact-organisation"
                  name="organisation"
                  type="text"
                  autoComplete="organization"
                  placeholder={t('Nom de votre organisation ou association')}
                  className="form-control border border-border rounded-md px-4 py-3 bg-input text-foreground font-body w-full"
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="contact-message" className="block text-sm font-bold text-foreground mb-2">{t('Votre message *')}</label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows="6"
                  placeholder={t('Décrivez votre demande, question ou projet...')}
                  className="form-control border border-border rounded-md px-4 py-4 bg-input text-foreground font-body leading-relaxed w-full resize-y"
                />
              </div>

              {/* Consent */}
              <label className="flex items-start gap-3">
                <input
                  name="consent"
                  type="checkbox"
                  required
                  className="mt-1 h-5 w-5 flex-shrink-0"
                  style={{ accentColor: '#005C38' }}
                />
                <span className="text-sm text-muted-foreground font-body leading-relaxed">
                  {t('J\'accepte que mes données soient utilisées pour traiter ma demande par Terre d\'Avenir KOMO-KANGO, conformément à sa politique de confidentialité.')}
                </span>
              </label>

              {/* Submit */}
              <div className="flex flex-col items-stretch gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground font-body">
                  {t('* Champs obligatoires')}
                </p>
                <button
                  type="submit"
                  className="font-bold text-base px-10 py-3 rounded-md font-body text-primary-foreground flex items-center justify-center gap-2"
                  style={{ background: '#005C38' }}
                >
                  {t('Envoyer le message')}
                  <Icon i="send" size={16} />
                </button>
              </div>
              {submitted && (
                <p className="text-sm text-primary" role="status">
                  {t('Votre application de messagerie va s’ouvrir avec le message prérempli.')}
                </p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* ─── MAP PLACEHOLDER ─── */}
      <section className="bg-background pb-24">
        <div className="max-w-[1280px] mx-auto px-6">
          <h2 className="text-2xl font-bold text-foreground font-headings mb-6">{t('Notre localisation')}</h2>
          <div
            className="relative w-full rounded-lg overflow-hidden flex items-center justify-center"
            style={{ height: 320, background: '#F7F8F4', border: '1px solid #e8e8e8' }}
          >
            <Image
              ar="21:9"
              prompt="satellite map view of Komo-Kango region in Gabon, tropical green forest, river visible, top down aerial view, cartographic style, no text no labels, palette: deep forest green, warm gold light, earthy tones"
              className="w-full h-full object-cover"
              style={{ opacity: 0.7 }}
            />
            <div className="absolute flex flex-col items-center gap-2">
              <div className="rounded-full w-12 h-12 flex items-center justify-center" style={{ background: '#005C38' }}>
                <Icon i="map-pin" size={24} style={{ color: '#E6BF58' }} />
              </div>
              <div className="rounded-md px-4 py-2" style={{ background: '#003E2A', color: '#fff' }}>
                <p className="text-sm font-bold font-body">{t('Komo-Kango, Gabon')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA BAND ─── */}
      <section className="py-16" style={{ background: '#003E2A' }}>
        <div className="max-w-[1280px] mx-auto px-6 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center lg:gap-12">
          <div>
            <h2 className="text-3xl font-bold text-primary-foreground font-headings mb-2">{t('Prêt à nous rejoindre ?')}</h2>
            <p className="text-base text-primary-foreground font-body" style={{ opacity: 0.82 }}>
              {t('Adhérez à Terre d\'Avenir KOMO-KANGO et participez activement au développement du Komo-Kango.')}
            </p>
          </div>
          <div className="flex w-full gap-4 flex-wrap lg:w-auto lg:flex-shrink-0">
            <Link
              to="/ong#adhesion"
              className="font-bold text-base px-8 py-3 rounded-md font-body flex items-center gap-2"
              style={{ background: '#E6BF58', color: '#003E2A' }}
            >
              <Icon i="user-plus" size={17} />
              {t('Adhérer')}
            </Link>
            <a
              href="https://www.facebook.com/profile.php?id=61573035845197"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-base px-8 py-3 rounded-md font-body text-primary-foreground flex items-center gap-2"
              style={{ border: '1.5px solid rgba(255,255,255,0.4)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.269h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
              </svg>
              {t('Facebook')}
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

