import { useState } from 'react'
import { motion as Motion } from 'motion/react'
import { ChevronDown, ChevronUp, Lock, Trash2, Target } from 'lucide-react'
import TeamTag from '../components/TeamTag'
import { DRAW_PICK, getKnockoutBracket, getPickOptions } from '../utils/tournamentLogic'

/**
 * Devuelve el primer nombre de un jugador para etiquetas cortas.
 */
const shortName = (name) => name.split(' ')[0]

/**
 * Etiqueta visible de una opción de pick: el empate es una opción más (RF-1).
 */
const etiquetaPick = (option) => (option === DRAW_PICK ? 'Empate' : shortName(option))

/**
 * Vista de pronósticos: registro manual (lo anota Neil por todos) de la
 * predicción de cada amigo, organizada en Fase de Grupos, Eliminatorias y
 * Tabla (RF-10). En grupos cada partido abierto ofrece local, empate o
 * visita (RF-1); quien juega un partido no aparece como votante (RF-13) y
 * el total posible del contador resta a sus dos participantes (RF-14).
 */
export default function PredictionsView({ tournament }) {
    const { data, addPrediction, removePrediction, getPredictionStandings } =
        tournament
    const { players, matches, groups, knockout, predictions, draftPicks } = data

    // Sección activa: 'grupos' | 'ko' | 'tabla'
    const [section, setSection] = useState('grupos')
    const [expandedId, setExpandedId] = useState(null)

    // Ya ordenada por la función pura: total desc → eliminatorias desc → alfabético (RF-16, CL-7).
    const standings = getPredictionStandings()
    // Única fuente de verdad de los cruces: participantes (reales o placeholder),
    // confirmaciones, marcadores y ganador derivados de grupos + eliminatorias.
    const bracket = getKnockoutBracket(matches, groups, knockout)

    /**
     * Pick actual de un amigo en un partido concreto (o null si no pronosticó).
     */
    const getPick = (matchId, player) => {
        const found = predictions.find(
            (p) => p.matchId === matchId && p.player === player
        )
        return found ? found.pick : null
    }

    /**
     * Cantidad de amigos que ya pronosticaron un partido.
     */
    const countPicks = (matchId) =>
        predictions.filter((p) => p.matchId === matchId).length

    /**
     * Amigos elegibles para votar un enfrentamiento: sus dos participantes
     * quedan fuera de la lista (RF-13).
     */
    const votantes = (a, b) => players.filter((p) => p !== a && p !== b)

    /**
     * Panel de picks compartido por partidos de grupo y cruces: una fila por
     * votante con sus opciones de apuesta (toggle activo/inactivo). En las
     * opciones, la primera y la última son siempre los dos participantes: el
     * empate va en medio en grupos (RF-1) y no existe en cruces (RF-4).
     */
    const panelDePicks = (matchId, opciones) => (
        <div className="px-3 pb-3 pt-1 border-t border-line space-y-1.5">
            {votantes(opciones[0], opciones[opciones.length - 1]).map((player) => {
                const pick = getPick(matchId, player)
                return (
                    <div
                        key={player}
                        className="flex items-center justify-between gap-2 py-1"
                    >
                        <span className="flex flex-col min-w-0 w-20 shrink-0">
                            <span className="text-xs font-medium text-ink truncate">
                                {shortName(player)}
                            </span>
                            <TeamTag player={player} draftPicks={draftPicks} />
                        </span>
                        <div className="flex gap-1.5 flex-1 justify-end">
                            {opciones.map((option) => {
                                const isActive = pick === option
                                return (
                                    <button
                                        key={option}
                                        onClick={() =>
                                            isActive
                                                ? removePrediction(matchId, player)
                                                : addPrediction(matchId, player, option)
                                        }
                                        className={`flex-1 max-w-28 px-2 py-1.5 rounded-md border text-xs font-semibold transition-colors ${
                                            isActive
                                                ? 'bg-emerald-500 text-arena border-emerald-400'
                                                : 'bg-arena border-line text-muted hover:border-emerald-500/40'
                                        }`}
                                    >
                                        {etiquetaPick(option)}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )
            })}
        </div>
    )

    // Total posible de picks por partido: todos los amigos menos los 2 que juegan (RF-14).
    const totalPosible = Math.max(0, players.length - 2)

    const toggleExpand = (id) =>
        setExpandedId((prev) => (prev === id ? null : id))

    return (
        <div className="flex flex-col gap-6 mb-24 animate-in fade-in duration-300">
            {/* Selector de sección con pastilla deslizante (layoutId propio) */}
            <div className="flex bg-surface rounded-[10px] p-1 border border-line">
                {[
                    ['grupos', 'Fase de Grupos'],
                    ['ko', 'Eliminatorias'],
                    ['tabla', 'Tabla'],
                ].map(([key, label]) => (
                    <button
                        key={key}
                        onClick={() => setSection(key)}
                        className={`relative flex-1 py-2 text-sm font-semibold rounded-md transition-colors font-sans ${
                            section === key ? 'text-arena' : 'text-muted hover:text-ink'
                        }`}
                    >
                        {section === key && (
                            <Motion.div
                                layoutId="pred-pill"
                                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                                className="absolute inset-0 bg-emerald-500 rounded-md"
                            />
                        )}
                        <span className="relative z-10">{label}</span>
                    </button>
                ))}
            </div>

            {/* Fase de Grupos: ambos grupos con sub-encabezado (RF-11) */}
            {section === 'grupos' &&
                ['A', 'B'].map((groupId) => {
                    const sectionMatches = matches.filter((m) => m.groupId === groupId)
                    return (
                        <section key={groupId} className="flex flex-col gap-3">
                            <h3 className="text-lg font-semibold font-display text-ink">
                                Grupo {groupId}
                            </h3>
                            {sectionMatches.length === 0 && (
                                <p className="text-muted text-center text-sm py-4 italic">
                                    No hay partidos definidos.
                                </p>
                            )}
                            {sectionMatches.map((match, idx) => {
                                const isExpanded = expandedId === match.id
                                const picks = countPicks(match.id)

                                return (
                                    <Motion.div
                                        key={match.id}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                        className={`bg-surface border rounded-2xl overflow-hidden transition-all duration-200 ${
                                            match.closed
                                                ? 'bg-emerald-500/10 border-emerald-500/50'
                                                : 'border-emerald-500/25 hover:border-emerald-500/50 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(2,6,23,0.6)]'
                                        }`}
                                    >
                                        {/* Cabecera del partido */}
                                        <button
                                            onClick={() => toggleExpand(match.id)}
                                            disabled={match.closed}
                                            className="w-full flex items-center justify-between p-3 text-left"
                                        >
                                            <span className="flex-1 flex flex-col items-end text-right font-semibold text-sm text-ink pr-2 min-w-0 max-w-[38%]">
                                                <span className="truncate max-w-full">{match.player1}</span>
                                                <TeamTag player={match.player1} draftPicks={draftPicks} />
                                            </span>
                                            <span className="shrink-0 flex items-center gap-1.5 text-[11px] font-semibold text-muted font-display tabular-nums">
                                                {match.score1 !== null && match.score2 !== null && (
                                                    <span className="text-emerald-300">
                                                        {match.score1}-{match.score2}
                                                    </span>
                                                )}
                                                {match.closed ? (
                                                    <Lock size={14} className="text-emerald-400" />
                                                ) : (
                                                    <>
                                                        <Target size={14} />
                                                        {picks}/{totalPosible}
                                                    </>
                                                )}
                                            </span>
                                            <span className="flex-1 flex flex-col items-start text-left font-semibold text-sm text-ink pl-2 min-w-0 max-w-[38%]">
                                                <span className="truncate max-w-full">{match.player2}</span>
                                                <TeamTag player={match.player2} draftPicks={draftPicks} />
                                            </span>
                                            {!match.closed &&
                                                (isExpanded ? (
                                                    <ChevronUp size={16} className="text-muted ml-1" />
                                                ) : (
                                                    <ChevronDown size={16} className="text-muted ml-1" />
                                                ))}
                                        </button>

                                        {/* Registro de pronósticos por amigo, sin los 2 participantes (RF-13) */}
                                        {isExpanded && !match.closed &&
                                            panelDePicks(match.id, [match.player1, DRAW_PICK, match.player2])}
                                    </Motion.div>
                                )
                            })}
                        </section>
                    )
                })}

            {/* Eliminatorias: los 4 cruces con participantes reales o placeholder (RF-12) */}
            {section === 'ko' && (
                <section className="flex flex-col gap-3">
                    {bracket.map((cruce, idx) => {
                        const isExpanded = expandedId === cruce.id
                        const picks = countPicks(cruce.id)
                        // Apuesta habilitada solo con ambos participantes confirmados y sin cerrar (RF-5, RF-9).
                        const apuestaAbierta = cruce.confirmed && !cruce.closed
                        // En cruces solo 2 opciones, sin empate (RF-4).
                        const opciones = getPickOptions(cruce.p1, cruce.p2, false)

                        return (
                            <Motion.div
                                key={cruce.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                className={`bg-surface border rounded-2xl overflow-hidden transition-all duration-200 ${
                                    cruce.closed
                                        ? 'bg-emerald-500/10 border-emerald-500/50'
                                        : 'border-emerald-500/25 hover:border-emerald-500/50 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(2,6,23,0.6)]'
                                }`}
                            >
                                {/* Etiqueta de la ronda (patrón del cuadro de TournamentView) */}
                                <p className="pt-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted text-center">
                                    {cruce.label}
                                </p>

                                {/* Cabecera del cruce */}
                                <button
                                    onClick={() => toggleExpand(cruce.id)}
                                    disabled={!apuestaAbierta}
                                    className="w-full flex items-center justify-between p-3 pt-2 text-left"
                                >
                                    <span className={`flex-1 flex flex-col items-end text-right font-semibold text-sm pr-2 min-w-0 max-w-[38%] ${cruce.confirmedP1 ? 'text-ink' : 'text-muted'}`}>
                                        <span className="truncate max-w-full">{cruce.p1}</span>
                                        {cruce.confirmedP1 && <TeamTag player={cruce.p1} draftPicks={draftPicks} />}
                                    </span>
                                    <span className="shrink-0 flex items-center gap-1.5 text-[11px] font-semibold text-muted font-display tabular-nums">
                                        {cruce.score1 !== null && cruce.score2 !== null && (
                                            <span className="text-emerald-300">
                                                {cruce.score1}-{cruce.score2}
                                            </span>
                                        )}
                                        {cruce.closed ? (
                                            <Lock size={14} className="text-emerald-400" />
                                        ) : (
                                            apuestaAbierta && (
                                                <>
                                                    <Target size={14} />
                                                    {picks}/{totalPosible}
                                                </>
                                            )
                                        )}
                                    </span>
                                    <span className={`flex-1 flex flex-col items-start text-left font-semibold text-sm pl-2 min-w-0 max-w-[38%] ${cruce.confirmedP2 ? 'text-ink' : 'text-muted'}`}>
                                        <span className="truncate max-w-full">{cruce.p2}</span>
                                        {cruce.confirmedP2 && <TeamTag player={cruce.p2} draftPicks={draftPicks} />}
                                    </span>
                                    {apuestaAbierta &&
                                        (isExpanded ? (
                                            <ChevronUp size={16} className="text-muted ml-1" />
                                        ) : (
                                            <ChevronDown size={16} className="text-muted ml-1" />
                                        ))}
                                </button>

                                {/* Picks del cruce: solo con participantes confirmados y sin cerrar (RF-5, RF-9) */}
                                {isExpanded && apuestaAbierta && panelDePicks(cruce.id, opciones)}

                                {/* Sin confirmar: sin botones, solo el aviso (RF-5) */}
                                {!cruce.confirmed && !cruce.closed && (
                                    <p className="px-3 pb-3 text-[11px] text-muted italic text-center">
                                        Se habilita cuando se confirmen los clasificados.
                                    </p>
                                )}
                            </Motion.div>
                        )
                    })}
                </section>
            )}

            {/* Tabla de aciertos: TOTAL del torneo como columna principal, subtotales por fase (RF-15, RF-16, RF-17) */}
            {section === 'tabla' && (
                <div className="bg-surface border border-line rounded-2xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-line">
                        <h3 className="text-lg font-semibold font-display text-ink flex items-center gap-2">
                            <Target size={18} className="text-emerald-400" />
                            Liga de Pronósticos
                        </h3>
                    </div>
                    {standings.length === 0 ? (
                        <p className="text-muted text-center text-sm py-6 italic">
                            Aún no hay pronósticos registrados.
                        </p>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
                                <tr>
                                    <th className="px-4 py-3">#</th>
                                    <th className="px-2 py-3">Amigo</th>
                                    <th className="px-2 py-3 text-center">Grupos</th>
                                    <th className="px-2 py-3 text-center">Eli.</th>
                                    <th className="px-4 py-3 text-center">TOTAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {standings.map((row, idx) => (
                                    <tr
                                        key={row.name}
                                        className={`border-b border-line last:border-0 transition-colors hover:bg-surface-raised ${idx === 0 ? 'shadow-[inset_3px_0_0_#10B981]' : ''}`}
                                    >
                                        <td className="px-4 py-3">
                                            <span
                                                className={`font-display font-bold ${idx === 0 ? 'text-emerald-400' : 'text-muted'}`}
                                            >
                                                {idx + 1}
                                            </span>
                                        </td>
                                        <td className="px-2 py-3 font-medium text-ink">
                                            <div className="flex flex-col min-w-0">
                                                <span className="truncate">{row.name}</span>
                                                <TeamTag player={row.name} draftPicks={draftPicks} />
                                            </div>
                                        </td>
                                        <td className="px-2 py-3 text-center text-muted font-display tabular-nums">
                                            {row.group.hits}/{row.group.total}
                                        </td>
                                        <td className="px-2 py-3 text-center text-muted font-display tabular-nums">
                                            {row.ko.hits}/{row.ko.total}
                                        </td>
                                        {/* TOTAL: columna principal, mismo tratamiento que los PTS de posiciones */}
                                        <td className="px-4 py-3 text-center font-display font-bold text-lg text-emerald-400 tabular-nums">
                                            {row.total}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    )
}
