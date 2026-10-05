export const displayName = 'Gold Divider';
export const shortDescription = 'Séparateur décoratif doré fin';

export default function GoldDivider({ className = '' }) {
  return (
    <div className={`w-16 h-0.5 bg-secondary ${className}`}></div>
  );
}

