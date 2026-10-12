/**
 * Suite de la lógica pura del torneo (node --test). Cubre la tabla de grupos,
 * la derivación del cuadro eliminatorio, las opciones de pronóstico, la tabla
 * de aciertos de la quiniela y el líder Micasino.com (RF-1, RF-2, RF-3,
 * RF-4, RF-5, RF-6, RF-7, RF-8, RF-15, RF-16, RF-17, RF-18, RF-19, RF-20).
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
    DRAW_PICK,
    KO_STAGES,
    KO_LABELS,
    getGroupStandings,
    getKnockoutBracket,
    getPickOptions,
    getPredictionStandings,
    getBestPredictor,
} from './tournamentLogic.js';

/** Crea un partido de grupo con la forma exacta del estado global. */
const partido = (id, groupId, player1, player2, score1 = null, score2 = null, closed = false) => ({
    id,
    groupId,
    player1,
    player2,
    score1,
    score2,
    closed,
});

/** Crea un pick con la forma exacta del estado global. */
const pronostico = (id, matchId, player, eleccion) => ({ id, matchId, player, pick: eleccion });

/** Estado de eliminatorias por defecto: los cuatro cruces sin jugar. */
const knockoutVacio = () => ({
    semi1: { score1: null, score2: null, closed: false },
    semi2: { score1: null, score2: null, closed: false },
    third: { score1: null, score2: null, closed: false },
    final: { score1: null, score2: null, closed: false },
});

describe('getGroupStandings', () => {
    test('ordena por puntos, luego diferencia de goles, luego goles a favor', () => {
        const matches = [
            partido('m1', 'A', 'Ana', 'Beto', 2, 1), // Ana: 3 pts, DG +1, GF 2
            partido('m2', 'A', 'Caro', 'Dana', 1, 0), // Caro: 3 pts, DG +1, GF 1
            partido('m3', 'A', 'Beto', 'Dana', 3, 0), // Beto: 3 pts, DG +2
        ];
        const tabla = getGroupStandings(matches, 'A', ['Ana', 'Beto', 'Caro', 'Dana']);
        assert.deepEqual(
            tabla.map((fila) => fila.name),
            ['Beto', 'Ana', 'Caro', 'Dana']
        );
    });

    test('incluye a los jugadores del grupo sin partidos jugados, con ceros', () => {
        const matches = [partido('m1', 'A', 'Ana', 'Beto', 2, 1)];
        const tabla = getGroupStandings(matches, 'A', ['Ana', 'Beto', 'Caro']);
        assert.equal(tabla.length, 3);
        assert.deepEqual(tabla.find((fila) => fila.name === 'Caro'), {
            name: 'Caro',
            points: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
        });
    });

    test('un empate reparte un punto por lado (paridad con la lógica del hook)', () => {
        const matches = [partido('m1', 'A', 'Ana', 'Beto', 1, 1)];
        const [ana, beto] = getGroupStandings(matches, 'A', ['Ana', 'Beto']);
        assert.equal(ana.points, 1);
        assert.equal(beto.points, 1);
        assert.equal(ana.drawn, 1);
        assert.equal(beto.drawn, 1);
    });
});

