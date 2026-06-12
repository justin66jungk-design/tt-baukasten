/* macOS-Gruppenpanel (wie Systemeinstellungen) */
export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-white rounded-[var(--radius-md)] shadow-[var(--shadow-card)] ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
