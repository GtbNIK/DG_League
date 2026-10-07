import { useState } from 'react'
import { motion as Motion, AnimatePresence } from 'motion/react'
import { Dices, Play } from 'lucide-react'
import { TEAM_CATALOG } from '../utils/teamCatalog'

/**
 * Busca el nombre de un equipo en el catálogo por su id.
 *
 * @param {string} teamId - Id del equipo.
 * @returns {{id: string, name: string, logo: string}|undefined} Equipo encontrado.
 */
const teamById = (teamId) => TEAM_CATALOG.find((team) => team.id === teamId)

/**
 * Vista del draft de equipos: cada jugador elige su club por turnos,
 * uno a la vez, con la posibilidad de elegir al azar. Los equipos
 * elegidos se retiran de la grilla y se fusionan con el jugador en la
 * banda inferior de tarjetas. Al completarse, habilita el arranque de
 * la liga con la animación de sorteo.
 *
 * @param {Object} props
 * @param {Object} props.tournament - Estado y acciones del hook useTournament.
 */
export default function DraftView({ tournament }) {
    const { data, pickTeam, pickRandomTeam, startLeague } = tournament
    const { draftOrder, draftPicks } = data

    // Logos que fallaron al cargar (mostrar iniciales como respaldo)
    const [failedLogos, setFailedLogos] = useState({})
    const [isShuffling, setIsShuffling] = useState(false)

    // Turno actual y derivados (siempre calculados, nunca duplicados en estado)
    const turnIndex = draftPicks.length
    const currentPlayer = draftOrder[turnIndex]
    const nextPlayer = draftOrder[turnIndex + 1]
    const isComplete = draftOrder.length > 0 && !currentPlayer
    const progress = draftOrder.length > 0 ? (turnIndex / draftOrder.length) * 100 : 0
    const availableTeams = TEAM_CATALOG.filter(
        (team) => !draftPicks.some((pick) => pick.teamId === team.id)
    )

    /**
     * Marca el logo de un equipo como fallido para usar el respaldo.
     */
    const handleLogoError = (teamId) =>
        setFailedLogos((prev) => ({ ...prev, [teamId]: true }))

    /**
     * Lanza la animación de sorteo y, al terminar, genera grupos y partidos.
     */
    const handleStartLeague = () => {
        if (isShuffling) return
        setIsShuffling(true)
        setTimeout(() => {
            startLeague()
        }, 2500)
    }

    /**
     * Imagen del escudo con respaldo de iniciales si el archivo falta.
     */
    const TeamLogo = ({ team, size }) => {
        const boxSize = size === 'lg' ? 'w-20 h-20 md:w-24 md:h-24' : 'w-8 h-8'
        if (failedLogos[team.id]) {
            return (
                <span
                    className={`${boxSize} rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center font-black text-emerald-400 ${size === 'lg' ? 'text-3xl' : 'text-xs'}`}
                >
                    {team.name.charAt(0)}
                </span>
            )
        }
        return (
            <img
                src={team.logo}
                alt={`Escudo de ${team.name}`}
                onError={() => handleLogoError(team.id)}
                className={`${boxSize} object-contain`}
            />
        )
    }

    return (
        <div className="flex flex-col items-center gap-8 py-6 min-h-[calc(100vh-120px)]">
            {/* Encabezado del draft */}
            <div className="text-center space-y-3 w-full max-w-md">
                <h2 className="text-xs font-bold tracking-[0.4em] text-emerald-400 uppercase">
                    Draft de Equipos
                </h2>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <Motion.div
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="h-full bg-emerald-500 rounded-full"
                    />
                </div>
            </div>

            {/* Zona superior: turno en curso y grilla de equipos */}
            <AnimatePresence>
                {!isComplete && currentPlayer && (
                    <Motion.div
                        key="draft-area"
                        exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.4 } }}
                        className="flex flex-col items-center gap-8 w-full"
                    >
                        {/* Jugador del turno (cambia con animación por jugador) */}
                        <div className="text-center">
                            <AnimatePresence mode="wait">
                                <Motion.div
                                    key={currentPlayer}
                                    initial={{ y: 24, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -24, opacity: 0 }}
                                    transition={{ duration: 0.35 }}
                                    className="flex flex-col items-center gap-1"
                                >
                                    <p className="text-xs font-bold tracking-[0.3em] text-slate-400 uppercase">
                                        Turno {turnIndex + 1} de {draftOrder.length}
                                    </p>
                                    <h3 className="text-4xl md:text-5xl font-black text-white">
                                        {currentPlayer}
                                    </h3>
                                    {nextPlayer && (
                                        <p className="text-xs text-slate-500 mt-1">
                                            Sigue: {nextPlayer}
                                        </p>
                                    )}
                                </Motion.div>
                            </AnimatePresence>

                            {/* Elección al azar para el turno actual */}
                            <Motion.button
                                onClick={pickRandomTeam}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.94 }}
                                className="mt-4 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-bold
                                           flex items-center gap-2 transition-colors hover:bg-emerald-500/20"
                            >
                                <Dices size={16} />
                                Elegir al azar
                            </Motion.button>
                        </div>

                        {/* Grilla de equipos disponibles (12 plazas para máx. 10 jugadores) */}
                        <Motion.div
                            layout
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 w-full max-w-5xl px-4"
                        >
                            <AnimatePresence mode="popLayout">
                                {availableTeams.map((team, idx) => (
                                    <Motion.button
                                        key={team.id}
                                        layoutId={`team-visual-${team.id}`}
                                        onClick={() => pickTeam(team.id)}
                                        initial={{ opacity: 0, scale: 0.85 }}
                                        animate={{
                                            opacity: 1,
                                            scale: 1,
                                            transition: { delay: idx * 0.04 },
                                        }}
                                        exit={{ opacity: 0, scale: 0.7, transition: { duration: 0.2 } }}
                                        whileHover={{ y: -4 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="bg-surface border border-emerald-500/25 rounded-2xl p-4 md:p-5 flex flex-col items-center gap-3 cursor-pointer
                                                   transition-all duration-200 hover:border-emerald-500/60 hover:shadow-[0_8px_30px_rgba(2,6,23,0.6)]"
                                    >
                                        <TeamLogo team={team} size="lg" />
                                        <span className="text-sm font-bold text-white text-center leading-tight">
                                            {team.name}
                                        </span>
                                    </Motion.button>
                                ))}
                            </AnimatePresence>
                        </Motion.div>
                    </Motion.div>
                )}
            </AnimatePresence>

            {/* Botón final una vez completado el draft */}
            {isComplete && (
                <Motion.button
                    onClick={handleStartLeague}
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', bounce: 0.4 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-emerald-500 text-arena px-10 py-4 rounded-xl font-bold text-lg
                               flex items-center gap-2 transition-all duration-200 hover:brightness-110 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                >
                    <Play fill="currentColor" size={20} />
                    Empezar Liga
                </Motion.button>
            )}

            {/* Banda de equipos ya elegidos: jugador en grande + su club */}
            {draftPicks.length > 0 && (
                <Motion.div layout className="w-full max-w-5xl px-4 flex flex-col items-center gap-4">
                    <p className="text-[10px] font-bold tracking-[0.35em] text-slate-500 uppercase">
                        {isComplete ? 'Equipos del torneo' : 'Ya elegidos'}
                    </p>
                    <Motion.div
                        layout
                        className={
                            isComplete
                                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 w-full'
                                : 'flex flex-wrap justify-center gap-3'
                        }
                    >
                        <AnimatePresence>
                            {draftPicks.map((pick) => {
                                const team = teamById(pick.teamId)
                                if (!team) return null
                                return (
                                    <Motion.div
                                        key={pick.player}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="bg-surface border border-emerald-500/25 rounded-2xl p-4 flex flex-col items-center gap-2 min-w-36"
                                    >
                                        <span className="text-lg font-black text-white leading-tight text-center">
                                            {pick.player}
                                        </span>
                                        {/* Bloque del equipo: vuela desde la grilla por el layoutId compartido */}
                                        <Motion.div
                                            layoutId={`team-visual-${team.id}`}
                                            className="flex items-center gap-2"
                                        >
                                            <TeamLogo team={team} size="sm" />
                                            <span className="text-sm font-bold text-emerald-300">
                                                {team.name}
                                            </span>
                                        </Motion.div>
                                    </Motion.div>
                                )
                            })}
                        </AnimatePresence>
                    </Motion.div>
                </Motion.div>
            )}

            {/* Overlay de sorteo de grupos antes de entrar al torneo */}
            <AnimatePresence>
                {isShuffling && (
                    <Motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center gap-8"
                    >
                        <div className="text-4xl font-black text-emerald-400 animate-pulse tracking-widest">
                            MEZCLANDO...
                        </div>
                        <div className="flex flex-wrap justify-center gap-2 max-w-md px-6">
                            {draftOrder.map((player, idx) => (
                                <Motion.div
                                    key={player}
                                    animate={{ y: [0, -8, 0] }}
                                    transition={{
                                        duration: 0.5,
                                        repeat: Infinity,
                                        delay: idx * 0.1,
                                    }}
                                    className="bg-slate-800/60 px-3 py-2 rounded-lg border border-slate-700/50 text-sm font-medium"
                                >
                                    {player}
                                </Motion.div>
                            ))}
                        </div>
                    </Motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
