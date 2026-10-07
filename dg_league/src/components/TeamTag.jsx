import { TEAM_CATALOG } from '../utils/teamCatalog'

/**
 * Etiqueta de equipo de un jugador: escudo pequeño + nombre del club
 * en texto small, pensada para ubicarse debajo del nombre en cualquier
 * vista (tabla, fixture, eliminatorias, pronósticos).
 *
 * Es nula-segura: si el jugador aún no eligió equipo en el draft
 * (o el nombre es un placeholder como "1° Grupo A"), no renderiza nada.
 *
 * @param {Object} props
 * @param {string} props.player - Nombre del jugador (clave del draft).
 * @param {Array<{player: string, teamId: string}>} props.draftPicks - Elecciones del draft.
 * @param {boolean} [props.alignCenter] - Centra el contenido (para nombres a la derecha/izquierda del duelo).
 */
export default function TeamTag({ player, draftPicks, alignCenter = false }) {
    const pick = draftPicks?.find((p) => p.player === player)
    const team = pick
        ? TEAM_CATALOG.find((t) => t.id === pick.teamId)
        : undefined

    if (!team) return null

    return (
        <span
            className={`flex items-center gap-1 mt-0.5 max-w-full ${
                alignCenter ? 'justify-center' : ''
            }`}
        >
            <img
                src={team.logo}
                alt=""
                className="w-3.5 h-3.5 object-contain shrink-0"
            />
            <span className="text-[10px] font-medium text-muted leading-none truncate">
                {team.name}
            </span>
        </span>
    )
}
