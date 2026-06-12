import { useApp } from '../../context/AppContext'

const TABS = [
  { id: 'planen',        label: 'Planen',    icon: PlanIcon    },
  { id: 'geplant',       label: 'Geplant',   icon: CalIcon     },
  { id: 'auswerten',     label: 'Auswerten', icon: ChartIcon   },
  { id: 'match',         label: 'Match',     icon: MatchIcon   },
  { id: 'einstellungen', label: 'Einst.',    icon: SettingsIcon},
]

export function BottomNav() {
  const { activeTab, setActiveTab } = useApp()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom bg-[var(--color-surface)] border-t border-[var(--color-border)] shadow-[0_-1px_0_rgba(0,0,0,.04),0_-4px_16px_rgba(0,0,0,.06)] flex items-end px-1 pb-1 pt-1.5">
      {TABS.map(({ id, label, icon: Icon }) => {
        const active = activeTab === id
        return (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className="flex-1 flex flex-col items-center gap-0.5 transition-opacity active:opacity-70"
          >
            <div className={`
              flex items-center justify-center rounded-[10px] transition-all duration-200
              ${active
                ? 'bg-[var(--color-table-600)] w-12 h-7 shadow-[0_2px_8px_rgba(22,163,74,.35)]'
                : 'w-12 h-7'
              }
            `}>
              <Icon active={active} />
            </div>
            <span className={`
              text-[10px] font-semibold tracking-wide transition-colors duration-150 leading-none mb-0.5
              ${active ? 'text-[var(--color-table-700)]' : 'text-[var(--color-muted)]'}
            `}>
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

/* ── Icons ── */
const iconProps = (active) => ({
  width: 18,
  height: 18,
  fill: 'none',
  viewBox: '0 0 24 24',
  stroke: active ? 'white' : 'currentColor',
  strokeWidth: '2',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
})

function PlanIcon({ active }) {
  return (
    <svg {...iconProps(active)}>
      <rect x="3" y="4" width="18" height="18" rx="3" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <path d="M8 14h4M8 18h8" />
    </svg>
  )
}
function CalIcon({ active }) {
  return (
    <svg {...iconProps(active)}>
      <rect x="3" y="4" width="18" height="18" rx="3" />
      <path d="M3 10h18M8 2v4M16 2v4" />
      <path d="M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h.01" />
    </svg>
  )
}
function ChartIcon({ active }) {
  return (
    <svg {...iconProps(active)}>
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  )
}
function MatchIcon({ active }) {
  return (
    <svg {...iconProps(active)}>
      <circle cx="12" cy="12" r="10" />
      <path d="M6.3 6.3c3.5 3.5 3.5 8 0 11.4M17.7 6.3c-3.5 3.5-3.5 8 0 11.4" />
      <path d="M2 12h20" />
    </svg>
  )
}
function SettingsIcon({ active }) {
  return (
    <svg {...iconProps(active)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v4M12 19v4M4.2 4.2l2.8 2.8M17 17l2.8 2.8M1 12h4M19 12h4M4.2 19.8l2.8-2.8M17 7l2.8-2.8" />
    </svg>
  )
}
