---
name: DG League
description: Sistema visual "La Arena Nocturna" — liga de fútbol virtual entre amigos, gaming, oscuro y vivo
colors:
  primary: "#10B981"
  secondary: "#22D3EE"
  deep-blue: "#1D4ED8"
  arena-black: "#050A12"
  surface: "#0B1626"
  surface-raised: "#122036"
  border-subtle: "#1B2A45"
  text-primary: "#F1F5F9"
  text-muted: "#8FA6C4"
  trophy-gold: "#F59E0B"
  danger: "#FB7185"
typography:
  display:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 5vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.06em"
rounded:
  sm: "6px"
  md: "10px"
  lg: "16px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.arena-black}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "20px"
  score-input:
    backgroundColor: "{colors.arena-black}"
    textColor: "{colors.primary}"
    typography: "{typography.headline}"
    rounded: "{rounded.sm}"
    width: "48px"
    height: "48px"
  nav-tab-active:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  nav-tab:
    backgroundColor: "transparent"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
---

# Design System: DG League

## Overview

**Creative North Star: "La Arena Nocturna"**

DG League se ve como un estadio de esports de noche: un fondo negro azulado (*arena-black* #050A12) sobre el que derivan lentamente halos de energía esmeralda y cian, y encima flotan superficies **sólidas** y seguras de sí mismas. El movimiento es protagonista — las entradas, los marcadores y las celebraciones se mueven con intención de videojuego — pero el dato siempre es legible: tablas limpias, cifras tabulares, tipografía con jerarquía real. La emoción la ponen la animación y el color en el momento justo; la profesionalidad la pone la calma tipográfica del resto.

Este sistema **reemplaza** al incumbente (glassmorphism translúcido, bordes con glow neón, tablas genéricas, tipografía del sistema), que Neil declaró explícitamente anti-referencia por parecerse a un "AI slop" genérico. El código actual está en transición hacia estos tokens: toda pantalla nueva o refactorizada adopta este mundo; lo que aún muestra el look viejo es deuda visual, no una opción de estilo. La única superficie que queda fuera del sistema es el **Onboarding** (LandingView): usa una imagen estática autoría de Neil en Photoshop (`public/onboarding-bg.webp`) y se respeta tal cual.

**Key Characteristics:**
- Fondo vivo animado (esmeralda → cian → azul profundo sobre negro) en todas las vistas, excepto el Onboarding.
- Cards y paneles con fondo sólido (`surface` #0B1626); cero translucidez y cero `backdrop-blur` fuera del Onboarding.
- Animación protagonista con `motion/react`: entradas escalonadas, celebraciones de estado, transiciones entre vistas.
- Pareja tipográfica Space Grotesk (títulos y cifras) + Montserrat (texto y párrafos), siempre cargada vía Google Fonts.
- Tablas limpias: encabezados discretos, números tabulares, jerarquía por peso y color, sin adornos.
- El resplandor es una respuesta, no una decoración: solo aparece al enfocar, seleccionar o celebrar.

## Colors

Paleta nocturna de arena de esports: base casi negra con matiz azul, energía verde-esmeralda como voz principal y cian eléctrico como contrapunto frío.

### Primary
- **Esmeralda Eléctrica** (#10B981): el acento que lidera — pestaña activa, marcadores, PTS de la tabla, botón primario, foco de inputs. Es la continuidad de marca con el logo existente; en un mismo componente es el único acento de color.

### Secondary
- **Cian Eléctrico** (#22D3EE): contrapunto del esmeralda en el fondo animado, links y estados informativos, outline de `focus-visible` alternativo. Nunca compite con el primario dentro de la misma tarjeta: aparece como segundo plano del ambiente o en datos complementarios.

### Tertiary
- **Oro de Trofeo** (#F59E0B): exclusivo del contexto campeón — Gran Final, primer puesto, logros máximos. Su rareza es el mensaje.

### Neutral
- **Negro de Arena** (#050A12): fondo base de toda la app y texto del botón primario.
- **Superficie** (#0B1626): fondo sólido de cards, paneles y barra de navegación.
- **Superficie Elevada** (#122036): hover de filas, pestaña activa, strips flotantes.
- **Borde Sutil** (#1B2A45): líneas divisorias y bordes de tarjetas (1px).
- **Texto Principal** (#F1F5F9): títulos, nombres, cifras destacadas.
- **Texto Atenuado** (#8FA6C4): párrafos secundarios, encabezados de tabla, metadatos.
- **Peligro** (#FB7185): única y exclusivamente para acciones destructivas (Reiniciar liga).

### Named Rules
**La Regla del Fondo Vivo.** Toda vista vive sobre el fondo animado verde-azul-negro (capa fija detrás del contenido); ninguna tarjeta hereda translucidez de ese fondo — superficie sólida siempre. La única excepción es el Onboarding, cuya imagen estática de Photoshop manda y jamás se anima.

**El Oro Solo Celebra.** El oro (#F59E0B) aparece únicamente en contexto de campeón o Gran Final. Usarlo como decoración genérica diluye la única distinción que importa.

## Typography

**Display Font:** Space Grotesk (fallback system-ui) — títulos, encabezados y toda cifra destacada.
**Body Font:** Montserrat (fallback system-ui) — párrafos, descripciones, etiquetas.

**Character:** La tensión entre lo técnico y lo humano: Space Grotesk pone el filo futurista de videojuego en títulos y números; Montserrat baja el ritmo y hace el texto corrido cómodo y profesional. Cargar ambas desde Google Fonts en `index.html` y mapearlas en `@theme` (`--font-display`, `--font-sans`); la pila del sistema solo es red de seguridad.

### Hierarchy
- **Display** (700, clamp(1.875rem, 5vw, 3rem), line-height 1.1, tracking -0.02em): titulares de vista y momentos épicos (Gran Final, campeón). Aparece pocas veces por pantalla.
- **Headline** (700, 1.5rem, line-height 1.2): números grandes — marcadores en vivo, puntos de líder, contadores del draft.
- **Title** (600, 1.125rem, line-height 1.3): títulos de tarjeta y sección ("Tabla de Posiciones", "Fixture").
- **Body** (400, 0.9375rem, line-height 1.6): todo texto corrido y descripciones, máx. ~65-75ch en desktop.
- **Label** (600, 0.6875rem, tracking 0.06em, mayúsculas): encabezados de tabla, pestañas, metadatos. El mayúsculo sostenido queda restringido a esta escala mínima.

### Named Rules
**La Regla de las Dos Voces.** Space Grotesk solo habla en títulos y cifras; Montserrat carga todo el texto corrido. Jamás se intercambian los roles.

**La Regla del Grito Ganado.** La jerarquía se gana con tamaño, peso y movimiento — no con MAYÚSCULAS + `tracking-widest` sostenidos en títulos y secciones (marca registrada del slop descartado).

## Layout

Mobile-first con anchos progresivos (no layouts distintos): contenedor único `max-w-md` en móvil que crece a `md:max-w-5xl` y `lg:max-w-7xl`. Ritmo de espaciado de 8/16/24 px (`sm/md/lg`) y listas verticales con `gap` de 24 px entre secciones. La barra de navegación inferior (5 pestañas) es fija y sólida; en desktop la navegación es interna de la vista.

El fondo vivo es una **capa fija detrás de todo el contenido** (z-0, contenido sobre z-10): base #050A12 con 2-3 halos radiales grandes — esmeralda arriba a la izquierda, cian a la derecha, azul profundo #1D4ED8 abajo — que derivan lentamente (translate/rotate, 30s `ease-in-out` alternando, o gradiente cónico animado; opacidad baja, entre 15% y 25%, para no competir con el contenido). Las superficies sólidas flotan sobre esta capa y le dan profundidad por contraste, no por transparencia.

## Elevation & Depth

El sistema es **plano y sólido por defecto**: la profundidad nace del contraste entre las superficies opacas y el fondo vivo que se mueve detrás, no de sombras decorativas ni difuminados. No existe el panel translúcido: una tarjeta que deja ver el fondo es un bug visual.

### Shadow Vocabulary
- **Resplandor activo** (`box-shadow: 0 0 20px rgba(16,185,129,0.35)`): respuesta a foco, selección o celebración. Solo existe durante o como reacción al evento.
- **Elevación flotante** (`box-shadow: 0 8px 30px rgba(2,6,23,0.6)`): para lo que flota de verdad sobre la página — strip del draft, modales, menús.

### Named Rules
**El Resplandor Responde.** El glow es un feedback, no un adorno: aparece al enfocar, seleccionar o celebrar (gol, victoria, logro) y se va cuando el momento pasa. Un halo estático en reposo es exactamente el slop que este sistema prohíbe.

## Shapes

Forma limpia y techy sin exagerar: tarjetas y paneles con radio generoso (16px), botones e inputs con radio medio (10px), chips y score inputs pequeños con radio corto (6px). Bordes de 1px en `border-subtle` delimitan la superficie sólida contra el fondo vivo — el borde delinea, jamás brilla. Sin recortes angulares ni muescas ornamentales: la personalidad futurista la aportan la tipografía, el color y el movimiento, no la geometría gratuita.

## Components

### Buttons
- **Shape:** radio medio (10px), padding 12px 24px.
- **Primary:** fondo Esmeralda Eléctrica (#10B981) con texto Negro de Arena (#050A12), tipografía Label (Montserrat 600, 11px, mayúsculas). Hover: brillo +1,1x y elevación de 1px con resplandor activo. Es el botón de las acciones que hacen avanzar el juego ("Empezar Liga", "Registrar pronóstico").
- **Ghost:** transparente con borde 1px `border-subtle` y texto principal; hover rellena con `surface-raised`. Acciones secundarias y de cancelación.
- **Danger:** ghost con texto y borde Peligro (#FB7185) — solo Reiniciar liga.

### Cards / Containers
- **Corner Style:** radio 16px.
- **Background:** sólido `surface` #0B1626 — nunca translúcido, nunca `backdrop-blur` (única excepción: el panel del Onboarding).
- **Shadow Strategy:** ninguna en reposo; elevación flotante solo si el componente flota (ver Elevation & Depth).
- **Border:** 1px `border-subtle` #1B2A45.
- **Internal Padding:** 20px; el título de sección va en Title (Space Grotesk 600) con 16px de respiro inferior.

### Tables
- **Encabezado:** Label (Montserrat 600, 11px, mayúsculas, `text-muted`), fondo transparente dentro de la card sólida — prohibido el strip translúcido del incumbente (`bg-slate-900/50`).
- **Filas:** separadas por 1px `border-subtle`; hover rellena con `surface-raised`; la fila líder lleva una barra de acento de 3px en Esmeralda en su borde izquierdo.
- **Cifras:** Space Grotesk con `font-variant-numeric: tabular-nums`; PJ/DG en texto atenuado, PTS en Esmeralda 700. Sin badges brillantes ni glows en celdas.

### Inputs / Fields (El Duelo de Marcador)
- **Style:** caja sólida de 48x48px, fondo Negro de Arena, borde 1px `border-subtle`, radio 6px; cifra centrada en Headline (Space Grotesk 700, 1.5rem) en Esmeralda. El par local-visita se presenta lado a lado con un separador "VS" en Label atenuado — es el componente firma de la app.
- **Focus:** borde a Esmeralda + resplandor activo.
- **Disabled (nocaut 3-0):** la caja se bloquea con la cifra en Esmeralda y una banda de estado "Cerrado 3-0"; sin glow, porque el momento ya pasó.

### Navigation
- **Style:** barra inferior sólida (`surface` #0B1626) con borde superior 1px `border-subtle`; 5 pestañas de icono + label.
- **Active:** icono y texto en Esmeralda sobre pastilla `surface-raised` (radio 10px); **Default:** texto atenuado, hover sube a texto principal.

### Signature: la Celebración de Estado
El momento memorable del sistema: cerrar un 3-0, ganar un pick o alcanzar un logro dispara una micro-celebración con `motion/react` (spring stiffness ~260 / damping ~20) — el elemento pulsa una vez, el resplandor activo se enciende y se apaga, y el fondo vivo acelera su deriva medio segundo. Breve (< 600ms), nunca en bucle.

## Do's and Don'ts

### Do:
- **Do** animar con propósito: entradas escalonadas de listas y tablas (stagger ~40ms por ítem, 200-400ms, `ease-arena`), transiciones entre vistas y celebraciones de estado con `motion/react`.
- **Do** mantener toda tarjeta sólida: `background #0B1626`, borde `1px #1B2A45`, radio 16px, padding 20px.
- **Do** usar Space Grotesk con `tabular-nums` en toda cifra (marcadores, tablas, estadísticas).
- **Do** reservar el oro (#F59E0B) para campeón y Gran Final, y el resplandor para momentos de respuesta.
- **Do** respetar el Onboarding como isla: imagen estática de Photoshop, panel propio de Neil, sin fondo vivo ni tokens de este sistema.
- **Do** cargar Space Grotesk y Montserrat desde Google Fonts antes de la primera pantalla.

### Don't:
- **Don't** usar glassmorphism (`backdrop-blur` en paneles o cards) fuera del Onboarding — prohibición explícita de Neil.
- **Don't** dibujar bordes neón ni halos estáticos (p. ej. `shadow-[0_0_15px_rgba(245,158,11,0.2)]` del incumbente): el glow que no responde a nada es la definición de slop en este proyecto.
- **Don't** maquetar títulos o secciones en MAYÚSCULAS con tracking amplio; el mayúsculo vive solo en labels de 11px.
- **Don't** usar superficies translúcidas en tablas ni encabezados sobre strips semitransparentes.
- **Don't** dejar la pila tipográfica del sistema en producción: sin Google Fonts cargadas, el mundo tipográfico no existe.
- **Don't** animar el fondo del Onboarding ni aplicar el fondo vivo sobre él.
