import { motion as Motion } from 'motion/react'
import { Flame, Medal } from 'lucide-react'
import { detectStreaks, getAchievements } from '../utils/tournamentLogic'
import TeamTag from '../components/TeamTag'

/**
 * Identidad visual por logro: borde del mismo tono del premio.
 * Sin glow en reposo: el resplandor solo responde (DESIGN.md).
 * El índice de racha es dinámico (`racha-<nombre>`), por eso se resuelve por prefijo.
 */
const CARD_ACCENTS = {
    pichichi: {
        border: 'border-amber-500/40',
        text: 'text-amber-400',
    },
    muralla: {
        border: 'border-sky-500/40',
        text: 'text-sky-400',
    },
    goleada: {
        border: 'border-rose-500/40',
        text: 'text-rose-400',
    },
}

const STREAK_ACCENT = {
    border: 'border-orange-500/40',
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
    const { matches, draftPicks } = tournament.data

    const hasPlayed = matches.some(
        (m) => m.score1 !== null && m.score2 !== null
    )

    if (!hasPlayed) {
        return (
            <Motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center justify-center gap-3 mb-24 mt-16"
            >
                <Medal size={40} className="text-muted" />
                <p className="text-muted text-sm italic text-center px-8">
                    Las estadísticas aparecerán cuando ingreses los primeros marcadores.
                </p>
            </Motion.div>
        )
    }

    const streaks = detectStreaks(matches)
    const achievements = getAchievements(matches)

    return (
        <Motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-6 mb-24"
        >
            {/* Rachas activas */}
            <section className="bg-surface border border-line rounded-2xl p-4">
                <h3 className="text-base font-semibold font-display text-ink mb-4 flex items-center gap-2">
                    <Flame size={18} className="text-emerald-400" />
                    Rachas Activas
                </h3>
                {streaks.length === 0 ? (
                    <p className="text-xs text-muted italic">
                        Nadie tiene una racha activa de 2+ victorias...
                    </p>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {streaks.map((s, idx) => (
                            <Motion.span
                                key={s.name}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05, duration: 0.25 }}
                                className="flex flex-col items-center px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/40"
                            >
                                <span className="text-xs font-semibold text-emerald-300">
                                    🔥 {s.name} · {s.streak} seguidas
                                </span>
                                <TeamTag player={s.name} draftPicks={draftPicks} alignCenter />
                            </Motion.span>
                        ))}
                    </div>
                )}
            </section>

            {/* Logros honoríficos */}
            <section>
                <h3 className="text-base font-semibold font-display text-ink mb-4 flex items-center gap-2">
                    <Medal size={18} className="text-emerald-400" />
                    Logros del Torneo
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {achievements.map((a, idx) => {
                        const accent = getAccent(a.id)
                        return (
                            <Motion.article
                                key={a.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                className={`flex flex-col items-center text-center gap-2 p-5 rounded-xl bg-surface border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(2,6,23,0.6)] ${
                                    accent ? accent.border : 'border-line'
                                }`}
                            >
                                <span className="text-5xl leading-none">{a.emoji}</span>
                                <h4 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted mt-1.5">
                                    {a.title}
                                </h4>
                                <div className="flex flex-col items-center min-w-0">
                                    <p className={`text-base font-bold font-display truncate max-w-full ${accent ? accent.text : 'text-emerald-400'}`}>
                                        {a.holder}
                                    </p>
                                    <TeamTag player={a.holder} draftPicks={draftPicks} alignCenter />
                                </div>
                                <p className="text-xs text-muted leading-snug">{a.description}</p>
                            </Motion.article>
                        )
                    })}
                </div>
                {achievements.length === 0 && (
                    <p className="text-xs text-muted italic text-center">
                        Aún no hay logros que repartir...
                    </p>
                )}
            </section>
        </Motion.div>
    )
}
