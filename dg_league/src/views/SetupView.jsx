import { useState } from 'react'
import { motion as Motion } from 'motion/react'
import { UserPlus, Play, Trash2 } from 'lucide-react'
import TeamTag from '../components/TeamTag'

export default function SetupView({ tournament }) {
  const { data, addPlayer, removePlayer, startDraftOrder } = tournament
  const { players, draftPicks } = data
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
        startDraftOrder()
      }, 3000)
    }
  }

  return (
    <Motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-6"
    >
      <div className="text-center space-y-2 mb-4">
        <h2 className="text-3xl font-bold font-display text-ink">Inscripción</h2>
        <p className="text-muted text-sm">Añade entre 8 y 10 jugadores</p>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newPlayer}
          onChange={(e) => setNewPlayer(e.target.value)}
          placeholder="Nombre del jugador..."
          className="flex-1 bg-arena border border-line rounded-lg px-4 py-3 text-ink focus:outline-none focus:border-emerald-400 transition-colors"
          disabled={players.length >= 10}
        />
        <button
          type="submit"
          disabled={players.length >= 10 || !newPlayer.trim()}
          className="bg-emerald-500 text-arena px-4 py-3 rounded-lg font-bold disabled:opacity-50 flex items-center justify-center transition-transform active:scale-95"
        >
          <UserPlus size={20} />
        </button>
      </form>

      <div className="bg-surface border border-line rounded-2xl p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[11px] uppercase tracking-[0.06em] font-semibold text-muted">Jugadores ({players.length}/10)</h3>
        </div>

        {isShuffling ? (
          <div className="text-center py-8 space-y-4">
            <div className="text-4xl font-bold font-display text-emerald-400 animate-pulse">MEZCLANDO...</div>
            <div className="flex flex-wrap justify-center gap-2">
              {players.map((p) => (
                <div
                  key={p}
                  className="bg-arena border border-line px-3 py-2 rounded-lg font-medium animate-pulse"
                >
                  {p}
                </div>
              ))}
            </div>
          </div>
        ) : players.length === 0 ? (
          <p className="text-center text-muted py-4 italic text-sm">Nadie inscrito aún...</p>
        ) : (
          <ul className="space-y-2">
            {players.map((p, idx) => (
              <Motion.li
                key={p}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center justify-between bg-arena p-3 rounded-lg border border-emerald-500/25"
              >
                <div className="flex flex-col min-w-0">
                  <span className="font-medium text-ink">{p}</span>
                  <TeamTag player={p} draftPicks={draftPicks} />
                </div>
                <button
                  onClick={() => removePlayer(p)}
                  className="text-rose-400 hover:text-rose-300 p-1"
                >
                  <Trash2 size={18} />
                </button>
              </Motion.li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={handleStart}
        disabled={players.length < 2 || isShuffling}
        className="w-full bg-emerald-500 text-arena p-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-slate-700 disabled:text-ink transition-transform active:scale-95 mt-4 hover:shadow-[0_0_20px_rgba(16,185,129,0.35)]"
      >
        {isShuffling ? (
          <>
            <div className="animate-spin">
              <Play fill="currentColor" size={20} />
            </div>
            SORTEANDO ORDEN...
          </>
        ) : (
          <>
            <Play fill="currentColor" size={20} />
            SORTEAR ORDEN
          </>
        )}
      </button>
    </Motion.div>
  )
}
