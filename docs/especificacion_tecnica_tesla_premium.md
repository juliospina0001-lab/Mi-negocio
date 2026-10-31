# Especificación técnica frontend — Tesla Premium

**Documento de requisitos · UI/UX · HTML5 · CSS3 · JavaScript vanilla**

## 1. Descripción del proyecto

Desarrollar una página web premium de exhibición y venta comercial de vehículos Tesla, con una experiencia visual sofisticada, navegación intuitiva y funcionalidades interactivas que permitan explorar el catálogo de vehículos y generar solicitudes comerciales.

La propuesta combina la estética minimalista del sitio oficial de Tesla con patrones de navegación y presentación de inventario utilizados en concesionarios de vehículos de lujo. Todo se implementará exclusivamente con **HTML, CSS y JavaScript nativo**, sin frameworks ni bibliotecas externas de JavaScript.

## 2. Análisis de referentes

### 2.1 Tesla — sitio oficial colombiano

**Referencia principal de marca.** El sitio oficial utiliza una presentación centrada en el vehículo, llamadas a la acción directas y páginas individuales con información sobre autonomía, diseño, tecnología y características.

**Qué adoptar:**
- Fotografías protagonistas.
- Navegación sencilla.
- Tipografía limpia.
- Secciones que transmitan innovación.;

Sitio: https://www.tesla.com/es_co

### 2.2 DealerAssist — plantillas para concesionarios

**Referencia de inventario y conversión.** Las propuestas para concesionarios incluyen páginas de vehículos, inventario, captación de clientes y personalización de marca.

**Qué adoptar:**
- Tarjetas de vehículos uniformes.
- Filtros de búsqueda.
- Fichas de producto detalladas.
- Formularios de contacto accesibles.

Referencia: https://www.dealerassist.com/templates/oklahoma

### 2.3 Diseño monocromático de concesionario de lujo

**Referencia estética complementaria.** Este enfoque utiliza una paleta monocromática, espacios amplios y fotografías tratadas como piezas de exhibición.

**Qué adoptar:**
- Fondos negros y blancos.
- Líneas divisorias sutiles.
- Geometría limpia.
- Ausencia de elementos decorativos innecesarios.

Referencia: https://www.savvydealer.com/dealer-website-examples/monochrome-luxury-style

### Conclusión del análisis

No conviene copiar literalmente ninguna página. La mejor solución es combinar el lenguaje visual de Tesla con la estructura comercial de un concesionario premium: el automóvil debe generar interés visual y la interfaz debe facilitar que el usuario encuentre un modelo, conozca sus características y solicite información.

## 3. Objetivo y alcance

### Objetivo del producto

Crear un showroom digital que permita al usuario:
- Descubrir vehículos Tesla en un catálogo demostrativo.
- Filtrar y ordenar modelos.
- Consultar información técnica y fotografías.
- Personalizar visualmente algunas opciones del vehículo.
- Calcular estimaciones de pago orientativas.
- Enviar solicitudes de información o de prueba de manejo.
- Contactar al equipo comercial mediante enlaces configurables.

**Objetivo de negocio:** convertir visitas en solicitudes comerciales, sin sacrificar la experiencia premium de marca.

### Alcance funcional

| Incluido en frontend | Fuera del alcance |
|---|---|
| Interfaz responsive | Backend y API |
| Catálogo con datos locales | Inventario real en tiempo real |
| Filtros y búsqueda funcionales | Pagos y compras reales |
| Fichas de vehículos | Autenticación de usuarios |
| Simulador de cuotas | Aprobación de créditos |
| Formularios con validación | Almacenamiento en servidor |
| Favoritos con `localStorage` | CRM y base de datos |
| Navegación y microinteracciones | Confirmación real de reservas |

Las funciones comerciales serán demostrativas hasta conectar el proyecto con servicios reales. La interfaz nunca debe afirmar que un pedido, pago o reserva se ha confirmado cuando solo se ha ejecutado JavaScript en el navegador.

## 4. Arquitectura de información

El sitio se organizará en cinco vistas principales. Pueden implementarse como secciones de una aplicación de una sola página, usando HTML, CSS y JavaScript sin framework.

### Vistas principales

1. **Inicio:** hero, modelos destacados, beneficios y llamadas a la acción.
2. **Catálogo:** filtros, ordenación y favoritos.
3. **Detalle del vehículo:** galería, especificaciones y opciones.
4. **Financiación:** simulador orientativo.
5. **Contacto:** formulario y solicitud de prueba.

