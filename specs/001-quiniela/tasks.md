# Tareas 001 — Quiniela del torneo: empate, eliminatorias y tabla

Ejecución: una tarea a la vez, en orden. Tareas de lógica (T1-T3): tests primero en rojo, código, verde. Toda tarea cierra con `npm run lint` y `npm run build` en verde desde `dg_league/`.

- [x] **T1. Constantes y bracket puro: `DRAW_PICK`, `KO_STAGES`, `KO_LABELS`, `getGroupStandings`, `getKnockoutBracket` y `getPickOptions` en `src/utils/tournamentLogic.js`, con su suite en `src/utils/tournamentLogic.test.js` (tests en rojo primero) y script `"test": "node --test src/utils/"` en package.json.** RF-4, RF-5, RF-6
  - Hecho cuando: `npm test` falla sin el código y queda en verde con los casos: grupos sin jugadores → placeholders y sin confirmar; grupos con jugadores → semis confirmadas con nombres reales; semi con un solo marcador → winner null (quirk corregido); semi completa → final/tercero con nombres reales y confirmados; semi empatada → placeholders persisten; 3-0 → `closed: true`; `getPickOptions` devuelve 3 opciones con 'empate' en grupos y 2 en cruces. Lint y build en verde.

- [x] **T2. `getPredictionStandings` pura con subtotales por fase en `src/utils/tournamentLogic.js` + tests (en rojo primero).** RF-2, RF-3, RF-7, RF-8, RF-15, RF-16, RF-17
  - Hecho cuando: `npm test` en verde con los casos: 'empate' acierta con marcador empatado y no con 3-0 (CL-1, CL-5); pick antiguo de nombre no acierta en empate (CL-4); partido con un solo marcador no suma; acierto/fallo de cruce confirmado; cruce empatado no suma a nadie; pick huérfano no acierta pero cuenta en ko.total sin borrarse (CL-2); forma `{name, group, ko, total}` exacta; orden total desc → ko desc → alfabético. Lint y build en verde.

- [x] **T3. `getBestPredictor` pura en `src/utils/tournamentLogic.js` + tests (en rojo primero).** RF-18, RF-19, RF-20
  - Hecho cuando: `npm test` en verde con los casos: standings sin picks puntuados → null; líder único → `names` de uno; empate a total desempatado por ko.hits; empate a total y ko → `names` con ambos (CL-7); cambiando resultados de entrada cambia el líder devuelto. Lint y build en verde.

- [x] **T4. Hook `useTournament`: delegar `getStandings` y `getPredictionStandings` en las funciones puras y extender `addPrediction` a cruces (`ko-*`: valida cruce confirmado, no cerrado, rechaza 'empate' y rechaza al participante; en grupos añade el guard de participante).** RF-4, RF-5, RF-9, RF-13
  - Hecho cuando: con datos existentes la tabla de aciertos muestra exactamente los mismos números que antes de la delegación (regresión RNF-3); intentar guardar un pick sobre un cruce sin confirmar o cerrado no altera el estado; guardar un pick 'empate' sobre un cruce no se registra; el pick de un participante sobre su propio partido o cruce se rechaza. Lint y build en verde.

- [x] **T5. `PredictionsView`: tres pestañas 'grupos' | 'ko' | 'tabla' con pastilla deslizante (layoutId propio), sub-encabezados "Grupo A"/"Grupo B" en grupos, chip "Empate" en medio de las opciones de cada partido, ocultado de los dos participantes de la lista de votantes y contador `picks/(players.length - 2)`.** RF-1, RF-10, RF-11, RF-13, RF-14
  - Hecho cuando: en la app se ven las tres pestañas; la sección grupos muestra ambos grupos con sub-encabezado; cada partido abierto ofrece local/empate/visita y el pick de empate se guarda, se ve activo y se quita al re-pulsar; en un partido de 9 amigos el contador llega a 7/7 y los dos jugadores del partido no aparecen como votantes; partidos cerrados sin panel de picks. Lint y build en verde.

- [x] **T6. `PredictionsView`: sección "Eliminatorias" con los 4 cruces desde `getKnockoutBracket`: placeholders visibles y cruce bloqueado sin confirmar; cruce confirmado con nombres+TeamTag, apuesta de 2 opciones y contador participants-excluidos; cruce cerrado bloqueado.** RF-4, RF-5, RF-6, RF-12
  - Hecho cuando: en la app la pestaña Eliminatorias lista Semifinal 1, Semifinal 2, Tercer Puesto y Gran Final; un cruce con placeholder no ofrece botones; al confirmarse ambos participantes aparecen los nombres reales y se puede apostar solo entre ellos (sin opción empate), sobrescribiendo el pick al repetir; un cruce cerrado no admite picks. Lint y build en verde.

- [x] **T7. `PredictionsView`: sección "Tabla" con columnas TOTAL (columna principal), Grupos y Eliminatorias por amigo, ordenada por TOTAL, consumiendo la standings delegada del hook.** RF-15, RF-16, RF-17
  - Hecho cuando: en la app cada fila muestra subtotales por fase y el total destacado como columna principal; los números cuadran con un escenario de prueba manual (aciertos de grupos + cruces) y el orden sigue el total con desempate por eliminatorias; sin pronósticos se muestra el estado vacío actual. Lint y build en verde.

- [x] **T8. `TournamentView`: reemplazar la derivación local del bracket (líneas 30-47 y comparaciones de score sueltas) por `getKnockoutBracket` en las ramas móvil y escritorio, con resaltado de ganador basado en `winner`.** RF-6
  - Hecho cuando: en la app el cuadro eliminatorio se ve idéntico al actual con marcadores completos; con un solo marcador cargado en una semi el ganador ya NO se confirma (corrige el quirk) y la final mantiene placeholders; el resaltado del ganador solo aparece con cruce decidido. Lint y build en verde.

- [x] **T9. `AchievementsView`: card dorada "Micasino.com" al final de la vista, fuera del grid, con estilo Gran Final (border-amber-500/60, bg-amber-500/10), holders con TeamTag (uno o compartidos) y puntos, evaluada con `getBestPredictor` fuera del early-return de partidos jugados.** RF-18, RF-19, RF-20
  - Hecho cuando: en la app, con al menos un pick puntuado, la card dorada aparece al final de logros con el nombre del líder de la quiniela; al cambiar resultados el nombre cambia al nuevo líder; sin ningún pick puntuado la card no aparece (aunque haya partidos jugados). Lint y build en verde.

- [x] **T10. Verificación final RF a RF contra la spec aprobada: suite `npm test` completa en verde, `npm run lint` y `npm run build` en verde, detector `impeccable` sobre los archivos tocados y revisión manual de los casos límite CL-1 a CL-7.** RF-1 a RF-20
  - Hecho cuando: checklist RF-1..RF-20 verificado uno a uno contra `spec.md` (incluye CL-3: contador 7/7 con 9 amigos; CL-4: picks antiguos intactos y sin reinterpretar; RNF-3: pronósticos y puntos previos intactos tras actualizar), detector impeccable sin hallazgos sin resolver y build de producción ok.
  - Cerrada por el coordinador: reviewer independiente emitió veredicto APROBADO (20/20 RF con evidencia, 7/7 CL, regresión limpia); test/lint/build y detector `[]` verificados; 28 tests en verde. Verificación visual en navegador pendiente de Neil (HMR aplicado).
