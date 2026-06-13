/* macOS-Gruppenpanel — Glasmaterial */
export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`card-glass rounded-[var(--radius-md)] shadow-[var(--shadow-card)] ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
