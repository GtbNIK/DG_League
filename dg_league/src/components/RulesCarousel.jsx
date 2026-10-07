import { useEffect, useState } from 'react'
import { motion as Motion } from 'motion/react'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Láminas del reglamento, en el orden oficial del torneo.
 */
const LAMINAS = [
    {
        src: '/Rules-img/REGLAS.jpg',
        alt: 'Lámina 1: reglas del torneo (formato, clasificación, tiempos, nocaut 3-0 y draft)',
    },
    {
        src: '/Rules-img/REGLAS-ESPECIALES.jpg',
        alt: 'Lámina 2: reglas especiales (draft de equipos, nerfeos y mercado de fichajes)',
    },
    {
        src: '/Rules-img/cartas-de-perdedor.jpg',
        alt: 'Lámina 3: cartas de perdedor (catenaccio, pausa del pánico y cambio ciego)',
    },
]

/**
 * Visor a pantalla completa de las láminas del reglamento.
 * Navegación por deslizamiento (swipe), flechas laterales, indicadores
 * y teclado (Escape vuelve al landing; ← y → cambian de lámina).
 *
 * @param {Object} props
 * @param {Function} props.onBack - Callback para volver al landing.
 */
export default function RulesCarousel({ onBack }) {
    const [index, setIndex] = useState(0)

    /**
     * Mueve el carrusel `dir` posiciones (positivo = siguiente),
     * sin salirse de los límites del mazo de láminas.
     */
    const saltar = (dir) => {
        setIndex((actual) => Math.min(LAMINAS.length - 1, Math.max(0, actual + dir)))
    }

    // Atajos de teclado mientras el visor está abierto
    useEffect(() => {
        const onKey = (evento) => {
            if (evento.key === 'Escape') onBack()
            if (evento.key === 'ArrowRight') saltar(1)
            if (evento.key === 'ArrowLeft') saltar(-1)
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [onBack])

    return (
        <Motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Reglas de la DG League"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex flex-col overflow-hidden"
        >
            {/* Barra superior: botón de atrás en la esquina + contador de láminas */}
            <div className="relative z-10 flex items-center justify-between px-4 py-3">
                <button
                    onClick={onBack}
                    autoFocus
                    aria-label="Volver al inicio"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900/80
                    border border-slate-700/60 text-slate-200 font-semibold text-sm
                    transition-colors hover:border-emerald-500/60 hover:text-white
                    focus-visible:outline-2 focus-visible:outline-emerald-400"
                >
                    <ArrowLeft size={18} className="text-emerald-400" />
                    Volver
                </button>

                <p className="font-display text-sm text-slate-400 tabular-nums" aria-live="polite">
                    {index + 1} / {LAMINAS.length}
                </p>
            </div>

            {/* Carrusel deslizable: cada lámina ocupa el ancho completo */}
            <div className="relative flex-1 min-h-0">
                <Motion.div
                    className="flex h-full"
                    animate={{ x: `-${index * 100}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 32 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.15}
                    onDragEnd={(e, info) => {
                        if (info.offset.x < -80) saltar(1)
                        else if (info.offset.x > 80) saltar(-1)
                    }}
                >
                    {LAMINAS.map((lamina) => (
                        <div
                            key={lamina.src}
                            className="w-full h-full shrink-0 flex items-center justify-center p-3 md:p-8"
                        >
                            <img
                                src={lamina.src}
                                alt={lamina.alt}
                                draggable={false}
                                className="max-w-full max-h-full object-contain select-none
                                rounded-md shadow-[0_8px_30px_rgba(2,6,23,0.6)]"
                            />
                        </div>
                    ))}
                </Motion.div>

                {/* Flechas de navegación (escritorio; en móvil se desliza) */}
                <button
                    onClick={() => saltar(-1)}
                    disabled={index === 0}
                    aria-label="Lámina anterior"
                    className="hidden md:flex absolute left-5 top-1/2 -translate-y-1/2 w-11 h-11 items-center
                    justify-center rounded-full bg-slate-900/80 border border-slate-700/60 text-slate-200
                    transition-colors hover:border-emerald-500/60 hover:text-white
                    disabled:opacity-30 disabled:pointer-events-none
                    focus-visible:outline-2 focus-visible:outline-emerald-400"
                >
                    <ChevronLeft size={22} />
                </button>
                <button
                    onClick={() => saltar(1)}
                    disabled={index === LAMINAS.length - 1}
                    aria-label="Lámina siguiente"
                    className="hidden md:flex absolute right-5 top-1/2 -translate-y-1/2 w-11 h-11 items-center
                    justify-center rounded-full bg-slate-900/80 border border-slate-700/60 text-slate-200
                    transition-colors hover:border-emerald-500/60 hover:text-white
                    disabled:opacity-30 disabled:pointer-events-none
                    focus-visible:outline-2 focus-visible:outline-emerald-400"
                >
                    <ChevronRight size={22} />
                </button>
            </div>

            {/* Indicadores de lámina */}
            <div className="relative z-10 flex items-center justify-center gap-2 pt-1 pb-5">
                {LAMINAS.map((lamina, n) => (
                    <button
                        key={lamina.src}
                        onClick={() => setIndex(n)}
                        aria-label={`Ir a la lámina ${n + 1}`}
                        aria-current={index === n}
                        className={`h-2 rounded-full transition-all duration-300
                        focus-visible:outline-2 focus-visible:outline-emerald-400 ${
                            index === n ? 'w-7 bg-emerald-500' : 'w-2 bg-slate-600 hover:bg-slate-400'
                        }`}
                    />
                ))}
            </div>
        </Motion.div>
    )
}
