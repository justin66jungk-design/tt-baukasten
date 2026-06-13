import { useState } from 'react'
import { Plus, Minus, CaretUp, CaretDown, CaretRight, X } from '@phosphor-icons/react'
import { byId } from '../../lib/planUtils'
import { TT_ZONES } from '../../lib/constants'

/* Kleine runde macOS-Steuertaste */
function RoundControl({ children, disabled, danger, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-[24px] h-[24px] rounded-full flex items-center justify-center flex-shrink-0
        bg-white shadow-[inset_0_1px_0_rgba(255,255,255,.8),0_0_0_0.5px_rgba(0,0,0,.14),0_1px_1.5px_rgba(0,0,0,.08)]
        transition-colors disabled:opacity-30 disabled:pointer-events-none
        ${danger
          ? 'text-[var(--color-muted)] hover:text-[#e0352b] hover:bg-[#fff5f4] active:bg-[#ffe9e7]'
          : 'text-[var(--color-sub)] hover:bg-[#f8f8fa] active:bg-[#ececef]'}
      `}
    >
      {children}
    </button>
  )
}

export function ExerciseCard({ item, mod, idx, lastIdx, onInc, onDec, onUp, onDown, onRemove }) {
  const [open, setOpen] = useState(false)
  const ex = byId(item.id)
  if (!ex) return null

  const hasDetail = ex.goal || (ex.steps?.length) || ex.run || (ex.coach?.length)

  return (
    <div className="bg-[var(--color-bg)] rounded-[var(--radius-md)] shadow-[0_0_0_0.5px_rgba(0,0,0,.07)] overflow-hidden">
      {/* Top-Zeile */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-[var(--color-ink)] leading-snug truncate">{ex.title}</p>
          {ex.theme && (
            <span className="text-[10.5px] text-[var(--color-muted)]">{ex.theme}</span>
          )}
        </div>

        {/* Dauer-Stepper */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <RoundControl onClick={onDec}><Minus size={11} weight="bold" /></RoundControl>
          <span className="text-[12px] font-semibold w-[46px] text-center tabular-nums text-[var(--color-ink)]">{item.dur} min</span>
          <RoundControl onClick={onInc}><Plus size={11} weight="bold" /></RoundControl>
        </div>

        {/* Reihenfolge + Entfernen */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <RoundControl onClick={onUp} disabled={idx === 0}><CaretUp size={11} weight="bold" /></RoundControl>
          <RoundControl onClick={onDown} disabled={idx === lastIdx}><CaretDown size={11} weight="bold" /></RoundControl>
          <RoundControl onClick={onRemove} danger><X size={11} weight="bold" /></RoundControl>
        </div>
      </div>

      {/* Zonen-Chips (nur TT) */}
      {mod === 'tt' && item.zones?.length > 0 && (
        <div className="flex gap-1 px-3 pb-2 flex-wrap">
          {item.zones.map(z => TT_ZONES[z] && (
            <span key={z} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--color-table-500)]/12 text-[var(--color-table-800)]">
              {TT_ZONES[z].short}
            </span>
          ))}
        </div>
      )}

      {/* Details-Klappbar */}
      {hasDetail && (
        <div className="border-t-[0.5px] border-[var(--color-border)]">
          <button
            onClick={() => setOpen(o => !o)}
            className="w-full text-left px-3 py-2 text-[11.5px] font-medium text-[var(--color-muted)] hover:text-[var(--color-sub)] flex items-center gap-1 transition-colors"
          >
            <CaretRight size={10} weight="bold" className={`transition-transform duration-150 ${open ? 'rotate-90' : ''}`} />
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
                    {ex.coach.map((c, i) => <li key={i} className="text-[12px] text-[var(--color-sub)] flex gap-1.5"><span className="text-[var(--color-muted)]">–</span><span>{c}</span></li>)}
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
