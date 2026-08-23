import { useState } from 'react'
import { ChevronDown, ChevronUp, Lock, Trash2, Target } from 'lucide-react'

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
    const { players, matches, predictions } = data

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
            <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
                {[
                    ['A', 'GRUPO A'],
                    ['B', 'GRUPO B'],
                    ['tabla', 'TABLA'],
                ].map(([key, label]) => (
                    <button
                        key={key}
                        onClick={() => setSection(key)}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${
                            section === key
                                ? 'bg-emerald-500 text-slate-950'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {section !== 'tabla' &&
                sectionMatches.map((match) => {
                    const isExpanded = expandedId === match.id
                    const picks = countPicks(match.id)

                    return (
                        <div
                            key={match.id}
                            className={`glass-panel overflow-hidden ${
                                match.closed ? 'bg-emerald-500/10 border-emerald-500/30' : ''
                            }`}
                        >
                            {/* Cabecera del partido */}
                            <button
                                onClick={() => toggleExpand(match.id)}
                                disabled={match.closed}
                                className="w-full flex items-center justify-between p-3 text-left"
                            >
                                <span className="flex-1 text-right font-bold text-sm pr-2 truncate max-w-[38%]">
                                    {match.player1}
                                </span>
                                <span className="shrink-0 flex items-center gap-1.5 text-xs font-black text-slate-400">
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
                                <span className="flex-1 font-bold text-sm pl-2 truncate max-w-[38%]">
                                    {match.player2}
                                </span>
                                {!match.closed &&
                                    (isExpanded ? (
                                        <ChevronUp size={16} className="text-slate-500 ml-1" />
                                    ) : (
                                        <ChevronDown size={16} className="text-slate-500 ml-1" />
                                    ))}
                            </button>

                            {/* Registro de pronósticos por amigo */}
                            {isExpanded && !match.closed && (
                                <div className="px-3 pb-3 pt-1 border-t border-slate-700/50 space-y-1.5">
                                    {players.map((player) => {
                                        const pick = getPick(match.id, player)
                                        return (
                                            <div
                                                key={player}
                                                className="flex items-center justify-between gap-2 py-1"
                                            >
                                                <span className="text-xs font-medium text-slate-300 truncate w-20 shrink-0">
                                                    {shortName(player)}
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
                                                                className={`flex-1 max-w-28 px-2 py-1.5 rounded-md border text-xs font-bold transition-colors ${
                                                                    isActive
                                                                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                                                                        : 'bg-slate-900/70 border-slate-700 text-slate-400 hover:border-slate-500'
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
                        </div>
                    )
                })}

            {section !== 'tabla' && sectionMatches.length === 0 && (
                <p className="text-slate-500 text-center text-sm py-4 italic">
                    No hay partidos definidos.
                </p>
            )}

            {/* Tabla de aciertos */}
            {section === 'tabla' && (
                <div className="glass-panel overflow-hidden">
                    <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700/50">
                        <h3 className="text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
                            <Target size={18} className="text-emerald-400" />
                            Liga de Pronósticos
                        </h3>
                    </div>
                    {standings.length === 0 ? (
                        <p className="text-slate-500 text-center text-sm py-6 italic">
                            Aún no hay pronósticos registrados.
                        </p>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-400 uppercase bg-slate-900/50">
                                <tr>
                                    <th className="px-4 py-3 font-medium">#</th>
                                    <th className="px-2 py-3 font-medium">Amigo</th>
                                    <th className="px-2 py-3 font-medium text-center">Aciertos</th>
                                    <th className="px-4 py-3 font-black text-emerald-400 text-center">PTS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {standings.map((row, idx) => (
                                    <tr
                                        key={row.name}
                                        className={`border-b border-slate-800 last:border-0 ${idx === 0 ? 'bg-emerald-500/5' : ''}`}
                                    >
                                        <td className="px-4 py-3">
                                            <span
                                                className={`font-black ${idx === 0 ? 'text-emerald-400' : 'text-slate-600'}`}
                                            >
                                                {idx + 1}
                                            </span>
                                        </td>
                                        <td className="px-2 py-3 font-medium">{row.name}</td>
                                        <td className="px-2 py-3 text-center text-slate-400">
                                            {row.hits}/{row.total}
                                        </td>
                                        <td className="px-4 py-3 text-center font-black text-white">
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
