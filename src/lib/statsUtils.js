import BASE from './exercises.json'
import { MUSCLES } from './constants'

const TT_TOPICS = [
  'Vorhand','Rückhand','Schupf','Aufschlag','Beinarbeit',
  'Topspin','Spin-Verständnis','Taktik','Material','Mental','Wettkampf','Doppel',
]
const DEFAULT_TOPIC_TARGETS = {
  Vorhand:6, Rückhand:6, Schupf:3, Aufschlag:4, Beinarbeit:3,
  Topspin:3, 'Spin-Verständnis':2, Taktik:4, Material:1, Mental:4, Wettkampf:5, Doppel:2,
}

export { TT_TOPICS, DEFAULT_TOPIC_TARGETS }

function byId(id) { return BASE.find(e => e.id === id) }

/* ── Themen-Zählungen für einen Block von Trainings ── */
export function techCounts(entries) {
  const c = {}
  TT_TOPICS.forEach(t => { c[t] = 0 })
  entries.forEach(h => {
    const seen = new Set()
    ;(h.sel?.tt || []).forEach(it => {
      ;(byId(it.id)?.covers?.tech || []).forEach(t => {
        if (!seen.has(t)) { seen.add(t); if (c[t] !== undefined) c[t]++ }
      })
    })
  })
  return c
}

/* ── Übungs-Häufigkeiten über alle Trainings ── */
export function exFrequencies(trainLog) {
  const freq = {}
  trainLog.forEach(h => {
    Object.values(h.sel || {}).flat().forEach(it => {
      freq[it.id] = (freq[it.id] || 0) + 1
    })
  })
  return freq
}

/* ── Muskelgruppen-Häufigkeiten ── */
export function muscleFrequencies(trainLog) {
  const freq = {}
  MUSCLES.forEach(m => { freq[m] = 0 })
  trainLog.forEach(h => {
    ;(h.sel?.kraft || []).forEach(it => {
      ;(byId(it.id)?.covers?.musc || []).forEach(m => {
        if (freq[m] !== undefined) freq[m]++
      })
    })
  })
  return freq
}

/* ── Letzte bekannte Trainings-Datum pro Übung ── */
export function buildLastDoneMap(trainLog) {
  const map = {}
  ;[...trainLog].sort((a, b) => a.date.localeCompare(b.date)).forEach(h => {
    Object.values(h.sel || {}).flat().forEach(it => { map[it.id] = h.date })
  })
  return map
}

/* ── Meilensteine (freigeschaltete Übungen) ── */
export function computeMilestones(trainLog) {
  const sorted = [...trainLog].sort((a, b) => a.date.localeCompare(b.date))
  const found = new Map()
  sorted.forEach(h => {
    const doneUpTo = {}
    sorted.filter(x => x.date <= h.date).forEach(x => {
      const seen = new Set()
      Object.values(x.sel || {}).flat().forEach(it => seen.add(it.id))
      seen.forEach(id => { doneUpTo[id] = (doneUpTo[id] || 0) + 1 })
    })
    BASE.filter(e => e.needs?.length && e.needs.every(n => (doneUpTo[n] || 0) >= 2))
      .forEach(e => { if (!found.has(e.id)) found.set(e.id, { id: e.id, date: h.date, title: e.title, prog: e.prog }) })
  })
  return [...found.values()]
}

/* ── Match-Kennzahlen ── */
export function isSetOver(a, b) {
  return Math.max(a, b) >= 11 && Math.abs(a - b) >= 2
}

export function buildMatchKeyStats(match) {
  let sp = 0, sm = 0, rcp = 0, rcm = 0, rp = 0, rm = 0, pw = 0, pt = 0
  match.sets.forEach(s => {
    const chips = s.chips || []
    chips.forEach(c => {
      if (c.side === 'serve') { if (c.point) sp++; else sm++ }
      if (c.side === 'receive') { if (c.point) rcp++; else rcm++ }
      if (c.rally) { if (c.point) rp++; else rm++ }
      if (c.pressure) { pt++; if (c.point) pw++ }
    })
  })
  return {
    serveEff:    (sp + sm) > 0   ? sp / (sp + sm)             : NaN,
    receiveStab: (rcp + rcm) > 0 ? 1 - rcm / (rcp + rcm)     : NaN,
    rallyQual:   (rp + rm) > 0   ? rp / (rp + rm)             : NaN,
    pressurePerf: pt > 0         ? pw / pt                    : NaN,
  }
}

export function fmtDate(iso) {
  if (!iso) return ''
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
}