### Navegación principal

- Logotipo o nombre comercial.
- Inicio.
- Vehículos.
- Experiencia Tesla.
- Financiación.
- Contacto.
- Icono de favoritos con contador.
- Botón principal: **Explorar vehículos**.

En móvil, la navegación debe convertirse en un menú desplegable accesible. El encabezado puede permanecer fijo durante el desplazamiento, siempre que no ocupe demasiado espacio de pantalla.

## 5. Especificación de diseño UI/UX

### 5.1 Identidad visual

Paleta propuesta:

| Color | Código | Uso |
|---|---|---|
| Obsidiana | `#101010` | Fondos oscuros |
| Blanco | `#FFFFFF` | Fondos claros y texto sobre fondos oscuros |
| Plata | `#A7A7A7` | Elementos secundarios |
| Rojo de acento | `#E82127` | Acciones prioritarias e indicadores |
| Carbón | `#242424` | Superficies oscuras |
| Gris claro | `#F3F3F3` | Fondos alternativos |

El rojo debe reservarse para acciones prioritarias, indicadores y estados importantes, no para todos los elementos interactivos.

### 5.2 Tipografía y espaciado

- Utilizar una tipografía sans-serif del sistema, sin necesidad de cargar bibliotecas externas.
- Emplear títulos de gran tamaño, textos secundarios discretos y jerarquía visual consistente.
- Establecer una escala de espaciado basada en 8 px: 8, 16, 24, 32, 48 y 64 px.
- Utilizar bordes sutiles, sombras discretas y radios pequeños o moderados.

### 5.3 Diseño de la página de inicio

**01. Hero cinematográfico**
- Fotografía amplia del vehículo.
- Titular corto y subtítulo comercial.
- Dos acciones: «Explorar modelos» y «Solicitar información».
- Contraste suficiente y texto que no oculte el automóvil.

**02. Modelos destacados**
- Tarjetas con imagen, nombre, categoría y acceso al detalle.
- Mostrar precios únicamente si se han verificado.
- Mantener una jerarquía clara entre la tarjeta y su botón principal.

**03. Tecnología y experiencia**
- Bloques editoriales para explicar diseño, experiencia eléctrica, seguridad y carga.
- Utilizar textos verificables y fotografías pertinentes.

**04. Conversión comercial**
- Formulario breve.
- Solicitud de prueba de manejo.
- Vías de contacto configurables.

## 6. Funcionalidades y requisitos técnicos

Prioridades:
- **P0:** imprescindible.
- **P1:** importante.
- **P2:** mejora opcional.

| ID | Funcionalidad | Requisito | Prioridad |
|---|---|---|---|
| F-01 | Navegación | Enlaces y menú móvil operativos | P0 |
| F-02 | Catálogo | Renderizar vehículos desde un array JavaScript | P0 |
| F-03 | Búsqueda | Buscar por nombre y modelo | P0 |
| F-04 | Filtros | Categoría, precio y ordenación | P0 |
| F-05 | Ficha de vehículo | Mostrar datos y galería | P0 |
| F-06 | Formulario | Validar campos y mostrar resultado local | P0 |
| F-07 | Responsive | Adaptarse a móvil, tablet y escritorio | P0 |
| F-08 | Favoritos | Guardar selección localmente | P1 |
| F-09 | Configurador visual | Cambiar color e imagen cuando haya recursos | P1 |
| F-10 | Simulador | Calcular cuota estimada | P1 |
| F-11 | Comparador | Comparar características de dos modelos | P2 |
| F-12 | Animaciones | Transiciones discretas y respetuosas con accesibilidad | P2 |

### 6.1 Modelo de datos para el catálogo

Cada vehículo debe tener una estructura consistente. Ejemplo:

```javascript
const vehicles = [
  {
    id: "model-3",
    name: "Model 3",
    category: "Sedán",
    price: 0,
    currency: "COP",
    rangeKm: null,
    accelerationSeconds: null,
    image: "assets/images/model-3.webp",
    colors: ["Blanco", "Negro", "Gris"],
    featured: true
  }
];
```

