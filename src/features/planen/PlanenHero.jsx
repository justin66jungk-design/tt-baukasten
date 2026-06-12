import { MODS, DEFAULT_BUDGETS } from '../../lib/constants'
import { modTotal, totalUsed, totalBudget, fmtDateLong } from '../../lib/planUtils'

export function PlanenHero({ plan, settings, onDateClick }) {
  const budgets = settings?.budgets || DEFAULT_BUDGETS
  const used    = totalUsed(plan.sel, budgets)
  const budget  = totalBudget(budgets)
  const isOver  = used > budget

  return (
    <div className="rounded-[var(--radius-lg)] overflow-hidden bg-white shadow-[var(--shadow-elevated)] mb-4">

      {/* TT table top accent — evokes the green playing surface */}
      <div className="h-1.5 bg-[var(--color-table-600)]" />

      <div className="p-4">
        {/* Date — tappable */}
        <button
          onClick={onDateClick}
          className="flex items-center gap-3 mb-5 w-full text-left active:opacity-70 transition-opacity"
        >
          <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-table-50)] border border-[var(--color-table-200)] flex items-center justify-center flex-shrink-0">
            <CalIcon />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[20px] font-bold text-[var(--color-ink)] tracking-tight leading-none">
              {fmtDateLong(plan.date)}
            </p>
            <p className="text-[11px] text-[var(--color-muted)] mt-0.5">Datum tippen zum Ändern</p>
          </div>
          <ChevronIcon />
        </button>

        {/* Hero metric — big like Strava's distance */}
        <div className="mb-5">
          <div className={`font-black leading-none tabular-nums tracking-[-3px] ${isOver ? 'text-red-500' : 'text-[var(--color-ink)]'}`}
            style={{ fontSize: 'clamp(56px, 18vw, 80px)' }}>
            {used}
            <span className="text-[clamp(28px,8vw,36px)] font-semibold tracking-normal text-[var(--color-muted)] ml-2">min</span>
          </div>
          <p className="text-[13px] text-[var(--color-muted)] mt-2 font-medium">
            Ziel: {budget} min · {settings?.club || 'TV Bonn-Geislar'}
          </p>
        </div>

        {/* Segment bar — thick like Strava segments */}
        <SegmentBar plan={plan} budgets={budgets} />
      </div>

      {/* TT net divider — subtle table tennis element */}
      <div className="tt-net mx-4 mb-4" />

      {/* Module breakdown grid */}
      <div className="px-4 pb-4">
        <ModuleLegend plan={plan} budgets={budgets} />
      </div>
    </div>
  )
}

function SegmentBar({ plan, budgets }) {
  const tb = totalBudget(budgets)
  const segments = Object.entries(MODS).map(([mod, m]) => {
    const b     = budgets[mod] || 0
    const used  = modTotal(plan.sel, mod)
    const over  = Math.max(0, used - b)
    const span  = Math.max(b + over, 1)
    const segW  = (span / Math.max(tb, 1)) * 100
    const fillW = (Math.min(used, b) / span) * 100
    const overW = (over / span) * 100
    return { mod, m, segW, fillW, overW }
  })

  return (
    <div className="flex h-4 rounded-full overflow-hidden gap-0.5 mb-3" style={{ background: 'var(--color-bg)' }}>
      {segments.map(({ mod, m, segW, fillW, overW }) => (
        <div key={mod} className="relative flex overflow-hidden rounded-sm" style={{ width: `${segW}%` }}>
          <div className="h-full rounded-sm" style={{ width: `${fillW}%`, background: m.color }} />
          {overW > 0 && <div className="h-full bg-red-400" style={{ width: `${overW}%` }} />}
          <div className="flex-1 h-full bg-[var(--color-border)]" />
        </div>
      ))}
    </div>
  )
}

function ModuleLegend({ plan, budgets }) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
      {Object.entries(MODS).map(([mod, m]) => {
        const used = modTotal(plan.sel, mod)
        const b    = budgets[mod] || 0
        const over = used > b
        return (
          <div key={mod} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: m.color }} />
            <span className="text-[12px] text-[var(--color-sub)] flex-1 truncate font-medium">{m.name}</span>
            <span className={`text-[12px] font-bold tabular-nums flex-shrink-0 ${over ? 'text-red-500' : 'text-[var(--color-ink)]'}`}>
              {used}<span className="text-[var(--color-muted)] font-normal">/{b}</span>
            </span>
          </div>
        )
      })}
    </div>
  )
}

function CalIcon() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-table-600)]">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-table-500)] flex-shrink-0">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}
