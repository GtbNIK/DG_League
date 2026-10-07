import { motion as Motion } from 'motion/react'
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
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-line pb-safe">
            <div className="max-w-md mx-auto flex justify-around p-2">
                {tabs.map((tab) => {
                    const isActive = currentTab === tab.id
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setCurrentTab(tab.id)}
                            className={`relative flex flex-col items-center justify-center p-2 rounded-[10px] flex-1 min-w-0 transition-colors duration-200 ${
                                isActive ? 'text-emerald-400' : 'text-muted hover:text-ink'
                            }`}
                        >
                            {/* Pastilla deslizante: un solo elemento que viaja entre pestañas */}
                            {isActive && (
                                <Motion.div
                                    layoutId="nav-pill"
                                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                                    className="absolute inset-0 bg-surface-raised rounded-[10px]"
                                />
                            )}
                            <div className="relative z-10 flex flex-col items-center">
                                <div className={`${isActive ? 'scale-110 mb-1' : 'scale-100 mb-1'} transition-transform`}>
                                    {tab.icon}
                                </div>
                                <span className={`text-[10px] uppercase tracking-[0.06em] font-semibold ${isActive ? 'opacity-100' : 'opacity-80'}`}>
                                    {tab.label}
                                </span>
                            </div>
                        </button>
                    )
                })}
            </div>
        </nav>
    )
}
