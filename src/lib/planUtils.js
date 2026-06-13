import BASE from './exercises.json'
import { DEFAULT_BUDGETS, MODS } from './constants'

/* ── Übungszugriff ── */
export function allEx(custom = []) { return [...BASE, ...custom] }
export function byId(id, custom = []) { return allEx(custom).find(e => e.id === id) }

/* ── Datum ── */
export function today() { return new Date().toISOString().slice(0, 10) }
export function fmtDate(iso) {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
}
export function fmtDateLong(iso) {
  const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
  const d = new Date(iso + 'T12:00:00')
  return days[d.getDay()] + ', ' + fmtDate(iso)
}

/* ── Zeitrechnung ── */
export function modTotal(sel, mod) {
  return (sel[mod] || []).reduce((s, it) => s + (it.dur || 0), 0)
}
export function totalUsed(sel, budgets = DEFAULT_BUDGETS) {
  return Object.keys(MODS).reduce((s, m) => s + modTotal(sel, m), 0)
}
export function totalBudget(budgets = DEFAULT_BUDGETS) {
  return Object.keys(MODS).reduce((s, m) => s + (budgets[m] || 0), 0)
}

/* ── Initialer State ── */
export function emptyPlan() {
  return { date: today(), sel: { warmup: [], tt: [], kraft: [], spiel: [] } }
}

/* ── Unlock-Logik ── */
export function doneCounts(trainLog, custom = []) {
  const counts = {}
  trainLog.forEach(h => {
    const seen = new Set()
    Object.values(h.sel || {}).flat().forEach(it => {
      if (!seen.has(it.id)) { seen.add(it.id); counts[it.id] = (counts[it.id] || 0) + 1 }
    })
  })
  return counts
}
export function isUnlocked(ex, counts) {
  if (!ex.needs || !ex.needs.length) return true
  return ex.needs.every(n => (counts[n] || 0) >= 2)
}

/* ── Phasen-Warnung ── */
export function phaseWarning(sel) {
  const items = (sel.tt || []).map(it => BASE.find(e => e.id === it.id)).filter(Boolean)
  if (!items.length) return null
  const phases = items.map(e => e.phase || 2)
  const hasP1 = phases.includes(1), hasP2 = phases.includes(2), hasP3 = phases.includes(3)
  if (hasP3 && !hasP2) return 'Spielform ohne Übungsbaustein (Phase 2) – besser: erst üben, dann anwenden.'
  if (!hasP1 && (hasP2 || hasP3) && items.length >= 2) return 'Empfehlung: Ergänze einen Einführungsbaustein (Phase 1) als Einstieg.'
  const firstP3 = phases.findIndex(p => p === 3)
  const firstP2 = phases.findIndex(p => p === 2)
  if (firstP3 !== -1 && firstP2 !== -1 && firstP3 < firstP2) return 'Spielform (Phase 3) vor Übungsbaustein (Phase 2) – besser: erst üben.'
  return null
}

/* ── lastDoneMap ── */
export function lastDoneMap(trainLog) {
  const map = {}
  ;[...trainLog].sort((a, b) => a.date.localeCompare(b.date)).forEach(h => {
    Object.values(h.sel || {}).flat().forEach(it => { map[it.id] = h.date })
  })
  return map
}
