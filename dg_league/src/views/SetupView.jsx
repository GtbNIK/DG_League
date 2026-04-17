import { useState } from 'react'
import { UserPlus, Play, Trash2 } from 'lucide-react'

export default function SetupView({ tournament }) {
  const { data, addPlayer, removePlayer, generateGroupsAndMatches } = tournament
  const { players } = data
  const [newPlayer, setNewPlayer] = useState('')
  const [isShuffling, setIsShuffling] = useState(false)

  const handleAdd = (e) => {
    e.preventDefault()
    if (!newPlayer.trim()) return
    const success = addPlayer(newPlayer.trim())
    if (success) setNewPlayer('')
  }

  const handleStart = () => {
    if (players.length >= 2) {
      setIsShuffling(true)
      setTimeout(() => {
        generateGroupsAndMatches()
      }, 3000)
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in zoom-in duration-300">
      <div className="text-center space-y-2 mb-4">
        <h2 className="text-3xl font-black text-white">INSCRIPCIÓN</h2>
        <p className="text-slate-400 text-sm">Añade entre 8 y 10 jugadores</p>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newPlayer}
          onChange={(e) => setNewPlayer(e.target.value)}
          placeholder="Nombre del jugador..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
          disabled={players.length >= 10}
        />
        <button
          type="submit"
          disabled={players.length >= 10 || !newPlayer.trim()}
          className="bg-emerald-500 text-slate-950 px-4 py-3 rounded-lg font-bold disabled:opacity-50 flex items-center justify-center transition-transform active:scale-95"
        >
          <UserPlus size={20} />
        </button>
      </form>

      <div className="glass-panel p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm uppercase tracking-wider font-semibold text-slate-400">Jugadores ({players.length}/10)</h3>
        </div>

        {isShuffling ? (
          <div className="text-center py-8 space-y-4">
            <div className="text-4xl font-black text-emerald-400 animate-pulse">MEZCLANDO...</div>
            <div className="flex flex-wrap justify-center gap-2">
              {players.map((p, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-700/50 font-medium animate-bounce"
                  style={{
                    animationDelay: `${idx * 0.1}s`,
                    animationDuration: '0.5s'
                  }}
                >
                  {p}
                </div>
              ))}
            </div>
          </div>
        ) : players.length === 0 ? (
          <p className="text-center text-slate-600 py-4 italic text-sm">Nadie inscrito aún...</p>
        ) : (
          <ul className="space-y-2">
            {players.map((p, idx) => (
              <li key={idx} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                <span className="font-medium">{p}</span>
                <button
                  onClick={() => removePlayer(p)}
                  className="text-red-400 hover:text-red-300 p-1"
                >
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={handleStart}
        disabled={players.length < 2 || isShuffling}
        className="w-full bg-emerald-500 text-slate-950 p-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-slate-700 disabled:text-slate-500 transition-transform active:scale-95 mt-4 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
      >
        {isShuffling ? (
          <>
            <div className="animate-spin">
              <Play fill="currentColor" size={20} />
            </div>
            MEZCLANDO...
          </>
        ) : (
          <>
            <Play fill="currentColor" size={20} />
            EMPEZAR LIGA
          </>
        )}
      </button>
    </div>
  )
}
