import { useState } from 'react'
import { byId } from '../../lib/planUtils'
import { TT_ZONES } from '../../lib/constants'

export function ExerciseCard({ item, mod, idx, lastIdx, onInc, onDec, onUp, onDown, onRemove }) {
  const [open, setOpen] = useState(false)
  const ex = byId(item.id)
  if (!ex) return null

  const hasDetail = ex.goal || (ex.steps?.length) || ex.run || (ex.coach?.length)

  return (
    <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-md)] overflow-hidden">
      {/* Top-Zeile */}
      <div className="flex items-center gap-2 p-3">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-[var(--color-ink)] leading-snug truncate">{ex.title}</p>
          {ex.theme && (
            <span className="text-[10px] font-medium text-[var(--color-muted)] bg-[var(--color-bg)] px-1.5 py-0.5 rounded-full">
              {ex.theme}
            </span>
          )}
        </div>

        {/* Dauer-Stepper */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onDec}
            className="w-7 h-7 rounded-full bg-[var(--color-bg)] text-[var(--color-sub)] font-bold text-base flex items-center justify-center active:opacity-60 hover:bg-[var(--color-border)] transition-colors"
          >−</button>
          <span className="text-[13px] font-bold w-12 text-center tabular-nums text-[var(--color-ink)]">{item.dur} min</span>
          <button
            onClick={onInc}
            className="w-7 h-7 rounded-full bg-[var(--color-bg)] text-[var(--color-sub)] font-bold text-base flex items-center justify-center active:opacity-60 hover:bg-[var(--color-border)] transition-colors"
          >+</button>
        </div>

        {/* Reihenfolge + Entfernen */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            onClick={onUp}
            disabled={idx === 0}
            className="w-7 h-7 flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-ink)] disabled:opacity-20 transition-colors"
          >↑</button>
          <button
            onClick={onDown}
            disabled={idx === lastIdx}
            className="w-7 h-7 flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-ink)] disabled:opacity-20 transition-colors"
          >↓</button>
          <button
            onClick={onRemove}
            className="w-7 h-7 flex items-center justify-center text-[var(--color-muted)] hover:text-red-500 transition-colors"
          >✕</button>
        </div>
      </div>

      {/* Zonen-Chips (nur TT) */}
      {mod === 'tt' && item.zones?.length > 0 && (
        <div className="flex gap-1 px-3 pb-2 flex-wrap">
          {item.zones.map(z => TT_ZONES[z] && (
            <span key={z} className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[var(--color-table-50)] text-[var(--color-table-700)] border border-[var(--color-table-200)]">
              {TT_ZONES[z].short}
            </span>
          ))}
        </div>
      )}

      {/* Details-Klappbar */}
      {hasDetail && (
        <div className="border-t border-[var(--color-border)]">
          <button
            onClick={() => setOpen(o => !o)}
            className="w-full text-left px-3 py-2 text-[11px] font-semibold text-[var(--color-muted)] hover:text-[var(--color-sub)] flex items-center gap-1 transition-colors"
          >
            <span className={`transition-transform duration-150 ${open ? 'rotate-90' : ''}`}>›</span>
            Details {open ? 'ausblenden' : 'anzeigen'}
          </button>
          {open && (
            <div className="px-3 pb-3 space-y-2 animate-in">
              {ex.goal && <DetailRow label="Ziel" value={ex.goal} />}
              {ex.steps?.length > 0 && (
                <DetailRow label="Ablauf" value={
                  <ol className="list-decimal pl-4 space-y-1">
                    {ex.steps.map((s, i) => <li key={i} className="text-[12px] text-[var(--color-sub)]">{s}</li>)}
                  </ol>
                } />
              )}
              {!ex.steps?.length && ex.run && <DetailRow label="Ablauf" value={ex.run} />}
              {ex.coach?.length > 0 && (
                <DetailRow label="Coaching" value={
                  <ul className="space-y-1">
                    {ex.coach.map((c, i) => <li key={i} className="text-[12px] text-[var(--color-sub)] flex gap-1"><span>→</span><span>{c}</span></li>)}
                  </ul>
                } />
              )}
              {ex.mat && ex.mat !== 'keins' && <DetailRow label="Material" value={ex.mat} />}
              {ex.diff && ex.diff !== '—' && <DetailRow label="Differenzierung" value={ex.diff} />}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="flex gap-2">
      <span className="text-[11px] font-semibold text-[var(--color-muted)] w-24 flex-shrink-0 pt-0.5">{label}</span>
      <div className="flex-1">
        {typeof value === 'string'
          ? <p className="text-[12px] text-[var(--color-sub)]">{value}</p>
          : value
        }
      </div>
    </div>
  )
}
