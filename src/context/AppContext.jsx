import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [session, setSession]   = useState(undefined) // undefined = noch am Laden
  const [activeTab, setActiveTab] = useState('planen')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <AppContext.Provider value={{ session, activeTab, setActiveTab }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp muss innerhalb AppProvider verwendet werden')
  return ctx
}
