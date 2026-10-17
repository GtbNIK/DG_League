import { useState } from 'react'
import { motion as Motion } from 'motion/react'
import TeamTag from '../components/TeamTag'
import { getKnockoutBracket, isBlowout } from '../utils/tournamentLogic'

export default function TournamentView({ tournament }) {
    const { data, getStandings, updateMatchScore, updateKnockoutScore } = tournament
  const { matches, groups, knockout, draftPicks } = data

  const [activeGroup, setActiveGroup] = useState('A')

  const standingsA = getStandings('A')
  const standingsB = getStandings('B')

  const currentGroupMatches = matches.filter(m => m.groupId === activeGroup)
  const currentStandings = activeGroup === 'A' ? standingsA : (activeGroup === 'B' ? standingsB : [])

  // Convierte el texto del input a marcador válido: '' → null (partido sin
  // jugar). Negativos y valores no numéricos también colapsan a null para no
  // corromper la tabla (una diferencia de goles negativa sería un dato inválido).
  const toScore = (value) => {
    if (value === '' || value === null || value === undefined) return null
    const n = parseInt(value, 10)
    return Number.isNaN(n) || n < 0 ? null : n
  }

  // Los marcadores SIEMPRE son corregibles: la regla del nocaut 3-0 es social
  // (la aplican los jugadores) y la app solo la destaca visualmente (isBlowout).
  const handleScoreChange = (match, p1Score, p2Score) => {
    updateMatchScore(match.id, toScore(p1Score), toScore(p2Score))
  }

  const handleKnockoutScoreChange = (stage, p1Score, p2Score) => {
    updateKnockoutScore(stage, toScore(p1Score), toScore(p2Score))
  }

  // Única fuente de verdad del cuadro: participantes (reales o placeholder),
  // confirmaciones, marcadores y ganador derivados del estado. Quirk corregido:
  // una semi solo se decide con AMBOS marcadores (getKnockoutBracket).
  const bracket = getKnockoutBracket(matches, groups, knockout)
  const cruceDe = (stage) => bracket.find((cruce) => cruce.stage === stage)
  const semi1 = cruceDe('semi1')
  const semi2 = cruceDe('semi2')
  const cruceFinal = cruceDe('final')
  const cruceTercero = cruceDe('third')

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* Group Selector */}
      <div className="flex bg-surface rounded-[10px] p-1 border border-line">
        {[
            ['A', 'Grupo A'],
            ['B', 'Grupo B'],
            ['KO', 'Eliminatorias'],
        ].map(([key, label]) => (
            <button
                key={key}
                onClick={() => setActiveGroup(key)}
                className={`relative flex-1 py-2 text-sm font-semibold rounded-md transition-colors font-sans ${
                    activeGroup === key ? 'text-arena' : 'text-muted hover:text-ink'
                }`}
            >
                {/* Pastilla esmeralda deslizante entre secciones */}
                {activeGroup === key && (
                    <Motion.div
                        layoutId="group-pill"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                        className="absolute inset-0 bg-emerald-500 rounded-md"
                    />
                )}
                <span className="relative z-10">{label}</span>
            </button>
        ))}
      </div>

      {activeGroup !== 'KO' && (
        <div className="md:grid md:grid-cols-2 md:gap-6">
          <div className="bg-surface border border-line rounded-2xl overflow-hidden md:h-[calc(75vh-240px)] md:overflow-auto">
            <div className="px-4 py-3 border-b border-line flex justify-between items-center">
              <h3 className="text-lg font-semibold font-display text-ink">Tabla de Posiciones</h3>
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
                  {currentStandings.map((player, idx) => (
                    <tr key={player.name} className={`border-b border-line last:border-0 transition-colors hover:bg-surface-raised ${idx === 0 ? 'shadow-[inset_3px_0_0_#10B981]' : ''}`}>
                      <td className="px-4 py-4 font-medium text-ink">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 text-center text-sm font-display font-bold ${idx < 2 ? 'text-emerald-400' : 'text-muted'}`}>{idx + 1}</span>
                          <div className="flex flex-col min-w-0">
                            <span className="truncate">{player.name}</span>
                            <TeamTag player={player.name} draftPicks={draftPicks} alignCenter />
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-4 text-center text-muted text-base font-display tabular-nums">{player.played}</td>
                      <td className="px-2 py-4 text-center text-muted text-base font-display tabular-nums">{player.goalDifference > 0 ? `+${player.goalDifference}` : player.goalDifference}</td>
                      <td className="px-4 py-4 text-center font-display font-bold text-emerald-400 text-lg tabular-nums">{player.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-surface border border-line rounded-2xl p-4 mb-20 md:mb-0">
            <h3 className="text-lg font-semibold font-display text-ink mb-4">Fixture · Grupo {activeGroup}</h3>
            <div className="space-y-3">
              {currentGroupMatches.length === 0 && (
                <p className="text-muted text-center text-sm py-4">No hay partidos definidos.</p>
              )}
              {currentGroupMatches.map((match, idx) => (
                <Motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className={`flex items-center justify-between p-3 rounded-md border transition-all duration-200 ${isBlowout(match.score1, match.score2) ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-arena border-emerald-500/25 hover:border-emerald-500/50 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(2,6,23,0.6)]'}`}
                >
                  <div className="flex-1 flex flex-col items-end text-right font-medium text-base text-ink pr-3 min-w-0 max-w-[40%]">
                    <span className="truncate max-w-full">{match.player1}</span>
                    <TeamTag player={match.player1} draftPicks={draftPicks} />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <input type="number" min="0" max="20" value={match.score1 ?? ''} onChange={(e) => handleScoreChange(match, e.target.value, match.score2)} className="w-12 h-12 bg-arena border border-line rounded-md text-center font-display font-bold text-xl tabular-nums text-emerald-400 focus:outline-none focus:border-emerald-400 focus:shadow-[0_0_20px_rgba(16,185,129,0.35)]" />
                    <span className="text-muted font-semibold text-[11px]">VS</span>
                    <input type="number" min="0" max="20" value={match.score2 ?? ''} onChange={(e) => handleScoreChange(match, match.score1, e.target.value)} className="w-12 h-12 bg-arena border border-line rounded-md text-center font-display font-bold text-xl tabular-nums text-emerald-400 focus:outline-none focus:border-emerald-400 focus:shadow-[0_0_20px_rgba(16,185,129,0.35)]" />
                  </div>
                  <div className="flex-1 flex flex-col items-start text-left font-medium text-base text-ink pl-3 min-w-0 max-w-[40%]">
                    <span className="truncate max-w-full">{match.player2}</span>
                    <TeamTag player={match.player2} draftPicks={draftPicks} />
                  </div>
                </Motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Knockout Stage */}
      {activeGroup === 'KO' && (
        <div className="md:h-[calc(100vh-240px)] md:flex md:flex-col md:justify-center">
          <div className="bg-surface border border-line rounded-2xl p-4 mb-20 md:hidden">
            <h3 className="text-lg font-semibold font-display text-ink mb-6 text-center">Cuadro Eliminatorio</h3>
            <div className="space-y-6">
              {bracket.map((cruce, idx) => (
                <Motion.div
                    key={cruce.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className={`p-4 rounded-xl border transition-all duration-200 ${cruce.stage === 'final' ? 'border-amber-500/60 bg-amber-500/10 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(2,6,23,0.6)]' : 'border-emerald-500/25 bg-arena hover:border-emerald-500/50 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(2,6,23,0.6)]'}`}
                >
                  <h4 className={`text-[11px] font-semibold uppercase tracking-[0.06em] text-center mb-3 ${cruce.stage === 'final' ? 'text-amber-400' : 'text-muted'}`}>{cruce.label}</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 flex flex-col items-end text-right font-semibold text-sm pr-3 min-w-0 max-w-[40%]">
                      {/* Resaltado de ganador solo con cruce decidido (winner) */}
                      <span className={`truncate max-w-full ${cruce.winner === cruce.p1 ? 'text-ink' : 'text-muted'}`}>{cruce.p1}</span>
                      <TeamTag player={cruce.p1} draftPicks={draftPicks} />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <input type="number" min="0" max="20" value={cruce.score1 ?? ''} onChange={(e) => handleKnockoutScoreChange(cruce.stage, e.target.value, cruce.score2)} className={`w-10 h-10 border rounded-md text-center font-display font-bold text-lg tabular-nums text-emerald-400 focus:outline-none focus:border-emerald-400 focus:shadow-[0_0_20px_rgba(16,185,129,0.35)] ${cruce.stage === 'final' ? 'bg-arena border-amber-500/50' : 'bg-arena border-line'}`} />
                      <span className="text-muted font-semibold text-[11px]">VS</span>
                      <input type="number" min="0" max="20" value={cruce.score2 ?? ''} onChange={(e) => handleKnockoutScoreChange(cruce.stage, cruce.score1, e.target.value)} className={`w-10 h-10 border rounded-md text-center font-display font-bold text-lg tabular-nums text-emerald-400 focus:outline-none focus:border-emerald-400 focus:shadow-[0_0_20px_rgba(16,185,129,0.35)] ${cruce.stage === 'final' ? 'bg-arena border-amber-500/50' : 'bg-arena border-line'}`} />
                    </div>
                    <div className="flex-1 flex flex-col items-start text-left font-semibold text-sm pl-3 min-w-0 max-w-[40%]">
                      <span className={`truncate max-w-full ${cruce.winner === cruce.p2 ? 'text-ink' : 'text-muted'}`}>{cruce.p2}</span>
                      <TeamTag player={cruce.p2} draftPicks={draftPicks} />
                    </div>
                  </div>
                </Motion.div>
              ))}
            </div>
          </div>

          {/* Altura dinamica: el panel mide lo que mide el bracket, sin espacio vacio sobrante */}
          <div className="hidden md:block relative bg-surface border border-line rounded-2xl p-6 h-fit">
            <h3 className="text-lg font-semibold font-display text-ink mb-6 text-center">Cuadro Eliminatorio</h3>
            <div className="grid grid-cols-3 gap-6 items-center relative z-30">
                <div className="flex flex-col gap-6">
                  <div className="p-3 rounded-xl border border-emerald-500/25 bg-arena h-fit relative z-40 transition-all duration-200 hover:border-emerald-500/50 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(2,6,23,0.6)]">
                    <h4 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-center mb-2 text-muted">Semifinal 1</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 flex flex-col items-end text-right font-semibold text-sm pr-3 min-w-0">
                        <span className={`truncate max-w-full ${semi1.winner === semi1.p1 ? 'text-ink' : 'text-muted'}`}>{semi1.p1}</span>
                        <TeamTag player={semi1.p1} draftPicks={draftPicks} />
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <input type="number" min="0" max="20" value={semi1.score1 ?? ''} onChange={(e) => handleKnockoutScoreChange('semi1', e.target.value, semi1.score2)} className="w-10 h-10 bg-arena border border-line rounded-md text-center font-display font-bold text-lg tabular-nums text-emerald-400 focus:outline-none focus:border-emerald-400" />
                        <span className="text-muted font-semibold text-[11px]">VS</span>
                        <input type="number" min="0" max="20" value={semi1.score2 ?? ''} onChange={(e) => handleKnockoutScoreChange('semi1', semi1.score1, e.target.value)} className="w-10 h-10 bg-arena border border-line rounded-md text-center font-display font-bold text-lg tabular-nums text-emerald-400 focus:outline-none focus:border-emerald-400" />
                      </div>
                      <div className="flex-1 flex flex-col items-start text-left font-semibold text-sm pl-3 min-w-0">
                        <span className={`truncate max-w-full ${semi1.winner === semi1.p2 ? 'text-ink' : 'text-muted'}`}>{semi1.p2}</span>
                        <TeamTag player={semi1.p2} draftPicks={draftPicks} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="p-3 rounded-xl border border-amber-500/60 bg-amber-500/10 h-fit relative z-40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(2,6,23,0.6)]">
                    <h4 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-center mb-2 text-amber-400">Gran Final</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 flex flex-col items-end text-right font-semibold text-sm pr-3 min-w-0">
                        <span className={`truncate max-w-full ${cruceFinal.winner === cruceFinal.p1 ? 'text-ink' : 'text-amber-200/70'}`}>{cruceFinal.p1}</span>
                        <TeamTag player={cruceFinal.p1} draftPicks={draftPicks} />
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <input type="number" min="0" max="20" value={cruceFinal.score1 ?? ''} onChange={(e) => handleKnockoutScoreChange('final', e.target.value, cruceFinal.score2)} className="w-10 h-10 bg-arena border border-amber-500/50 text-amber-300 rounded-md text-center font-display font-bold text-lg tabular-nums focus:outline-none focus:border-amber-400" />
                        <span className="text-amber-400 font-semibold text-[11px]">VS</span>
                        <input type="number" min="0" max="20" value={cruceFinal.score2 ?? ''} onChange={(e) => handleKnockoutScoreChange('final', cruceFinal.score1, e.target.value)} className="w-10 h-10 bg-arena border border-amber-500/50 text-amber-300 rounded-md text-center font-display font-bold text-lg tabular-nums focus:outline-none focus:border-amber-400" />
                      </div>
                      <div className="flex-1 flex flex-col items-start text-left font-semibold text-sm pl-3 min-w-0">
                        <span className={`truncate max-w-full ${cruceFinal.winner === cruceFinal.p2 ? 'text-ink' : 'text-amber-200/70'}`}>{cruceFinal.p2}</span>
                        <TeamTag player={cruceFinal.p2} draftPicks={draftPicks} />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-emerald-500/25 bg-arena h-fit relative z-40 transition-all duration-200 hover:border-emerald-500/50 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(2,6,23,0.6)]">
                    <h4 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-center mb-2 text-muted">Tercer Puesto</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 flex flex-col items-end text-right font-semibold text-sm pr-3 min-w-0">
                        <span className={`truncate max-w-full ${cruceTercero.winner === cruceTercero.p1 ? 'text-ink' : 'text-muted'}`}>{cruceTercero.p1}</span>
                        <TeamTag player={cruceTercero.p1} draftPicks={draftPicks} />
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <input type="number" min="0" max="20" value={cruceTercero.score1 ?? ''} onChange={(e) => handleKnockoutScoreChange('third', e.target.value, cruceTercero.score2)} className="w-10 h-10 bg-arena border border-line rounded-md text-center font-display font-bold text-lg tabular-nums text-emerald-400 focus:outline-none focus:border-emerald-400" />
                        <span className="text-muted font-semibold text-[11px]">VS</span>
                        <input type="number" min="0" max="20" value={cruceTercero.score2 ?? ''} onChange={(e) => handleKnockoutScoreChange('third', cruceTercero.score1, e.target.value)} className="w-10 h-10 bg-arena border border-line rounded-md text-center font-display font-bold text-lg tabular-nums text-emerald-400 focus:outline-none focus:border-emerald-400" />
                      </div>
                      <div className="flex-1 flex flex-col items-start text-left font-semibold text-sm pl-3 min-w-0">
                        <span className={`truncate max-w-full ${cruceTercero.winner === cruceTercero.p2 ? 'text-ink' : 'text-muted'}`}>{cruceTercero.p2}</span>
                        <TeamTag player={cruceTercero.p2} draftPicks={draftPicks} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="p-3 rounded-xl border border-emerald-500/25 bg-arena h-fit relative z-40 transition-all duration-200 hover:border-emerald-500/50 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(2,6,23,0.6)]">
                    <h4 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-center mb-2 text-muted">Semifinal 2</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 flex flex-col items-end text-right font-semibold text-sm pr-3 min-w-0">
                        <span className={`truncate max-w-full ${semi2.winner === semi2.p1 ? 'text-ink' : 'text-muted'}`}>{semi2.p1}</span>
                        <TeamTag player={semi2.p1} draftPicks={draftPicks} />
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <input type="number" min="0" max="20" value={semi2.score1 ?? ''} onChange={(e) => handleKnockoutScoreChange('semi2', e.target.value, semi2.score2)} className="w-10 h-10 bg-arena border border-line rounded-md text-center font-display font-bold text-lg tabular-nums text-emerald-400 focus:outline-none focus:border-emerald-400" />
                        <span className="text-muted font-semibold text-[11px]">VS</span>
                        <input type="number" min="0" max="20" value={semi2.score2 ?? ''} onChange={(e) => handleKnockoutScoreChange('semi2', semi2.score1, e.target.value)} className="w-10 h-10 bg-arena border border-line rounded-md text-center font-display font-bold text-lg tabular-nums text-emerald-400 focus:outline-none focus:border-emerald-400" />
                      </div>
                      <div className="flex-1 flex flex-col items-start text-left font-semibold text-sm pl-3 min-w-0">
                        <span className={`truncate max-w-full ${semi2.winner === semi2.p2 ? 'text-ink' : 'text-muted'}`}>{semi2.p2}</span>
                        <TeamTag player={semi2.p2} draftPicks={draftPicks} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
      )}
    </div>
  )
}
