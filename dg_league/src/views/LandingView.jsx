import { useState } from 'react'
import { motion as Motion } from 'motion/react'
import { Play } from 'lucide-react'

/**
 * Pantalla de inicio (onboarding). Se muestra solo la primera vez, cuando
 * no existe un torneo activo. Presenta la liga sobre una imagen de fondo y
 * da acceso al registro con el botón "Iniciar Liga".
 *
 * Diseño: la imagen cubre toda la pantalla y el panel de contenido se
 * superpone a la derecha (escritorio) o abajo (móvil) con un desenfoque
 * progresivo en la zona de unión, para que la foto se "derrita" hacia el
 * contenido sin bordes duros.
 *
 * @param {Object} props
 * @param {Function} props.onFinish - Callback al pulsar "Iniciar Liga".
 */
export default function LandingView({ onFinish }) {
    const [bgFailed, setBgFailed] = useState(false)

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-950">
            {/* Resaldo visual si la imagen de fondo aún no existe */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,#064e3b_0%,#0f172a_55%,#020617_100%)]" />

            {/* Imagen de fondo (horizontal, foco a la izquierda) */}
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

            {/* Velo de contraste: protege el texto sin apagar la foto */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-slate-950/30 md:bg-gradient-to-r md:from-slate-950/5 md:via-slate-950/10 md:to-slate-950/70" />

            {/* Panel de contenido: abajo en móvil, derecha en escritorio */}
            <div className="relative z-10 min-h-screen flex items-end justify-center md:items-center md:justify-end">
                <Motion.section
                    initial={{ y: 48, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.7, delay: 0.25, ease: 'easeOut' }}
                    className="relative w-full md:w-[46%] md:min-h-screen flex flex-col items-center justify-center text-center px-6 pt-28 pb-14 md:py-14
                    bg-slate-950/55 backdrop-blur-xl md:border-l border-slate-700/40"
                >
                    {/* Costura difuminada: fundido progresivo de la unión con la foto */}
                    <div className="hidden md:block absolute inset-y-0 -left-24 w-24 backdrop-blur-md [mask-image:linear-gradient(to_right,transparent,black)] pointer-events-none" />
                    <div className="md:hidden absolute inset-x-0 -top-24 h-24 backdrop-blur-md [mask-image:linear-gradient(to_bottom,transparent,black)] pointer-events-none" />

                    {/* Escudo */}
                    <Motion.img
                        src="/LOGO-1.png"
                        alt="DG League"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.45 }}
                        className="w-24 h-24 md:w-28 md:h-28 object-contain drop-shadow-[0_0_25px_rgba(16,185,129,0.35)]"
                    />

                    {/* Titular con estilo dorsal: DG sólido + LEAGUE en trazo hueco */}
                    <Motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.55 }}
                        className="mt-8 text-[10px] md:text-xs font-bold tracking-[0.4em] text-emerald-400 uppercase"
                    >
                        12 Clubes · Un solo campeón · Un torneo Diferente al resto
                    </Motion.p>

                    <Motion.h1
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.65 }}
                        className="mt-2 text-5xl md:text-7xl font-black leading-none tracking-tight"
                    >
                        <span className="text-white">DG</span>{' '}
                        <span className="text-transparent [-webkit-text-stroke:2px_#10b981]">LEAGUE</span>
                    </Motion.h1>

                    <Motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.75 }}
                        className="mt-5 max-w-sm text-sm md:text-base text-slate-300 leading-relaxed"
                    >
                        Elige tu club en el draft, sobrevive a la fase de grupos
                        y conviertete en el campeón de la DG League.
                    </Motion.p>

                    {/* Botón principal con latido sutil */}
                    <Motion.button
                        onClick={onFinish}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0, scale: [1, 1.03, 1] }}
                        transition={{
                            opacity: { duration: 0.6, delay: 0.85 },
                            y: { duration: 0.6, delay: 0.85 },
                            scale: { duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 1.6 },
                        }}
                        whileTap={{ scale: 0.95 }}
                        className="mt-10 bg-emerald-500 text-slate-950 px-10 py-4 rounded-xl font-black text-lg tracking-wide
                        flex items-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.4)]
                        transition-colors hover:bg-emerald-400"
                    >
                        <Play fill="currentColor" size={20} />
                        Iniciar Liga
                    </Motion.button>

                    <Motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 1 }}
                        className="mt-4 text-xs text-slate-400"
                    >
                        Al iniciar, sortearás el orden del draft de equipos
                    </Motion.p>
                </Motion.section>
            </div>
        </div>
    )
}
