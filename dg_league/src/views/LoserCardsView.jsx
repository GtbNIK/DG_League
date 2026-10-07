import { useState } from 'react'
import { motion as Motion } from 'motion/react'
import { Sparkles, Dices } from 'lucide-react'

const PUNISHMENT_CARDS = [
  {
    id: 1,
    title: 'Catenaccio',
    description: 'Tu rival en el próximo partido está obligado a jugar con Línea de 5 defensas..',
    color: 'from-amber-600 to-yellow-500',
    image: '/catenaccio.webp'
  },
  {
    id: 2,
    title: 'Pausa del Pánico',
    description: 'Tienes el poder absoluto de pausar el partido de tu rival 1 vez, en el momento que tú decidas. ¡Rompe su concentración!',
    color: 'from-purple-600 to-indigo-500',
    image: '/pausa.webp'
  },
  {
    id: 3,
    title: 'Cambio Ciego',
    description: 'Tu rival debe hacerte un cambio al azar en el minuto 10 sin que tu veas la pantalla. ¡Que la suerte y su malicia decida quién entra!',
    color: 'from-red-600 to-rose-500',
    image: '/ciego.png'
  }
]

/**
 * Ruleta de cartas de castigo: el perdedor de la jornada saca una carta
 * que condiciona su próximo partido. Los gradientes de cada castigo son
 * identidad propia de esta vista y se conservan tal cual (petición de Neil).
 */
export default function LoserCardsView() {
  const [isSpinning, setIsSpinning] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)

  const drawCard = () => {
    if (isSpinning) return

    setSelectedCard(null)
    setIsSpinning(true)

    // Simulate roulette/shuffle effect
    setTimeout(() => {
      const randomIdx = Math.floor(Math.random() * PUNISHMENT_CARDS.length)
      setSelectedCard(PUNISHMENT_CARDS[randomIdx])
      setIsSpinning(false)
    }, 1500)
  }

  return (
    <Motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center gap-8 mb-24"
    >

      <div className="text-center space-y-2 mt-4">
        <h2 className="text-2xl font-bold font-display text-rose-500 flex items-center justify-center gap-2">
          <Sparkles size={20} />
          Cartas de Castigo
          <Sparkles size={20} />
        </h2>
        <p className="text-muted text-sm max-w-xs mx-auto">
          ¿Perdiste? Acepta tu destino. Pulsa el botón y descubre tu castigo para / contra tu próximo rival.
        </p>
      </div>

      {/* Card Display Area */}
      <div className="relative w-full max-w-[300px] aspect-[2/3] mx-auto [perspective:1200px]">

        <div className={`relative w-full h-full rounded-2xl transition-transform duration-700 [transform-style:preserve-3d] ${
          isSpinning ? 'animate-pulse' : ''
        } ${selectedCard && !isSpinning ? '[transform:rotateY(180deg)]' : ''}`}>

          {/* Card Back (Default/Spinning state): dorso sólido de la Arena.
              backface-visibility lo oculta solo al rotar la tarjeta. */}
          <div className="absolute inset-0 w-full h-full bg-surface border border-line rounded-2xl [backface-visibility:hidden] flex items-center justify-center">
            <div className="w-[80%] h-[90%] border-2 border-dashed border-line rounded-xl flex flex-col items-center justify-center opacity-60">
              <Dices size={48} className={`text-muted ${isSpinning ? 'animate-pulse' : ''}`} />
               <span className="text-muted font-semibold tracking-[0.06em] mt-4 text-sm">MISTERIO</span>
            </div>
          </div>

          {/* Card Front (Revealed state): gradiente propio del castigo, intacto.
              Pre-rotado 180° para quedar legible (no espejado) tras el flip. */}
          {selectedCard && (
            <div className={`absolute inset-0 w-full h-full bg-gradient-to-br ${selectedCard.color} rounded-2xl border border-white/20 p-6 flex flex-col justify-between [backface-visibility:hidden] [transform:rotateY(180deg)]`}>
              <div className="text-center mt-4">
                <span className="text-white/80 font-semibold uppercase tracking-[0.06em] text-xs mb-2 block">Castigo Revelado</span>
                <h3 className="text-3xl font-bold font-display text-white leading-tight">
                  {selectedCard.title}
                </h3>
              </div>

              <div className="flex items-center justify-center my-4">
                <img
                  src={selectedCard.image}
                  alt={selectedCard.title}
                  className="w-55 h-35 object-contain drop-shadow-lg"
                />
              </div>

              <div className="bg-black/30 backdrop-blur-sm p-4 rounded-xl border border-white/10 mb-4">
                <p className="text-white/90 text-sm font-medium leading-relaxed text-center">
                  {selectedCard.description}
                </p>
              </div>
            </div>
          )}

        </div>
      </div>

      <button
        onClick={drawCard}
        disabled={isSpinning}
        className="relative group w-full max-w-[300px]"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-rose-500 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-200"></div>
        <div className="relative bg-surface border border-line px-8 py-4 rounded-xl font-bold font-display text-ink text-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
          {isSpinning ? 'Sacando carta...' : 'Sacar Carta'}
        </div>
      </button>

    </Motion.div>
  )
}
