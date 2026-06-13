import { AppProvider, useApp } from './context/AppContext'
import { Sidebar } from './components/layout/Sidebar'
import { Toolbar } from './components/layout/Toolbar'
import { BottomNav } from './components/layout/BottomNav'
import { Spinner } from './components/ui/Spinner'
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
      <div className="wallpaper min-h-dvh flex items-center justify-center">
        <Spinner light />
      </div>
    )
  }

  // Nicht eingeloggt
  if (!session) return <AuthScreen />

  // App-Fenster
  return (
    <div className="wallpaper min-h-dvh lg:flex lg:items-center lg:justify-center lg:p-8">
      <div className="glass-window flex w-full h-dvh overflow-hidden lg:h-[calc(100dvh-64px)] lg:max-w-[1240px] lg:rounded-[26px] lg:shadow-[var(--shadow-window)]">

        {/* Sidebar (nur Desktop) */}
        <Sidebar />

        {/* Content-Pane */}
        <div className="glass-pane flex-1 flex flex-col min-w-0 lg:border-l lg:border-[var(--color-border)]">
          <Toolbar />
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4 lg:px-7 pt-4 lg:pt-6 pb-28 lg:pb-8">
              {TABS[activeTab]}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Dock */}
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
