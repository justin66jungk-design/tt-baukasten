import { SignOut } from '@phosphor-icons/react'
import { useApp } from '../../context/AppContext'
import { supabase } from '../../lib/supabase'
import { AppIcon } from './AppIcon'
import { NAV_ITEMS } from './nav'

export function Sidebar() {
  const { session, activeTab, setActiveTab } = useApp()

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  return (
    <aside className="hidden lg:flex w-[232px] flex-shrink-0 flex-col px-3 pt-5 pb-4">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-2 mb-6">
        <AppIcon size={36} />
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-[var(--color-ink)] leading-tight tracking-[-0.01em]">
            TT-Baukasten
          </p>
          <p className="text-[11px] text-[var(--color-muted)] leading-tight">TV Bonn-Geislar</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-px">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`
                w-full flex items-center gap-2.5 h-[34px] px-2.5 rounded-[8px]
                text-[13px] transition-colors duration-100
                ${active
                  ? 'bg-[var(--color-table-500)] text-white font-medium shadow-[inset_0_1px_0_rgba(255,255,255,.2)]'
                  : 'text-[var(--color-ink)] font-normal hover:bg-black/[.05] active:bg-black/[.08]'
                }
              `}
            >
              <Icon
                size={17}
                weight={active ? 'fill' : 'regular'}
                className={active ? 'text-white' : 'text-[var(--color-table-600)]'}
              />
              {label}
            </button>
          )
        })}
      </nav>

      <div className="flex-1" />

      {/* Account */}
      {session && (
        <div className="px-1">
          <p className="px-1.5 text-[11px] text-[var(--color-muted)] truncate mb-1">
            {session.user?.email}
          </p>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 h-[32px] px-2.5 rounded-[8px] text-[13px] text-[var(--color-sub)] hover:bg-black/[.05] active:bg-black/[.08] transition-colors"
          >
            <SignOut size={16} />
            Abmelden
          </button>
        </div>
      )}
    </aside>
  )
}
