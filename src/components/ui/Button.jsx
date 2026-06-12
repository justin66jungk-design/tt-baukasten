/* macOS-Push-Buttons: Kapselform, Verlauf, Glanzkante oben */
const variants = {
  primary: `
    text-white font-medium
    bg-gradient-to-b from-[#3ecf63] to-[#28b34e]
    shadow-[inset_0_1px_0_rgba(255,255,255,.3),0_0_0_0.5px_rgba(0,0,0,.08),0_1px_2.5px_rgba(40,179,78,.45)]
    hover:from-[#46d56b] hover:to-[#2cbb53]
    active:from-[#2cab4d] active:to-[#219a43] active:shadow-[inset_0_1px_2px_rgba(0,0,0,.15)]
  `,
  secondary: `
    text-[var(--color-ink)] font-medium bg-white
    shadow-[inset_0_1px_0_rgba(255,255,255,.8),0_0_0_0.5px_rgba(0,0,0,.14),0_1px_2px_rgba(0,0,0,.08)]
    hover:bg-[#f8f8fa] active:bg-[#ececef]
  `,
  ball: `
    text-white font-medium
    bg-gradient-to-b from-[#ffa426] to-[#f78f00]
    shadow-[inset_0_1px_0_rgba(255,255,255,.3),0_0_0_0.5px_rgba(0,0,0,.08),0_1px_2.5px_rgba(255,149,0,.4)]
    hover:from-[#ffae3d] hover:to-[#ff9a0d]
    active:from-[#ef8a00] active:to-[#dd8000] active:shadow-[inset_0_1px_2px_rgba(0,0,0,.15)]
  `,
  ghost: `
    text-[var(--color-sub)] font-medium
    hover:bg-black/[.05] active:bg-black/[.09]
  `,
  outline: `
    text-[var(--color-ink)] font-medium bg-transparent
    shadow-[0_0_0_0.5px_rgba(0,0,0,.18)]
    hover:bg-black/[.04] active:bg-black/[.08]
  `,
  destructive: `
    text-[#e0352b] font-medium bg-white
    shadow-[inset_0_1px_0_rgba(255,255,255,.8),0_0_0_0.5px_rgba(0,0,0,.14),0_1px_2px_rgba(0,0,0,.08)]
    hover:bg-[#fff5f4] active:bg-[#ffe9e7]
  `,
}

const sizes = {
  sm: 'h-[26px] px-3.5 text-[12px]',
  md: 'h-[32px] px-4.5 text-[13px]',
  lg: 'h-[40px] px-6 text-[14px]',
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-1.5 rounded-full whitespace-nowrap
        transition-[background,box-shadow,transform] duration-100
        active:scale-[0.99]
        disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}
