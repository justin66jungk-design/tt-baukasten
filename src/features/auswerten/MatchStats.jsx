import { useMemo } from 'react'
import { buildMatchKeyStats, isSetOver, fmtDate } from '../../lib/statsUtils'

export function MatchStats({ matches }) {
  if (!matches.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-4xl mb-3">🏓</div>
        <p className="text-[var(--color-ink)] font-semibold">Noch keine Matches</p>
        <p className="text-sm text-[var(--color-muted)] mt-1">Starte ein Match im Match-Tab.</p>
      </div>
    )
  }

  const sorted = useMemo(() => [...matches].sort((a, b) => a.date.localeCompare(b.date)), [matches])
  const wins   = matches.filter(m => m.result?.startsWith(m.playerA?.name)).length
  const losses = matches.length - wins
  const winPct = matches.length > 0 ? Math.round((wins / matches.length) * 100) : 0

  const recent = sorted.slice(-7)
  const lastTen = [...matches].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10)

  return (
    <div className="space-y-3">
      {/* Bilanz */}
      <div className="card-glass rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-4">
        <h3 className="text-[13px] font-bold text-[var(--color-ink)] mb-3">Bilanz</h3>
        <div className="flex items-center gap-4">
          <ScorePill value={wins}   label="Siege"          color="#10B981" />
          <span className="text-[var(--color-muted)] text-2xl font-light">:</span>
          <ScorePill value={losses} label="Niederlagen"    color="#EF4444" />
          <div className="flex-1 text-right">
            <div className="text-2xl font-bold text-[var(--color-ink)] tabular-nums">{winPct}%</div>
            <div className="text-[10px] text-[var(--color-muted)]">Siegquote</div>
          </div>
        </div>
        {/* Bilanz-Bar */}
        <div className="mt-3 h-2 rounded-full overflow-hidden bg-[var(--color-border)]">
          <div className="h-full rounded-full bg-[#10B981] transition-all duration-500" style={{ width: `${winPct}%` }} />
        </div>
      </div>

      {/* Sparkline-Trend */}
      {recent.length >= 2 && <TrendCard matches={recent} />}

      {/* Match-Liste */}
      <div className="card-glass rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-4">
        <h3 className="text-[13px] font-bold text-[var(--color-ink)] mb-3">Letzte Matches</h3>
        <div className="space-y-2">
          {lastTen.map((m, idx) => <MatchRow key={idx} match={m} />)}
        </div>
        {matches.length > 10 && (
          <p className="text-[11px] text-[var(--color-muted)] mt-2">+{matches.length - 10} weitere</p>
        )}
      </div>
    </div>
  )
}

function ScorePill({ value, label, color }) {
  return (
    <div className="text-center">
      <div className="text-[42px] font-bold leading-none tabular-nums" style={{ color }}>{value}</div>
      <div className="text-[10px] text-[var(--color-muted)] mt-0.5">{label}</div>
    </div>
  )
}