describe('getKnockoutBracket', () => {
    test('con grupos vacíos deriva placeholders sin confirmar', () => {
        const bracket = getKnockoutBracket([], { A: [], B: [] }, knockoutVacio());
        assert.deepEqual(
            bracket.map((cruce) => cruce.id),
            ['ko-semi1', 'ko-semi2', 'ko-third', 'ko-final']
        );
        assert.deepEqual(
            bracket.map((cruce) => cruce.stage),
            KO_STAGES
        );
        assert.deepEqual(
            bracket.map((cruce) => cruce.label),
            Object.values(KO_LABELS)
        );
        const semi1 = bracket[0];
        assert.equal(semi1.p1, '1° Grupo A');
        assert.equal(semi1.p2, '2° Grupo B');
        assert.equal(semi1.confirmedP1, false);
        assert.equal(semi1.confirmedP2, false);
        assert.equal(semi1.winner, null);
        bracket.forEach((cruce) => assert.equal(cruce.confirmed, false));
    });

    test('con grupos con jugadores confirma las semis con nombres reales', () => {
        const bracket = getKnockoutBracket([], { A: ['Ana', 'Beto'], B: ['Caro', 'Dana'] }, knockoutVacio());
        const [semi1, semi2] = bracket;
        assert.deepEqual([semi1.p1, semi1.p2], ['Ana', 'Dana']);
        assert.deepEqual([semi2.p1, semi2.p2], ['Caro', 'Beto']);
        assert.equal(semi1.confirmed, true);
        assert.equal(semi2.confirmed, true);
    });

    test('una semi con un solo marcador no confirma ganador (quirk corregido)', () => {
        const ko = knockoutVacio();
        ko.semi1 = { score1: 2, score2: null, closed: false };
        const bracket = getKnockoutBracket([], { A: ['Ana', 'Beto'], B: ['Caro', 'Dana'] }, ko);
        const semi1 = bracket.find((cruce) => cruce.stage === 'semi1');
        const final = bracket.find((cruce) => cruce.stage === 'final');
        const third = bracket.find((cruce) => cruce.stage === 'third');
        assert.equal(semi1.winner, null);
        assert.equal(final.p1, 'Ganador S1');
        assert.equal(final.confirmedP1, false);
        assert.equal(final.confirmed, false);
        assert.equal(third.p1, 'Perdedor S1');
        assert.equal(third.confirmedP1, false);
    });

    test('con ambas semis completas la final y el tercero reciben nombres reales confirmados', () => {
        const ko = knockoutVacio();
        ko.semi1 = { score1: 2, score2: 1, closed: false }; // Gana Ana, pierde Dana
        ko.semi2 = { score1: 0, score2: 2, closed: false }; // Gana Beto, pierde Caro
        const bracket = getKnockoutBracket([], { A: ['Ana', 'Beto'], B: ['Caro', 'Dana'] }, ko);
        const final = bracket.find((cruce) => cruce.stage === 'final');
        const third = bracket.find((cruce) => cruce.stage === 'third');
        assert.deepEqual([final.p1, final.p2], ['Ana', 'Beto']);
        assert.equal(final.confirmed, true);
        assert.deepEqual([third.p1, third.p2], ['Dana', 'Caro']);
        assert.equal(third.confirmed, true);
    });

    test('una semi empatada mantiene los placeholders en final y tercero', () => {
        const ko = knockoutVacio();
        ko.semi1 = { score1: 1, score2: 1, closed: false };
        const bracket = getKnockoutBracket([], { A: ['Ana', 'Beto'], B: ['Caro', 'Dana'] }, ko);
        const final = bracket.find((cruce) => cruce.stage === 'final');
        const third = bracket.find((cruce) => cruce.stage === 'third');
        assert.equal(final.p1, 'Ganador S1');
        assert.equal(final.confirmedP1, false);
        assert.equal(third.p1, 'Perdedor S1');
        assert.equal(third.confirmedP1, false);
        assert.equal(final.confirmed, false);
    });

    test('un 3-0 marca el cruce como cerrado y decide ganador', () => {
        const ko = knockoutVacio();
        ko.semi1 = { score1: 3, score2: 0, closed: true };
        const bracket = getKnockoutBracket([], { A: ['Ana', 'Beto'], B: ['Caro', 'Dana'] }, ko);
        const semi1 = bracket.find((cruce) => cruce.stage === 'semi1');
        assert.equal(semi1.closed, true);
        assert.equal(semi1.winner, 'Ana');
    });

    test('un cambio de marcador de grupo cambia los cruces derivados (base de CL-6)', () => {
        const groups = { A: ['Ana', 'Beto'], B: ['Caro', 'Dana'] };
        const bracketAntes = getKnockoutBracket([partido('m1', 'A', 'Ana', 'Beto', 2, 0)], groups, knockoutVacio());
        const bracketDespues = getKnockoutBracket([partido('m1', 'A', 'Ana', 'Beto', 0, 2)], groups, knockoutVacio());
        assert.equal(bracketAntes[0].p1, 'Ana');
        assert.equal(bracketDespues[0].p1, 'Beto');
    });
});

