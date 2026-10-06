type Props = { label: string; exitLabel: string; exitHref: string }

export default function PreviewBanner({ label, exitLabel, exitHref }: Props) {
  return (
    <div role="status" className="bg-gold text-deep text-sm font-semibold px-6 py-2 flex items-center justify-center gap-4">
      <span>{label}</span>
      <a href={exitHref} className="underline">{exitLabel}</a>
    </div>
  )
}
