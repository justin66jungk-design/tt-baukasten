import { useApp } from '../../context/AppContext'
import { NAV_ITEMS } from './nav'

const SHORT_LABELS = { einstellungen: 'Einst.' }

/* Mobile Tab-Leiste: schwebende Glas-Dock im Tahoe-Stil */
export function BottomNav() {
  const { activeTab, setActiveTab } = useApp()

  return (
    <nav className="lg:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-50 safe-bottom">
      <div className="glass-dock rounded-full flex items-center gap-0.5 px-1.5 py-1.5">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`
                flex flex-col items-center justify-center w-[60px] h-[46px] rounded-full
                transition-colors duration-150
                ${active
                  ? 'bg-[var(--color-table-500)]/90 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.25)]'
                  : 'text-[var(--color-sub)] active:bg-black/[.06]'
                }
              `}
            >
              <Icon size={19} weight={active ? 'fill' : 'regular'} />
              <span className={`text-[9.5px] leading-none mt-0.5 ${active ? 'font-semibold' : 'font-medium'}`}>
                {SHORT_LABELS[id] || label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
