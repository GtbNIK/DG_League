import { motion as Motion } from 'motion/react'
import { Flame, Medal } from 'lucide-react'
import {
    detectStreaks,
    getAchievements,
    getBestPredictor,
    getPredictionStandings,
} from '../utils/tournamentLogic'
import TeamTag from '../components/TeamTag'

/**
 * Identidad visual por logro: borde y beam del mismo tono del premio.
 * El beam es un brillo que gira por el borde de la carta (excepción
 * pedida por Neil al "sin glow en reposo" de DESIGN.md). El índice de
 * racha es dinámico (`racha-<nombre>`), por eso se resuelve por prefijo.
 */
const CARD_ACCENTS = {
    pichichi: {
        border: 'border-amber-500/40',
        text: 'text-amber-400',
        beam: '#f59e0b',
    },
    muralla: {
        border: 'border-sky-500/40',
        text: 'text-sky-400',
        beam: '#0ea5e9',
    },
    goleada: {
        border: 'border-rose-500/40',
        text: 'text-rose-400',
        beam: '#f43f5e',
    },
}

const STREAK_ACCENT = {
    border: 'border-orange-500/40',
    text: 'text-orange-400',
    beam: '#f97316',
}

/**
 * Render 3D por logro (public/achievements/). Las cards de racha comparten
 * un único render porque su id es dinámico (`racha-<nombre>`).
 */
const ACHIEVEMENT_RENDERS = {
    pichichi: '/achievements/pichichi.webp',
    muralla: '/achievements/muralla.webp',
    goleada: '/achievements/goleada.webp',
}

/**
 * Resuelve la ruta del render de una card según su id de logro.
 */
const getRender = (id) =>
    id.startsWith('racha-')
        ? '/achievements/racha.webp'
        : ACHIEVEMENT_RENDERS[id]

/**
 * Resuelve la paleta de una card según su id de logro.
 */
const getAccent = (id) =>
    id.startsWith('racha-') ? STREAK_ACCENT : CARD_ACCENTS[id] || null

/**
 * Carta dorada "Micasino.com" para el líder de la quiniela (RF-18). Ocupa
 * una celda del grid con el mismo formato de carta que los logros; el
 * dorado se aplica como acento (borde + beam + nombre), única excepción
 * cromática decidida por Neil (RNF-2); el título va literal, sin
 * explicación (RNF-1). Con empate a total y a eliminatorias se comparte
 * entre varios nombres (CL-7).
 */
function CardMicasino({ mejor, draftPicks }) {
    return (
        <Motion.article
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ '--beam-color': '#f59e0b' }}
            className="card-beam flex aspect-[3/4] flex-col items-center justify-center text-center gap-2 p-5 rounded-xl bg-surface border border-amber-500/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(2,6,23,0.6)]"
        >
            <img src="/achievements/micasino.webp" alt="" className="size-24 object-contain" loading="lazy" />
            <h4 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-muted mt-1.5">
                TriunfoBet
            </h4>
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
                {mejor.names.map((name) => (
                    <div key={name} className="flex flex-col items-center min-w-0">
                        <p className="text-base font-bold font-display truncate max-w-full text-amber-400">
                            {name}
                        </p>
                        <TeamTag player={name} draftPicks={draftPicks} alignCenter />
                    </div>
                ))}
            </div>
            <p className="text-xs text-muted leading-snug">
                {mejor.points} {mejor.points === 1 ? 'punto' : 'puntos'}
            </p>
        </Motion.article>
    )
}

/**
 * Vista dedicada a las estadísticas sociales del torneo: rachas activas y
 * logros honoríficos presentados como cartas (más altas que anchas, con
 * beam de brillo girando por el borde), incluida la carta dorada
 * "Micasino.com" del líder de la quiniela como última celda del grid.
 * Grilla de 2 columnas (render arriba, título, holder y descripción);
 * sin partidos jugados pero con quiniela viva, solo se ve la carta dorada.
 */
export default function AchievementsView({ tournament }) {
    const { matches, groups, knockout, predictions, draftPicks } = tournament.data

    const hasPlayed = matches.some(
        (m) => m.score1 !== null && m.score2 !== null
    )

    // El líder de la quiniela se evalúa SIEMPRE, fuera del early-return de
    // partidos jugados: pueden existir picks puntuados de cruces sin un solo
    // partido de grupo disputado (RF-18 y RF-19 mandan sobre ese atajo).
    const mejorPronosticador = getBestPredictor(
        getPredictionStandings(matches, groups, knockout, predictions)
    )

    if (!hasPlayed) {
        if (mejorPronosticador) {
            // Solo la carta dorada, centrada en ancho de carta: la quiniela
            // está viva aunque no haya partidos.
            return (
                <Motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col gap-6 mb-24 mt-16"
                >
                    <div className="w-44 self-center">
                        <CardMicasino mejor={mejorPronosticador} draftPicks={draftPicks} />
                    </div>
                </Motion.div>
            )
        }
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
            <section className="bg-surface border border-line rounded-2xl p-6">
                <h3 className="text-base font-semibold font-display text-ink mb-4 flex items-center gap-2">
                    <Flame size={18} className="text-emerald-400" />
                    Rachas Activas
                </h3>
                {streaks.length === 0 ? (
                    <p className="text-sm text-muted italic">
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
                                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-300">
                                    <img src="/achievements/racha.webp" alt="" className="size-4 object-contain" loading="lazy" />
                                    {s.name} · {s.streak} seguidas
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
                        const render = getRender(a.id)
                        return (
                            <Motion.article
                                key={a.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                style={{ '--beam-color': accent ? accent.beam : '#34d399' }}
                                className={`card-beam flex aspect-[3/4] flex-col items-center justify-center text-center gap-3 p-5 rounded-xl bg-surface border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(2,6,23,0.6)] ${
                                    accent ? accent.border : 'border-line'
                                }`}
                            >
                                <img src={render} alt="" className="size-24 object-contain" loading="lazy" />
                                <h4 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-muted mt-1.5">
                                    {a.title}
                                </h4>
                                <div className="flex flex-col items-center min-w-0">
                                    <p className={`text-base font-bold font-display truncate max-w-full ${accent ? accent.text : 'text-emerald-400'}`}>
                                        {a.holder}
                                    </p>
                                    <TeamTag player={a.holder} draftPicks={draftPicks} alignCenter />
                                </div>
                                <p className="text-sm text-muted leading-snug">{a.description}</p>
                            </Motion.article>
                        )
                    })}

                    {/* Carta dorada del líder de la quiniela: última celda del grid (RF-18) */}
                    {mejorPronosticador && (
                        <CardMicasino mejor={mejorPronosticador} draftPicks={draftPicks} />
                    )}
                    {achievements.length === 0 && (
                        <p className="text-xs text-muted italic text-center">
                            Aún no hay logros que repartir...
                        </p>
                    )}
                </div>
            </section>
        </Motion.div>
    )
}
