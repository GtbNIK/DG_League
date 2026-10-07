import { useState } from 'react'
import { useTournament } from './hooks/useTournament'
import BottomNav from './components/BottomNav'
import LandingView from './views/LandingView'
import SetupView from './views/SetupView'
import DraftView from './views/DraftView'
import TournamentView from './views/TournamentView'
import PredictionsView from './views/PredictionsView'
import RulesView from './views/RulesView'
import LoserCardsView from './views/LoserCardsView'
import AchievementsView from './views/AchievementsView'

function App() {
  const tournament = useTournament()
  const { phase, onboardingDone } = tournament.data
  const { resetData, finishOnboarding } = tournament
  const [currentTab, setCurrentTab] = useState(0)

  // Landing inmersivo: pantalla completa sin header ni navegación.
  // Solo aparece la primera vez, cuando no hay torneo activo.
  if (phase === 'setup' && !onboardingDone) {
    return <LandingView onFinish={finishOnboarding} />
  }

  // Renderizado condicional estilo Switch para mayor fluidez.
  const renderView = () => {
    if (phase === 'setup') {
      return <SetupView tournament={tournament} />
    }

    if (phase === 'draft') {
      return <DraftView tournament={tournament} />
    }

    switch (currentTab) {
      case 0:
        return <TournamentView tournament={tournament} />
      case 1:
        return <PredictionsView tournament={tournament} />
      case 2:
        return <RulesView tournament={tournament} />
      case 3:
        return <LoserCardsView />
      case 4:
        return <AchievementsView tournament={tournament} />
      default:
        return <TournamentView tournament={tournament} />
    }
  }

  return (
    <div className={`relative min-h-screen bg-arena text-slate-200 ${phase === 'group' ? 'pb-20' : ''}`}>

      {/* Fondo vivo: La Arena Nocturna (DESIGN.md). Capa fija detrás del contenido;
          el Onboarding nunca la ve porque hace retorno temprano antes de este shell. */}
      <div className="arena-bg" aria-hidden="true">
        <span className="arena-glow arena-glow--emerald" />
        <span className="arena-glow arena-glow--cyan" />
        <span className="arena-glow arena-glow--blue" />
      </div>

      {/* Header estético */}
      <header className="sticky top-0 z-50 bg-surface border-b border-line px-4 py-3 mb-4">
        <div className="flex items-center justify-between">
          <h1 className="flex items-center gap-3 font-display text-xl font-bold text-ink">
            <img src="/LOGO-1.png" alt="DG League Logo" className="w-20 h-20 object-contain drop-shadow-md" />
            <span><span className="text-emerald-400">DG</span> <span className="text-ink">LEAGUE</span></span>
          </h1>
          {phase === 'group' && (
            <button
              onClick={resetData}
              className="px-3 py-1 text-xs font-semibold text-rose-400 border border-rose-500/30 rounded-[10px] hover:bg-rose-500/10 transition-colors"
            >
              Reiniciar
            </button>
          )}
        </div>
      </header>

      {/* Contenedor Principal con max-width para desktop pero pensado en movil */}
      <main className="relative z-10 mx-auto w-full px-4 max-w-md md:max-w-5xl lg:max-w-7xl">
        {renderView()}
      </main>

      {/* Navegación inferior solo cuando la liga ya está en curso */}
      {phase === 'group' && (
        <BottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />
      )}
    </div>
  )
}

export default App
