# Spec 001 — Quiniela del torneo: empate, eliminatorias y tabla

Estado: implementada

## Contexto y objetivo

La quiniela actual solo permite pronosticar el ganador de los partidos de fase de grupos. Esto tiene dos problemas: (1) el empate es un resultado real y frecuente en la liga y hoy no se puede pronosticar, y (2) cuando el torneo llega a eliminatorias, la quiniela se muere porque no hay nada que apostar.

Esta spec extiende la quiniela para que acompañe todo el torneo: añade la opción "Empate" en fase de grupos, permite apostar en los cuatro cruces de eliminatorias cuando sus participantes están confirmados, organiza la vista en tres secciones (Fase de Grupos, Eliminatorias, Tabla), convierte la tabla de aciertos en una tabla con subtotales por fase y total del torneo, aplica la regla "quien juega, no vota" y añade la card dorada "Micasino.com" para el líder de la quiniela, una broma interna del grupo.

Decisiones ya ratificadas con Neil que esta spec incorpora y no reabre: el empate solo existe en fase de grupos (en eliminatorias solo 2 opciones y un cruce empatado no puntúa para nadie), la puntuación sigue siendo 1 punto por acierto en cualquier fase, los pronósticos existentes (solo ganador) siguen siendo válidos sin migración, y la card Micasino.com usa dorado destacado aunque el sistema visual reserve el oro para el campeón.

## Usuarios

- **Neil (administrador y dueño):** registra marcadores de grupos y cruces; de que los resultados se reflejen en puntos de la quiniela depende su credibilidad como organizador.
- **Amigos de la liga (8-10 jugadores):** dejan sus pronósticos partido a partido en el dispositivo compartido y compiten por encabezar la tabla y por ser el "Micasino.com" del torneo.

## Historias de usuario

- HU-1. Como amigo, quiero pronosticar empate en un partido de fase de grupos para no estar obligado a inventarme un ganador cuando creo que va a quedar igualado.
- HU-2. Como amigo, quiero apostar en los cruces de eliminatorias en cuanto se conozcan los clasificados para que la quiniela siga viva hasta la gran final.
- HU-3. Como amigo, quiero ver la quiniela dividida en "Fase de Grupos", "Eliminatorias" y "Tabla" para encontrar en segundos qué me queda por pronosticar.
- HU-4. Como Neil, quiero que los cruces muestren los enfrentamientos reales cuando ambos clasificados estén confirmados para que el grupo apueste con información completa y no con posiciones genéricas.
- HU-5. Como amigo, quiero que quien juega un partido no pueda pronosticarlo para que nadie vote su propio partido.
- HU-6. Como amigo, quiero ver en una sola tabla mis aciertos por fase y mi total del torneo para saber exactamente a cuántos puntos del líder estoy.
- HU-7. Como amigo, quiero ver una card dorada "Micasino.com" con el nombre del líder de la quiniela al final de los logros, para reírnos y celebrar al mejor pronosticador del grupo.

## Definiciones

- **Quiniela:** conjunto de todos los pronósticos del torneo, de grupos y de eliminatorias. La suma total de puntos es la de todo el torneo.
- **Pick (pronóstico):** la elección de un amigo sobre el resultado de un partido o cruce. Cada amigo tiene un único pick por partido o cruce; volver a pronosticar sobrescribe el anterior.
- **Partido abierto / cerrado:** un partido o cruce está cerrado cuando se cierra por nocaut 3-0 (regla del grupo); un cerrado no admite cambios de marcador ni pronósticos.
- **Cruce confirmado:** cruce de eliminatorias cuyos dos participantes son jugadores reales ya conocidos. Mientras no lo estén, se muestran textos pendientes derivados de la tabla o de cruces previos (por ejemplo, una posición de grupo).
- **Pick puntuado:** pick que otorgó al menos 1 punto a su amigo al registrarse el resultado de su partido o cruce.
- **Líder de la quiniela:** amigo con mayor total de puntos en la tabla de aciertos del torneo.
- **Participante oculto:** amigo que es uno de los dos jugadores de un partido o cruce y que por tanto no puede pronosticarlo.

## Requisitos funcionales

### Empate en fase de grupos

- RF-1: CUANDO un amigo registra un pronóstico sobre un partido de fase de grupos abierto, EL SISTEMA presenta exactamente tres opciones: gana el jugador local, empate, gana el jugador visitante.
- RF-2: CUANDO un partido de grupo con marcador completo termina empatado, EL SISTEMA otorga 1 punto únicamente a los amigos que pronosticaron empate.
- RF-3: CUANDO un partido de grupo con marcador completo termina con ganador, EL SISTEMA otorga 1 punto únicamente a los amigos que pronosticaron a ese ganador y ninguno a quienes pronosticaron empate.

