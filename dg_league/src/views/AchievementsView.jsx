import { Flame, Medal } from 'lucide-react'
import { detectStreaks, getAchievements } from '../utils/tournamentLogic'

/**
 * Identidad visual por logro: borde sutil + glow del mismo tono.
 * El índice de racha es dinámico (`racha-<nombre>`), por eso se resuelve por prefijo.
 */
const CARD_ACCENTS = {
    pichichi: {
        border: 'border-amber-500/30',
        glow: 'shadow-[0_0_20px_rgba(245,158,11,0.12)]',
        text: 'text-amber-400',
    },
    muralla: {
        border: 'border-sky-500/30',
        glow: 'shadow-[0_0_20px_rgba(14,165,233,0.12)]',
        text: 'text-sky-400',
    },
    goleada: {
        border: 'border-rose-500/30',
        glow: 'shadow-[0_0_20px_rgba(244,63,94,0.12)]',
        text: 'text-rose-400',
    },
}

const STREAK_ACCENT = {
    border: 'border-orange-500/30',
    glow: 'shadow-[0_0_20px_rgba(249,115,22,0.12)]',
    text: 'text-orange-400',
}

/**
 * Resuelve la paleta de una card según su id de logro.
 */
const getAccent = (id) =>
    id.startsWith('racha-') ? STREAK_ACCENT : CARD_ACCENTS[id] || null

/**
 * Vista dedicada a las estadísticas sociales del torneo: rachas activas
 * y logros honoríficos. Los logros se presentan como cards individuales
 * en una grilla de 2 columnas (icono grande arriba, título, holder y descripción).
 */
export default function AchievementsView({ tournament }) {
    const { matches } = tournament.data

    const hasPlayed = matches.some(
        (m) => m.score1 !== null && m.score2 !== null
    )

    if (!hasPlayed) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 mb-24 mt-16 animate-in fade-in duration-300">
                <Medal size={40} className="text-slate-700" />
                <p className="text-slate-500 text-sm italic text-center px-8">
                    Las estadísticas aparecerán cuando ingreses los primeros marcadores.
                </p>
            </div>
        )
    }

    const streaks = detectStreaks(matches)
    const achievements = getAchievements(matches)

    return (
        <div className="flex flex-col gap-6 mb-24 animate-in fade-in duration-300">
            {/* Rachas activas */}
            <section className="glass-panel p-4">
                <h3 className="text-base font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
                    <Flame size={18} className="text-emerald-400" />
                    Rachas Activas
                </h3>
                {streaks.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">
                        Nadie tiene una racha activa de 2+ victorias...
                    </p>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {streaks.map((s) => (
                            <span
                                key={s.name}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-300"
                            >
                                🔥 {s.name} · {s.streak} seguidas
                            </span>
                        ))}
                    </div>
                )}
            </section>

            {/* Logros honoríficos */}
            <section>
                <h3 className="text-base font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
                    <Medal size={18} className="text-emerald-400" />
                    Logros del Torneo
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {achievements.map((a) => {
                        const accent = getAccent(a.id)
                        return (
                            <article
                                key={a.id}
                                className={`flex flex-col items-center text-center gap-2 p-5 rounded-xl bg-slate-900/60 border backdrop-blur-md transition-shadow ${
                                    accent
                                        ? `${accent.border} ${accent.glow}`
                                        : 'border-slate-800'
                                }`}
                            >
                                <span className="text-5xl leading-none drop-shadow-md">{a.emoji}</span>
                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 mt-1.5">
                                    {a.title}
                                </h4>
                                <p className={`text-base font-black truncate max-w-full ${accent ? accent.text : 'text-emerald-400'}`}>
                                    {a.holder}
                                </p>
                                <p className="text-xs text-slate-400 leading-snug">{a.description}</p>
                            </article>
                        )
                    })}
                </div>
                {achievements.length === 0 && (
                    <p className="text-xs text-slate-500 italic text-center">
                        Aún no hay logros que repartir...
                    </p>
                )}
            </section>
        </div>
    )
}
