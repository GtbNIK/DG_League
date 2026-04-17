import { useState } from 'react'
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
    <div className="flex flex-col items-center gap-8 mb-24 animate-in fade-in duration-300">
      
      <div className="text-center space-y-2 mt-4">
        <h2 className="text-2xl font-black text-rose-500 uppercase tracking-widest flex items-center justify-center gap-2">
          <Sparkles size={20} />
          Cartas de Castigo
          <Sparkles size={20} />
        </h2>
        <p className="text-slate-400 text-sm max-w-xs mx-auto">
          ¿Perdiste? Acepta tu destino. Pulsa el botón y descubre tu castigo para / contra tu próximo rival.
        </p>
      </div>

      {/* Card Display Area */}
      <div className="relative w-full max-w-[300px] aspect-[2/3] mx-auto perspective-1000">
        
        <div className={`w-full h-full rounded-2xl shadow-2xl transition-all duration-700 preserve-3d ${
          isSpinning ? 'animate-pulse' : ''
        } ${selectedCard && !isSpinning ? 'rotate-y-180' : ''}`}>
          
          {/* Card Back (Default/Spinning state) */}
          <div className={`absolute inset-0 w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl backface-hidden flex items-center justify-center ${selectedCard && !isSpinning ? 'hidden' : ''}`}>
            <div className="w-[80%] h-[90%] border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center opacity-50">
              <Dices size={48} className={`text-slate-500 ${isSpinning ? 'animate-bounce' : ''}`} />
               <span className="text-slate-500 font-black tracking-widest mt-4">MISTERIO</span>
            </div>
          </div>

          {/* Card Front (Revealed state) */}
          {selectedCard && (
            <div className={`absolute inset-0 w-full h-full bg-gradient-to-br ${selectedCard.color} rounded-2xl border border-white/20 p-6 flex flex-col justify-between shadow-[0_0_40px_rgba(255,255,255,0.1)] rotate-y-180 animate-in zoom-in-95 duration-500`}>
              <div className="text-center mt-4">
                <span className="text-white/80 font-bold uppercase tracking-widest text-xs mb-2 block">Castigo Revelado</span>
                <h3 className="text-3xl font-black text-white leading-tight drop-shadow-md">
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
        <div className="relative bg-slate-900 border border-slate-800 px-8 py-4 rounded-xl font-black text-white text-lg tracking-widest uppercase transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
          {isSpinning ? 'Sacando carta...' : 'Sacar Carta'}
        </div>
      </button>

    </div>
  )
}
