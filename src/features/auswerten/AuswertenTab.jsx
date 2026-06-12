import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { supabase } from '../../lib/supabase'
import { TrainingStats } from './TrainingStats'
import { MatchStats } from './MatchStats'
import { computeMilestones } from '../../lib/statsUtils'
import { Spinner } from '../../components/ui/Spinner'

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
        <Spinner />
      </div>
    )
  }

  return (
    <div className="animate-in">
      <p className="text-[13px] text-[var(--color-muted)] mb-4">
        Trainingsanalyse für {settings.club}
      </p>

      {/* Kennzahl-Chips */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <MetricChip value={trainLog.length}   label="Einheiten"       color="var(--color-table-600)" />
        <MetricChip value={milestoneCount}     label="Freigeschaltet"  color="var(--color-ball-500)"  />
        <MetricChip value={matches.length}     label="Matches"         color="#A855F7"                />
      </div>

      {/* Segmented Control — macOS-Stil */}
      <div className="flex gap-0.5 bg-black/[.06] rounded-[9px] p-[2px] mb-4 max-w-[320px]">
        {SUBTABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 h-[26px] text-[12.5px] font-medium rounded-[7px] transition-all duration-150
              ${activeTab === tab.id
                ? 'bg-white text-[var(--color-ink)] shadow-[0_0_0_0.5px_rgba(0,0,0,.08),0_1px_2.5px_rgba(0,0,0,.12)]'
                : 'text-[var(--color-sub)] hover:text-[var(--color-ink)]'
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
    <div className="flex items-center gap-2 bg-white rounded-[var(--radius-md)] px-3.5 py-2 shadow-[var(--shadow-card)]">
      <span className="text-[20px] font-semibold tabular-nums leading-none" style={{ color }}>{value}</span>
      <span className="text-[11px] text-[var(--color-muted)] font-medium leading-tight">{label}</span>
    </div>
  )
}
