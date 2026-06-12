import { MODS, MOD_ICONS, DEFAULT_BUDGETS } from '../../lib/constants'
import { modTotal, byId, phaseWarning } from '../../lib/planUtils'
import { ExerciseCard } from './ExerciseCard'

export function ModuleSection({ mod, plan, settings, onAddClick, onInc, onDec, onUp, onDown, onRemove }) {
  const m       = MODS[mod]
  const budgets = settings?.budgets || DEFAULT_BUDGETS
  const b       = budgets[mod] || 0
  const used    = modTotal(plan.sel, mod)
  const over    = used > b
  const items   = plan.sel[mod] || []

  const warn = mod === 'tt' ? phaseWarning(plan.sel) : null

  return (
    <section className="rounded-[var(--radius-lg)] overflow-hidden border border-[var(--color-border)] bg-white mb-3">
      {/* Modul-Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]"
        style={{ borderLeftWidth: 3, borderLeftColor: m.color, borderLeftStyle: 'solid' }}
      >
        <div className="flex items-center gap-2">
          <span
            className="flex items-center justify-center w-6 h-6"
            style={{ color: m.color }}
            dangerouslySetInnerHTML={{ __html: MOD_ICONS[mod] }}
          />
          <span className="text-[14px] font-bold text-[var(--color-ink)]">{m.name}</span>
        </div>
        <span className={`text-[12px] font-bold tabular-nums px-2 py-0.5 rounded-full ${over ? 'text-red-600 bg-red-50' : 'text-[var(--color-sub)] bg-[var(--color-bg)]'}`}>
          {used} / {b} min
        </span>
      </div>

      {/* Inhalt */}
      <div className="p-3 space-y-2">
        {/* Phasen-Warnung (nur TT) */}
        {warn && (
          <div className="flex gap-2 p-2.5 rounded-[var(--radius-sm)] bg-amber-50 border border-amber-200">
            <span className="text-amber-500 flex-shrink-0">⚠</span>
            <p className="text-[12px] text-amber-800">{warn}</p>
          </div>
        )}

        {/* Leere Liste */}
        {items.length === 0 && (
          <p className="text-[12px] text-[var(--color-muted)] text-center py-2">
            Noch nichts ausgewählt.
          </p>
        )}

        {/* Übungskarten */}
        {items.map((item, idx) => (
          <ExerciseCard
            key={`${item.id}-${idx}`}
            item={item}
            mod={mod}
            idx={idx}
            lastIdx={items.length - 1}
            onInc={()    => onInc(mod, idx)}
            onDec={()    => onDec(mod, idx)}
            onUp={()     => onUp(mod, idx)}
            onDown={()   => onDown(mod, idx)}
            onRemove={()  => onRemove(mod, idx)}
          />
        ))}

        {/* Hinzufügen-Button */}
        <button
          onClick={() => onAddClick(mod)}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-[var(--radius-md)] border-2 border-dashed border-[var(--color-border)] text-[12px] font-semibold text-[var(--color-muted)] hover:border-[var(--color-table-400)] hover:text-[var(--color-table-600)] transition-colors"
        >
          <span className="text-base leading-none">+</span>
          Übung hinzufügen
        </button>
      </div>
    </section>
  )
}
