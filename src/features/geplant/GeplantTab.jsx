import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { supabase } from '../../lib/supabase'
import { MODS } from '../../lib/constants'
import { byId, fmtDate, today } from '../../lib/planUtils'
import { Button } from '../../components/ui/Button'

export function GeplantTab() {
  const { session } = useApp()
  const uid = session?.user?.id

  const [drafts,  setDrafts]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) return
    load()
  }, [uid])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('plan_drafts')
      .select('*')
      .eq('user_id', uid)
      .order('date', { ascending: true })
    setDrafts(data || [])
    setLoading(false)
  }

  async function handleDelete(id) {
    await supabase.from('plan_drafts').delete().eq('id', id).eq('user_id', uid)
    setDrafts(d => d.filter(x => x.id !== id))
  }

  const todayIso = today()
  const future = drafts.filter(d => d.date >= todayIso)
  const past    = drafts.filter(d => d.date <  todayIso)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-2xl animate-spin">🏓</div>
      </div>
    )
  }

  return (
    <div className="animate-in">
      <div className="mb-4">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--color-ink)]">Geplant</h2>
        <p className="text-sm text-[var(--color-muted)] mt-0.5">Vorgemerkte Trainingseinheiten</p>
      </div>

      {drafts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-4xl mb-3">📌</div>
          <p className="font-semibold text-[var(--color-ink)]">Noch nichts vorgemerkt</p>
          <p className="text-sm text-[var(--color-muted)] mt-1 max-w-xs">
            Erstelle einen Plan im Planen-Tab und speichere ihn als Vorlage.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {future.length > 0 && (
            <Section title="Geplant">
              {future.map(d => <DraftCard key={d.id} draft={d} onDelete={() => handleDelete(d.id)} />)}
            </Section>
          )}
          {past.length > 0 && (
            <Section title="Vergangene Pläne" muted>
              {past.map(d => <DraftCard key={d.id} draft={d} past onDelete={() => handleDelete(d.id)} />)}
            </Section>
          )}
        </div>
      )}
    </div>
  )
}

function Section({ title, muted, children }) {
  return (
    <div>
      <p className={`text-[11px] font-semibold uppercase tracking-wider mb-2 ${muted ? 'text-[var(--color-muted)]' : 'text-[var(--color-sub)]'}`}>
        {title}
      </p>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function DraftCard({ draft, past, onDelete }) {
  const parts = []
  if (draft.sel) {
    Object.entries(MODS).forEach(([mod, m]) => {
      const items = draft.sel[mod] || []
      if (items.length) {
        parts.push({
          mod, color: m.color,
          items: items.map(it => byId(it.id)?.title || it.id),
        })
      }
    })
  }

  return (
    <div className={`bg-white rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-card)] p-4 ${past ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="text-[15px] font-bold text-[var(--color-ink)]">{fmtDate(draft.date)}</p>
          {past && <span className="text-[10px] text-[var(--color-muted)]">vergangen</span>}
        </div>
        <button
          onClick={onDelete}
          className="text-[11px] text-[var(--color-muted)] hover:text-red-500 transition-colors p-1"
        >
          ✕
        </button>
      </div>

      {parts.length > 0 && (
        <div className="space-y-1.5">
          {parts.map(({ mod, color, items }) => (
            <div key={mod} className="flex gap-2">
              <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: color }} />
              <p className="text-[12px] text-[var(--color-sub)] leading-relaxed">
                {items.join(', ')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
