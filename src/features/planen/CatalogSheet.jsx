import { useState, useMemo } from 'react'
import { allEx, isUnlocked, doneCounts } from '../../lib/planUtils'
import { MODS } from '../../lib/constants'

export function CatalogSheet({ mod, plan, trainLog, onAdd, onClose }) {
  const [query, setQuery] = useState('')
  const counts  = useMemo(() => doneCounts(trainLog), [trainLog])
  const selectedIds = new Set(Object.values(plan.sel).flat().map(it => it.id))

  const exercises = useMemo(() => {
    return allEx().filter(e => {
      if (e.mod !== mod) return false
      if (query) {
        const q = query.toLowerCase()
        return e.title.toLowerCase().includes(q) || (e.theme || '').toLowerCase().includes(q)
      }
      return true
    })
  }, [mod, query])

  const unlocked   = exercises.filter(e => isUnlocked(e, counts))
  const locked     = exercises.filter(e => !isUnlocked(e, counts))

  return (
    <div className="fixed inset-0 z-40 flex flex-col" onClick={onClose}>
      {/* Backdrop */}
      <div className="flex-1 bg-black/40" />

      {/* Sheet */}
      <div
        className="bg-white rounded-t-[20px] shadow-[var(--shadow-sheet)] max-h-[80dvh] flex flex-col animate-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[var(--color-border)]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: MODS[mod].color }} />
            <h2 className="text-[15px] font-bold text-[var(--color-ink)]">{MODS[mod].name}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-[var(--color-bg)] text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors"
          >✕</button>
        </div>

        {/* Suche */}
        <div className="px-4 py-2 border-b border-[var(--color-border)]">
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Übung suchen…"
            autoFocus
            className="w-full px-3 py-2 rounded-[var(--radius-md)] bg-[var(--color-bg)] border border-[var(--color-border)] text-[13px] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-table-500)] transition"
          />
        </div>

        {/* Liste */}
        <div className="overflow-y-auto flex-1 px-4 py-2 space-y-1">
          {unlocked.length === 0 && locked.length === 0 && (
            <p className="text-center text-[var(--color-muted)] text-sm py-6">Keine Übungen gefunden.</p>
          )}

          {unlocked.map(ex => (
            <ExRow
              key={ex.id}
              ex={ex}
              selected={selectedIds.has(ex.id)}
              locked={false}
              onAdd={() => { onAdd(mod, ex.id, ex.dur || 10); onClose() }}
            />
          ))}

          {locked.length > 0 && (
            <>
              <div className="pt-3 pb-1">
                <p className="text-[10.5px] font-semibold text-[var(--color-muted)] uppercase tracking-wider">
                  🔒 Noch gesperrt — 2× trainieren zum Freischalten
                </p>
              </div>
              {locked.map(ex => (
                <ExRow key={ex.id} ex={ex} selected={false} locked={true} onAdd={() => {}} />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function ExRow({ ex, selected, locked, onAdd }) {
  return (
    <button
      onClick={locked ? undefined : onAdd}
      disabled={locked || selected}
      className={`
        w-full flex items-center gap-3 p-3 rounded-[var(--radius-md)] text-left transition-colors
        ${locked   ? 'opacity-40 cursor-not-allowed' : ''}
        ${selected ? 'bg-[var(--color-table-50)] border border-[var(--color-table-200)]' : 'hover:bg-[var(--color-bg)] active:bg-[var(--color-border)]'}
      `}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[var(--color-ink)] leading-snug">{ex.title}</p>
        <p className="text-[11px] text-[var(--color-muted)]">
          {ex.theme && <span className="mr-2">{ex.theme}</span>}
          {ex.dur && <span>{ex.dur} min</span>}
          {ex.level && <span className="ml-2">· {ex.level}</span>}
        </p>
      </div>
      {selected
        ? <span className="text-[11px] font-semibold text-[var(--color-table-600)] flex-shrink-0">✓ im Plan</span>
        : locked
          ? <span className="text-[11px] text-[var(--color-muted)] flex-shrink-0">🔒</span>
          : <span className="w-7 h-7 rounded-full bg-[var(--color-table-50)] border border-[var(--color-table-200)] flex items-center justify-center text-[var(--color-table-600)] font-bold flex-shrink-0 text-base">+</span>
      }
    </button>
  )
}
