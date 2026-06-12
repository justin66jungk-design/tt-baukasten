import { useState, useReducer, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { supabase } from '../../lib/supabase'
import { isSetOver } from '../../lib/statsUtils'
import { today, fmtDate } from '../../lib/planUtils'
import { Button } from '../../components/ui/Button'

// ── Chip definitions ──────────────────────────────────────────────────────────
// server: 'A' = valid when A serves, 'B' = valid when B serves, '*' = always
// winner: which player gets the point
const CHIP_DEF = [
  { id: 'AS+', server: 'A', winner: 'A', stat: { side: 'serve',   point: true  } },
  { id: 'AS-', server: 'A', winner: 'B', stat: { side: 'serve',   point: false } },
  { id: 'AN+', server: 'B', winner: 'A', stat: { side: 'receive', point: true  } },
  { id: 'AN-', server: 'B', winner: 'B', stat: { side: 'receive', point: false } },
  { id: 'R+',  server: '*', winner: 'A', stat: { rally: true,     point: true  } },
  { id: 'R-',  server: '*', winner: 'B', stat: { rally: true,     point: false } },
]

// ── ITTF serve logic ──────────────────────────────────────────────────────────

function firstServerOfSet(setIdx, firstServerSet1) {
  return setIdx % 2 === 0 ? firstServerSet1 : (firstServerSet1 === 'A' ? 'B' : 'A')
}

function currentServer(setIdx, score, firstServerSet1) {
  const [a, b] = score
  const first = firstServerOfSet(setIdx, firstServerSet1)
  const other = first === 'A' ? 'B' : 'A'
  if (a >= 10 && b >= 10) {
    const pointsSinceDeuce = (a - 10) + (b - 10)
    return pointsSinceDeuce % 2 === 0 ? first : other
  }
  return Math.floor((a + b) / 2) % 2 === 0 ? first : other
}

// ── Match reducer ─────────────────────────────────────────────────────────────

function emptySet() {
  return { score: [0, 0], rallies: [], coachNote: '' }
}

const INITIAL = {
  phase: 'setup',
  date: '',
  tournament: '',
  playerA: { profileId: null, name: '' },
  playerB: { name: '' },
  format: 'Bo3',
  firstServerSet1: 'A',
  sets: [emptySet()],
  currentSetIdx: 0,
  pauseNote: '',
  result: null,
}

function countSetWins(sets) {
  let a = 0, b = 0
  sets.forEach(s => {
    if (isSetOver(s.score[0], s.score[1])) {
      if (s.score[0] > s.score[1]) a++; else b++
    }
  })
  return [a, b]
}

function reducer(state, action) {
  switch (action.type) {
    case 'FIELD':
      return { ...state, [action.key]: action.value }
    case 'PLAYER_A':
      return { ...state, playerA: { ...state.playerA, ...action.payload } }
    case 'PLAYER_B':
      return { ...state, playerB: { ...state.playerB, ...action.payload } }
    case 'START':
      return { ...state, phase: 'live', date: action.date }
    case 'ADD_RALLY': {
      const sets = state.sets.map((s, i) => {
        if (i !== state.currentSetIdx) return s
        const newScore = [...s.score]
        if (action.winner === 'A') newScore[0]++; else newScore[1]++
        return { ...s, score: newScore, rallies: [...s.rallies, { winner: action.winner, chip: action.chip }] }
      })
      const cur = sets[state.currentSetIdx]
      if (isSetOver(cur.score[0], cur.score[1])) {
        const maxSets = state.format === 'Bo5' ? 5 : 3
        const setsToWin = Math.ceil(maxSets / 2)
        const [aW, bW] = countSetWins(sets)
        if (aW >= setsToWin || bW >= setsToWin) {
          const winName = aW >= setsToWin ? state.playerA.name : state.playerB.name
          return { ...state, sets, phase: 'finish', result: `${winName} wins ${aW}:${bW}` }
        }
        return { ...state, sets, phase: 'pause', pauseNote: '' }
      }
      return { ...state, sets }
    }
    case 'UNDO': {
      const sets = state.sets.map((s, i) => {
        if (i !== state.currentSetIdx || !s.rallies.length) return s
        const rallies = s.rallies.slice(0, -1)
        const score = rallies.reduce((acc, r) => {
          if (r.winner === 'A') acc[0]++; else acc[1]++
          return acc
        }, [0, 0])
        return { ...s, rallies, score }
      })
      return { ...state, sets }
    }
    case 'PAUSE_NOTE':
      return { ...state, pauseNote: action.note }
    case 'NEXT_SET': {
      const sets = state.sets.map((s, i) =>
        i === state.currentSetIdx ? { ...s, coachNote: state.pauseNote } : s
      )
      return {
        ...state,
        sets: [...sets, emptySet()],
        currentSetIdx: state.currentSetIdx + 1,
        phase: 'live',
        pauseNote: '',
      }
    }
    case 'RESET':
      return { ...INITIAL, date: today() }
    default:
      return state
  }
}

// ── Root component ────────────────────────────────────────────────────────────

export function MatchTab() {
  const { session } = useApp()
  const uid = session?.user?.id

  const [state, dispatch] = useReducer(reducer, { ...INITIAL, date: today() })
  const [profiles, setProfiles] = useState([])
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)

  useEffect(() => {
    if (!uid) return
    supabase.from('players').select('player_id,name').eq('user_id', uid).then(({ data }) => {
      if (data) setProfiles(data.map(r => ({ id: r.player_id, name: r.name })))
    })
  }, [uid])

  async function handleSave() {
    setSaving(true)
    const matchId = 'm_' + Date.now()
    const setsForDb = state.sets
      .filter(s => s.rallies.length > 0)
      .map(s => ({
        score: s.score,
        coachNote: s.coachNote || null,
        chips: s.rallies.map(r => {
          const def = CHIP_DEF.find(c => c.id === r.chip)
          return def ? def.stat : { point: r.winner === 'A' }
        }),
      }))
    await supabase.from('matches').upsert(
      {
        user_id: uid,
        match_id: matchId,
        date: state.date,
        tournament: state.tournament || null,
        player_a: state.playerA,
        player_b: state.playerB,
        format: state.format,
        sets: setsForDb,
        result: state.result,
      },
      { onConflict: 'user_id,match_id' }
    )
    setSaving(false)
    setSaved(true)
  }

  if (state.phase === 'setup')
    return <SetupScreen  state={state} dispatch={dispatch} profiles={profiles} />
  if (state.phase === 'live')
    return <LiveScreen   state={state} dispatch={dispatch} />
  if (state.phase === 'pause')
    return <PauseScreen  state={state} dispatch={dispatch} />
  return     <FinishScreen state={state} dispatch={dispatch} onSave={handleSave} saving={saving} saved={saved} />
}