### Pronósticos en eliminatorias

- RF-4: CUANDO un cruce de eliminatorias tiene sus dos participantes confirmados, EL SISTEMA permite a los amigos registrar pronóstico sobre ese cruce con exactamente dos opciones: gana un participante o gana el otro (sin opción de empate).
- RF-5: MIENTRAS un cruce tenga al menos un participante sin confirmar, EL SISTEMA muestra el cruce sin opciones de apuesta.
- RF-6: CUANDO los dos participantes de un cruce se confirman, EL SISTEMA sustituye los textos pendientes por los nombres reales de los jugadores con sus equipos y habilita la apuesta en ese cruce.
- RF-7: CUANDO un cruce con pronósticos cierra con marcador empatado, EL SISTEMA no otorga puntos por ese cruce a ningún amigo.
- RF-8: CUANDO un cruce con pronósticos cierra con un ganador, EL SISTEMA otorga 1 punto a cada amigo que pronosticó a ese ganador.
- RF-9: SI un partido o cruce está cerrado, ENTONCES EL SISTEMA impide registrar o modificar pronósticos sobre él.

### Secciones de la quiniela

- RF-10: CUANDO se abre la vista de pronósticos, EL SISTEMA muestra tres secciones: "Fase de Grupos", "Eliminatorias" y "Tabla".
- RF-11: MIENTRAS la sección "Fase de Grupos" está activa, EL SISTEMA muestra todos los partidos de los grupos con un sub-encabezado por grupo.
- RF-12: MIENTRAS la sección "Eliminatorias" está activa, EL SISTEMA muestra los cuatro cruces con sus participantes (reales o pendientes) y su estado de apuesta.

### Quien juega, no vota

- RF-13: CUANDO un amigo es uno de los dos participantes de un partido o cruce, EL SISTEMA lo oculta de la lista de amigos elegibles para pronosticar ese partido o cruce.
- RF-14: CUANDO se muestra el contador de pronósticos de un partido o cruce, EL SISTEMA calcula el total posible restando a sus dos participantes del total de amigos (total posible = amigos - 2).

### Tabla de aciertos

- RF-15: EL SISTEMA muestra en la sección "Tabla" una fila por amigo con el subtotal de aciertos de Grupos, el subtotal de Eliminatorias y el TOTAL del torneo como columna principal.
- RF-16: EL SISTEMA ordena la tabla de aciertos por el TOTAL del torneo, de mayor a menor.
- RF-17: EL SISTEMA suma en cada subtotal solo los partidos o cruces de esa fase con resultado registrado, y calcula el TOTAL del torneo como la suma de ambos subtotales.

### Card Micasino.com

- RF-18: CUANDO existe al menos un pick puntuado en el torneo, EL SISTEMA muestra al final de la vista de logros, aparte del grid de logros, una card destacada dorada "Micasino.com" con el nombre del líder de la quiniela.
- RF-19: SI no existe ningún pick puntuado, ENTONCES EL SISTEMA no muestra la card Micasino.com.
- RF-20: CUANDO nuevos resultados cambian al líder de la quiniela, EL SISTEMA actualiza el nombre asignado a la card Micasino.com.

## Requisitos no funcionales

- RNF-1: Toda la UI de la quiniela (secciones, opciones, card) está en español y mantiene el tono informal del grupo; "Micasino.com" aparece literal, sin explicación, porque el grupo ya entiende la broma.
- RNF-2: La vista cumple el mundo visual del proyecto (tema oscuro mobile-first); el dorado destacado de la card Micasino.com es una excepción decidida explícitamente por Neil y documentada aquí.
- RNF-3: Los pronósticos y sus puntos persisten en el almacenamiento local del dispositivo y sobreviven al cierre de la app; los datos de pronósticos existentes se conservan intactos (sin migración).
- RNF-4: El cálculo de puntos, subtotales y líder debe poder verificarse de forma determinista mediante pruebas automatizadas, sin depender de la interfaz.
- RNF-5: Registrar o cambiar un pick requiere como máximo elegir la opción y confirmar; ningún paso intermedio.

## Casos límite

