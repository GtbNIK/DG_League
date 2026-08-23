import { Trophy, RefreshCcw, Skull, Target, Award } from 'lucide-react'

export default function BottomNav({ currentTab, setCurrentTab }) {
  const tabs = [
    { id: 0, label: 'Torneo', icon: <Trophy size={20} /> },
    { id: 1, label: 'Pronóstico', icon: <Target size={20} /> },
    { id: 2, label: 'Fichajes', icon: <RefreshCcw size={20} /> },
    { id: 3, label: 'Castigo', icon: <Skull size={20} /> },
    { id: 4, label: 'Logros', icon: <Award size={20} /> }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 pb-safe">
      <div className="max-w-md mx-auto flex justify-around p-2">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl flex-1 min-w-0 transition-all duration-200 ${
                isActive
                  ? 'text-emerald-400 bg-emerald-400/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`${isActive ? 'scale-110 mb-1' : 'scale-100 mb-1'} transition-transform`}>
                {tab.icon}
              </div>
              <span className={`text-[10px] uppercase tracking-wider font-semibold ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
