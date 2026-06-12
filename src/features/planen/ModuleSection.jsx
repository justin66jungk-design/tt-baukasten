import { MODS, MOD_ICONS, DEFAULT_BUDGETS } from '../../lib/constants'
import { modTotal, phaseWarning } from '../../lib/planUtils'
import { ExerciseCard } from './ExerciseCard'

export function ModuleSection({ mod, plan, settings, onAddClick, onInc, onDec, onUp, onDown, onRemove }) {
  const m       = MODS[mod]
  const budgets = settings?.budgets || DEFAULT_BUDGETS
  const b       = budgets[mod] || 0
  const used    = modTotal(plan.sel, mod)
  const over    = used > b
  const items   = plan.sel[mod] || []
  const fillPct = b > 0 ? Math.min(100, (used / b) * 100) : 0
  const warn    = mod === 'tt' ? phaseWarning(plan.sel) : null

  // White icon on colored badge
  const iconHtml = MOD_ICONS[mod]
    .replace(/stroke="currentColor"/g, 'stroke="white"')
    .replace(/fill="currentColor"/g, 'fill="white"')
    .replace('width="16"', 'width="18"')
    .replace('height="16"', 'height="18"')

  return (
    <section className="rounded-[var(--radius-lg)] overflow-hidden bg-white shadow-[var(--shadow-card)] mb-3">

      {/* Module header */}
      <div className="flex items-center gap-3 px-4 py-4">
        {/* Colored icon badge */}
        <div
          className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0"
          style={{ background: m.color }}
          dangerouslySetInnerHTML={{ __html: iconHtml }}
        />

        {/* Name */}
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold text-[var(--color-ink)] leading-tight">{m.name}</p>
        </div>

        {/* Time badge */}
        <div className={`flex items-baseline gap-0.5 flex-shrink-0 ${over ? 'text-red-600' : 'text-[var(--color-ink)]'}`}>
          <span className="text-[20px] font-black tabular-nums leading-none">{used}</span>
          <span className="text-[12px] text-[var(--color-muted)] font-medium">/{b}′</span>
        </div>
      </div>

      {/* Per-module fill bar */}
      <div className="h-0.5 bg-[var(--color-border)]">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${fillPct}%`, background: over ? '#ef4444' : m.color }}
        />
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {warn && (
          <div className="flex gap-2 p-2.5 rounded-[var(--radius-sm)] bg-amber-50 border border-amber-200">
            <span className="text-amber-500 flex-shrink-0 text-[15px]">⚠</span>
            <p className="text-[12px] text-amber-800">{warn}</p>
          </div>
        )}

        {items.length === 0 && (
          <p className="text-[12px] text-[var(--color-muted)] text-center py-3">
            Noch nichts ausgewählt.
          </p>
        )}

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

        {/* Add button — module-color-tinted dashed border */}
        <button
          onClick={() => onAddClick(mod)}
          className="w-full flex items-center justify-center gap-1.5 py-3 rounded-[var(--radius-md)] border-2 border-dashed text-[13px] font-semibold transition-all active:opacity-70"
          style={{ borderColor: `${m.color}50`, color: m.color }}
        >
          <span className="text-[16px] leading-none font-bold">+</span>
          Übung hinzufügen
        </button>
      </div>
    </section>
  )
}
