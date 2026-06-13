import { useReducer, useCallback } from 'react'
import { emptyPlan } from '../../lib/planUtils'

/* Jede Aktion beschreibt WAS passieren soll — der Reducer entscheidet WIE */
function reducer(state, action) {
  const { mod, idx } = action
  const sel = { ...state.sel }

  switch (action.type) {
    case 'SET_DATE':
      return { ...state, date: action.date }

    case 'SET_PLAN':
      return action.plan

    case 'RESET':
      return emptyPlan()

    case 'ADD': {
      const list = [...(sel[mod] || [])]
      list.push({ id: action.id, dur: action.dur })
      return { ...state, sel: { ...sel, [mod]: list } }
    }

    case 'REMOVE': {
      const list = [...(sel[mod] || [])]
      list.splice(idx, 1)
      return { ...state, sel: { ...sel, [mod]: list } }
    }

    case 'INC': {
      const list = [...(sel[mod] || [])]
      list[idx] = { ...list[idx], dur: list[idx].dur + 1 }
      return { ...state, sel: { ...sel, [mod]: list } }
    }

    case 'DEC': {
      const list = [...(sel[mod] || [])]
      if (list[idx].dur <= 1) return state
      list[idx] = { ...list[idx], dur: list[idx].dur - 1 }
      return { ...state, sel: { ...sel, [mod]: list } }
    }

    case 'MOVE_UP': {
      if (idx === 0) return state
      const list = [...(sel[mod] || [])]
      ;[list[idx - 1], list[idx]] = [list[idx], list[idx - 1]]
      return { ...state, sel: { ...sel, [mod]: list } }
    }

    case 'MOVE_DOWN': {
      const list = [...(sel[mod] || [])]
      if (idx >= list.length - 1) return state
      ;[list[idx], list[idx + 1]] = [list[idx + 1], list[idx]]
      return { ...state, sel: { ...sel, [mod]: list } }
    }

    case 'SET_ZONES': {
      const list = [...(sel[mod] || [])]
      list[idx] = { ...list[idx], zones: action.zones }
      return { ...state, sel: { ...sel, [mod]: list } }
    }

    default:
      return state
  }
}

export function usePlan(initialPlan) {
  const [plan, dispatch] = useReducer(reducer, initialPlan || emptyPlan())

  const setDate    = useCallback(date => dispatch({ type: 'SET_DATE', date }), [])
  const setPlan    = useCallback(plan  => dispatch({ type: 'SET_PLAN', plan }), [])
  const reset      = useCallback(()   => dispatch({ type: 'RESET' }), [])
  const addEx      = useCallback((mod, id, dur) => dispatch({ type: 'ADD', mod, id, dur }), [])
  const removeEx   = useCallback((mod, idx) => dispatch({ type: 'REMOVE', mod, idx }), [])
  const incDur     = useCallback((mod, idx) => dispatch({ type: 'INC', mod, idx }), [])
  const decDur     = useCallback((mod, idx) => dispatch({ type: 'DEC', mod, idx }), [])
  const moveUp     = useCallback((mod, idx) => dispatch({ type: 'MOVE_UP', mod, idx }), [])
  const moveDown   = useCallback((mod, idx) => dispatch({ type: 'MOVE_DOWN', mod, idx }), [])
  const setZones   = useCallback((mod, idx, zones) => dispatch({ type: 'SET_ZONES', mod, idx, zones }), [])

  return { plan, setDate, setPlan, reset, addEx, removeEx, incDur, decDur, moveUp, moveDown, setZones }
}
