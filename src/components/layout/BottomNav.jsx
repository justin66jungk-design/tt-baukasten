import { useApp } from '../../context/AppContext'

const TABS = [
  { id: 'planen',        label: 'Planen',      icon: PlanIcon },
  { id: 'geplant',       label: 'Geplant',     icon: CalIcon },
  { id: 'auswerten',     label: 'Auswerten',   icon: ChartIcon },
  { id: 'match',         label: 'Match',       icon: MatchIcon },
  { id: 'einstellungen', label: 'Einstellung', icon: SettingsIcon },
]

export function BottomNav() {
  const { activeTab, setActiveTab } = useApp()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom bg-white/90 backdrop-blur-xl border-t border-[var(--color-border)] flex">
      {TABS.map(({ id, label, icon: Icon }) => {
        const active = activeTab === id
        return (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`
              flex-1 flex flex-col items-center justify-center gap-1 py-2.5
              text-[10.5px] font-semibold tracking-wide
              transition-colors duration-150 -webkit-tap-highlight-color-transparent
              ${active ? 'text-[var(--color-table-600)]' : 'text-[var(--color-muted)]'}
            `}
          >
            <Icon active={active} />
            <span>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}

/* ── Icons (inline SVG, kein extra Package nötig) ── */
function PlanIcon({ active }) {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={active ? 'var(--color-table-600)' : 'currentColor'} strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="18" rx="3" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}
function CalIcon({ active }) {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={active ? 'var(--color-table-600)' : 'currentColor'} strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="18" rx="3" />
      <path d="M3 10h18M8 2v4M16 2v4" />
      <circle cx="9" cy="15" r="1" fill="currentColor" />
      <circle cx="15" cy="15" r="1" fill="currentColor" />
    </svg>
  )
}
function ChartIcon({ active }) {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={active ? 'var(--color-table-600)' : 'currentColor'} strokeWidth="1.8">
      <path d="M3 20h18M7 20V10m5 10V6m5 14v-4" />
    </svg>
  )
}
function MatchIcon({ active }) {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={active ? 'var(--color-table-600)' : 'currentColor'} strokeWidth="1.8">
      <ellipse cx="12" cy="12" rx="10" ry="10" />
      <path d="M5 7c3 2 3 6 0 8M19 7c-3 2-3 6 0 8" />
    </svg>
  )
}
function SettingsIcon({ active }) {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={active ? 'var(--color-table-600)' : 'currentColor'} strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}
