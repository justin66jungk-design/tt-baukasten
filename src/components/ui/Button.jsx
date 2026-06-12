const variants = {
  primary:   'bg-[var(--color-table-600)] text-white hover:bg-[var(--color-table-700)] active:scale-[0.97]',
  secondary: 'bg-[var(--color-table-50)] text-[var(--color-table-700)] border border-[var(--color-table-200)] hover:bg-[var(--color-table-100)] active:scale-[0.97]',
  ball:      'bg-[var(--color-ball-500)] text-white hover:bg-[var(--color-ball-400)] active:scale-[0.97]',
  ghost:     'text-[var(--color-sub)] hover:text-[var(--color-ink)] hover:bg-[var(--color-border)] active:scale-[0.97]',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-[var(--radius-sm)]',
  md: 'px-4 py-2.5 text-sm rounded-[var(--radius-md)]',
  lg: 'px-5 py-3 text-base rounded-[var(--radius-md)]',
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 font-semibold
        transition-[transform,background-color] duration-150
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}
