import { MODS, DEFAULT_BUDGETS } from '../../lib/constants'
import { modTotal, totalUsed, totalBudget, fmtDateLong } from '../../lib/planUtils'

export function PlanenHero({ plan, settings, onDateClick }) {
  const budgets = settings?.budgets || DEFAULT_BUDGETS
  const used    = totalUsed(plan.sel, budgets)
  const budget  = totalBudget(budgets)
  const isOver  = used > budget

  return (
    <div className="bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] border border-[var(--color-border)] p-4 mb-3">
      {/* Datum + Gesamtzeit */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <button
          onClick={onDateClick}
          className="flex items-center gap-2 bg-[var(--color-bg)] rounded-full px-3 py-2 active:opacity-70 transition-opacity"
        >
          <CalIcon />
          <div className="text-left">
            <div className="text-[10px] text-[var(--color-muted)] font-semibold uppercase tracking-wider leading-none mb-0.5">Einheit</div>
            <div className="text-[17px] font-bold tracking-tight text-[var(--color-ink)] leading-none">
              {fmtDateLong(plan.date)}
            </div>
          </div>
        </button>

        <div className="text-right">
          <div className={`text-[52px] font-bold leading-none tracking-tighter tabular-nums ${isOver ? 'text-red-500' : 'text-[var(--color-ink)]'}`}>
            {used}<span className="text-[28px] font-normal text-[var(--color-muted)]">′</span>
          </div>
          <div className="text-[11px] text-[var(--color-muted)] mt-1">
            von {budget}′ · {settings?.club || 'TV Bonn-Geislar'}
          </div>
        </div>
      </div>

      {/* Timeline-Balken */}
      <TimelineBar plan={plan} budgets={budgets} />

      {/* Legende */}
      <TimelineLegend plan={plan} budgets={budgets} />
    </div>
  )
}

function TimelineBar({ plan, budgets }) {
  const tb = totalBudget(budgets)
  const segments = Object.entries(MODS).map(([mod, m]) => {
    const b    = budgets[mod] || 0
    const used = modTotal(plan.sel, mod)
    const over = Math.max(0, used - b)
    const span = Math.max(b + over, 1)
    const segW = (span / Math.max(tb, 1)) * 100
    const fillW = (Math.min(used, b) / span) * 100
    const overW = (over / span) * 100
    return { mod, m, segW, fillW, overW, used, b, over }
  })

  return (
    <div className="flex h-2 rounded-full overflow-hidden bg-[var(--color-border)] mb-3 gap-0.5">
      {segments.map(({ mod, m, segW, fillW, overW }) => (
        <div key={mod} className="relative flex overflow-hidden rounded-sm" style={{ width: `${segW}%` }}>
          <div className="h-full rounded-sm" style={{ width: `${fillW}%`, background: m.color }} />
          {overW > 0 && <div className="h-full bg-red-400" style={{ width: `${overW}%` }} />}
          <div className="flex-1 h-full" />
        </div>
      ))}
    </div>
  )
}

function TimelineLegend({ plan, budgets }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Object.entries(MODS).map(([mod, m]) => {
        const used = modTotal(plan.sel, mod)
        const b    = budgets[mod] || 0
        const over = used > b
        return (
          <div
            key={mod}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)]"
          >
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: m.color }} />
            <span className="text-[11px] font-medium text-[var(--color-sub)]">{m.name}</span>
            <span className={`text-[11px] font-bold font-mono ${over ? 'text-red-500' : 'text-[var(--color-ink)]'}`}>
              {used}/{b}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function CalIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" className="text-[var(--color-muted)] flex-shrink-0">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}
