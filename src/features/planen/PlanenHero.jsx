import { CalendarBlank, CaretDown } from '@phosphor-icons/react'
import { MODS, DEFAULT_BUDGETS } from '../../lib/constants'
import { modTotal, totalUsed, totalBudget, fmtDateLong } from '../../lib/planUtils'

export function PlanenHero({ plan, settings, onDateClick }) {
  const budgets = settings?.budgets || DEFAULT_BUDGETS
  const used    = totalUsed(plan.sel, budgets)
  const budget  = totalBudget(budgets)
  const isOver  = used > budget

  return (
    <div className="card-glass rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] overflow-hidden">

      {/* Kopfzeile: Titel + Datums-Button */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <p className="text-[13px] font-semibold text-[var(--color-ink)]">Trainingszeit</p>
        <button
          onClick={onDateClick}
          className="flex items-center gap-1.5 h-[26px] pl-2.5 pr-2 rounded-full bg-white text-[12px] font-medium text-[var(--color-ink)]
            shadow-[inset_0_1px_0_rgba(255,255,255,.8),0_0_0_0.5px_rgba(0,0,0,.14),0_1px_2px_rgba(0,0,0,.08)]
            hover:bg-[#f8f8fa] active:bg-[#ececef] transition-colors"
        >
          <CalendarBlank size={13} className="text-[var(--color-table-600)]" />
          {fmtDateLong(plan.date)}
          <CaretDown size={10} className="text-[var(--color-muted)]" />
        </button>
      </div>

      {/* Kennzahl */}
      <div className="px-5 pb-4">
        <div className="flex items-baseline gap-2">
          <span className={`text-[44px] font-semibold tabular-nums leading-none tracking-[-0.02em] ${isOver ? 'text-[#e0352b]' : 'text-[var(--color-ink)]'}`}>
            {used}
          </span>
          <span className="text-[17px] text-[var(--color-muted)] font-medium">/ {budget} min</span>
          {isOver && (
            <span className="text-[11px] font-semibold text-[#e0352b] bg-[#e0352b]/10 px-2 py-0.5 rounded-full">
              Budget überschritten
            </span>
          )}
        </div>
        <p className="text-[12px] text-[var(--color-muted)] mt-1">{settings?.club || 'TV Bonn-Geislar'}</p>
      </div>

      {/* Segmentbalken */}
      <div className="px-5 pb-4">
        <SegmentBar plan={plan} budgets={budgets} />
      </div>

      {/* Legende */}
      <div className="hairline-b mx-5" style={{ borderTopWidth: 0 }} />
      <div className="px-5 py-3.5">
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
    <div className="flex h-[7px] rounded-full overflow-hidden gap-px bg-[var(--color-surface-2)]">
      {segments.map(({ mod, m, segW, fillW, overW }) => (
        <div key={mod} className="relative flex overflow-hidden first:rounded-l-full last:rounded-r-full" style={{ width: `${segW}%` }}>
          <div className="h-full" style={{ width: `${fillW}%`, background: m.color }} />
          {overW > 0 && <div className="h-full bg-[#e0352b]" style={{ width: `${overW}%` }} />}
          <div className="flex-1 h-full" />
        </div>
      ))}
    </div>
  )
}

function ModuleLegend({ plan, budgets }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2">
      {Object.entries(MODS).map(([mod, m]) => {
        const used = modTotal(plan.sel, mod)
        const b    = budgets[mod] || 0
        const over = used > b
        return (
          <div key={mod} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: m.color }} />
            <span className="text-[12px] text-[var(--color-sub)] flex-1 truncate">{m.name}</span>
            <span className={`text-[12px] font-semibold tabular-nums flex-shrink-0 ${over ? 'text-[#e0352b]' : 'text-[var(--color-ink)]'}`}>
              {used}<span className="text-[var(--color-muted)] font-normal">/{b}</span>
            </span>
          </div>
        )
      })}
    </div>
  )
}
