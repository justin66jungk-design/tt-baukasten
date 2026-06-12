import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { supabase } from '../../lib/supabase'
import { MODS, DEFAULT_BUDGETS, DEFAULT_WEIGHTS } from '../../lib/constants'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { Plus, X, Minus } from '@phosphor-icons/react'

const WEIGHT_LABELS = {
  gap:         'Lücke (nicht trainiert)',
  balance:     'Themen-Balance',
  progression: 'Progression (fast frei)',
  phase:       'Phasen-Sinnhaftigkeit',
}

export function EinstellungenTab() {
  const { session } = useApp()
  const uid = session?.user?.id

  const [club,    setClub]    = useState('TV Bonn-Geislar')
  const [budgets, setBudgets] = useState({ ...DEFAULT_BUDGETS })
  const [weights, setWeights] = useState({ ...DEFAULT_WEIGHTS })
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [toast,   setToast]   = useState(null)

  const [showPlayerForm, setShowPlayerForm] = useState(false)
  const [editPlayer, setEditPlayer] = useState(null)

  useEffect(() => {
    if (!uid) return
    async function load() {
      setLoading(true)
      const [sRes, pRes] = await Promise.all([
        supabase.from('settings').select('data').eq('user_id', uid).maybeSingle(),
        supabase.from('players').select('*').eq('user_id', uid),
      ])
      if (sRes.data?.data) {
        const d = sRes.data.data
        if (d.club)    setClub(d.club)
        if (d.budgets) setBudgets(b => ({ ...b, ...d.budgets }))
        if (d.weights) setWeights(w => ({ ...w, ...d.weights }))
      }
      if (pRes.data) {
        setPlayers(pRes.data.map(r => ({
          id: r.player_id, name: r.name,
          hand: r.hand, birthyear: r.birthyear, style: r.style,
        })))
      }
      setLoading(false)
    }
    load()
  }, [uid])

  async function handleSave() {
    setSaving(true)
    const { error } = await supabase.from('settings').upsert(
      { user_id: uid, data: { club, budgets, weights }, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
    setSaving(false)
    showToast(error ? 'Fehler beim Speichern' : 'Einstellungen gespeichert ✓')
  }

  async function handleSavePlayer(player) {
    const isNew = !player.id
    const pid   = player.id || 'p_' + Date.now()
    const row   = { user_id: uid, player_id: pid, name: player.name, hand: player.hand, birthyear: player.birthyear, style: player.style }
    await supabase.from('players').upsert(row, { onConflict: 'user_id,player_id' })
    setPlayers(prev => isNew
      ? [...prev, { ...player, id: pid }]
      : prev.map(p => p.id === pid ? { ...player, id: pid } : p)
    )
    setShowPlayerForm(false)
    setEditPlayer(null)
  }

  async function handleDeletePlayer(id) {
    if (!confirm('Spieler löschen?')) return
    await supabase.from('players').delete().eq('user_id', uid).eq('player_id', id)
    setPlayers(prev => prev.filter(p => p.id !== id))
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const budgetSum = Object.values(budgets).reduce((s, v) => s + (v || 0), 0)

  if (loading) {
    return <div className="flex items-center justify-center py-16"><Spinner /></div>
  }

  return (
    <div className="animate-in space-y-4 pb-6">
      {/* Spielerprofile */}
      <SettingsSection title="Spielerprofile">
        <p className="text-[12px] text-[var(--color-muted)] mb-3">Max. 10 Profile. Match-History wird mit dem Profil verknüpft.</p>
        <div className="space-y-2">
          {players.map(p => (
            <div key={p.id} className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-bg)] shadow-[0_0_0_0.5px_rgba(0,0,0,.07)]">
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[var(--color-ink)]">{p.name}</p>
                <p className="text-[11px] text-[var(--color-muted)]">
                  {[p.hand, p.birthyear, p.style].filter(Boolean).join(' · ')}
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => { setEditPlayer(p); setShowPlayerForm(true) }}>Bearbeiten</Button>
              <button
                onClick={() => handleDeletePlayer(p.id)}
                title="Löschen"
                className="w-[22px] h-[22px] flex items-center justify-center rounded-full bg-black/[.06] text-[var(--color-muted)] hover:text-[#e0352b] hover:bg-[#e0352b]/10 transition-colors"
              >
                <X size={11} weight="bold" />
              </button>
            </div>
          ))}
        </div>
        {players.length < 10 && (
          <button
            onClick={() => { setEditPlayer(null); setShowPlayerForm(true) }}
            className="mt-2 flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-table-700)] hover:opacity-70 transition-opacity py-1"
          >
            <Plus size={13} weight="bold" />
            Spieler anlegen
          </button>
        )}
      </SettingsSection>

      {/* Verein */}
      <SettingsSection title="Verein">
        <label className="block text-[12px] font-semibold text-[var(--color-sub)] mb-1">Vereinsname</label>
        <input
          type="text"
          value={club}
          onChange={e => setClub(e.target.value)}
          placeholder="z. B. TV Bonn-Geislar"
          className={fieldCls}
        />
        <p className="text-[11px] text-[var(--color-muted)] mt-1">Erscheint im Header und im Ausdruck.</p>
      </SettingsSection>

      {/* Zeitbudgets */}
      <SettingsSection title="Zeitbudget pro Modul">
        <div className="space-y-3">
          {Object.entries(MODS).map(([mod, m]) => (
            <div key={mod} className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: m.color }} />
              <span className="text-[13px] text-[var(--color-sub)] flex-1">{m.name}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBudgets(b => ({ ...b, [mod]: Math.max(0, (b[mod] || 0) - 5) }))}
                  className="w-[24px] h-[24px] rounded-full bg-white shadow-[inset_0_1px_0_rgba(255,255,255,.8),0_0_0_0.5px_rgba(0,0,0,.14),0_1px_1.5px_rgba(0,0,0,.08)] text-[var(--color-sub)] flex items-center justify-center hover:bg-[#f8f8fa] active:bg-[#ececef] transition-colors"
                ><Minus size={11} weight="bold" /></button>
                <span className="text-[13px] font-bold w-14 text-center tabular-nums text-[var(--color-ink)]">
                  {budgets[mod] || 0} min
                </span>
                <button
                  onClick={() => setBudgets(b => ({ ...b, [mod]: (b[mod] || 0) + 5 }))}
                  className="w-[24px] h-[24px] rounded-full bg-white shadow-[inset_0_1px_0_rgba(255,255,255,.8),0_0_0_0.5px_rgba(0,0,0,.14),0_1px_1.5px_rgba(0,0,0,.08)] text-[var(--color-sub)] flex items-center justify-center hover:bg-[#f8f8fa] active:bg-[#ececef] transition-colors"
                ><Plus size={11} weight="bold" /></button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex justify-between items-center">
          <span className="text-[12px] text-[var(--color-muted)]">Gesamt</span>
          <span className="text-[14px] font-bold text-[var(--color-ink)] tabular-nums">{budgetSum} min</span>
        </div>
      </SettingsSection>

      {/* Score-Gewichte */}
      <SettingsSection title="Score-Gewichte">
        <p className="text-[12px] text-[var(--color-muted)] mb-3">Steuert wie stark jeder Faktor die Vorschläge beeinflusst.</p>
        <div className="space-y-3">
          {Object.keys(DEFAULT_WEIGHTS).map(k => (
            <div key={k}>
              <div className="flex justify-between mb-1">
                <span className="text-[12px] text-[var(--color-sub)]">{WEIGHT_LABELS[k]}</span>
                <span className="text-[12px] font-bold tabular-nums text-[var(--color-ink)]">{weights[k]}</span>
              </div>
              <input
                type="range" min="0" max="100" step="5"
                value={weights[k]}
                onChange={e => setWeights(w => ({ ...w, [k]: parseInt(e.target.value) }))}
                className="w-full accent-[var(--color-table-600)]"
              />
            </div>
          ))}
        </div>
      </SettingsSection>

      {/* Speichern */}
      <div className="flex lg:justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg" className="w-full lg:w-auto">
          {saving ? 'Speichert…' : 'Einstellungen speichern'}
        </Button>
      </div>

      {/* Spieler-Formular */}
      {showPlayerForm && (
        <PlayerSheet
          player={editPlayer}
          onSave={handleSavePlayer}
          onClose={() => { setShowPlayerForm(false); setEditPlayer(null) }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[var(--color-ink)] text-white text-[13px] font-semibold px-4 py-2.5 rounded-full shadow-lg animate-in whitespace-nowrap">
          {toast}
        </div>
      )}
    </div>
  )
}

function SettingsSection({ title, children }) {
  return (
    <div className="bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-4">
      <h3 className="text-[13px] font-semibold text-[var(--color-ink)] mb-3">{title}</h3>
      {children}
    </div>
  )
}

function PlayerSheet({ player, onSave, onClose }) {
  const [name,      setName]      = useState(player?.name || '')
  const [hand,      setHand]      = useState(player?.hand || 'Rechts')
  const [birthyear, setBirthyear] = useState(player?.birthyear || '')
  const [style,     setStyle]     = useState(player?.style || '')

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ id: player?.id || null, name: name.trim(), hand, birthyear: birthyear || null, style: style || null })
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end lg:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div
        className="glass-modal relative w-full rounded-t-[18px] lg:max-w-[440px] lg:rounded-[16px] shadow-[var(--shadow-modal)] p-5 animate-modal"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center mb-3 lg:hidden"><div className="w-9 h-[5px] rounded-full bg-black/15" /></div>
        <h2 className="text-[15px] font-semibold text-[var(--color-ink)] mb-4">{player ? 'Spieler bearbeiten' : 'Spieler anlegen'}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Field label="Name" required>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Name…" required className={fieldCls} />
          </Field>
          <Field label="Schlaghand">
            <select value={hand} onChange={e => setHand(e.target.value)} className={fieldCls}>
              <option>Rechts</option><option>Links</option>
            </select>
          </Field>
          <Field label="Jahrgang">
            <input type="number" value={birthyear} onChange={e => setBirthyear(e.target.value)} placeholder="z. B. 2012" className={fieldCls} />
          </Field>
          <Field label="Spielstil">
            <input type="text" value={style} onChange={e => setStyle(e.target.value)} placeholder="z. B. Topspin, Allrounder…" className={fieldCls} />
          </Field>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="ghost" size="md" className="flex-1" onClick={onClose}>Abbrechen</Button>
            <Button type="submit" size="md" className="flex-1">Speichern</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

const fieldCls = 'w-full h-[34px] px-3 rounded-[8px] bg-white shadow-[0_0_0_0.5px_rgba(0,0,0,.16),inset_0_1px_2px_rgba(0,0,0,.04)] text-[13px] text-[var(--color-ink)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-[3px] focus:ring-[var(--color-table-500)]/40 transition'

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-[var(--color-sub)] mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}
