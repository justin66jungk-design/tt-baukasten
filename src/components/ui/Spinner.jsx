export function Spinner({ light = false, className = '' }) {
  return (
    <div
      className={`spinner ${className}`}
      style={light ? { borderColor: 'rgba(255,255,255,.25)', borderTopColor: 'rgba(255,255,255,.85)' } : undefined}
      role="status"
      aria-label="Lädt"
    />
  )
}
