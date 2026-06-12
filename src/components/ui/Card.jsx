export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] border border-[var(--color-border)] ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
