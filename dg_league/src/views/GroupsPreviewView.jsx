import { useEffect, useState } from 'react'
import { motion as Motion, AnimatePresence } from 'motion/react'
import { Play } from 'lucide-react'
import TeamTag from '../components/TeamTag'

// Ritmo del revelado dominó (en segundos): cada fila entra STEP después de
// la anterior, y entre el cierre de un grupo y el inicio del otro hay una
// pequeña pausa para que se lean los planteles completos.
const STEP = 0.09
const INICIO_A = 0.4
const PAUSA_ENTRE_GRUPOS = 0.35

/**
 * Tabla de posiciones de un grupo recién sorteado: mismo formato que la de
 * TournamentView (Jugador, PJ, DG, PTS, con las dos primeras plazas marcadas
 * como clasificadas). La tarjeta "salta" en cardDelay y sus filas se revelan
 * en dominó a partir de rowsDelay. Como aún no hay partidos, el cálculo viene
 * de getStandings con todo en 0 (el orden respeta el sorteo).
 *
 * @param {Object} props
 * @param {string} props.title - Subtítulo del grupo ("Grupo A" | "Grupo B").
 * @param {Array} props.standings - Filas de getGroupStandings para el grupo.
 * @param {number} props.cardDelay - Segundos hasta el salto de la tarjeta.
 * @param {number} props.rowsDelay - Segundos hasta la primera fila del dominó.
 * @param {Array<{player: string, teamId: string}>} props.draftPicks - Elecciones del draft.
 */
function GroupTable({ title, standings, cardDelay, rowsDelay, draftPicks }) {
    return (
        <Motion.div
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', bounce: 0.3, delay: cardDelay }}
            className="bg-surface border border-line rounded-2xl overflow-hidden"
        >
            {/* Subtítulo del grupo, arriba de la tabla */}
            <div className="px-4 py-3 border-b border-line">
                <h3 className="text-xs font-bold tracking-[0.35em] text-emerald-400 uppercase text-center font-display">
                    {title}
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
                        <tr>
                            <th className="px-4 py-3">Jugador</th>
                            <th className="px-2 py-3 text-center">PJ</th>
                            <th className="px-2 py-3 text-center">DG</th>
                            <th className="px-4 py-3 text-center">PTS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {standings.map((player, idx) => (
                            <Motion.tr
                                key={player.name}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: rowsDelay + idx * STEP, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                className={`border-b border-line last:border-0 ${idx === 0 ? 'shadow-[inset_3px_0_0_#10B981]' : ''}`}
                            >
                                <td className="px-4 py-4 font-medium text-ink">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-6 text-center text-sm font-display font-bold ${idx < 2 ? 'text-emerald-400' : 'text-muted'}`}>
                                            {idx + 1}
                                        </span>
                                        <div className="flex flex-col min-w-0">
                                            <span className="truncate">{player.name}</span>
                                            <TeamTag player={player.name} draftPicks={draftPicks} alignCenter />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-2 py-4 text-center text-muted text-base font-display tabular-nums">{player.played}</td>
                                <td className="px-2 py-4 text-center text-muted text-base font-display tabular-nums">
                                    {player.goalDifference > 0 ? `+${player.goalDifference}` : player.goalDifference}
                                </td>
                                <td className="px-4 py-4 text-center font-display font-bold text-emerald-400 text-lg tabular-nums">{player.points}</td>
                            </Motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Motion.div>
    )
}

/**
 * Previsualización de los grupos recién sorteados: pantalla puente entre el
 * draft y el torneo (fase 'drawn'). Muestra las dos tablas en grande y
 * centradas, revela sus filas en dominó (primero el Grupo A, después el B) y
 * habilita el botón "Abrir torneo" que confirma el arranque de la liga.
 *
 * @param {Object} props
 * @param {Object} props.tournament - Estado y acciones del hook useTournament.
 */
export default function GroupsPreviewView({ tournament }) {
    const { data, getStandings, openTournament } = tournament
    const { draftPicks } = data

    const [showButton, setShowButton] = useState(false)
    const [isOpening, setIsOpening] = useState(false)

    const standingsA = getStandings('A')
    const standingsB = getStandings('B')

    // Coreografía del dominó: el Grupo B arranca cuando termina el A (los
    // delays dependen del tamaño real de cada grupo, así que grupos impares
    // cierran bien) y el botón llega justo tras cerrarse el Grupo B.
    const rowsDelayB = INICIO_A + standingsA.length * STEP + PAUSA_ENTRE_GRUPOS
    const cardDelayB = rowsDelayB - 0.25
    const delayBotonMs = (rowsDelayB + standingsB.length * STEP + 0.3) * 1000

    // El botón "Abrir torneo" aparece solo cuando el dominó terminó.
    useEffect(() => {
        const timer = setTimeout(() => setShowButton(true), delayBotonMs)
        return () => clearTimeout(timer)
    }, [delayBotonMs])

    /**
     * Confirma la apertura del torneo: guard anti doble clic, mini salida de
     * la pantalla y cambio de fase a 'group'.
     */
    const handleOpen = () => {
        if (isOpening) return
        setIsOpening(true)
        setTimeout(openTournament, 350)
    }

    return (
        <Motion.div
            animate={isOpening ? { opacity: 0, y: -12 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-10 py-8 min-h-[calc(100vh-120px)] w-full"
        >
            {/* Encabezado de la previsualización */}
            <div className="text-center space-y-2">
                <p className="text-xs font-bold tracking-[0.4em] text-emerald-400 uppercase">
                    El sorteo está hecho
                </p>
                <h2 className="text-3xl md:text-4xl font-black font-display text-white">
                    Así quedan los grupos
                </h2>
            </div>

            {/* Tablas sorteadas, centradas y en grande */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full max-w-md md:max-w-4xl lg:max-w-5xl px-2">
                <GroupTable
                    title="Grupo A"
                    standings={standingsA}
                    cardDelay={0.15}
                    rowsDelay={INICIO_A}
                    draftPicks={draftPicks}
                />
                <GroupTable
                    title="Grupo B"
                    standings={standingsB}
                    cardDelay={cardDelayB}
                    rowsDelay={rowsDelayB}
                    draftPicks={draftPicks}
                />
            </div>

            {/* Apertura del torneo, centrada respecto a las dos tablas */}
            <AnimatePresence>
                {showButton && (
                    <Motion.button
                        onClick={handleOpen}
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', bounce: 0.4 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-emerald-500 text-arena px-10 py-4 rounded-xl font-bold text-lg
                                   flex items-center gap-2 transition-all duration-200 hover:brightness-110 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                    >
                        <Play fill="currentColor" size={20} />
                        Abrir torneo
                    </Motion.button>
                )}
            </AnimatePresence>
        </Motion.div>
    )
}
