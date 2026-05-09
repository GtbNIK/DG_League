import { useState } from 'react'
import { useTournament } from './hooks/useTournament'
import BottomNav from './components/BottomNav'
import SetupView from './views/SetupView'
import TournamentView from './views/TournamentView'
import RulesView from './views/RulesView'
import LoserCardsView from './views/LoserCardsView'

function App() {
  const tournament = useTournament()
  const { phase } = tournament.data
  const { resetData } = tournament
  const [currentTab, setCurrentTab] = useState(0)

  // Renderizado condicional estilo Switch para mayor fluidez.
  const renderView = () => {
    if (phase === 'setup') {
      return <SetupView tournament={tournament} />
    }

    switch (currentTab) {
      case 0:
        return <TournamentView tournament={tournament} />
      case 1:
        return <RulesView tournament={tournament} />
      case 2:
        return <LoserCardsView />
      default:
        return <TournamentView tournament={tournament} />
    }
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-200 pb-20">
      
      {/* Header estético */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-emerald-500/20 px-4 py-3 mb-4">
        <div className="flex items-center justify-between">
          <h1 className="flex items-center gap-3 text-xl font-bold tracking-wider text-emerald-400">
            <img src="/LOGO-1.png" alt="DG League Logo" className="w-20 h-20 object-contain drop-shadow-md" />
            <span>DG <span className="text-white">LEAGUE</span></span>
          </h1>
          {phase !== 'setup' && (
            <button
              onClick={resetData}
              className="px-3 py-1 text-xs font-bold text-rose-400 border border-rose-500/30 rounded-lg hover:bg-rose-500/10 transition-colors"
            >
              Reiniciar
            </button>
          )}
        </div>
      </header>

      {/* Contenedor Principal con max-width para desktop pero pensado en movil */}
      <main className="mx-auto w-full px-4 max-w-md md:max-w-5xl lg:max-w-7xl">
        {renderView()}
      </main>

      {/* Solo mostrar Navegación inferior si ya pasamos la fase de setup */}
      {phase !== 'setup' && (
        <BottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />
      )}
    </div>
  )
}

export default App