// ── Setup ─────────────────────────────────────────────────────────────────────

function SetupScreen({ state, dispatch, profiles }) {
  const field = k => v => dispatch({ type: 'FIELD', key: k, value: v })
  const canStart = state.playerA.name.trim() && state.playerB.name.trim()

  return (
    <div className="animate-in space-y-4 pb-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--color-ink)]">Match</h2>
        <p className="text-sm text-[var(--color-muted)] mt-0.5">Neues Match starten</p>
      </div>

      <Card title="Spieler">
        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-[var(--color-sub)] mb-1">Spieler A (du)</label>
            {profiles.length > 0 ? (
              <select
                className={fldCls}
                value={state.playerA.profileId || ''}
                onChange={e => {
                  const p = profiles.find(x => x.id === e.target.value)
                  dispatch({ type: 'PLAYER_A', payload: p ? { profileId: p.id, name: p.name } : { profileId: null, name: '' } })
                }}
              >
                <option value="">— Profil wählen —</option>
                {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            ) : (
              <input
                type="text" className={fldCls} placeholder="Dein Name…"
                value={state.playerA.name}
                onChange={e => dispatch({ type: 'PLAYER_A', payload: { name: e.target.value } })}
              />
            )}
            {profiles.length > 0 && (
              <input
                type="text" className={`${fldCls} mt-2`} placeholder="Oder Namen eingeben…"
                value={state.playerA.profileId ? '' : state.playerA.name}
                onChange={e => dispatch({ type: 'PLAYER_A', payload: { profileId: null, name: e.target.value } })}
              />
            )}
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[var(--color-sub)] mb-1">Spieler B (Gegner)</label>
            <input
              type="text" className={fldCls} placeholder="Name des Gegners…"
              value={state.playerB.name}
              onChange={e => dispatch({ type: 'PLAYER_B', payload: { name: e.target.value } })}
            />
          </div>
        </div>
      </Card>

      <Card title="Einstellungen">
        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-[var(--color-sub)] mb-1">Format</label>
            <ToggleRow
              options={['Bo3', 'Bo5']}
              labels={{ Bo3: 'Best of 3', Bo5: 'Best of 5' }}
              value={state.format}
              onChange={field('format')}
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[var(--color-sub)] mb-1">Erster Aufschlag</label>
            <ToggleRow
              options={['A', 'B']}
              labels={{ A: state.playerA.name || 'Spieler A', B: state.playerB.name || 'Spieler B' }}
              value={state.firstServerSet1}
              onChange={field('firstServerSet1')}
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[var(--color-sub)] mb-1">Turnier (optional)</label>
            <input
              type="text" className={fldCls} placeholder="z. B. Kreismeisterschaft…"
              value={state.tournament}
              onChange={e => field('tournament')(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <Button size="lg" className="w-full" disabled={!canStart}
        onClick={() => dispatch({ type: 'START', date: today() })}>
        Match starten →
      </Button>
    </div>
  )
}

// ── Live ──────────────────────────────────────────────────────────────────────

function LiveScreen({ state, dispatch }) {
  const { sets, currentSetIdx, playerA, playerB, firstServerSet1 } = state
  const curSet = sets[currentSetIdx]
  const [sA, sB] = curSet.score
  const server = currentServer(currentSetIdx, curSet.score, firstServerSet1)
  const [aW, bW] = countSetWins(sets)

  function addChip(chip) {
    const def = CHIP_DEF.find(c => c.id === chip)
    if (def) dispatch({ type: 'ADD_RALLY', winner: def.winner, chip })
  }

  return (
    <div className="animate-in flex flex-col gap-3 pb-4">
      {/* Header row */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[15px] font-bold text-[var(--color-ink)]">Satz {currentSetIdx + 1}</h2>
          <p className="text-[11px] text-[var(--color-muted)]">
            {fmtDate(state.date)}{state.tournament ? ` · ${state.tournament}` : ''}
          </p>
        </div>
        <SetDots aWins={aW} bWins={bW} format={state.format} />
      </div>

      {/* Scoreboard */}
      <div className="bg-white rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-card)] p-5">
        <div className="flex items-center">
          <PlayerScore name={playerA.name} score={sA} isServer={server === 'A'} left />
          <span className="text-[var(--color-border)] text-3xl font-light px-3 flex-shrink-0">:</span>
          <PlayerScore name={playerB.name} score={sB} isServer={server === 'B'} />
        </div>
        <p className="text-center text-[11px] text-[var(--color-muted)] mt-2">
          Aufschlag: <strong className="text-[var(--color-sub)]">
            {server === 'A' ? playerA.name : playerB.name}
          </strong>
        </p>
      </div>

      {/* Chips */}
      <div className="bg-white rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-card)] p-4">
        <p className="text-[11px] font-bold text-[var(--color-sub)] uppercase tracking-wider mb-3">Rallye-Chip</p>
        <div className="grid grid-cols-3 gap-2">
          {CHIP_DEF.map(c => {
            const active = c.server === '*' || c.server === server
            const green  = c.winner === 'A'
            return (
              <button
                key={c.id}
                onClick={() => addChip(c.id)}
                disabled={!active}
                className={`
                  py-3.5 rounded-[var(--radius-md)] text-[16px] font-black border-2 transition-all active:scale-95 select-none
                  ${active
                    ? green
                      ? 'border-[#10B981] text-[#10B981] bg-[rgba(16,185,129,.05)] hover:bg-[rgba(16,185,129,.12)]'
                      : 'border-[#EF4444] text-[#EF4444] bg-[rgba(239,68,68,.05)] hover:bg-[rgba(239,68,68,.12)]'
                    : 'border-[var(--color-border)] text-[var(--color-border)] opacity-30 cursor-not-allowed'
                  }
                `}
              >{c.id}</button>
            )
          })}
        </div>
        <p className="text-[10px] text-[var(--color-muted)] text-center mt-2">
          Grün = +1 {playerA.name} · Rot = +1 {playerB.name}
        </p>
      </div>

      {/* Undo + manual */}
      <div className="flex gap-2">
        <button
          onClick={() => dispatch({ type: 'UNDO' })}
          disabled={!curSet.rallies.length}
          className="px-3 py-3 rounded-[var(--radius-md)] border border-[var(--color-border)] text-[12px] font-semibold text-[var(--color-muted)] hover:text-[var(--color-ink)] disabled:opacity-40 transition-colors"
        >↩</button>
        <button
          onClick={() => dispatch({ type: 'ADD_RALLY', winner: 'A', chip: null })}
          className="flex-1 py-3 rounded-[var(--radius-md)] border-2 border-[#10B981] text-[#10B981] text-[13px] font-bold active:scale-95 transition-all hover:bg-[rgba(16,185,129,.08)]"
        >+1 {playerA.name}</button>
        <button
          onClick={() => dispatch({ type: 'ADD_RALLY', winner: 'B', chip: null })}
          className="flex-1 py-3 rounded-[var(--radius-md)] border-2 border-[#EF4444] text-[#EF4444] text-[13px] font-bold active:scale-95 transition-all hover:bg-[rgba(239,68,68,.08)]"
        >+1 {playerB.name}</button>
      </div>

      {/* Rally trail */}
      {curSet.rallies.length > 0 && (
        <div className="flex gap-1 flex-wrap px-1">
          {curSet.rallies.slice(-20).map((r, i) => (
            <span key={i} className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ color: r.winner === 'A' ? '#10B981' : '#EF4444', background: r.winner === 'A' ? 'rgba(16,185,129,.1)' : 'rgba(239,68,68,.1)' }}>
              {r.chip || (r.winner === 'A' ? '+A' : '+B')}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function PlayerScore({ name, score, isServer, left }) {
  return (
    <div className={`flex-1 flex flex-col ${left ? 'items-start' : 'items-end'}`}>
      <div className={`flex items-center gap-1 ${left ? '' : 'flex-row-reverse'}`}>
        {isServer && <span className="text-[12px]">🏓</span>}
        <span className="text-[12px] font-semibold text-[var(--color-sub)] truncate max-w-[100px]">{name}</span>
      </div>
      <span className="text-[60px] font-black tabular-nums leading-none text-[var(--color-ink)]">{score}</span>
    </div>
  )
}

function SetDots({ aWins, bWins, format }) {
  const total = format === 'Bo5' ? 5 : 3
  return (
    <div className="flex flex-col gap-1 items-end">
      {[[aWins, '#10B981'], [bWins, '#EF4444']].map(([wins, color], row) => (
        <div key={row} className="flex gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-full border"
              style={i < wins ? { background: color, borderColor: color } : { borderColor: 'var(--color-border)' }} />
          ))}
        </div>
      ))}
    </div>
  )
}

// ── Pause ─────────────────────────────────────────────────────────────────────

function PauseScreen({ state, dispatch }) {
  const { sets, currentSetIdx, playerA, playerB } = state
  const s = sets[currentSetIdx]
  const [a, b] = s.score
  const [aW, bW] = countSetWins(sets)

  return (
    <div className="animate-in space-y-4 pb-6">
      <div className="bg-white rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-card)] p-6 text-center">
        <div className="text-[36px] mb-2">🏓</div>
        <h2 className="text-[18px] font-bold text-[var(--color-ink)]">Satz {currentSetIdx + 1} beendet</h2>
        <p className="text-[15px] font-semibold text-[var(--color-sub)] mt-2">
          {playerA.name} {a} : {b} {playerB.name}
        </p>
        <p className="text-[12px] text-[var(--color-muted)] mt-3">
          Satzstand — <strong>{playerA.name}</strong> {aW} : {bW} <strong>{playerB.name}</strong>
        </p>
      </div>

      <Card title="Trainer-Notiz (optional)">
        <textarea
          className={`${fldCls} resize-none`} rows={3}
          placeholder="Beobachtungen für diesen Satz…"
          value={state.pauseNote}
          onChange={e => dispatch({ type: 'PAUSE_NOTE', note: e.target.value })}
        />
      </Card>

      <Button size="lg" className="w-full" onClick={() => dispatch({ type: 'NEXT_SET' })}>
        Nächster Satz →
      </Button>
    </div>
  )
}

// ── Finish ────────────────────────────────────────────────────────────────────

function FinishScreen({ state, dispatch, onSave, saving, saved }) {
  const { sets, playerA, playerB, result } = state
  const [aW, bW] = countSetWins(sets)
  const filledSets = sets.filter(s => s.rallies.length > 0)

  return (
    <div className="animate-in space-y-4 pb-6">
      <div className="bg-white rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-card)] p-6 text-center">
        <div className="text-4xl mb-3">🏆</div>
        <h2 className="text-[20px] font-bold text-[var(--color-ink)]">Match beendet</h2>
        <div className="flex items-center justify-center gap-5 mt-4">
          <div>
            <p className="text-[12px] font-semibold text-[var(--color-sub)]">{playerA.name}</p>
            <p className="text-[56px] font-black leading-none tabular-nums text-[#10B981]">{aW}</p>
          </div>
          <span className="text-[var(--color-muted)] text-2xl font-light pb-4">:</span>
          <div>
            <p className="text-[12px] font-semibold text-[var(--color-sub)]">{playerB.name}</p>
            <p className="text-[56px] font-black leading-none tabular-nums text-[#EF4444]">{bW}</p>
          </div>
        </div>
        <p className="text-[12px] text-[var(--color-muted)] mt-2">{result}</p>
      </div>

      <Card title="Satz-Übersicht">
        <div className="space-y-2">
          {filledSets.map((s, i) => (
            <div key={i} className="flex items-start gap-3 py-1.5 border-b border-[var(--color-border)] last:border-0">
              <span className="text-[11px] font-semibold text-[var(--color-muted)] w-12 flex-shrink-0 pt-0.5">Satz {i + 1}</span>
              <span className="text-[14px] font-bold tabular-nums text-[var(--color-ink)] flex-shrink-0">{s.score[0]}:{s.score[1]}</span>
              <div className="flex gap-0.5 flex-wrap flex-1">
                {s.rallies.map((r, j) => (
                  <span key={j} className="text-[9px] font-bold"
                    style={{ color: r.winner === 'A' ? '#10B981' : '#EF4444' }}>
                    {r.chip || '·'}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="space-y-2">
        {!saved ? (
          <Button size="lg" className="w-full" onClick={onSave} disabled={saving}>
            {saving ? 'Speichert…' : 'Match speichern'}
          </Button>
        ) : (
          <p className="py-3 text-center text-[13px] font-semibold text-[#10B981]">Match gespeichert ✓</p>
        )}
        <Button size="lg" variant="ghost" className="w-full" onClick={() => dispatch({ type: 'RESET' })}>
          Neues Match
        </Button>
      </div>
    </div>
  )
}

// ── Shared UI helpers ─────────────────────────────────────────────────────────

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-card)] p-4">
      <h3 className="text-[13px] font-bold text-[var(--color-ink)] mb-3">{title}</h3>
      {children}
    </div>
  )
}

function ToggleRow({ options, labels, value, onChange }) {
  return (
    <div className="flex gap-2">
      {options.map(o => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`flex-1 py-2.5 text-[13px] font-semibold rounded-[var(--radius-md)] border-2 transition-colors ${
            value === o
              ? 'border-[var(--color-table-500)] bg-[var(--color-table-50)] text-[var(--color-table-700)]'
              : 'border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-sub)]'
          }`}
        >
          {labels[o]}
        </button>
      ))}
    </div>
  )
}

const fldCls = 'w-full px-3 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-[13px] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-table-500)] transition'
