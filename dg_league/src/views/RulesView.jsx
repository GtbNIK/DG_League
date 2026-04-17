import { useState } from 'react'
import { ArrowRightLeft, ShieldBan } from 'lucide-react'

export default function RulesView({ tournament }) {
  const { data, addTransfer, toggleNerf } = tournament
  const { transfers, nerfs, players } = data

  const [playerOut, setPlayerOut] = useState('')
  const [playerIn, setPlayerIn] = useState('')
  const [selectedUser, setSelectedUser] = useState(players[0] || '')

  const handleTransferSubmit = (e) => {
    e.preventDefault()
    if (!playerOut.trim() || !playerIn.trim() || !selectedUser) return
    addTransfer(selectedUser, playerOut.trim(), playerIn.trim())
    setPlayerOut('')
    setPlayerIn('')
  }

  // Nerfeos definidos
  const neilNerfs = [
    "No puede robar jugadores",
    "Elige de último"
  ]

  const neilActiveNerfs = nerfs.filter(n => n.userId === 'Neil' && n.active)

  return (
    <div className="flex flex-col gap-6 mb-24 animate-in fade-in duration-300">
      
      {/* 1x1 Transfers */}
      <div className="glass-panel p-5">
        <div className="flex items-center gap-2 mb-4">
          <ArrowRightLeft className="text-emerald-400" size={20} />
          <h2 className="text-lg font-black uppercase text-white">Fichajes 1x1</h2>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Registra el intercambio de jugadores (de la misma posición o media general).
        </p>

        <form onSubmit={handleTransferSubmit} className="space-y-3">
          <select 
            value={selectedUser} 
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
          >
            {players.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Quita de su plantilla"
              value={playerOut}
              onChange={(e) => setPlayerOut(e.target.value)}
              className="flex-1 min-w-0 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 text-sm"
            />
            <ArrowRightLeft className="text-slate-500 shrink-0" size={16} />
            <input
              type="text"
              placeholder="Añade a su plantilla"
              value={playerIn}
              onChange={(e) => setPlayerIn(e.target.value)}
              className="flex-1 min-w-0 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={!playerOut.trim() || !playerIn.trim()}
            className="w-full bg-slate-800 text-white border border-slate-700 hover:border-emerald-500 py-3 rounded-lg font-bold disabled:opacity-50 transition-colors mt-2 text-sm uppercase tracking-wide"
          >
            Registrar Fichaje
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-700/50">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Historial Reciente</h3>
          <ul className="space-y-2">
            {transfers.length === 0 && <p className="text-xs text-slate-500 italic">No hay fichajes registrados.</p>}
            {[...transfers].reverse().slice(0, 5).map(t => (
              <li key={t.id} className="text-sm bg-slate-900/50 p-2 rounded-md border border-slate-800 flex flex-col gap-1">
                <span className="text-emerald-400 font-bold text-xs">{t.user}</span>
                <span className="text-slate-300">
                  <span className="text-red-400 line-through mr-1">{t.playerOut}</span>
                  <ArrowRightLeft className="inline mx-1 text-slate-600" size={12} />
                  <span className="text-emerald-300 ml-1 font-medium">{t.playerIn}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Special Rules / Nerfs */}
      <div className="glass-panel p-5 border-blue-500/30">
        <div className="flex items-center gap-2 mb-4">
          <ShieldBan className="text-blue-400" size={20} />
          <h2 className="text-lg font-black uppercase text-white">Nerfeos (Neil)</h2>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Reglas especiales aplicadas a Neil para equilibrar el torneo.
        </p>

        <div className="space-y-2">
          {neilNerfs.map(desc => {
            const isActive = neilActiveNerfs.some(n => n.description === desc)
            return (
              <button
                key={desc}
                onClick={() => toggleNerf('Neil', desc)}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left ${
                  isActive 
                    ? 'bg-blue-500/10 border-blue-500/50 text-blue-100' 
                    : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-600'
                }`}
              >
                <span className="text-sm font-medium">{desc}</span>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isActive ? 'border-blue-400 bg-blue-400/20' : 'border-slate-600'}`}>
                  {isActive && <div className="w-2 h-2 rounded-full bg-blue-400" />}
                </div>
              </button>
            )
          })}
        </div>
      </div>

    </div>
  )
}
