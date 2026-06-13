export const MODS = {
  warmup: { name: 'Aufwärmen',    color: '#F59E0B', bg: 'rgba(245,158,11,.08)',  covKey: 'skill' },
  tt:     { name: 'Tischtennis',  color: '#3B82F6', bg: 'rgba(59,130,246,.08)',  covKey: 'tech'  },
  kraft:  { name: 'Krafttraining',color: '#10B981', bg: 'rgba(16,185,129,.08)',  covKey: 'musc'  },
  spiel:  { name: 'Spiel & Spaß', color: '#A855F7', bg: 'rgba(168,85,247,.08)', covKey: 'skill' },
}

export const DEFAULT_BUDGETS = { warmup: 25, tt: 60, kraft: 15, spiel: 15 }
export const DEFAULT_WEIGHTS = { gap: 50, balance: 25, progression: 15, phase: 10 }

export const MUSCLES = [
  'Beine', 'Beine explosiv', 'Bauch', 'Rumpf seitlich',
  'Rücken', 'Schultern/Arme', 'Ganzkörper',
]

export const TT_ZONES = {
  vhk: { label: 'VH kurz',           short: 'VH↗',   color: '#3B82F6' },
  vhl: { label: 'VH lang',           short: 'VH↗↗',  color: '#3B82F6' },
  m:   { label: 'Ellenbogen/Mitte',   short: '↔',     color: '#F59E0B' },
  rhk: { label: 'RH kurz',           short: 'RH↖',   color: '#10B981' },
  rhl: { label: 'RH lang',           short: 'RH↖↖',  color: '#10B981' },
  n:   { label: 'Kurz Netz',         short: 'Netz',  color: '#A855F7' },
}

export const MOD_ICONS = {
  warmup: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
  tt:     `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="10" cy="10" rx="7" ry="7"/><line x1="15" y1="15" x2="21" y2="21"/><circle cx="20" cy="5" r="2"/></svg>`,
  kraft:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="12" x2="18" y2="12"/><rect x="1" y="9" width="5" height="6" rx="1"/><rect x="18" y="9" width="5" height="6" rx="1"/></svg>`,
  spiel:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3a14.5 14.5 0 0 0 0 18"/><path d="M3 12h18"/></svg>`,
}
