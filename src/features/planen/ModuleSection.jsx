import { Lightning, PingPong, Barbell, Confetti, Plus, Warning } from '@phosphor-icons/react'
import { MODS, DEFAULT_BUDGETS } from '../../lib/constants'
import { modTotal, phaseWarning } from '../../lib/planUtils'
import { ExerciseCard } from './ExerciseCard'

const MOD_ICON = { warmup: Lightning, tt: PingPong, kraft: Barbell, spiel: Confetti }

export function ModuleSection({ mod, plan, settings, onAddClick, onInc, onDec, onUp, onDown, onRemove }) {
  const m       = MODS[mod]
  const budgets = settings?.budgets || DEFAULT_BUDGETS
  const b       = budgets[mod] || 0
  const used    = modTotal(plan.sel, mod)
  const over    = used > b
  const items   = plan.sel[mod] || []
  const fillPct = b > 0 ? Math.min(100, (used / b) * 100) : 0
  const warn    = mod === 'tt' ? phaseWarning(plan.sel) : null
  const Icon    = MOD_ICON[mod]

  return (
    <section className="bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] overflow-hidden mb-3">

      {/* Gruppenkopf — wie macOS Systemeinstellungen */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Farbige Icon-Kachel */}
        <div
          className="w-[28px] h-[28px] rounded-[7px] flex items-center justify-center flex-shrink-0"
          style={{
            background: m.color,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,.3), 0 0 0 0.5px rgba(0,0,0,.1)',
          }}
        >
          <Icon size={16} weight="fill" color="white" />
        </div>

        <p className="flex-1 text-[13px] font-semibold text-[var(--color-ink)] min-w-0 truncate">{m.name}</p>

        {/* Zeit */}
        <div className={`flex items-baseline gap-0.5 flex-shrink-0 ${over ? 'text-[#e0352b]' : 'text-[var(--color-ink)]'}`}>
          <span className="text-[15px] font-semibold tabular-nums leading-none">{used}</span>
          <span className="text-[12px] text-[var(--color-muted)]">/{b} min</span>
        </div>
      </div>

      {/* Füllbalken */}
      <div className="h-[3px] bg-[var(--color-surface-2)] mx-4 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${fillPct}%`, background: over ? '#e0352b' : m.color }}
        />
      </div>

      {/* Inhalt */}
      <div className="px-4 pt-3 pb-2">
        {warn && (
          <div className="flex items-center gap-2 px-3 py-2 mb-2 rounded-[var(--radius-sm)] bg-[#ff9500]/10">
            <Warning size={14} weight="fill" className="text-[#ff9500] flex-shrink-0" />
            <p className="text-[12px] text-[var(--color-sub)]">{warn}</p>
          </div>
        )}

        {items.length === 0 && (
          <p className="text-[12px] text-[var(--color-muted)] text-center py-2.5">
            Noch nichts ausgewählt.
          </p>
        )}

        <div className="space-y-2">
          {items.map((item, idx) => (
            <ExerciseCard
              key={`${item.id}-${idx}`}
              item={item}
              mod={mod}
              idx={idx}
              lastIdx={items.length - 1}
              onInc={() => onInc(mod, idx)}
              onDec={() => onDec(mod, idx)}
              onUp={() => onUp(mod, idx)}
              onDown={() => onDown(mod, idx)}
              onRemove={() => onRemove(mod, idx)}
            />
          ))}
        </div>
      </div>

      {/* Hinzufügen-Zeile — macOS-Listenstil */}
      <button
        onClick={() => onAddClick(mod)}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium text-[var(--color-table-700)] hover:bg-black/[.03] active:bg-black/[.06] transition-colors border-t-[0.5px] border-[var(--color-border)]"
      >
        <Plus size={14} weight="bold" />
        Übung hinzufügen
      </button>
    </section>
  )
}
