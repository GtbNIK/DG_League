import { useState } from 'react'

export default function TournamentView({ tournament }) {
    const { data, getStandings, updateMatchScore, updateKnockoutScore } = tournament
  const { groups, matches, knockout } = data

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
      <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
        <button
          onClick={() => setActiveGroup('A')}
          className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${
            activeGroup === 'A' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          GRUPO A
        </button>
        <button
          onClick={() => setActiveGroup('B')}
          className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${
            activeGroup === 'B' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          GRUPO B
        </button>
        <button
          onClick={() => setActiveGroup('KO')}
          className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${
            activeGroup === 'KO' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          ELIMINATORIAS
        </button>
      </div>

      {activeGroup !== 'KO' && (
        <div className="md:grid md:grid-cols-2 md:gap-6">
          <div className="glass-panel overflow-hidden md:h-[calc(75vh-240px)] md:overflow-auto">
            <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700/50 flex justify-between items-center">
              <h3 className="text-base font-bold uppercase tracking-wider text-white">Tabla de Posiciones</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-sm text-slate-400 uppercase bg-slate-900/50">
                  <tr>
                    <th className="px-4 py-3 font-medium">Jugador</th>
                    <th className="px-2 py-3 font-medium text-center">PJ</th>
                    <th className="px-2 py-3 font-medium text-center">DG</th>
                    <th className="px-4 py-3 font-black text-emerald-400 text-center">PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {currentStandings.map((player, idx) => (
                    <tr key={player.name} className={`border-b border-slate-800 last:border-0 ${idx < 2 ? 'bg-emerald-500/5' : ''}`}>
                      <td className="px-4 py-4 font-medium flex items-center gap-2">
                        <span className={`w-6 text-center text-sm font-black ${idx < 2 ? 'text-emerald-400' : 'text-slate-600'}`}>{idx + 1}</span>
                        {player.name}
                      </td>
                      <td className="px-2 py-4 text-center text-slate-400 text-base">{player.played}</td>
                      <td className="px-2 py-4 text-center text-slate-400 text-base">{player.goalDifference > 0 ? `+${player.goalDifference}` : player.goalDifference}</td>
                      <td className="px-4 py-4 text-center font-black text-white text-lg">{player.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass-panel p-4 mb-20 md:mb-0 md:h-[calc(100vh-240px)] md:overflow-auto">
            <h3 className="text-base font-bold uppercase tracking-wider text-slate-400 mb-4">Fixture - Grupo {activeGroup}</h3>
            <div className="space-y-3">
              {currentGroupMatches.length === 0 && (
                <p className="text-slate-500 text-center text-sm py-4">No hay partidos definidos.</p>
              )}
              {currentGroupMatches.map((match) => (
                <div key={match.id} className={`flex items-center justify-between p-3 rounded-lg border max-h-20 ${match.closed ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-800/40 border-slate-700/50'}`}>
                  <div className="flex-1 text-right font-medium text-base pr-3 truncate max-w-[40%]">
                    {match.player1}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <input type="number" min="0" max="20" value={match.score1 ?? ''} onChange={(e) => handleScoreChange(match, e.target.value, match.score2)} disabled={match.closed} className="w-12 h-12 bg-slate-900 border border-slate-600 rounded text-center font-black text-xl focus:outline-none focus:border-emerald-400 disabled:opacity-100 disabled:text-emerald-400" />
                    <span className="text-slate-500 font-black text-xl">-</span>
                    <input type="number" min="0" max="20" value={match.score2 ?? ''} onChange={(e) => handleScoreChange(match, match.score1, e.target.value)} disabled={match.closed} className="w-12 h-12 bg-slate-900 border border-slate-600 rounded text-center font-black text-xl focus:outline-none focus:border-emerald-400 disabled:opacity-100 disabled:text-emerald-400" />
                  </div>
                  <div className="flex-1 text-left font-medium text-base pl-3 truncate max-w-[40%]">
                    {match.player2}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Knockout Stage */}
      {activeGroup === 'KO' && (
        <div>
          <div className="glass-panel p-4 mb-20 bg-emerald-950/20 md:hidden h-min-20 h-max-30">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 mb-6 text-center">Cuadro Eliminatorio</h3>
            <div className="space-y-6">
              {knockoutList.map((match) => (
                <div key={match.id} className={`p-4 rounded-xl border ${match.id === 'final' ? 'border-amber-500/50 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'border-slate-700/50 bg-slate-800/40'}`}>
                  <h4 className={`text-xs font-black uppercase text-center mb-3 tracking-widest ${match.id === 'final' ? 'text-amber-400' : 'text-slate-400'}`}>{match.label}</h4>
                  <div className="flex items-center justify-between">
                    <div className={`flex-1 text-right font-bold text-sm pr-3 truncate max-w-[40%] ${match.score1 > match.score2 ? 'text-white' : 'text-slate-400'}`}>{match.p1}</div>
                    <div className="flex items-center gap-2 shrink-0">
                      <input type="number" min="0" max="20" value={match.score1 ?? ''} onChange={(e) => handleKnockoutScoreChange(match.id, e.target.value, match.score2)} disabled={match.closed} className={`w-10 h-10 border rounded text-center font-black text-lg focus:outline-none focus:border-emerald-400 disabled:opacity-100 ${match.id === 'final' ? 'bg-slate-900 border-amber-600/50 text-amber-100' : 'bg-slate-900 border-slate-600 text-white'}`} />
                      <span className="text-slate-500 font-black">-</span>
                      <input type="number" min="0" max="20" value={match.score2 ?? ''} onChange={(e) => handleKnockoutScoreChange(match.id, match.score1, e.target.value)} disabled={match.closed} className={`w-10 h-10 border rounded text-center font-black text-lg focus:outline-none focus:border-emerald-400 disabled:opacity-100 ${match.id === 'final' ? 'bg-slate-900 border-amber-600/50 text-amber-100' : 'bg-slate-900 border-slate-600 text-white'}`} />
                    </div>
                    <div className={`flex-1 text-left font-bold text-sm pl-3 truncate max-w-[40%] ${match.score2 > match.score1 ? 'text-white' : 'text-slate-400'}`}>{match.p2}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden md:block relative glass-panel p-6 bg-emerald-950/20 md:h-[calc(100vh-240px)] overflow-auto">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 mb-6 text-center">Cuadro Eliminatorio</h3>
            <div className="grid grid-cols-3 gap-6 items-center relative z-30">
                <div className="flex flex-col gap-6">
                  <div className="p-3 rounded-xl border border-slate-700/50 bg-slate-800/40 h-fit relative z-40 border-r-4 border-r-emerald-500/0 hover:border-r-emerald-500/50 transition-colors">
                    <h4 className="text-xs font-black uppercase text-center mb-2 tracking-widest text-slate-400">Semifinal 1</h4>
                    <div className="flex items-center justify-between">
                      <div className={`flex-1 text-right font-bold text-sm pr-3 truncate ${knockout?.semi1?.score1 > knockout?.semi1?.score2 ? 'text-white' : 'text-slate-400'}`}>{s1_1}</div>
                      <div className="flex items-center gap-2 shrink-0">
                        <input type="number" min="0" max="20" value={knockout?.semi1?.score1 ?? ''} onChange={(e) => handleKnockoutScoreChange('semi1', e.target.value, knockout?.semi1?.score2)} disabled={knockout?.semi1?.closed} className="w-10 h-10 bg-slate-900 border border-slate-600 rounded text-center font-black text-lg" />
                        <span className="text-slate-500 font-black">-</span>
                        <input type="number" min="0" max="20" value={knockout?.semi1?.score2 ?? ''} onChange={(e) => handleKnockoutScoreChange('semi1', knockout?.semi1?.score1, e.target.value)} disabled={knockout?.semi1?.closed} className="w-10 h-10 bg-slate-900 border border-slate-600 rounded text-center font-black text-lg" />
                      </div>
                      <div className={`flex-1 text-left font-bold text-sm pl-3 truncate ${knockout?.semi1?.score2 > knockout?.semi1?.score1 ? 'text-white' : 'text-slate-400'}`}>{s1_2}</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="p-3 rounded-xl border border-amber-500/50 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.2)] h-fit relative z-40">
                    <h4 className="text-xs font-black uppercase text-center mb-2 tracking-widest text-amber-400">Gran Final</h4>
                    <div className="flex items-center justify-between">
                      <div className={`flex-1 text-right font-bold text-sm pr-3 truncate ${knockout?.final?.score1 > knockout?.final?.score2 ? 'text-white' : 'text-amber-200/70'}`}>{ws1}</div>
                      <div className="flex items-center gap-2 shrink-0">
                        <input type="number" min="0" max="20" value={knockout?.final?.score1 ?? ''} onChange={(e) => handleKnockoutScoreChange('final', e.target.value, knockout?.final?.score2)} disabled={knockout?.final?.closed} className="w-10 h-10 bg-slate-900 border border-amber-600/50 text-amber-100 rounded text-center font-black text-lg" />
                        <span className="text-amber-400 font-black">-</span>
                        <input type="number" min="0" max="20" value={knockout?.final?.score2 ?? ''} onChange={(e) => handleKnockoutScoreChange('final', knockout?.final?.score1, e.target.value)} disabled={knockout?.final?.closed} className="w-10 h-10 bg-slate-900 border border-amber-600/50 text-amber-100 rounded text-center font-black text-lg" />
                      </div>
                      <div className={`flex-1 text-left font-bold text-sm pl-3 truncate ${knockout?.final?.score2 > knockout?.final?.score1 ? 'text-white' : 'text-amber-200/70'}`}>{ws2}</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-700/50 bg-slate-800/40 h-fit relative z-40">
                    <h4 className="text-xs font-black uppercase text-center mb-2 tracking-widest text-slate-400">Tercer Puesto</h4>
                    <div className="flex items-center justify-between">
                      <div className={`flex-1 text-right font-bold text-sm pr-3 truncate ${knockout?.third?.score1 > knockout?.third?.score2 ? 'text-white' : 'text-slate-400'}`}>{ls1}</div>
                      <div className="flex items-center gap-2 shrink-0">
                        <input type="number" min="0" max="20" value={knockout?.third?.score1 ?? ''} onChange={(e) => handleKnockoutScoreChange('third', e.target.value, knockout?.third?.score2)} disabled={knockout?.third?.closed} className="w-10 h-10 bg-slate-900 border border-slate-600 rounded text-center font-black text-lg" />
                        <span className="text-slate-500 font-black">-</span>
                        <input type="number" min="0" max="20" value={knockout?.third?.score2 ?? ''} onChange={(e) => handleKnockoutScoreChange('third', knockout?.third?.score1, e.target.value)} disabled={knockout?.third?.closed} className="w-10 h-10 bg-slate-900 border border-slate-600 rounded text-center font-black text-lg" />
                      </div>
                      <div className={`flex-1 text-left font-bold text-sm pl-3 truncate ${knockout?.third?.score2 > knockout?.third?.score1 ? 'text-white' : 'text-slate-400'}`}>{ls2}</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="p-3 rounded-xl border border-slate-700/50 bg-slate-800/40 h-fit relative z-40 border-l-4 border-l-emerald-500/0 hover:border-l-emerald-500/50 transition-colors">
                    <h4 className="text-xs font-black uppercase text-center mb-2 tracking-widest text-slate-400">Semifinal 2</h4>
                    <div className="flex items-center justify-between">
                      <div className={`flex-1 text-right font-bold text-sm pr-3 truncate ${knockout?.semi2?.score1 > knockout?.semi2?.score2 ? 'text-white' : 'text-slate-400'}`}>{s2_1}</div>
                      <div className="flex items-center gap-2 shrink-0">
                        <input type="number" min="0" max="20" value={knockout?.semi2?.score1 ?? ''} onChange={(e) => handleKnockoutScoreChange('semi2', e.target.value, knockout?.semi2?.score2)} disabled={knockout?.semi2?.closed} className="w-10 h-10 bg-slate-900 border border-slate-600 rounded text-center font-black text-lg" />
                        <span className="text-slate-500 font-black">-</span>
                        <input type="number" min="0" max="20" value={knockout?.semi2?.score2 ?? ''} onChange={(e) => handleKnockoutScoreChange('semi2', knockout?.semi2?.score1, e.target.value)} disabled={knockout?.semi2?.closed} className="w-10 h-10 bg-slate-900 border border-slate-600 rounded text-center font-black text-lg" />
                      </div>
                      <div className={`flex-1 text-left font-bold text-sm pl-3 truncate ${knockout?.semi2?.score2 > knockout?.semi2?.score1 ? 'text-white' : 'text-slate-400'}`}>{s2_2}</div>
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
