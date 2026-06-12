import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { supabase } from '../../lib/supabase'
import { TrainingStats } from './TrainingStats'
import { MatchStats } from './MatchStats'
import { computeMilestones } from '../../lib/statsUtils'

const SUBTABS = [
  { id: 'training', label: 'Training' },
  { id: 'matches',  label: 'Matches'  },
]

export function AuswertenTab() {
  const { session } = useApp()
  const uid = session?.user?.id

  const [activeTab, setActiveTab] = useState('training')
  const [trainLog,  setTrainLog]  = useState([])
  const [matches,   setMatches]   = useState([])
  const [settings,  setSettings]  = useState({ club: 'TV Bonn-Geislar' })
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    if (!uid) return
    async function load() {
      setLoading(true)
      const [hRes, mRes, sRes] = await Promise.all([
        supabase.from('training_sessions').select('*').eq('user_id', uid).order('date', { ascending: false }),
        supabase.from('matches').select('*').eq('user_id', uid).order('date', { ascending: false }),
        supabase.from('settings').select('data').eq('user_id', uid).maybeSingle(),
      ])
      if (hRes.data) {
        setTrainLog(hRes.data.map(r => ({
          date: r.date, sel: r.sel, note: r.note || '', count: r.count,
        })))
      }
      if (mRes.data) {
        setMatches(mRes.data.map(r => ({
          id: r.match_id, date: r.date, tournament: r.tournament,
          playerA: r.player_a, playerB: r.player_b,
          format: r.format, sets: r.sets, result: r.result,
        })))
      }
      if (sRes.data?.data) setSettings(s => ({ ...s, ...sRes.data.data }))
      setLoading(false)
    }
    load()
  }, [uid])

  const milestoneCount = computeMilestones(trainLog).length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-2xl animate-spin">🏓</div>
      </div>
    )
  }

  return (
    <div className="animate-in">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--color-ink)]">Auswerten</h2>
        <p className="text-sm text-[var(--color-muted)] mt-0.5">
          Trainingsanalyse für {settings.club}
        </p>
      </div>

      {/* Kennzahl-Chips */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <MetricChip value={trainLog.length}   label="Einheiten"       color="var(--color-table-600)" />
        <MetricChip value={milestoneCount}     label="Freigeschaltet"  color="var(--color-ball-500)"  />
        <MetricChip value={matches.length}     label="Matches"         color="#A855F7"                />
      </div>

      {/* Sub-Tab-Navigation */}
      <div className="flex gap-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-1 mb-4">
        {SUBTABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 py-2 text-[13px] font-semibold rounded-[var(--radius-sm)] transition-all duration-150
              ${activeTab === tab.id
                ? 'bg-white text-[var(--color-ink)] shadow-[var(--shadow-card)]'
                : 'text-[var(--color-muted)] hover:text-[var(--color-sub)]'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Inhalt */}
      {activeTab === 'training'
        ? <TrainingStats trainLog={trainLog} />
        : <MatchStats matches={matches} />
      }
    </div>
  )
}

function MetricChip({ value, label, color }) {
  return (
    <div className="flex items-center gap-2 bg-white border border-[var(--color-border)] rounded-[var(--radius-md)] px-3 py-2 shadow-[var(--shadow-card)]">
      <span className="text-[22px] font-bold tabular-nums leading-none" style={{ color }}>{value}</span>
      <span className="text-[11px] text-[var(--color-muted)] font-medium leading-tight">{label}</span>
    </div>
  )
}
