export default function ChampErreur({ id, message }: { id: string; message: string | null }) {
  if (!message) return null
  return (
    <p id={id} className="mt-1.5 text-sm font-semibold text-error">
      {message}
    </p>
  )
}
