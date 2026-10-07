import { useState } from 'react'
import { motion as Motion } from 'motion/react'
import { ChevronDown, ChevronUp, Lock, Trash2, Target } from 'lucide-react'
import TeamTag from '../components/TeamTag'

/**
 * Devuelve el primer nombre de un jugador para etiquetas cortas.
 */
const shortName = (name) => name.split(' ')[0]

/**
 * Vista de pronósticos: registro manual (lo anota Neil por todos) de la
 * predicción de cada amigo sobre cada partido, más una tabla paralela
 * de aciertos que solo puntúa con partidos ya jugados.
 */
export default function PredictionsView({ tournament }) {
    const { data, addPrediction, removePrediction, getPredictionStandings } =
        tournament
    const { players, matches, predictions, draftPicks } = data

    // Sección activa: 'A' | 'B' | 'tabla'
    const [section, setSection] = useState('A')
    const [expandedId, setExpandedId] = useState(null)

    const standings = getPredictionStandings()
    const sectionMatches = section === 'tabla' ? [] : matches.filter((m) => m.groupId === section)

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

    const toggleExpand = (id) =>
        setExpandedId((prev) => (prev === id ? null : id))

    return (
        <div className="flex flex-col gap-6 mb-24 animate-in fade-in duration-300">
            {/* Selector de sección */}
            <div className="flex bg-surface rounded-[10px] p-1 border border-line">
                {[
                    ['A', 'Grupo A'],
                    ['B', 'Grupo B'],
                    ['tabla', 'Tabla'],
                ].map(([key, label]) => (
                    <button
                        key={key}
                        onClick={() => setSection(key)}
                        className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors font-sans ${
                            section === key
                                ? 'bg-emerald-500 text-arena'
                                : 'text-muted hover:text-ink'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {section !== 'tabla' &&
                sectionMatches.map((match, idx) => {
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
                                            {picks}/{players.length}
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

                            {/* Registro de pronósticos por amigo */}
                            {isExpanded && !match.closed && (
                                <div className="px-3 pb-3 pt-1 border-t border-line space-y-1.5">
                                    {players.map((player) => {
                                        const pick = getPick(match.id, player)
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
                                                    {[match.player1, match.player2].map((option) => {
                                                        const isActive = pick === option
                                                        return (
                                                            <button
                                                                key={option}
                                                                onClick={() =>
                                                                    isActive
                                                                        ? removePrediction(match.id, player)
                                                                        : addPrediction(match.id, player, option)
                                                                }
                                                                className={`flex-1 max-w-28 px-2 py-1.5 rounded-md border text-xs font-semibold transition-colors ${
                                                                    isActive
                                                                        ? 'bg-emerald-500 text-arena border-emerald-400'
                                                                        : 'bg-arena border-line text-muted hover:border-emerald-500/40'
                                                                }`}
                                                            >
                                                                {shortName(option)}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </Motion.div>
                    )
                })}

            {section !== 'tabla' && sectionMatches.length === 0 && (
                <p className="text-slate-500 text-center text-sm py-4 italic">
                    No hay partidos definidos.
                </p>
            )}

            {/* Tabla de aciertos */}
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
                                    <th className="px-2 py-3 text-center">Aciertos</th>
                                    <th className="px-4 py-3 text-center">PTS</th>
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
                                            {row.hits}/{row.total}
                                        </td>
                                        <td className="px-4 py-3 text-center font-display font-bold text-emerald-400 tabular-nums">
                                            {row.hits}
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
