import { useApp } from '../../context/AppContext'
import { supabase } from '../../lib/supabase'

export function TopBar() {
  const { session } = useApp()

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  return (
    <header className="bg-[var(--color-header)] px-4 pt-safe-top">
      <div className="flex items-center justify-between h-14">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <TTMark />
          <div>
            <span className="font-bold text-[16px] tracking-tight text-white leading-none">
              TT<span className="text-[var(--color-table-500)]">·</span>Baukasten
            </span>
            <p className="text-[10px] text-white/40 font-medium mt-0.5 leading-none">
              TV Bonn-Geislar
            </p>
          </div>
        </div>

        {/* Sign out */}
        {session && (
          <button
            onClick={handleSignOut}
            title="Abmelden"
            className="flex items-center gap-1.5 text-[11px] font-semibold text-white/50 hover:text-white/80 transition-colors px-2 py-1.5 rounded-[var(--radius-sm)] hover:bg-white/8"
          >
            <SignOutIcon />
            <span>Abmelden</span>
          </button>
        )}
      </div>
    </header>
  )
}

/* ── TT table mark (Tisch von oben) ── */
function TTMark() {
  return (
    <svg width="28" height="18" viewBox="0 0 28 18" fill="none" aria-hidden="true">
      {/* Table surface */}
      <rect width="28" height="18" rx="3" fill="#16a34a" />
      {/* Center line (net) */}
      <rect x="13" y="0" width="2" height="18" fill="rgba(255,255,255,.25)" />
      {/* Net post */}
      <rect x="12" y="6.5" width="4" height="5" rx="1" fill="white" />
      {/* Service lines */}
      <line x1="0" y1="9" x2="13" y2="9" stroke="rgba(255,255,255,.2)" strokeWidth="0.75" />
      <line x1="15" y1="9" x2="28" y2="9" stroke="rgba(255,255,255,.2)" strokeWidth="0.75" />
    </svg>
  )
}

function SignOutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}
