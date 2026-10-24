# Especificación de Mejora UI/UX y Diseño Responsive 100%
## Tesla Premium Showroom · Frontend Nativo (HTML5 · CSS3 · JavaScript Vanilla)

> **Documento de Arquitectura de Interfaz, Experiencia de Usuario y Adaptabilidad Móvil**  
> **Versión:** 2.0 — Responsive & UX Deep Audit  
> **Ámbito:** Adaptabilidad 100% multidispositivo (desde 320px hasta 4K UHD), accesibilidad táctil WCAG 2.1 AA y microinteracciones de lujo.

---

## 1. Diagnóstico Heurístico y Puntos Críticos del Estado Actual

Tras la auditoría del código actual en `index.html`, `css/styles.css` y `js/app.js`, se identifican los siguientes cuellos de botella que impiden una experiencia 100% fluida en dispositivos móviles y tablets:

### 1.1 Fricciones en Mobile (< 480px)
1. **Saturación en el Header:** En resoluciones pequeñas (320px–390px, ej. iPhone SE, iPhone 13 Mini, Galaxy S21), el botón de cuenta (`btn-account-trigger` con el texto «Iniciar Sesión»), el botón de favoritos, el selector de tema y el botón hamburguesa colisionan en la misma línea, provocando desbordamiento horizontal (*horizontal overflow*) o colapso visual.
2. **Menú Móvil Clásico en Cortina:** El menú actual usa `transform: translateY(-150%)` hacia abajo desde el header. En teléfonos con altura reducida, si hay muchos ítems de navegación (Inicio, Modelos, Tesla 360°, Catálogo, Experiencia, Financiación, Comparador, Contacto, Cuenta), el menú se corta verticalmente y no permite scroll adecuado si el body está libre.
3. **Sección Tesla 360° en Móvil:** Los controles de ángulos preestablecidos, las píldoras de modos (Exterior, Llantas, Interior) y el slider de rotación consumen demasiado espacio vertical, impidiendo ver el vehículo completo junto con sus controles sin hacer scroll constante.
4. **Modales de Pantalla Completa:** En móviles, los modales centrados (`.modal-dialog`) con `margin: 10px; max-height: 95vh;` generan doble scroll interno, barras de navegación del navegador (Safari/Chrome) que tapan botones de confirmación y falta de área de agarre táctil (*drag handle*).
5. **Zoom no deseado en iOS Safari:** Varios campos `<input>` y `<select>` que tienen fuentes menores a 16px (`font-size: 0.875rem` / 14px) activan el zoom automático forzado en iOS al recibir foco, rompiendo el encuadre del usuario.
6. **Comparador en Pantallas Chicas:** Las tablas o tarjetas de comparación horizontal sufren compresión extrema de columnas, resultando en textos ilegibles o rotura de layout.

### 1.2 Oportunidades de Mejora UX
- **Zona del Pulgar ("Thumb Zone"):** Colocar las acciones clave (filtrar, agendar prueba, calcular financiación, contactar WhatsApp) en la parte inferior accesible con una sola mano.
- **Bottom Sheet Pattern:** Reemplazar los modales centrados de escritorio por paneles emergentes inferiores (*bottom sheets*) en móviles (< 768px), con barra de arrastre y cierre intuitivo.
- **Microinteracciones y Feedback Háptico Visual:** Respuestas sutiles pero perceptibles al pulsar botones (`transform: scale(0.97)`), estados activos claros y transiciones de aceleración cúbica de alto nivel (`cubic-bezier(0.16, 1, 0.3, 1)`).

---

## 2. Sistema de Diseño y Tokens Responsivos (Foundations)

### 2.1 Escala de Breakpoints Unificada

Se establece una matriz de 5 escalones con enfoque *Mobile-First*:

```css
/* Escala de Breakpoints Oficial */
/* -------------------------------------------------------------------------
   xs : 320px  - 379px  (Móviles ultra compactos: iPhone SE, plegables cerrados)
   sm : 380px  - 599px  (Móviles estándar modernos: iPhone 14/15, Galaxy S/Ultra)
   md : 600px  - 899px  (Phablets y tablets verticales: iPad Mini, Surface portrait)
   lg : 900px  - 1279px (Tablets apaisados y laptops compactas: iPad Pro, MacBook 13")
   xl : 1280px - 1599px (Escritorios de alta resolución: 1080p estándar)
   2xl: 1600px+         (Monitores ultrapanorámicos, 2K y 4K UHD)
   ------------------------------------------------------------------------- */
```