describe('getPickOptions', () => {
    test('en fase de grupos devuelve 3 opciones con el empate en el medio (RF-1)', () => {
        const opciones = getPickOptions('Ana', 'Beto', true);
        assert.deepEqual(opciones, ['Ana', DRAW_PICK, 'Beto']);
        assert.equal(opciones.length, 3);
        assert.equal(DRAW_PICK, 'empate');
    });

    test('en cruces de eliminatorias devuelve solo 2 opciones, sin empate (RF-4)', () => {
        const opciones = getPickOptions('Ana', 'Beto', false);
        assert.deepEqual(opciones, ['Ana', 'Beto']);
        assert.equal(opciones.length, 2);
    });
});

describe('getPredictionStandings', () => {
    const gruposLlenos = { A: ['Ana', 'Beto'], B: ['Caro', 'Dana'] };

    test('un acierto de ganador en grupos suma 1 punto y un fallo suma 0 (RF-3)', () => {
        const matches = [partido('m1', 'A', 'Ana', 'Beto', 2, 0)]; // Gana Ana
        const predictions = [
            pronostico('p1', 'm1', 'Amigo1', 'Ana'),
            pronostico('p2', 'm1', 'Amigo2', 'Beto'),
        ];
        const tabla = getPredictionStandings(matches, gruposLlenos, knockoutVacio(), predictions);
        assert.deepEqual(tabla.find((fila) => fila.name === 'Amigo1'), {
            name: 'Amigo1',
            group: { hits: 1, total: 1 },
            ko: { hits: 0, total: 0 },
            total: 1,
        });
        assert.deepEqual(tabla.find((fila) => fila.name === 'Amigo2'), {
            name: 'Amigo2',
            group: { hits: 0, total: 1 },
            ko: { hits: 0, total: 0 },
            total: 0,
        });
    });

    test("'empate' acierta con marcador empatado (RF-2) pero no con un 3-0 (CL-1, CL-5)", () => {
        const matches = [
            partido('m1', 'A', 'Ana', 'Beto', 1, 1),
            partido('m2', 'B', 'Caro', 'Dana', 3, 0, true), // Nocaut: nunca es empate
        ];
        const predictions = [
            pronostico('p1', 'm1', 'Amigo1', DRAW_PICK),
            pronostico('p2', 'm2', 'Amigo2', DRAW_PICK),
        ];
        const tabla = getPredictionStandings(matches, gruposLlenos, knockoutVacio(), predictions);
        assert.equal(tabla.find((fila) => fila.name === 'Amigo1').group.hits, 1);
        assert.equal(tabla.find((fila) => fila.name === 'Amigo1').group.total, 1);
        assert.equal(tabla.find((fila) => fila.name === 'Amigo2').group.hits, 0);
        assert.equal(tabla.find((fila) => fila.name === 'Amigo2').group.total, 1);
    });

    test("un 'empate' en un partido con ganador no puntúa (RF-3, segunda mitad)", () => {
        const matches = [partido('m1', 'A', 'Ana', 'Beto', 2, 1)];
        const predictions = [pronostico('p1', 'm1', 'Amigo1', DRAW_PICK)];
        const tabla = getPredictionStandings(matches, gruposLlenos, knockoutVacio(), predictions);
        const fila = tabla.find((f) => f.name === 'Amigo1');
        assert.equal(fila.group.hits, 0);
        assert.equal(fila.group.total, 1);
    });

    test('un pick antiguo de nombre en un partido empatado no acierta (CL-4)', () => {
        const matches = [partido('m1', 'A', 'Ana', 'Beto', 1, 1)];
        const predictions = [pronostico('p1', 'm1', 'Amigo1', 'Ana')];
        const tabla = getPredictionStandings(matches, gruposLlenos, knockoutVacio(), predictions);
        const fila = tabla.find((f) => f.name === 'Amigo1');
        assert.equal(fila.group.total, 1);
        assert.equal(fila.group.hits, 0);
    });

    test('un partido con un solo marcador no suma ni a hits ni a total', () => {
        const matches = [partido('m1', 'A', 'Ana', 'Beto', 2, null)];
        const predictions = [pronostico('p1', 'm1', 'Amigo1', 'Ana')];
        const tabla = getPredictionStandings(matches, gruposLlenos, knockoutVacio(), predictions);
        const fila = tabla.find((f) => f.name === 'Amigo1');
        assert.deepEqual(fila.group, { hits: 0, total: 0 });
        assert.equal(fila.total, 0);
    });

    test('un acierto de cruce confirmado suma y un fallo no (RF-8)', () => {
        const ko = knockoutVacio();
        ko.semi1 = { score1: 2, score2: 1, closed: false }; // Gana Ana
        const predictions = [
            pronostico('p1', 'ko-semi1', 'Amigo1', 'Ana'),
            pronostico('p2', 'ko-semi1', 'Amigo2', 'Dana'),
        ];
        const tabla = getPredictionStandings([], gruposLlenos, ko, predictions);
        assert.deepEqual(tabla.find((f) => f.name === 'Amigo1').ko, { hits: 1, total: 1 });
        assert.deepEqual(tabla.find((f) => f.name === 'Amigo2').ko, { hits: 0, total: 1 });
    });

    test('un cruce empatado no suma puntos a nadie (RF-7)', () => {
        const ko = knockoutVacio();
        ko.semi1 = { score1: 1, score2: 1, closed: false };
        const predictions = [
            pronostico('p1', 'ko-semi1', 'Amigo1', 'Ana'),
            pronostico('p2', 'ko-semi1', 'Amigo2', DRAW_PICK),
        ];
        const tabla = getPredictionStandings([], gruposLlenos, ko, predictions);
        tabla.forEach((fila) => {
            assert.deepEqual(fila.ko, { hits: 0, total: 1 });
        });
    });

    test('un pick huérfano no acierta pero cuenta en ko.total y nada se borra (CL-2)', () => {
        const ko = knockoutVacio();
        ko.semi1 = { score1: 2, score2: 1, closed: false };
        // El marcador de grupo dejó a Beto primero: la semi1 ahora es Beto vs Dana.
        const matches = [partido('m1', 'A', 'Ana', 'Beto', 0, 2)];
        const predictions = [pronostico('p1', 'ko-semi1', 'Amigo1', 'Ana')];
        const tabla = getPredictionStandings(matches, gruposLlenos, ko, predictions);
        assert.deepEqual(tabla.find((f) => f.name === 'Amigo1').ko, { hits: 0, total: 1 });
    });

    test('un pick sobre un cruce sin confirmar no suma (RF-5)', () => {
        const ko = knockoutVacio();
        ko.semi1 = { score1: 2, score2: 1, closed: false };
        const predictions = [pronostico('p1', 'ko-semi1', 'Amigo1', 'Ana')];
        const tabla = getPredictionStandings([], { A: [], B: [] }, ko, predictions);
        const fila = tabla.find((f) => f.name === 'Amigo1');
        assert.deepEqual(fila.ko, { hits: 0, total: 0 });
        assert.equal(fila.total, 0);
    });

    test('un pick sobre un cruce con marcador incompleto no suma (RF-17)', () => {
        const ko = knockoutVacio();
        ko.semi1 = { score1: 2, score2: null, closed: false };
        const predictions = [pronostico('p1', 'ko-semi1', 'Amigo1', 'Ana')];
        const tabla = getPredictionStandings([], gruposLlenos, ko, predictions);
        assert.deepEqual(tabla.find((f) => f.name === 'Amigo1').ko, { hits: 0, total: 0 });
    });

    test('forma exacta, total = grupos + eliminatorias y orden total → ko → alfabético (RF-15, RF-16, RF-17)', () => {
        const ko = knockoutVacio();
        ko.semi1 = { score1: 2, score2: 1, closed: false }; // Gana Ana
        ko.semi2 = { score1: 0, score2: 2, closed: false }; // Gana Beto
        const matches = [partido('m1', 'A', 'Ana', 'Beto', 2, 0)]; // Gana Ana
        const predictions = [
            pronostico('p1', 'm1', 'Amigo1', 'Ana'), // acierto de grupo
            pronostico('p2', 'ko-semi1', 'Amigo1', 'Ana'), // acierto de cruce → total 2, ko 1
            pronostico('p3', 'ko-semi1', 'Amigo2', 'Ana'), // acierto de cruce
            pronostico('p4', 'ko-semi2', 'Amigo2', 'Beto'), // acierto de cruce → total 2, ko 2
            pronostico('p5', 'm1', 'Amigo3', 'Ana'), // acierto de grupo → total 1
            pronostico('p6', 'ko-third', 'Ada', 'Dana'), // tercero sin resultado → total 0
            pronostico('p7', 'ko-third', 'Bruno', 'Caro'), // tercero sin resultado → total 0
        ];
        const tabla = getPredictionStandings(matches, gruposLlenos, ko, predictions);
        assert.deepEqual(
            tabla.map((fila) => fila.name),
            ['Amigo2', 'Amigo1', 'Amigo3', 'Ada', 'Bruno']
        );
        // Forma exacta de la fila y total = suma de subtotales (RF-15, RF-17).
        assert.deepEqual(tabla[1], {
            name: 'Amigo1',
            group: { hits: 1, total: 1 },
            ko: { hits: 1, total: 1 },
            total: 2,
        });
        // Solo filas de amigos con al menos un pick (paridad con el hook).
        assert.equal(tabla.length, 5);
    });
});

