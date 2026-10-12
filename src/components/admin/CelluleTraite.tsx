import './cellule-traite.css'

/** Colonne « Traité » de la liste des messages : pastille verte « Traité » ou ambre « À traiter » (la ligne entière est teintée, voir le CSS). */
export default function CelluleTraite({ cellData }: { cellData?: unknown }) {
  const traite = cellData === true
  return (
    <span className={`cellule-traite ${traite ? 'cellule-traite--oui' : 'cellule-traite--non'}`} data-traite={traite ? 'oui' : 'non'}>
      <span className="cellule-traite-point" aria-hidden="true" />
      {traite ? 'Traité' : 'À traiter'}
    </span>
  )
}