Los valores `0` y `null` son marcadores de demostración; deben reemplazarse por datos comprobados antes de publicar. No deben mostrarse como precios reales ni como especificaciones confirmadas. Los valores comerciales deben ser configurables porque pueden variar según versión, mercado y disponibilidad.

### 6.2 Lógica del frontend

- **Catálogo:** `Array.filter()` para filtros y `Array.sort()` para ordenación.
- **Renderizado:** generar las tarjetas con funciones JavaScript a partir de los datos.
- **Detalle:** identificar el vehículo mediante su ID.
- **Favoritos:** persistir identificadores con `localStorage`, comprobando que el almacenamiento esté disponible.
- **Configurador:** actualizar el estado seleccionado y la presentación visual.
- **Simulador:** calcular estimaciones con datos introducidos por el usuario.
- **Formularios:** validar campos y mostrar mensajes de estado accesibles.
- **Navegación:** utilizar enlaces HTML reales y gestionar el menú móvil con JavaScript.

## 7. Simulador de financiación

El simulador debe ser una herramienta informativa, no un sistema bancario. Debe permitir modificar el precio del vehículo, la cuota inicial, el plazo y una tasa de interés configurable.

Para un modelo de cuotas mensuales fijas, la fórmula es:

\[
C=P\frac{i(1+i)^n}{(1+i)^n-1}
\]

Donde:
- \(C\): cuota mensual estimada.
- \(P\): importe financiado.
- \(i\): tasa de interés mensual.
- \(n\): número de cuotas.

Si la tasa es cero, la cuota es simplemente \(P/n\). La interfaz debe validar los valores, actualizar los resultados al cambiar los controles y mostrar una advertencia de que el cálculo no constituye una oferta de crédito.

No se deben inventar tasas bancarias ni afirmar que una entidad financiera ha aprobado al usuario.

## 8. Estructura de archivos

```text
tesla-premium/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── data.js
│   └── app.js
└── assets/
    └── images/
```

- **`index.html`:** estructura semántica, navegación, secciones, catálogo y formularios.
- **`css/styles.css`:** variables de diseño, componentes, responsive, animaciones y estados visuales.
- **`js/data.js`:** array de vehículos, categorías, especificaciones y contenido demostrativo.
- **`js/app.js`:** navegación, filtros, favoritos, configurador, formularios y eventos.
- **`assets/images/`:** fotografías optimizadas, imágenes alternativas y recursos locales.

Se permite separar JavaScript en varios archivos si mejora la mantenibilidad. No se deben introducir React, Vue, Angular, Bootstrap, Tailwind, jQuery, TypeScript, npm ni frameworks similares. La aplicación debe poder abrirse y probarse en un navegador moderno, sin un proceso de compilación.

## 9. Accesibilidad, rendimiento y seguridad

- **Responsive:** diseño desde móvil hasta pantallas grandes, sin desbordamientos horizontales.
- **Accesibilidad:** HTML semántico, etiquetas de formulario, textos alternativos, navegación por teclado y foco visible.
- **Contraste:** textos legibles en fondos claros y oscuros.
- **Movimiento:** respetar `prefers-reduced-motion`.
- **Imágenes:** utilizar dimensiones adecuadas, formatos modernos como WebP y carga diferida en imágenes fuera de pantalla.
- **Seguridad:** insertar texto de datos externos mediante `textContent` o mecanismos seguros, evitando construir HTML con datos no confiables.
- **Mantenibilidad:** funciones pequeñas, nombres descriptivos, ausencia de errores en consola y CSS organizado por componentes.
- **Privacidad:** no recopilar datos personales innecesarios ni afirmar que un formulario se envió a un servidor cuando no existe conexión.

## 10. Criterios de aceptación

La entrega se considerará satisfactoria cuando se verifique que:

1. El sitio se visualiza correctamente en escritorio, tablet y móvil.
2. Todos los enlaces y controles tienen un comportamiento definido.
3. El catálogo se genera a partir de datos JavaScript y no de tarjetas duplicadas manualmente.
4. La búsqueda, los filtros y la ordenación funcionan conjuntamente.
5. Cada vehículo presenta una ficha con sus datos e imágenes disponibles.
6. Los formularios validan los campos y muestran mensajes comprensibles.
7. Los favoritos persisten después de recargar la página cuando el almacenamiento está disponible.
8. El simulador actualiza las cuotas correctamente, incluido el caso de tasa cero.
9. Los botones y campos pueden utilizarse con teclado y tienen estados de foco visibles.
10. No hay errores JavaScript en consola ni promesas comerciales falsas.

