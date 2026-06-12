import { MODS, DEFAULT_BUDGETS } from '../../lib/constants'
import { modTotal, totalUsed, totalBudget, fmtDateLong } from '../../lib/planUtils'

export function PlanenHero({ plan, settings, onDateClick }) {
  const budgets = settings?.budgets || DEFAULT_BUDGETS
  const used    = totalUsed(plan.sel, budgets)
  const budget  = totalBudget(budgets)
  const isOver  = used > budget

  return (
    <div className="rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-elevated)] mb-4">

      {/* ── Green hero area — full bleed, like Strava's activity banner ── */}
      <div
        className="px-5 pt-5 pb-6 relative"
        style={{
          background: 'linear-gradient(135deg, #14532d 0%, #16a34a 60%, #15803d 100%)',
        }}
      >
        {/* Subtle TT table texture — two white lines like service boxes */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" aria-hidden>
          <div className="absolute inset-x-0 top-1/2 h-px bg-white" />
          <div className="absolute inset-y-0 left-1/2 w-px bg-white" />
        </div>

        {/* Date */}
        <button
          onClick={onDateClick}
          className="flex items-center gap-2.5 mb-6 group active:opacity-70 transition-opacity"
        >
          <div className="w-9 h-9 rounded-[var(--radius-md)] bg-white/15 flex items-center justify-center flex-shrink-0 border border-white/20">
            <CalIcon />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[19px] font-bold text-white leading-none tracking-tight">
              {fmtDateLong(plan.date)}
            </p>
            <p className="text-[11px] text-white/60 mt-0.5">Datum ändern</p>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Hero metric */}
        <div className="mb-5">
          <div className={`font-black leading-none tabular-nums tracking-[-3px] text-white ${isOver ? 'opacity-100' : ''}`}
            style={{ fontSize: 'clamp(60px, 20vw, 88px)' }}>
            {used}
            <span className="text-[clamp(28px,8vw,38px)] font-semibold tracking-normal text-white/70 ml-2">min</span>
          </div>
          <p className="text-[13px] text-white/60 mt-2 font-medium">
            {isOver ? 'Budget überschritten! ' : ''}Ziel: {budget} min · {settings?.club || 'TV Bonn-Geislar'}
          </p>
        </div>

        {/* Segment bar on dark green bg */}
        <SegmentBar plan={plan} budgets={budgets} />
      </div>

      {/* ── White info panel below ── */}
      <div className="bg-white px-4 py-4">
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
    <div className="flex h-3 rounded-full overflow-hidden gap-0.5" style={{ background: 'rgba(0,0,0,.25)' }}>
      {segments.map(({ mod, m, segW, fillW, overW }) => (
        <div key={mod} className="relative flex overflow-hidden rounded-sm" style={{ width: `${segW}%` }}>
          <div className="h-full rounded-sm" style={{ width: `${fillW}%`, background: m.color }} />
          {overW > 0 && <div className="h-full bg-red-400" style={{ width: `${overW}%` }} />}
          <div className="flex-1 h-full" style={{ background: 'rgba(255,255,255,.12)' }} />
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
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}
