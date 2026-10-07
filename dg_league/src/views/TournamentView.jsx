import { useState } from 'react'
import { motion as Motion } from 'motion/react'
import TeamTag from '../components/TeamTag'

export default function TournamentView({ tournament }) {
    const { data, getStandings, updateMatchScore, updateKnockoutScore } = tournament
  const { matches, knockout, draftPicks } = data

  const [activeGroup, setActiveGroup] = useState('A')

  const standingsA = getStandings('A')
  const standingsB = getStandings('B')

  const currentGroupMatches = matches.filter(m => m.groupId === activeGroup)
  const currentStandings = activeGroup === 'A' ? standingsA : (activeGroup === 'B' ? standingsB : [])

  const handleScoreChange = (match, p1Score, p2Score) => {
    if (match.closed) return // Si está cerrado por 3-0, no se puede cambiar
    const s1 = p1Score === '' ? null : parseInt(p1Score)
    const s2 = p2Score === '' ? null : parseInt(p2Score)
    updateMatchScore(match.id, s1, s2)
  }

  const handleKnockoutScoreChange = (stage, p1Score, p2Score) => {
    const s1 = p1Score === '' ? null : parseInt(p1Score)
    const s2 = p2Score === '' ? null : parseInt(p2Score)
    updateKnockoutScore(stage, s1, s2)
  }

  // Knockout derivado
  const s1_1 = standingsA[0]?.name || '1° Grupo A'
  const s1_2 = standingsB[1]?.name || '2° Grupo B'
  const s2_1 = standingsB[0]?.name || '1° Grupo B'
  const s2_2 = standingsA[1]?.name || '2° Grupo A'

  const ws1 = (knockout?.semi1?.score1 > knockout?.semi1?.score2) ? s1_1 : ((knockout?.semi1?.score2 > knockout?.semi1?.score1) ? s1_2 : 'Ganador S1')
  const ls1 = (knockout?.semi1?.score1 > knockout?.semi1?.score2) ? s1_2 : ((knockout?.semi1?.score2 > knockout?.semi1?.score1) ? s1_1 : 'Perdedor S1')

  const ws2 = (knockout?.semi2?.score1 > knockout?.semi2?.score2) ? s2_1 : ((knockout?.semi2?.score2 > knockout?.semi2?.score1) ? s2_2 : 'Ganador S2')
  const ls2 = (knockout?.semi2?.score1 > knockout?.semi2?.score2) ? s2_2 : ((knockout?.semi2?.score2 > knockout?.semi2?.score1) ? s2_1 : 'Perdedor S2')

  const knockoutList = [
    { id: 'semi1', label: 'Semifinal 1', p1: s1_1, p2: s1_2, ...knockout?.semi1 },
    { id: 'semi2', label: 'Semifinal 2', p1: s2_1, p2: s2_2, ...knockout?.semi2 },
    { id: 'third', label: 'Tercer Puesto', p1: ls1, p2: ls2, ...knockout?.third },
    { id: 'final', label: 'Gran Final', p1: ws1, p2: ws2, ...knockout?.final }
  ]

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
                    className={`flex items-center justify-between p-3 rounded-md border transition-all duration-200 ${match.closed ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-arena border-emerald-500/25 hover:border-emerald-500/50 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(2,6,23,0.6)]'}`}
                >
                  <div className="flex-1 flex flex-col items-end text-right font-medium text-base text-ink pr-3 min-w-0 max-w-[40%]">
                    <span className="truncate max-w-full">{match.player1}</span>
                    <TeamTag player={match.player1} draftPicks={draftPicks} />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <input type="number" min="0" max="20" value={match.score1 ?? ''} onChange={(e) => handleScoreChange(match, e.target.value, match.score2)} disabled={match.closed} className="w-12 h-12 bg-arena border border-line rounded-md text-center font-display font-bold text-xl tabular-nums text-emerald-400 focus:outline-none focus:border-emerald-400 focus:shadow-[0_0_20px_rgba(16,185,129,0.35)] disabled:opacity-100 disabled:text-emerald-400" />
                    <span className="text-muted font-semibold text-[11px]">VS</span>
                    <input type="number" min="0" max="20" value={match.score2 ?? ''} onChange={(e) => handleScoreChange(match, match.score1, e.target.value)} disabled={match.closed} className="w-12 h-12 bg-arena border border-line rounded-md text-center font-display font-bold text-xl tabular-nums text-emerald-400 focus:outline-none focus:border-emerald-400 focus:shadow-[0_0_20px_rgba(16,185,129,0.35)] disabled:opacity-100 disabled:text-emerald-400" />
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
              {knockoutList.map((match, idx) => (
                <Motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className={`p-4 rounded-xl border transition-all duration-200 ${match.id === 'final' ? 'border-amber-500/60 bg-amber-500/10 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(2,6,23,0.6)]' : 'border-emerald-500/25 bg-arena hover:border-emerald-500/50 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(2,6,23,0.6)]'}`}
                >
                  <h4 className={`text-[11px] font-semibold uppercase tracking-[0.06em] text-center mb-3 ${match.id === 'final' ? 'text-amber-400' : 'text-muted'}`}>{match.label}</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 flex flex-col items-end text-right font-semibold text-sm pr-3 min-w-0 max-w-[40%]">
                      <span className={`truncate max-w-full ${match.score1 > match.score2 ? 'text-ink' : 'text-muted'}`}>{match.p1}</span>
                      <TeamTag player={match.p1} draftPicks={draftPicks} />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <input type="number" min="0" max="20" value={match.score1 ?? ''} onChange={(e) => handleKnockoutScoreChange(match.id, e.target.value, match.score2)} disabled={match.closed} className={`w-10 h-10 border rounded-md text-center font-display font-bold text-lg tabular-nums text-emerald-400 focus:outline-none focus:border-emerald-400 focus:shadow-[0_0_20px_rgba(16,185,129,0.35)] disabled:opacity-100 ${match.id === 'final' ? 'bg-arena border-amber-500/50' : 'bg-arena border-line'}`} />
                      <span className="text-muted font-semibold text-[11px]">VS</span>
                      <input type="number" min="0" max="20" value={match.score2 ?? ''} onChange={(e) => handleKnockoutScoreChange(match.id, match.score1, e.target.value)} disabled={match.closed} className={`w-10 h-10 border rounded-md text-center font-display font-bold text-lg tabular-nums text-emerald-400 focus:outline-none focus:border-emerald-400 focus:shadow-[0_0_20px_rgba(16,185,129,0.35)] disabled:opacity-100 ${match.id === 'final' ? 'bg-arena border-amber-500/50' : 'bg-arena border-line'}`} />
                    </div>
                    <div className="flex-1 flex flex-col items-start text-left font-semibold text-sm pl-3 min-w-0 max-w-[40%]">
                      <span className={`truncate max-w-full ${match.score2 > match.score1 ? 'text-ink' : 'text-muted'}`}>{match.p2}</span>
                      <TeamTag player={match.p2} draftPicks={draftPicks} />
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
                        <span className={`truncate max-w-full ${knockout?.semi1?.score1 > knockout?.semi1?.score2 ? 'text-ink' : 'text-muted'}`}>{s1_1}</span>
                        <TeamTag player={s1_1} draftPicks={draftPicks} />
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <input type="number" min="0" max="20" value={knockout?.semi1?.score1 ?? ''} onChange={(e) => handleKnockoutScoreChange('semi1', e.target.value, knockout?.semi1?.score2)} disabled={knockout?.semi1?.closed} className="w-10 h-10 bg-arena border border-line rounded-md text-center font-display font-bold text-lg tabular-nums text-emerald-400 focus:outline-none focus:border-emerald-400" />
                        <span className="text-muted font-semibold text-[11px]">VS</span>
                        <input type="number" min="0" max="20" value={knockout?.semi1?.score2 ?? ''} onChange={(e) => handleKnockoutScoreChange('semi1', knockout?.semi1?.score1, e.target.value)} disabled={knockout?.semi1?.closed} className="w-10 h-10 bg-arena border border-line rounded-md text-center font-display font-bold text-lg tabular-nums text-emerald-400 focus:outline-none focus:border-emerald-400" />
                      </div>
                      <div className="flex-1 flex flex-col items-start text-left font-semibold text-sm pl-3 min-w-0">
                        <span className={`truncate max-w-full ${knockout?.semi1?.score2 > knockout?.semi1?.score1 ? 'text-ink' : 'text-muted'}`}>{s1_2}</span>
                        <TeamTag player={s1_2} draftPicks={draftPicks} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="p-3 rounded-xl border border-amber-500/60 bg-amber-500/10 h-fit relative z-40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(2,6,23,0.6)]">
                    <h4 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-center mb-2 text-amber-400">Gran Final</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 flex flex-col items-end text-right font-semibold text-sm pr-3 min-w-0">
                        <span className={`truncate max-w-full ${knockout?.final?.score1 > knockout?.final?.score2 ? 'text-ink' : 'text-amber-200/70'}`}>{ws1}</span>
                        <TeamTag player={ws1} draftPicks={draftPicks} />
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <input type="number" min="0" max="20" value={knockout?.final?.score1 ?? ''} onChange={(e) => handleKnockoutScoreChange('final', e.target.value, knockout?.final?.score2)} disabled={knockout?.final?.closed} className="w-10 h-10 bg-arena border border-amber-500/50 text-amber-300 rounded-md text-center font-display font-bold text-lg tabular-nums focus:outline-none focus:border-amber-400" />
                        <span className="text-amber-400 font-semibold text-[11px]">VS</span>
                        <input type="number" min="0" max="20" value={knockout?.final?.score2 ?? ''} onChange={(e) => handleKnockoutScoreChange('final', knockout?.final?.score1, e.target.value)} disabled={knockout?.final?.closed} className="w-10 h-10 bg-arena border border-amber-500/50 text-amber-300 rounded-md text-center font-display font-bold text-lg tabular-nums focus:outline-none focus:border-amber-400" />
                      </div>
                      <div className="flex-1 flex flex-col items-start text-left font-semibold text-sm pl-3 min-w-0">
                        <span className={`truncate max-w-full ${knockout?.final?.score2 > knockout?.final?.score1 ? 'text-ink' : 'text-amber-200/70'}`}>{ws2}</span>
                        <TeamTag player={ws2} draftPicks={draftPicks} />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-emerald-500/25 bg-arena h-fit relative z-40 transition-all duration-200 hover:border-emerald-500/50 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(2,6,23,0.6)]">
                    <h4 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-center mb-2 text-muted">Tercer Puesto</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 flex flex-col items-end text-right font-semibold text-sm pr-3 min-w-0">
                        <span className={`truncate max-w-full ${knockout?.third?.score1 > knockout?.third?.score2 ? 'text-ink' : 'text-muted'}`}>{ls1}</span>
                        <TeamTag player={ls1} draftPicks={draftPicks} />
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <input type="number" min="0" max="20" value={knockout?.third?.score1 ?? ''} onChange={(e) => handleKnockoutScoreChange('third', e.target.value, knockout?.third?.score2)} disabled={knockout?.third?.closed} className="w-10 h-10 bg-arena border border-line rounded-md text-center font-display font-bold text-lg tabular-nums text-emerald-400 focus:outline-none focus:border-emerald-400" />
                        <span className="text-muted font-semibold text-[11px]">VS</span>
                        <input type="number" min="0" max="20" value={knockout?.third?.score2 ?? ''} onChange={(e) => handleKnockoutScoreChange('third', knockout?.third?.score1, e.target.value)} disabled={knockout?.third?.closed} className="w-10 h-10 bg-arena border border-line rounded-md text-center font-display font-bold text-lg tabular-nums text-emerald-400 focus:outline-none focus:border-emerald-400" />
                      </div>
                      <div className="flex-1 flex flex-col items-start text-left font-semibold text-sm pl-3 min-w-0">
                        <span className={`truncate max-w-full ${knockout?.third?.score2 > knockout?.third?.score1 ? 'text-ink' : 'text-muted'}`}>{ls2}</span>
                        <TeamTag player={ls2} draftPicks={draftPicks} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="p-3 rounded-xl border border-emerald-500/25 bg-arena h-fit relative z-40 transition-all duration-200 hover:border-emerald-500/50 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(2,6,23,0.6)]">
                    <h4 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-center mb-2 text-muted">Semifinal 2</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 flex flex-col items-end text-right font-semibold text-sm pr-3 min-w-0">
                        <span className={`truncate max-w-full ${knockout?.semi2?.score1 > knockout?.semi2?.score2 ? 'text-ink' : 'text-muted'}`}>{s2_1}</span>
                        <TeamTag player={s2_1} draftPicks={draftPicks} />
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <input type="number" min="0" max="20" value={knockout?.semi2?.score1 ?? ''} onChange={(e) => handleKnockoutScoreChange('semi2', e.target.value, knockout?.semi2?.score2)} disabled={knockout?.semi2?.closed} className="w-10 h-10 bg-arena border border-line rounded-md text-center font-display font-bold text-lg tabular-nums text-emerald-400 focus:outline-none focus:border-emerald-400" />
                        <span className="text-muted font-semibold text-[11px]">VS</span>
                        <input type="number" min="0" max="20" value={knockout?.semi2?.score2 ?? ''} onChange={(e) => handleKnockoutScoreChange('semi2', knockout?.semi2?.score1, e.target.value)} disabled={knockout?.semi2?.closed} className="w-10 h-10 bg-arena border border-line rounded-md text-center font-display font-bold text-lg tabular-nums text-emerald-400 focus:outline-none focus:border-emerald-400" />
                      </div>
                      <div className="flex-1 flex flex-col items-start text-left font-semibold text-sm pl-3 min-w-0">
                        <span className={`truncate max-w-full ${knockout?.semi2?.score2 > knockout?.semi2?.score1 ? 'text-ink' : 'text-muted'}`}>{s2_2}</span>
                        <TeamTag player={s2_2} draftPicks={draftPicks} />
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