### 2.2 Tipografía Fluida con `clamp()`

Eliminar el cambio brusco de tamaños de fuente mediante funciones `clamp()`, garantizando legibilidad óptima en cualquier ancho:

```css
:root {
  /* Jerarquía Tipográfica Fluida */
  --font-hero: clamp(2rem, 5.5vw + 1rem, 4.25rem);       /* 32px a 68px */
  --font-h1:   clamp(1.75rem, 3.5vw + 0.5rem, 3rem);      /* 28px a 48px */
  --font-h2:   clamp(1.35rem, 2.5vw + 0.5rem, 2.25rem);   /* 22px a 36px */
  --font-h3:   clamp(1.15rem, 1.8vw + 0.4rem, 1.65rem);   /* 18px a 26px */
  --font-body: clamp(0.9375rem, 0.4vw + 0.85rem, 1.0625rem); /* 15px a 17px */
  --font-small: clamp(0.8125rem, 0.25vw + 0.75rem, 0.875rem); /* 13px a 14px */
}
```

### 2.3 Ergonomía Táctil y Áreas de Contacto (WCAG 2.5.5 / 2.5.8)

- **Regla de los 48px:** Todo botón, enlace interactivo, selector de color, píldora de filtro o icono táctil debe tener un área mínima interactiva de **48 × 48 px** en móviles. Si visualmente el icono es de 20px, se compensa mediante `padding` o un pseudo-elemento `::before` de 48px.
- **Soporte de Safe Area Insets:** Integrar soporte para el notch y barra de inicio de iOS:
  ```css
  padding-bottom: max(var(--space-16), env(safe-area-inset-bottom));
  padding-left: max(var(--space-16), env(safe-area-inset-left));
  padding-right: max(var(--space-16), env(safe-area-inset-right));
  ```
- **Unidades Dinámicas de Viewport:** Uso de `100dvh` (*Dynamic Viewport Height*) en lugar de `100vh` para evitar saltos provocados por la aparición y desaparición de la barra de direcciones de Safari y Chrome en iOS/Android.

---

## 3. Especificación Detallada por Componente y Sección

### 3.1 Header y Navegación Universal

#### Comportamiento en Escritorio (≥ 900px)
- Barra flotante con efecto *glassmorphism* (`backdrop-filter: blur(16px)`).
- Menú central alineado, logotipo minimalista a la izquierda y bloque de acciones rápidas a la derecha (Cuenta, Favoritos, Tema, Botón primario de Explorar).

#### Comportamiento en Mobile y Tablet (< 900px)
- **Altura fija de 60px** con alineación vertical perfecta.
- **Compactación del botón de cuenta:** En `< 480px`, el texto "Iniciar Sesión" se oculta automáticamente, mostrando únicamente el icono del usuario en un botón circular de 40×40px con badge de estado.
- **Cajón de Navegación Off-Canvas (Side Drawer):**
  - Se despliega suavemente desde la derecha o izquierda con `transform: translateX(0)` ocupando el **85% del ancho de pantalla (máximo 360px)** con sombra profunda y fondo *Obsidian Glass*.
  - El fondo de la página se cubre con un overlay oscuro semi-transparente (`backdrop-blur`).
  - Bloqueo de scroll del body (`overflow: hidden; touch-action: none;`) al estar abierto.
  - Al pie del cajón móvil se integran accesos directos de alta conversión: botón directo a WhatsApp y botón para Agendar Prueba de Manejo.
  - Botón de cierre (`X`) prominente de 48×48px accesible con el pulgar.

---

### 3.2 Hero Cinematográfico

#### Estructura y Adaptabilidad
- **Altura del contenedor:** `min-height: 100dvh` en pantallas grandes, pero adaptado a `min-height: auto; padding: 120px 0 60px;` en móviles para que las métricas y botones no queden ocultos bajo el pliegue inferior (*below the fold*).
- **Tratamiento de Imagen de Fondo:**
  - `object-fit: cover; object-position: center 35%;` en móvil para que el automóvil se mantenga siempre centrado y no se corte por los bordes.
  - Gradiente protector multinivel: oscurecimiento en la parte superior para legibilidad del menú y en la inferior para realce del texto y botones.