- **CL-1. Empate pronosticado en partido cerrado 3-0:** un 3-0 nunca es empate; quien pronosticó empate no acierta, y al quedar el partido cerrado no puede cambiar su pick.
- **CL-2. Picks de eliminatorias cuando cambian los clasificados:** si un marcador de grupo posterior modifica quién llega a un cruce ya apostado, los picks de ese cruce pueden quedar "huérfanos" respecto a los jugadores reales. Tratamiento propuesto en Dudas abiertas.
- **CL-3. Contador de picks con participantes ocultos:** con 9 amigos y 2 de ellos jugando un partido, el total posible es 7; el contador debe leer 7/7 cuando todos los elegibles votaron, nunca esperar 9 votos imposibles.
- **CL-4. Picks antiguos ante un empate:** los pronósticos previos solo registraban ganador, así que nunca puntúan en un partido que termina empatado; siguen siendo válidos tal cual, sin reinterpretarlos.
- **CL-5. Pick de empate marcado antes de un 3-0:** si un amigo pronostica empate y el partido termina cerrándose por nocaut 3-0, el pick queda registrado pero no puntúa (CL-1) y no puede modificarse por estar cerrado.
- **CL-6. Cruce que vuelve a quedar pendiente:** si un cambio de marcador aguas arriba deja de nuevo incierto un participante que estaba confirmado, el cruce vuelve al estado de la RF-5 y sus picks quedan congelados hasta que se vuelvan a confirmar los participantes.
- **CL-7. Empate a puntos en lo más alto de la tabla:** afecta al orden de la "Tabla" y al titular de la card Micasino.com; tratamiento propuesto en Dudas abiertas.

## Fuera de alcance

- Backend, nube, cuentas o sincronización entre dispositivos: la app sigue siendo de un solo dispositivo compartido.
- Marcador exacto y puntuación escalonada (3/1/0): descartado explícitamente con Neil; solo gana/empate/gana con 1 punto por acierto.
- Cambiar la regla de puntuación actual: 1 punto por acierto en cualquier fase, sin excepciones.
- Premios de temporada (más goles, mayor goleada, campeón, etc.): vienen después, en otra spec.
- Migración o reinterpretación de los pronósticos existentes: siguen válidos tal cual.
- Modificar cómo se derivan los clasificados de las eliminatorias o el orden de la tabla de posiciones: esta spec solo consume esos datos.

## Criterios de finalización

- Dado un partido de grupo abierto, la vista muestra las tres opciones (local, empate, visita) y un pick de "Empate" queda guardado, visible y sobrescribible (RF-1).
- Dado un partido de grupo cerrado empatado con picks mixtos, solo quienes pronosticaron empate suman 1 punto, verificable en la tabla (RF-2, RF-3).
- Dado un cruce sin participantes confirmados, no se ofrece apuesta; al confirmarse ambos, se muestran nombres y equipos reales y se pueden registrar picks de exactamente 2 opciones (RF-4, RF-5, RF-6).
- Dado un cruce cerrado empatado, ningún amigo suma puntos por ese cruce; dado un cruce cerrado con ganador, solo quienes lo pronosticaron suman (RF-7, RF-8).
- Dado un partido o cruce cerrado, no se puede registrar ni modificar ningún pick sobre él (RF-9).
- La vista de pronósticos muestra las tres secciones y cada una contiene lo definido (RF-10, RF-11, RF-12).
- En cualquier partido o cruce, sus dos participantes no aparecen como votantes y el contador usa total posible = amigos - 2, con el caso CL-3 verificado (RF-13, RF-14).
- La sección "Tabla" muestra Grupos / Eliminatorias / TOTAL por amigo, ordenada por TOTAL, sumando solo fases con resultado registrado (RF-15, RF-16, RF-17).
- Con al menos un pick puntuado, la card dorada "Micasino.com" aparece al final de logros con el nombre del líder y se actualiza si el líder cambia; sin picks puntuados no aparece (RF-18, RF-19, RF-20).
- Tras actualizar, los pronósticos y puntos previos del grupo están intactos y los puntos siguen sumando igual que antes (RNF-3).

## Dudas abiertas

Ninguna. Las dos originales se resolvieron con Neil al aprobar la spec:

- **Picks huérfanos en cruces (CL-2) — RESUELTA:** los picks viven en el cruce (no en los jugadores) y puntúan contra quienes finalmente lo jueguen; un pick cuyo jugador ya no juega ese cruce simplemente no acierta. Nada se borra.
- **Desempate a puntos (CL-7) — RESUELTA:** el empate a total se desempata por mayor subtotal de eliminatorias y, si persiste, la card Micasino.com se muestra compartida entre ambos nombres.
