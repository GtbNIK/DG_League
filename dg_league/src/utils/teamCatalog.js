/**
 * Catálogo de equipos disponibles para el draft.
 *
 * Los logos viven en `public/TeamLogos/<id>.png`. Si un archivo falta,
 * las vistas lo manejan con un fallback (ocultan la imagen y muestran
 * el nombre del equipo), así que este archivo es el único lugar donde
 * se define la lista.
 *
 * Para cambiar un equipo: edita su entrada aquí y sube el logo
 * correspondiente con el nombre `<id>.png`.
 */
export const TEAM_CATALOG = [
    { id: 'real-madrid', name: 'Real Madrid', logo: '/TeamLogos/real-madrid.png' },
    { id: 'manchester-city', name: 'Manchester City', logo: '/TeamLogos/manchester-city.png' },
    { id: 'barcelona', name: 'FC Barcelona', logo: '/TeamLogos/barcelona.png' },
    { id: 'bayern', name: 'Bayern Múnich', logo: '/TeamLogos/bayern.png' },
    { id: 'liverpool', name: 'Liverpool', logo: '/TeamLogos/liverpool.png' },
    { id: 'inter', name: 'Inter de Milán', logo: '/TeamLogos/inter.png' },
    { id: 'arsenal', name: 'Arsenal', logo: '/TeamLogos/arsenal.png' },
    { id: 'psg', name: 'PSG', logo: '/TeamLogos/psg.png' },
    { id: 'atletico', name: 'Atlético de Madrid', logo: '/TeamLogos/atletico.png' },
    { id: 'chelsea', name: 'Chelsea', logo: '/TeamLogos/chelsea.png' },
    { id: 'milan', name: 'Milan', logo: '/TeamLogos/milan.png' },
    { id: 'juventus', name: 'Juventus', logo: '/TeamLogos/juventus.png' },
]

/**
 * Devuelve los equipos que aún no fueron elegidos en el draft.
 *
 * @param {Array<{player: string, teamId: string}>} draftPicks - Elecciones hechas.
 * @returns {Array<{id: string, name: string, logo: string}>} Equipos libres.
 */
export const getAvailableTeams = (draftPicks) => {
    const takenIds = draftPicks.map((pick) => pick.teamId)
    return TEAM_CATALOG.filter((team) => !takenIds.includes(team.id))
}