- **Métricas Destacadas:**
  - En Desktop: fila horizontal de 4 métricas con bordes divisorios sutiles.
  - En Tablet (600px - 899px): cuadrícula de 2 × 2 con tarjetas translúcidas.
  - En Móvil (< 600px): formato de carrusel horizontal deslizable o stack de 3 métricas compactas (`2.1s`, `650 km`, `15 min`), con valores numéricos grandes y etiquetas descriptivas legibles.
- **Botones de Llamada a la Acción (CTA):**
  - En `< 600px`, los botones se expanden a `width: 100%` en disposición vertical (columna), colocando la acción primaria arriba (*Explorar Modelos*) y la secundaria abajo (*Prueba de Manejo*), con separación de 12px.

---

### 3.3 Garaje Estudio Interactivo Tesla 360°

El componente diferencial de la web requiere una atención especial para garantizar fluidez táctil:

#### Controles y Modos de Visualización (Exterior, Ruedas, Interior)
- **Píldoras de selector de vehículo y modo:**
  - Contenedor con `overflow-x: auto; scroll-snap-type: x mandatory;` y sin barra de desplazamiento visible (`scrollbar-width: none;`).
  - Cada botón con `flex-shrink: 0; min-height: 44px;` para fácil selección por deslizamiento táctil.
- **Área Interactiva del Automóvil:**
  - En móviles, el lienzo de 360° ocupa una altura fija proporcional (`aspect-ratio: 16/9; max-height: 48vh;`).
  - Soporte de gestos táctiles directos (*swipe horizontal*): arrastrar el dedo hacia la izquierda o derecha rota el vehículo con inercia suave y amortiguada.
  - Indicador visual animado de gesto ("Desliza para rotar 360°") que desaparece tras la primera interacción.
- **Barra de Ángulos Preestablecidos (Preset Angles):**
  - En pantallas < 768px, se transforman en una tira inferior horizontal compacta de iconos/chips (Frente, 3/4 Frontal, Lateral, Trasera, Interior).
- **Dock de Navegación Interior 360:**
  - Slider panorámico de rango optimizado con un *thumb* táctil agrandado de 28px de diámetro para ser manipulado sin error por dedos de cualquier tamaño.
- **Barra Resumen Inferior:**
  - En pantallas < 768px, se transforma en una ficha fija compacta con el nombre del modelo, el precio base y dos botones de acción rápida (*Configurar* y *Reservar*).

---

### 3.4 Catálogo Inteligente y Sistema de Filtros

#### Barra de Búsqueda y Filtros
- **Modo Móvil (< 768px):**
  - Barra superior simplificada: Campo de búsqueda con icono de lupa + botón flotante o integrado **«Filtros (3)»** con badge de filtros activos.
  - Al pulsar **«Filtros»**, se abre un **Bottom Sheet (Panel Inferior)** que contiene:
    1. Selector de categoría (Sedán, SUV, Deportivo, Utilitario).
    2. Slider de rango de precio con visualización en tiempo real en pesos colombianos (COP).
    3. Selector de ordenación (Precio: menor a mayor, mayor a menor, Autonomía, Aceleración).
    4. Botón de «Limpiar filtros» y botón de acción principal «Ver 8 Vehículos».
- **Scroll Horizontal de Categorías Rápidas:**
  - Píldoras táctiles horizontales con *scroll-snap* para alternar rápidamente entre "Todos", "Sedán", "SUV", "Hypercar", "Cyber".

#### Cuadrícula de Tarjetas de Vehículos (`.vehicles-grid`)
- **Comportamiento responsivo de columnas:**
  - `> 1100px`: 3 columnas iguales.
  - `680px - 1099px`: 2 columnas con espacio equilibrado (`gap: 24px;`).
  - `< 680px`: 1 columna centrada con ancho máximo de 460px por tarjeta, logrando un impacto visual de póster automotriz de alta gama.