function MatchRow({ match }) {
  const ks    = buildMatchKeyStats(match)
  const sA    = match.sets.filter(s => s.score[0] > s.score[1] && isSetOver(s.score[0], s.score[1])).length
  const sB    = match.sets.filter(s => s.score[0] < s.score[1] && isSetOver(s.score[0], s.score[1])).length
  const isWin = match.result?.startsWith(match.playerA?.name)

  function pct(v) { return isNaN(v) ? null : Math.round(v * 100) + '%' }
  function statColor(v, good, ok) {
    if (isNaN(v)) return null
    return v >= good ? '#10B981' : v >= ok ? '#F59E0B' : '#EF4444'
  }

  return (
    <div className="flex items-center gap-3 p-2.5 rounded-[var(--radius-md)] bg-[var(--color-bg)] border border-[var(--color-border)]">
      {/* Ergebnis */}
      <div className={`text-[15px] font-bold tabular-nums flex-shrink-0 w-10 text-center ${isWin ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
        {sA}:{sB}
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-[var(--color-ink)] truncate">
          vs {match.playerB?.name}
          {match.tournament && <span className="font-normal text-[var(--color-muted)]"> · {match.tournament}</span>}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-[10px] text-[var(--color-muted)]">{fmtDate(match.date)}</span>
          {[
            [pct(ks.serveEff), statColor(ks.serveEff, .65, .45), 'AS'],
            [pct(ks.receiveStab), statColor(ks.receiveStab, .65, .45), 'AN'],
            [pct(ks.rallyQual), statColor(ks.rallyQual, .60, .40), 'R'],
          ].filter(([p]) => p).map(([p, c, label]) => (
            <span key={label} className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ color: c, background: `${c}18` }}>
              {label} {p}
            </span>
          ))}
        </div>
      </div>
      <span className="text-[var(--color-muted)] flex-shrink-0">›</span>
    </div>
  )
}

function TrendCard({ matches }) {
  const METRICS = [
    { key: 'serveEff',    label: 'Aufschlag-Eff.', good: .65, ok: .45 },
    { key: 'receiveStab', label: 'Annahme-Stab.',  good: .65, ok: .45 },
    { key: 'rallyQual',   label: 'Rallye-Qual.',   good: .60, ok: .40 },
  ]

  return (
    <div className="card-glass rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-4">
      <h3 className="text-[13px] font-bold text-[var(--color-ink)] mb-3">Kennzahlen-Trend — letzte {matches.length} Matches</h3>
      <div className="space-y-3">
        {METRICS.map(m => {
          const vals = matches.map(match => buildMatchKeyStats(match)[m.key])
          const defined = vals.filter(v => !isNaN(v))
          if (!defined.length) return null
          const last = defined[defined.length - 1]
          const color = last >= m.good ? '#10B981' : last >= m.ok ? '#F59E0B' : '#EF4444'
          return (
            <div key={m.key} className="flex items-center gap-2">
              <span className="text-[11px] text-[var(--color-sub)] w-28 flex-shrink-0">{m.label}</span>
              <Sparkline vals={vals} good={m.good} ok={m.ok} />
              <span className="text-[12px] font-bold w-10 text-right tabular-nums flex-shrink-0" style={{ color }}>
                {Math.round(last * 100)}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Sparkline({ vals, good, ok }) {
  const W = 120, H = 28, PAD = 4
  const defined = vals.filter(v => !isNaN(v))
  if (!defined.length) return <div className="flex-1 h-7" />

  const min = Math.min(...defined, 0)
  const max = Math.max(...defined, 1)
  const toY = v => v === null || isNaN(v) ? null : PAD + (1 - (v - min) / (max - min || 1)) * (H - PAD * 2)
  const toX = i => PAD + (i / ((vals.length - 1) || 1)) * (W - PAD * 2)

  let path = ''
  vals.forEach((v, i) => {
    const y = toY(v)
    if (y === null) return
    path += (path ? 'L' : 'M') + `${toX(i).toFixed(1)},${y.toFixed(1)}`
  })

  const lastI = vals.length - 1 - [...vals].reverse().findIndex(v => v !== null && !isNaN(v))
  const dotY  = toY(vals[lastI])
  const last  = defined[defined.length - 1]
  const dotColor = last >= good ? '#10B981' : last >= ok ? '#F59E0B' : '#EF4444'
  const goodY = toY(good)?.toFixed(1)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="flex-1" style={{ height: H }}>
      {goodY && <line x1={PAD} y1={goodY} x2={W - PAD} y2={goodY} stroke="rgba(16,185,129,.25)" strokeWidth="1" strokeDasharray="3 2" />}
      {path && <path d={path} fill="none" stroke="#A855F7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />}
      {dotY && <circle cx={toX(lastI).toFixed(1)} cy={dotY} r="3.5" fill={dotColor} />}
    </svg>
  )
}
