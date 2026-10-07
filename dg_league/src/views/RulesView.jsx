import { useState } from 'react'
import { motion as Motion } from 'motion/react'
import { ArrowRightLeft } from 'lucide-react'
import TeamTag from '../components/TeamTag'

/**
 * Vista de fichajes 1x1: un jugador entrega un futbolista de su plantilla
 * y toma otro de la plantilla de un rival. En escritorio el formulario
 * queda a la izquierda (centrado verticalmente) y el historial a la derecha.
 *
 * @param {Object} props
 * @param {Object} props.tournament - Estado y acciones del hook useTournament.
 */
export default function RulesView({ tournament }) {
  const { data, addTransfer } = tournament
  const { transfers, players, draftPicks } = data

  const [playerOut, setPlayerOut] = useState('')
  const [playerIn, setPlayerIn] = useState('')
  const [selectedUser, setSelectedUser] = useState(players[0] || '')
  const [targetPlayer, setTargetPlayer] = useState(players[1] || '')

  /**
   * Lista de posibles cedentes: cualquiera excepto quien hace el fichaje.
   */
  const possibleTargets = players.filter((p) => p !== selectedUser)

  /**
   * Al cambiar quien ficha, el cedente seleccionado puede quedar inválido:
   * se reajusta al primero válido.
   */
  const handleUserChange = (user) => {
    setSelectedUser(user)
    if (targetPlayer === user) {
      setTargetPlayer(players.find((p) => p !== user) || '')
    }
  }

  const handleTransferSubmit = (e) => {
    e.preventDefault()
    if (!playerOut.trim() || !playerIn.trim() || !selectedUser || !targetPlayer) return
    addTransfer(selectedUser, playerOut.trim(), playerIn.trim(), targetPlayer)
    setPlayerOut('')
    setPlayerIn('')
  }

  return (
    <Motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-6 mb-24 md:grid md:grid-cols-2 md:gap-8 md:items-center md:min-h-[60vh]"
    >

      {/* Formulario de fichajes (izquierda en escritorio) */}
      <div className="bg-surface border border-line rounded-2xl p-5 md:self-center">
        <div className="flex items-center gap-2 mb-4">
          <ArrowRightLeft className="text-emerald-400" size={20} />
          <h2 className="text-lg font-semibold font-display text-ink">Fichajes 1x1</h2>
        </div>
        <p className="text-xs text-muted mb-4">
          Registra el intercambio de jugadores (de la misma posición o media general).
        </p>

        <form onSubmit={handleTransferSubmit} className="space-y-3">
          <select
            value={selectedUser}
            onChange={(e) => handleUserChange(e.target.value)}
            className="w-full bg-arena border border-line rounded-lg px-4 py-3 text-ink focus:outline-none focus:border-emerald-400"
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
              className="flex-1 min-w-0 bg-arena border border-line rounded-lg px-3 py-2 text-ink focus:outline-none focus:border-emerald-400 text-sm"
            />
            <ArrowRightLeft className="text-muted shrink-0" size={16} />
            <input
              type="text"
              placeholder="Añade a su plantilla"
              value={playerIn}
              onChange={(e) => setPlayerIn(e.target.value)}
              className="flex-1 min-w-0 bg-arena border border-line rounded-lg px-3 py-2 text-ink focus:outline-none focus:border-emerald-400 text-sm"
            />
          </div>

          {/* De quién toma el jugador que entra */}
          <select
            value={targetPlayer}
            onChange={(e) => setTargetPlayer(e.target.value)}
            className="w-full bg-arena border border-line rounded-lg px-4 py-3 text-ink focus:outline-none focus:border-emerald-400"
          >
            {possibleTargets.map(p => (
              <option key={p} value={p}>Le quita a: {p}</option>
            ))}
          </select>

          <button
            type="submit"
            disabled={!playerOut.trim() || !playerIn.trim() || !targetPlayer}
            className="w-full bg-surface-raised text-ink border border-line hover:border-emerald-500/50 py-3 rounded-lg font-semibold disabled:opacity-50 transition-colors mt-2 text-sm"
          >
            Registrar Fichaje
          </button>
        </form>
      </div>

      {/* Historial de fichajes (derecha en escritorio) */}
      <div className="bg-surface border border-line rounded-2xl p-5 md:self-center">
        <h3 className="text-[11px] uppercase tracking-[0.06em] font-semibold text-muted mb-3">Historial Reciente</h3>
        <ul className="space-y-2">
          {transfers.length === 0 && <p className="text-xs text-muted italic">No hay fichajes registrados.</p>}
          {[...transfers].reverse().slice(0, 5).map((t, idx) => (
            <Motion.li
              key={t.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.25 }}
              className="text-sm bg-arena p-3 rounded-md border border-line flex flex-col gap-1.5"
            >
              {/* Relato plano del fichaje: quién, a quién le quita qué, y qué recibe */}
              <p className="text-ink leading-relaxed">
                <span className="text-emerald-400 font-semibold">{t.user}</span>
                {t.targetPlayer ? (
                    <>
                      {' '}le quita <span className="text-rose-400 font-semibold">{t.playerOut}</span> a{' '}
                      <span className="text-cyan-300 font-semibold">{t.targetPlayer}</span> y le da a{' '}
                      <span className="text-emerald-300 font-semibold">{t.playerIn}</span>
                    </>
                ) : (
                    <>
                      {' '}cambia <span className="text-rose-400 font-semibold">"{t.playerOut}"</span> por{' '}
                      <span className="text-emerald-300 font-semibold">"{t.playerIn}"</span>
                    </>
                )}
              </p>
              <TeamTag player={t.user} draftPicks={draftPicks} />
            </Motion.li>
          ))}
        </ul>
      </div>

    </Motion.div>
  )
}
