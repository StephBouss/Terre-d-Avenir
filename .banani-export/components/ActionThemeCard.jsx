import Icon from '@global/Icon';

export const displayName = 'Action Theme Card';
export const shortDescription = "Carte thème d'action : icône, titre, description";

export default function ActionThemeCard({
  icon = 'users',
  title = t('Jeunesse & opportunités'),
  description = t('Accompagner les jeunes du Komo-Kango vers de nouvelles perspectives.'),
}) {
  return (
    <div className="bg-background rounded-lg border border-border p-6 flex flex-col gap-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div className="w-11 h-11 rounded-md flex items-center justify-center" style={{ background: '#F0F5EF' }}>
        <Icon i={icon} size={22} className="text-primary" />
      </div>
      <div>
        <h3 className="text-base font-bold text-foreground font-headings mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed font-body" style={{ textAlign: 'justify' }}>{description}</p>
      </div>
      <a className="text-sm font-bold text-primary flex items-center gap-1 mt-auto">
        {t('En savoir plus')} <Icon i="arrow-right" size={13} />
      </a>
    </div>
  );
}