- **Anatomía de la Tarjeta en Móvil:**
  - Proporción de imagen consistente (`aspect-ratio: 16/10; object-fit: cover;`).
  - Botón de favoritos (`card-fav-btn`) en la esquina superior derecha con tamaño de toque de 44×44px y feedback visual de pulsación (animación de latido *heart-beat* al guardar).
  - Bloque de métricas clave (Autonomía, 0-100 km/h, Top Speed) en una grilla de 3 mini-bloques con fondo neutro translúcido.
  - Botones de acción organizados: botón principal «Ver Ficha Técnica» y secundario «Simular Cuota».

---

### 3.5 Ficha Detallada del Vehículo (Modal / Bottom Sheet)

#### Transformación Arquitectónica según Dispositivo
- **En Desktop (> 768px):** Modal centrado amplio (ancho máx. 1040px) con vista dividida en dos columnas: galería/visualizador a la izquierda y selector de versiones/colores/especificaciones a la derecha.
- **En Móvil (< 768px) — Patrón Bottom Sheet:**
  - El modal surge desde la parte inferior ocupando el **92% de la altura de pantalla (`92dvh`)**.
  - **Barra de Arrastre Superior (*Drag Handle*):** Pastilla gris centrada de 40×4px que indica visualmente que la tarjeta puede deslizarse hacia abajo para cerrarse.
  - **Cabecera Sticky:** El nombre del modelo y el botón de cierre se mantienen fijos mientras el contenido interno se desplaza.
  - **Galería Deslizable:** Carrusel de fotos con swipe lateral y puntos de paginación (*dots*) táctiles.
  - **Selector de Colores Interactivo:** Círculos de color (*swatches*) con diámetro mínimo de 36px y borde activo visible de 2px de separación.
  - **Barra de Acción Fija Inferior:** Botón prominente de «Agendar Prueba» o «Iniciar Reserva» visible permanentemente sobre el borde inferior de la pantalla, sin requerir desplazarse hasta el final.

---

### 3.6 Simulador de Financiación

#### Experiencia y Distribución
- **Disposición en Escritorio:** 2 columnas (Controles a la izquierda y Tarjeta de resultados flotante sticky a la derecha).
- **Disposición en Móvil:**
  - Controles ordenados verticalmente:
    - Campo de precio del vehículo y cuota inicial con botones rápidos de porcentaje (+10%, +20%, +30%, +50%).
    - Selector de plazo en meses mediante botones en cuadrícula táctil de 3 columnas (12, 24, 36, 48, 60, 72 meses) de fácil pulsación.
    - Slider de tasa de interés anual ajustable.
  - **Tarjeta de Resultados:** En móvil, se sitúa inmediatamente después de los controles, destacando la cuota mensual calculada en tipografía grande y con el desglose del crédito (monto financiado, intereses estimados, advertencia legal demostrativa).

---

### 3.7 Comparador de Vehículos

#### Solución de Adaptabilidad Móvil
- En lugar de forzar una tabla ancha con scroll horizontal infinito que desorienta al usuario:
  - **En Móvil (< 768px):** Se implementa una vista de **Comparación de Tarjetas Duales**:
    - Selectores superiores para elegir "Vehículo A" y "Vehículo B".
    - Fila de métricas comparativas cara a cara (Potencia, Autonomía, Velocidad máxima, 0-100 km/h, Tracción, Precio estimado).
    - Indicador visual del ganador por categoría (pequeño badge verde o barra comparativa porcentual).

---

### 3.8 Formularios de Contacto y Agendamiento

- **Inputs Táctiles de Alta Usabilidad:**
  - `min-height: 50px;` en todos los campos de texto y selects.
  - `font-size: 16px;` para erradicar el zoom involuntario en navegadores Safari/iOS.
  - Atributos semánticos: `autocomplete="name"`, `type="email"`, `type="tel"`, `inputmode="numeric"`.
  - Estados de validación visual accesibles con iconos y mensajes de texto claro debajo del campo (no sólo cambios de color).

---

### 3.9 Widgets Flotantes (WhatsApp y Botón Volver Arriba)

