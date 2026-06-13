import { SignOut } from '@phosphor-icons/react'
import { useApp } from '../../context/AppContext'
import { supabase } from '../../lib/supabase'
import { AppIcon } from './AppIcon'
import { NAV_ITEMS } from './nav'

export function Toolbar() {
  const { session, activeTab } = useApp()
  const title = NAV_ITEMS.find(t => t.id === activeTab)?.label || 'TT-Baukasten'

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  return (
    <header className="flex items-center h-[52px] px-4 lg:px-7 hairline-b flex-shrink-0">
      {/* Mobile: Brand statt Tab-Titel */}
      <div className="flex items-center gap-2.5 lg:hidden">
        <AppIcon size={28} />
        <span className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--color-ink)]">
          {title}
        </span>
      </div>

      {/* Desktop: Fenstertitel */}
      <h1 className="hidden lg:block text-[16px] font-semibold tracking-[-0.01em] text-[var(--color-ink)]">
        {title}
      </h1>

      <div className="flex-1" />

      {/* Mobile: Abmelden (Desktop hat das in der Sidebar) */}
      {session && (
        <button
          onClick={handleSignOut}
          title="Abmelden"
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-full text-[var(--color-sub)] hover:bg-black/[.05] active:bg-black/[.08] transition-colors"
        >
          <SignOut size={17} />
        </button>
      )}
    </header>
  )
}
