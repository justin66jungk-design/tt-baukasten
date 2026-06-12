import { useState, useEffect, useRef } from 'react'
import { useApp } from '../../context/AppContext'
import { supabase } from '../../lib/supabase'
import { usePlan } from './usePlan'
import { PlanenHero } from './PlanenHero'
import { ModuleSection } from './ModuleSection'
import { CatalogSheet } from './CatalogSheet'
import { today } from '../../lib/planUtils'
import { MODS } from '../../lib/constants'
import { Button } from '../../components/ui/Button'

export function PlanenTab() {
  const { session } = useApp()
  const uid = session?.user?.id

  const [settings, setSettings] = useState({
    club: 'TV Bonn-Geislar',
    budgets: { warmup: 25, tt: 60, kraft: 15, spiel: 15 },
  })
  const [trainLog, setTrainLog] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [toast,    setToast]    = useState(null)

  const { plan, setDate, setPlan, reset, addEx, removeEx, incDur, decDur, moveUp, moveDown } = usePlan()

  const [catalogMod, setCatalogMod] = useState(null)
  const dateRef = useRef(null)
  const draftTimer = useRef(null)

  /* ── Daten laden ── */
  useEffect(() => {
    if (!uid) return
    async function load() {
      setLoading(true)
      const [sRes, dRes, hRes] = await Promise.all([
        supabase.from('settings').select('data').eq('user_id', uid).maybeSingle(),
        supabase.from('draft').select('data').eq('user_id', uid).maybeSingle(),
        supabase.from('training_sessions').select('*').eq('user_id', uid).order('date', { ascending: false }),
      ])
      if (sRes.data?.data) setSettings(s => ({ ...s, ...sRes.data.data }))
      if (dRes.data?.data) setPlan(dRes.data.data)
      if (hRes.data) {
        setTrainLog(hRes.data.map(r => ({
          date: r.date, sel: r.sel, note: r.note || '', count: r.count, savedAt: r.saved_at,
        })))
      }
      setLoading(false)
    }
    load()
  }, [uid])

  /* ── Draft auto-speichern (1s Debounce) ── */
  useEffect(() => {
    if (!uid || loading) return
    clearTimeout(draftTimer.current)
    draftTimer.current = setTimeout(async () => {
      await supabase.from('draft').upsert(
        { user_id: uid, data: plan, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      )
    }, 1000)
    return () => clearTimeout(draftTimer.current)
  }, [plan, uid, loading])

  /* ── Training speichern ── */
  async function saveTraining() {
    if (!uid) return
    setSaving(true)
    const { error } = await supabase.from('training_sessions').upsert(
      { user_id: uid, date: plan.date, sel: plan.sel, note: '', saved_at: Date.now() },
      { onConflict: 'user_id,date' }
    )
    setSaving(false)
    if (!error) {
      setTrainLog(prev => [{ date: plan.date, sel: plan.sel, note: '' }, ...prev.filter(h => h.date !== plan.date)])
      showToast('Training gespeichert ✓')
    } else {
      showToast('Fehler beim Speichern')
    }
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-2xl animate-spin">🏓</div>
      </div>
    )
  }

  return (
    <div className="animate-in">
      {/* Unsichtbares Datums-Input */}
      <input
        ref={dateRef}
        type="date"
        value={plan.date}
        onChange={e => setDate(e.target.value || today())}
        className="sr-only"
        aria-label="Trainingsdatum"
      />

      {/* Hero */}
      <div className="mb-3">
        <PlanenHero
          plan={plan}
          settings={settings}
          onDateClick={() => dateRef.current?.showPicker?.() || dateRef.current?.click()}
        />
      </div>

      {/* Aktions-Pill */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => { if (confirm('Plan leeren?')) reset() }}
          className="text-[12px] font-semibold text-[var(--color-muted)] bg-white border border-[var(--color-border)] rounded-full px-3 py-1.5 hover:text-[var(--color-ink)] transition-colors active:opacity-70"
        >
          Leeren
        </button>
      </div>

      {/* Module */}
      {Object.keys(MODS).map(mod => (
        <ModuleSection
          key={mod}
          mod={mod}
          plan={plan}
          settings={settings}
          onAddClick={setCatalogMod}
          onInc={incDur}
          onDec={decDur}
          onUp={moveUp}
          onDown={moveDown}
          onRemove={removeEx}
        />
      ))}

      {/* Speichern */}
      <div className="pt-2 pb-6">
        <Button onClick={saveTraining} disabled={saving} size="lg" className="w-full">
          {saving ? 'Speichert…' : 'Training speichern'}
        </Button>
      </div>

      {/* Katalog-Sheet */}
      {catalogMod && (
        <CatalogSheet
          mod={catalogMod}
          plan={plan}
          trainLog={trainLog}
          onAdd={addEx}
          onClose={() => setCatalogMod(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[var(--color-ink)] text-white text-[13px] font-semibold px-4 py-2.5 rounded-full shadow-lg animate-in whitespace-nowrap">
          {toast}
        </div>
      )}

      <p className="text-center text-[10px] text-[var(--color-muted)] pb-2">
        © {new Date().getFullYear()} Justin Jungk · TT-Baukasten · Alle Rechte vorbehalten
      </p>
    </div>
  )
}