- **Posicionamiento inteligente en Mobile:**
  - Botón de WhatsApp flotante posicionado a `bottom: max(20px, env(safe-area-inset-bottom)); right: 16px;`.
  - Tamaño de icono de 56×56px con elevación de sombra suave.
  - Despliegue del popover de chat ocupando el ancho completo menos 32px de margen en móvil, evitando salirse de la pantalla.
  - Desactivación o repliegue automático del widget flotante cuando se abre un modal o bottom sheet para no interferir con las acciones de reserva o cierre.

---

## 4. Matriz de Accesibilidad y Rendimiento (WCAG 2.1 AA)

| Criterio | Requisito WCAG | Solución Implementada |
|---|---|---|
| **Contraste de Color** | Ratio mín. 4.5:1 para texto normal, 3:1 para texto grande | Textos claros sobre `#101010` y oscuros sobre `#F5F5F7` verificados en ambos temas. |
| **Tamaño de Toque** | Mínimo 44×44px (WCAG 2.5.5 / 2.5.8) | Áreas interactivas aumentadas a 48px en dispositivos móviles. |
| **Enfoque Visible** | Elementos interactivos con anillo de foco accesible | `outline: 2px solid var(--color-accent-red); outline-offset: 3px;` en `:focus-visible`. |
| **Preferencia de Movimiento** | Respetar usuarios con sensibilidad vestibular | Media query `@media (prefers-reduced-motion: reduce)` activa con desactivación de transiciones largas. |
| **Zoom y Escalabilidad** | Permitir zoom hasta 200% sin rotura | `viewport` configurado sin `user-scalable=no` ni `maximum-scale=1.0`. |
| **Orientación** | Uso sin restricciones en vertical y horizontal | Soporte para cambio de orientación en tablets y teléfonos sin recargar. |

---

## 5. Hoja de Ruta de Implementación de Código

A continuación se detalla el plan de acción para aplicar esta especificación directamente en los archivos del proyecto:

### Fase 1: Tokens y Media Queries Base en `css/styles.css`
- Declaración de las variables fluidas (`--font-hero`, `--font-h1`, `--font-body`).
- Integración de la capa de utilidades de visibilidad responsiva (`.hide-on-mobile`, `.only-mobile`, `.touch-target-48`).
- Ajuste del contenedor principal (`.container`) con padding dinámico por breakpoint:
  - Móvil: `padding: 0 16px;`
  - Tablet: `padding: 0 24px;`
  - Desktop: `padding: 0 32px;`

### Fase 2: Rediseño del Header y Menú Off-Canvas
- Modificación del comportamiento del botón de cuenta para colapsar texto en `< 480px`.
- Transformación de `.main-nav-list` en un cajón lateral deslizante (*Off-Canvas Drawer*) en pantallas menores a 900px.
- Inserción de overlay con desenfoque de fondo y control de scroll corporal con JavaScript en `js/app.js`.

### Fase 3: Optimización del Visor 360° y Gestos Táctiles
- Habilitación de gestos táctiles `touchstart` / `touchmove` / `touchend` en el contenedor del vehículo 360°.
- Reestructuración responsive de la barra de controles inferiores del garaje con flex-wrap y botones de ancho completo en móvil.

### Fase 4: Catálogo y Bottom Sheet de Filtros
- Implementación de la barra de filtros sticky en móvil con botón disparador de Bottom Sheet.
- Optimización de la cuadrícula `.vehicles-grid` a 1 columna adaptativa en teléfonos.

### Fase 5: Modales Adaptables (Bottom Sheet Pattern)
- Reglas CSS para `.modal-dialog` en `@media (max-width: 768px)` con animación de entrada deslizante desde abajo, barra de arrastre y `max-height: 92dvh`.
- Ajuste de los inputs de formularios a `font-size: 16px` para evitar zoom en iOS.

### Fase 6: Pruebas y Validación Cruzada
- Inspección en Chrome DevTools en dispositivos preconfigurados:
  - iPhone SE (375 × 667)
  - iPhone 14 Pro Max (430 × 932)
  - Samsung Galaxy S20 Ultra (412 × 915)
  - iPad Mini (768 × 1024)
  - iPad Pro (1024 × 1366)
  - Desktop FHD (1920 × 1080)
- Verificación de ausencia de scroll horizontal involuntario en todas las resoluciones.
- Validación de que los formularios, configurador y simulador de crédito funcionen sin errores en consola.
