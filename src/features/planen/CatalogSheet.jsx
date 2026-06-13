import { useState, useMemo } from 'react'
import { MagnifyingGlass, X, Plus, LockSimple, Check } from '@phosphor-icons/react'
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

  const unlocked = exercises.filter(e => isUnlocked(e, counts))
  const locked   = exercises.filter(e => !isUnlocked(e, counts))

  return (
    <div
      className="fixed inset-0 z-40 flex items-end lg:items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Sheet / Modal */}
      <div
        className="glass-modal relative w-full max-h-[82dvh] rounded-t-[18px] flex flex-col animate-modal
          shadow-[var(--shadow-modal)]
          lg:max-w-[580px] lg:max-h-[72vh] lg:rounded-[16px]"
        onClick={e => e.stopPropagation()}
      >
        {/* Griff (nur Mobile) */}
        <div className="flex justify-center pt-2.5 pb-0.5 lg:hidden">
          <div className="w-9 h-[5px] rounded-full bg-black/15" />
        </div>

        {/* Titelzeile */}
        <div className="flex items-center justify-between px-4 lg:px-5 py-3 hairline-b">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: MODS[mod].color }} />
            <h2 className="text-[14px] font-semibold text-[var(--color-ink)]">{MODS[mod].name}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-[22px] h-[22px] flex items-center justify-center rounded-full bg-black/[.07] text-[var(--color-sub)] hover:bg-black/[.12] active:bg-black/[.16] transition-colors"
            title="Schließen"
          >
            <X size={11} weight="bold" />
          </button>
        </div>

        {/* Suche — macOS-Suchfeld */}
        <div className="px-4 lg:px-5 py-2.5 hairline-b">
          <div className="relative">
            <MagnifyingGlass size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Suchen"
              autoFocus
              className="w-full h-[30px] pl-8 pr-3 rounded-[8px] bg-black/[.06] text-[13px] text-[var(--color-ink)]
                placeholder:text-[var(--color-muted)]
                focus:outline-none focus:ring-[3px] focus:ring-[var(--color-table-500)]/40 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Liste */}
        <div className="overflow-y-auto flex-1 px-3 lg:px-4 py-2">
          {unlocked.length === 0 && locked.length === 0 && (
            <p className="text-center text-[var(--color-muted)] text-[13px] py-8">Keine Übungen gefunden.</p>
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
              <div className="flex items-center gap-1.5 pt-4 pb-1.5 px-2">
                <LockSimple size={11} weight="fill" className="text-[var(--color-muted)]" />
                <p className="text-[10.5px] font-semibold text-[var(--color-muted)] uppercase tracking-wider">
                  Noch gesperrt — 2× trainieren zum Freischalten
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
        w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-left transition-colors
        ${locked   ? 'opacity-40 cursor-not-allowed' : ''}
        ${selected ? '' : 'hover:bg-black/[.05] active:bg-black/[.08]'}
      `}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-[var(--color-ink)] leading-snug">{ex.title}</p>
        <p className="text-[11px] text-[var(--color-muted)]">
          {ex.theme && <span className="mr-2">{ex.theme}</span>}
          {ex.dur && <span>{ex.dur} min</span>}
          {ex.level && <span className="ml-2">· {ex.level}</span>}
        </p>
      </div>
      {selected
        ? <span className="flex items-center gap-1 text-[11px] font-semibold text-[var(--color-table-700)] flex-shrink-0">
            <Check size={11} weight="bold" /> im Plan
          </span>
        : locked
          ? <LockSimple size={13} className="text-[var(--color-muted)] flex-shrink-0" />
          : <span className="w-[22px] h-[22px] rounded-full bg-[var(--color-table-500)]/12 flex items-center justify-center text-[var(--color-table-700)] flex-shrink-0">
              <Plus size={11} weight="bold" />
            </span>
      }
    </button>
  )
}
