import { useApp } from '../../context/AppContext'
import { supabase } from '../../lib/supabase'

export function TopBar() {
  const { session } = useApp()

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  return (
    <header className="flex items-center justify-between px-4 pt-4 pb-2">
      {/* Brand */}
      <div>
        <div className="flex items-center gap-2">
          {/* TT-Ball als Logo-Akzent */}
          <span className="text-xl">🏓</span>
          <span className="font-bold text-[17px] tracking-tight text-[var(--color-ink)]">
            TT<span className="text-[var(--color-table-600)]">·</span>Baukasten
          </span>
        </div>
        <p className="text-[11px] text-[var(--color-muted)] font-medium mt-0.5 pl-7">
          TV Bonn-Geislar · Jugendtraining
        </p>
      </div>

      {/* Aktionen */}
      {session && (
        <button
          onClick={handleSignOut}
          className="text-[11px] font-semibold text-[var(--color-muted)] bg-white border border-[var(--color-border)] rounded-full px-3 py-1.5 hover:text-[var(--color-ink)] transition-colors"
          title="Abmelden"
        >
          Abmelden
        </button>
      )}
    </header>
  )
}
