import { AppProvider, useApp } from './context/AppContext'
import { TopBar } from './components/layout/TopBar'
import { BottomNav } from './components/layout/BottomNav'
import { AuthScreen } from './features/auth/AuthScreen'
import { PlanenTab } from './features/planen/PlanenTab'
import { GeplantTab } from './features/geplant/GeplantTab'
import { AuswertenTab } from './features/auswerten/AuswertenTab'
import { MatchTab } from './features/match/MatchTab'
import { EinstellungenTab } from './features/einstellungen/EinstellungenTab'

const TABS = {
  planen:        <PlanenTab />,
  geplant:       <GeplantTab />,
  auswerten:     <AuswertenTab />,
  match:         <MatchTab />,
  einstellungen: <EinstellungenTab />,
}

function AppShell() {
  const { session, activeTab } = useApp()

  // Noch am Laden
  if (session === undefined) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-3xl animate-spin">🏓</div>
      </div>
    )
  }

  // Nicht eingeloggt
  if (!session) return <AuthScreen />

  // App
  return (
    <div className="flex flex-col min-h-dvh">
      <TopBar />
      <main className="flex-1 w-full">
        <div className="max-w-xl mx-auto px-4 pt-2 pb-24">
          {TABS[activeTab]}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  )
}