describe('getBestPredictor', () => {
    /** Fila de standings de la quiniela con la forma que devuelve getPredictionStandings. */
    const filaTabla = (name, groupHits, koHits) => ({
        name,
        group: { hits: groupHits, total: groupHits },
        ko: { hits: koHits, total: koHits },
        total: groupHits + koHits,
    });

    test('sin ningún pick puntuado devuelve null (RF-19)', () => {
        assert.equal(getBestPredictor([]), null);
        assert.equal(getBestPredictor([filaTabla('Ada', 0, 0), filaTabla('Bruno', 0, 0)]), null);
    });

    test('con líder único devuelve su nombre y sus puntos (RF-18)', () => {
        const standings = [filaTabla('Ada', 3, 1), filaTabla('Bruno', 1, 0)];
        assert.deepEqual(getBestPredictor(standings), { names: ['Ada'], points: 4 });
    });

    test('un empate a total se desempata por mayor subtotal de eliminatorias', () => {
        const standings = [filaTabla('Ada', 2, 0), filaTabla('Bruno', 1, 1), filaTabla('Caro', 0, 0)];
        // Ada y Bruno empatan a 2; Bruno llega mejor en eliminatorias.
        assert.deepEqual(getBestPredictor(standings), { names: ['Bruno'], points: 2 });
    });

    test('un empate a total y a eliminatorias comparte la card (CL-7)', () => {
        const standings = [filaTabla('Bruno', 1, 1), filaTabla('Ada', 1, 1)];
        assert.deepEqual(getBestPredictor(standings), { names: ['Ada', 'Bruno'], points: 2 });
    });

    test('al cambiar los resultados cambia el líder devuelto (RF-20)', () => {
        const antes = [filaTabla('Ada', 0, 1), filaTabla('Bruno', 3, 0)];
        const despues = [filaTabla('Ada', 3, 0), filaTabla('Bruno', 0, 1)];
        assert.deepEqual(getBestPredictor(antes), { names: ['Bruno'], points: 3 });
        assert.deepEqual(getBestPredictor(despues), { names: ['Ada'], points: 3 });
    });
});