## 11. Prompt técnico para la herramienta de desarrollo

### Rol
Actúa como un desarrollador frontend senior especializado en diseño UI/UX, comercio electrónico automotriz, accesibilidad y optimización web.

### Objetivo
Desarrolla un sitio web premium de exhibición y venta comercial de vehículos Tesla. El resultado debe transmitir innovación, exclusividad, confianza y simplicidad, tomando como referencias de diseño el sitio oficial de Tesla Colombia y las interfaces de inventario de concesionarios de automóviles de lujo.

### Restricciones tecnológicas
Utiliza exclusivamente:
- HTML5 semántico.
- CSS3 nativo.
- JavaScript vanilla, ES6 o superior.

No utilices frameworks, bibliotecas de interfaz, dependencias externas de JavaScript, preprocesadores CSS ni herramientas de compilación.

### Diseño UI/UX
Crea una identidad visual minimalista y cinematográfica con:
- Paleta monocromática de negro, blanco, plata y gris.
- Rojo como color de acento para acciones importantes.
- Tipografía sans-serif del sistema.
- Fotografías de automóviles en alta calidad.
- Encabezado limpio y navegación intuitiva.
- Amplios espacios en blanco, jerarquía tipográfica y transiciones discretas.
- Tarjetas de vehículos coherentes y botones con estados hover, focus y active.
- Diseño adaptable a móvil, tablet y escritorio.

No copies literalmente la identidad gráfica ni los recursos propietarios de terceros. Utiliza recursos autorizados y no sugieras afiliación oficial con Tesla si el proyecto es independiente.

### Estructura funcional
1. Página de inicio con hero cinematográfico, llamadas a la acción y vehículos destacados.
2. Catálogo de vehículos con búsqueda, filtros por categoría y precio, y ordenación.
3. Ficha individual con galería, características, especificaciones y opciones visuales.
4. Simulador de financiación con cálculo de cuotas orientativas.
5. Sección de experiencia eléctrica, tecnología y carga.
6. Formulario de contacto y solicitud de prueba de manejo.
7. Favoritos persistentes mediante localStorage.
8. Footer con navegación secundaria, información de contacto configurable y avisos legales.

### Comportamiento
Mantén los datos de vehículos en estructuras JavaScript separadas del HTML. Implementa las interacciones mediante funciones reutilizables y eventos nativos. Valida los formularios, muestra estados de carga cuando proceda y proporciona mensajes de éxito o error adecuados.

No simules pagos reales, reservas confirmadas, inventario en tiempo real, autenticación ni envío a un servidor. Indica claramente cuando una operación sea solamente demostrativa.

### Arquitectura
Organiza el proyecto en:
- `index.html`
- `css/styles.css`
- `js/data.js`
- `js/app.js`
- `assets/images/`

Puedes añadir archivos HTML o JavaScript si una separación adicional mejora la claridad, manteniendo siempre las tecnologías permitidas.

### Calidad
Aplica HTML semántico, accesibilidad WCAG como objetivo, navegación por teclado, contraste suficiente, imágenes optimizadas, diseño responsive y código legible. Respeta las preferencias de movimiento reducido y evita errores en la consola.

### Entrega
Implementa el código completo, no únicamente un prototipo visual. Verifica que los filtros, los controles, los formularios, los favoritos y el simulador funcionen.

Antes de finalizar:
1. Revisa todos los enlaces y controles.
2. Prueba el diseño en distintos tamaños de pantalla.
3. Comprueba la consola del navegador.
4. Identifica los datos e imágenes de demostración.
5. Documenta las limitaciones propias de un frontend sin backend.

Prioriza primero una experiencia visual excelente y una estructura sólida; después implementa las funcionalidades interactivas y realiza las pruebas de calidad.

## 12. Recomendación de implementación

Desarrolla el proyecto en este orden: primero la estructura HTML, después el sistema visual CSS y finalmente la lógica JavaScript. Así podrás revisar el diseño antes de añadir interactividad y detectar errores de forma más sencilla.

Para una web de ventas premium, las tres prioridades son una presentación visual excelente, un catálogo fácil de explorar y una vía de contacto clara. La financiación, los favoritos y el comparador deben complementar esas funciones, no distraer de ellas.
