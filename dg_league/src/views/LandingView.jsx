import { useState } from 'react'
import { motion as Motion, AnimatePresence } from 'motion/react'
import { BookOpen, Play } from 'lucide-react'
import RulesCarousel from '../components/RulesCarousel'

/**
 * Pantalla de inicio (onboarding). Se muestra solo la primera vez, cuando
 * no existe un torneo activo. La imagen diseñada por Neil ocupa toda la
 * pantalla como protagonista y las acciones viven en una isla flotante
 * inferior que roba el mínimo espacio a la foto.
 *
 * @param {Object} props
 * @param {Function} props.onFinish - Callback al pulsar "Iniciar Liga".
 */
export default function LandingView({ onFinish }) {
    const [bgFailed, setBgFailed] = useState(false)
    const [showRules, setShowRules] = useState(false)

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-950">
            {/* Respaldo visual si la imagen de fondo aún no existe */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,#064e3b_0%,#0f172a_55%,#020617_100%)]" />

            {/* Imagen de fondo a pantalla completa: la foto manda */}
            {!bgFailed && (
                <Motion.img
                    src="/onboarding-bg.webp"
                    alt=""
                    onError={() => setBgFailed(true)}
                    initial={{ opacity: 0, scale: 1.06 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.4, ease: 'easeOut' }}
                    className="absolute inset-0 w-full h-full object-cover object-left"
                />
            )}

            {/* Scrim inferior: asienta la isla flotante sin apagar la foto */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20 pointer-events-none" />

            {/* Isla flotante de acciones: compacta, centrada abajo */}
            <Motion.div
                initial={{ y: 48, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
                className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-3 px-4 pb-6"
            >
                <div className="flex items-center gap-2 p-2 rounded-full bg-slate-900/70 backdrop-blur-md border border-slate-700/50 shadow-[0_8px_30px_rgba(2,6,23,0.6)]">
                    {/* Acción primaria: avanzar al registro */}
                    <Motion.button
                        onClick={onFinish}
                        animate={{ scale: [1, 1.03, 1] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 1.6 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 bg-emerald-500 text-slate-950 px-7 py-3.5 rounded-full
                        font-black text-base tracking-wide transition-colors hover:bg-emerald-400
                        focus-visible:outline-2 focus-visible:outline-emerald-400"
                    >
                        <Play fill="currentColor" size={18} />
                        Iniciar Liga
                    </Motion.button>

                    {/* Acción secundaria: consultar el reglamento */}
                    <button
                        onClick={() => setShowRules(true)}
                        className="flex items-center gap-2 bg-black text-white px-6 py-3.5 rounded-full
                        border border-emerald-500/70 font-bold text-base transition-colors
                        hover:border-emerald-400 hover:bg-emerald-500/10
                        focus-visible:outline-2 focus-visible:outline-emerald-400"
                    >
                        <BookOpen size={18} className="text-emerald-400" />
                        Ver reglas
                    </button>
                </div>

                <Motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.9 }}
                    className="text-xs text-slate-400 text-center"
                >
                    Al iniciar, sortearás el orden del draft de equipos
                </Motion.p>
            </Motion.div>

            {/* Visor de reglas a pantalla completa */}
            <AnimatePresence>
                {showRules && <RulesCarousel onBack={() => setShowRules(false)} />}
            </AnimatePresence>
        </div>
    )
}
