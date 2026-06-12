import { useMemo } from 'react'
import {
  TT_TOPICS, DEFAULT_TOPIC_TARGETS,
  techCounts, exFrequencies, muscleFrequencies,
  buildLastDoneMap, computeMilestones, fmtDate,
} from '../../lib/statsUtils'
import { MUSCLES } from '../../lib/constants'
import BASE from '../../lib/exercises.json'

const SEASON = 8

export function TrainingStats({ trainLog }) {
  const sorted = useMemo(() => [...trainLog].sort((a, b) => a.date.localeCompare(b.date)), [trainLog])

  const curBlock  = sorted.slice(-SEASON)
  const prevBlock = sorted.slice(-SEASON * 2, -SEASON)

  const curTech  = useMemo(() => techCounts(curBlock),  [curBlock])
  const prevTech = useMemo(() => prevBlock.length ? techCounts(prevBlock) : null, [prevBlock])

  const freq       = useMemo(() => exFrequencies(trainLog),   [trainLog])
  const muscFreq   = useMemo(() => muscleFrequencies(trainLog), [trainLog])
  const lastDone   = useMemo(() => buildLastDoneMap(trainLog), [trainLog])
  const milestones = useMemo(() => computeMilestones(trainLog), [trainLog])

  const topEx = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 8)
  const maxFreq = topEx[0]?.[1] || 1

  if (!trainLog.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-4xl mb-3">📊</div>
        <p className="text-[var(--color-ink)] font-semibold">Noch keine Daten</p>
        <p className="text-sm text-[var(--color-muted)] mt-1">Speichere zuerst ein paar Trainings.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Themen-Bilanz */}
      <StatCard title={`Themen-Bilanz — letzte ${curBlock.length} Einheiten`}>
        <div className="space-y-2">
          {TT_TOPICS.map(t => {
            const cnt    = curTech[t] || 0
            const target = DEFAULT_TOPIC_TARGETS[t] || 3
            const ratio  = cnt / Math.max(target, 1)
            const pct    = Math.min(100, Math.round(ratio * 100))
            const color  = ratio >= 0.75 ? '#10B981' : ratio >= 0.4 ? '#F59E0B' : '#EF4444'
            const prev   = prevTech ? prevTech[t] : null
            const delta  = prev !== null ? cnt - prev : null
            return (
              <div key={t} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                <span className="text-[12px] text-[var(--color-sub)] w-32 flex-shrink-0 truncate">{t}</span>
                {delta !== null && delta !== 0 && (
                  <span className="text-[10px] font-bold" style={{ color: delta > 0 ? '#10B981' : '#EF4444' }}>
                    {delta > 0 ? '+' : ''}{delta}
                  </span>
                )}
                <div className="flex-1 h-1.5 rounded-full bg-[var(--color-border)] overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
                </div>
                <span className="text-[11px] font-bold w-10 text-right tabular-nums" style={{ color }}>
                  {cnt}/{target}
                </span>
              </div>
            )
          })}
        </div>
        <div className="flex gap-3 mt-3 pt-3 border-t border-[var(--color-border)]">
          {[['#10B981','≥75% Soll'], ['#F59E0B','40–74%'], ['#EF4444','<40%']].map(([c, l]) => (
            <span key={l} className="flex items-center gap-1 text-[10px] text-[var(--color-muted)]">
              <span className="w-2 h-2 rounded-full" style={{ background: c }} />{l}
            </span>
          ))}
          {prevBlock.length > 0 && (
            <span className="text-[10px] text-[var(--color-muted)] ml-auto">+/− vs. Vorperiode</span>
          )}
        </div>
      </StatCard>

      {/* Meisttrainierte Übungen */}
      {topEx.length > 0 && (
        <StatCard title="Meisttrainierte Übungen">
          <div className="space-y-2">
            {topEx.map(([id, cnt]) => {
              const ex = BASE.find(e => e.id === id)
              if (!ex) return null
              const last = lastDone[id]
              const barW = Math.round((cnt / maxFreq) * 100)
              return (
                <div key={id}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[12px] font-medium text-[var(--color-sub)] truncate flex-1 mr-2">{ex.title}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {last && <span className="text-[10px] text-[var(--color-muted)]">{fmtDate(last)}</span>}
                      <span className="text-[12px] font-bold text-[var(--color-ink)] tabular-nums">{cnt}×</span>
                    </div>
                  </div>
                  <div className="h-1 rounded-full bg-[var(--color-border)] overflow-hidden">
                    <div className="h-full rounded-full bg-[var(--color-table-500)] transition-all duration-500" style={{ width: `${barW}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </StatCard>
      )}

      {/* Kraft — Muskelgruppen */}
      <StatCard title="Kraft — Muskelgruppen-Abdeckung">
        <div className="space-y-2">
          {MUSCLES.map(m => {
            const cnt   = muscFreq[m] || 0
            const pct   = Math.min(100, Math.round(cnt / Math.max(trainLog.length, 1) * 100))
            const color = pct >= 50 ? '#10B981' : pct >= 25 ? '#F59E0B' : '#EF4444'
            return (
              <div key={m} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                <span className="text-[12px] text-[var(--color-sub)] flex-1">{m}</span>
                <div className="w-24 h-1.5 rounded-full bg-[var(--color-border)] overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
                </div>
                <span className="text-[11px] font-bold w-6 text-right tabular-nums" style={{ color }}>{cnt}×</span>
              </div>
            )
          })}
        </div>
      </StatCard>

      {/* Freigeschaltete Übungen */}
      <StatCard title={`Freigeschaltete Übungen (${milestones.length})`}>
        {milestones.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">Noch keine Übungen freigeschaltet.</p>
        ) : (
          <div className="space-y-2">
            {[...milestones].reverse().slice(0, 8).map(ml => (
              <div key={ml.id} className="flex items-center gap-2">
                <span className="text-[11px] text-[var(--color-muted)] w-12 flex-shrink-0 tabular-nums">{fmtDate(ml.date)}</span>
                <span className="text-[12px] font-medium text-[var(--color-sub)] flex-1 truncate">{ml.title}</span>
                <span className="text-[10px] font-semibold text-[var(--color-table-600)] bg-[var(--color-table-50)] border border-[var(--color-table-200)] px-1.5 py-0.5 rounded-full flex-shrink-0">
                  {ml.prog || 'aufbauend'}
                </span>
              </div>
            ))}
            {milestones.length > 8 && (
              <p className="text-[11px] text-[var(--color-muted)]">+{milestones.length - 8} weitere</p>
            )}
          </div>
        )}
      </StatCard>
    </div>
  )
}

function StatCard({ title, children }) {
  return (
    <div className="bg-white rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-card)] p-4">
      <h3 className="text-[13px] font-bold text-[var(--color-ink)] mb-3">{title}</h3>
      {children}
    </div>
  )
}
