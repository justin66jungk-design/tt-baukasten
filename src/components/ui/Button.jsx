const variants = {
  primary:   'bg-[var(--color-table-600)] text-white shadow-[0_1px_4px_rgba(22,163,74,.35)] hover:bg-[var(--color-table-700)] active:scale-[0.97] active:shadow-none',
  secondary: 'bg-[var(--color-table-50)] text-[var(--color-table-700)] border border-[var(--color-table-200)] hover:bg-[var(--color-table-100)] active:scale-[0.97]',
  ball:      'bg-[var(--color-ball-500)] text-white shadow-[0_1px_4px_rgba(249,115,22,.3)] hover:bg-[var(--color-ball-400)] active:scale-[0.97] active:shadow-none',
  ghost:     'text-[var(--color-sub)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] active:scale-[0.97]',
  outline:   'bg-transparent text-[var(--color-ink)] border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] active:scale-[0.97]',
}

const sizes = {
  sm: 'px-3 py-1.5 text-[12px] rounded-[var(--radius-sm)]',
  md: 'px-4 py-2.5 text-[13px] rounded-[var(--radius-md)]',
  lg: 'px-5 py-3 text-[15px] rounded-[var(--radius-md)]',
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 font-semibold
        transition-[transform,background-color,box-shadow] duration-150
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}
