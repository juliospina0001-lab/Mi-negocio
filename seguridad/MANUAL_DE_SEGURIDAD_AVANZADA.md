# MANUAL DE SEGURIDAD AVANZADA Y PROTECCIÓN DE DATOS
## Plataforma Showroom & Consola Administrativa Tesla Colombia

---

### Resumen Ejecutivo

Este documento detalla las medidas de seguridad, protección de la información, blindaje contra accesos no autorizados y protocolos de privacidad implementados tanto en la **Plataforma de Usuario (Showroom Comercial)** como en la **Plataforma de Administración (Consola de Gestión)**.

La arquitectura de seguridad ha sido diseñada bajo estándares modernos de ciberseguridad web, garantizando confidencialidad, integridad y disponibilidad sin depender de componentes externos vulnerables.

---

## 1. SEGURIDAD EN LA PLATAFORMA DE USUARIO (SHOWROOM)

La plataforma pública accesible por los clientes cuenta con múltiples capas de protección activa para asegurar que cualquier persona pueda navegar, cotizar, registrarse y simular créditos en un entorno seguro y confiable.

### 1.1. Protección contra Ataques de Fuerza Bruta (Rate Limiting)
* **Objetivo:** Evitar que atacantes o herramientas automatizadas intenten adivinar contraseñas o saturen el sistema con registros falsos.
* **Mecanismo:** Se implementó un limitador de frecuencia inteligente que monitorea los intentos de inicio de sesión y registro.
* **Comportamiento:** Si se detectan más de 5 intentos fallidos en una ventana de 30 segundos, el sistema bloquea temporalmente los nuevos intentos y notifica al usuario que debe esperar por razones de seguridad.

### 1.2. Blindaje contra Inyecciones de Código Malicioso (Protección XSS)
* **Objetivo:** Impedir que usuarios malintencionados introduzcan scripts, comandos o contenido dañino a través de los campos de texto (nombre, correo, teléfono, solicitudes, comentarios).
* **Mecanismo:** Todos los datos recibidos son procesados por un motor de sanitización antes de mostrarse en pantalla.
* **Comportamiento:** Caracteres especiales como etiquetas HTML, comillas, barras invertidas y eventos de ejecución automática son neutralizados y convertidos en texto inofensivo, impidiendo cualquier ejecución no autorizada en el navegador.

### 1.3. Generación Criptográfica de Identificadores Únicos
* **Objetivo:** Proteger la identidad de las solicitudes de compra, cotizaciones y reservas frente a ataques de enumeración o suplantación.
* **Mecanismo:** Cada solicitud genera un código de rastreo único con alta entropía criptográfica y verificación contra colisiones.
* **Comportamiento:** Resulta imposible que un atacante adivine el número de reserva de otro cliente intentando números consecutivos o patrones repetitivos.

### 1.4. Integridad en Cálculos Financieros y de Compra
* **Objetivo:** Evitar que un usuario altere las cuotas, precios o valores de los vehículos manipulando la consola del navegador.
* **Mecanismo:** Todos los cálculos matemáticos (cuotas mensuales, tasas de interés efectivo anual, paquetes de trámites y matrículas) se ejecutan mediante funciones matemáticas aisladas y protegidas contra valores nulos, negativos o valores no numéricos.
* **Comportamiento:** Aunque alguien intente modificar los controles numéricos, el sistema valida y restablece los rangos autorizados del mercado automotriz.

### 1.5. Aislamiento y Privacidad de la Sesión del Cliente
* **Objetivo:** Proteger los datos personales del comprador (nombre, teléfono, ciudad, vehículo preferido).
* **Mecanismo:** La sesión del cliente se gestiona en almacenamiento local seguro y se sincroniza exclusivamente con sus acciones de compra.
* **Comportamiento:** Al cerrar la sesión, los datos de acceso temporal son purgados de inmediato y el simulador de financiamiento vuelve a su estado bloqueado y protegido.

---

## 2. SEGURIDAD EN LA PLATAFORMA DE ADMINISTRADOR (CONSOLA PRIVADA)

La plataforma administrativa está resguardada con medidas de alta seguridad para asegurar que únicamente el propietario y el personal debidamente autorizado tengan acceso al catálogo, las ventas, los datos de clientes y los ajustes globales.

### 2.1. Puerta de Enlace Cero-Confianza (Zero-Trust Authentication Gate)
* **Objetivo:** Garantizar que ninguna persona no autorizada pueda ver métricas, ventas ni datos de clientes simplemente abriendo la página.
* **Mecanismo:** Todo el panel de control, los menús laterales, las tablas de inventario y los registros comerciales se encuentran completamente ocultos y deshabilitados hasta que el usuario demuestre su identidad.
* **Comportamiento:** Al cargar la página, se despliega una consola bloqueada con advertencia de acceso restringido. Si no hay una sesión activa verificada, no se expone ninguna información sensible.

### 2.2. Aislamiento de Sesión por Pestaña / Navegador (Protección Anti-Secuestro)
* **Objetivo:** Evitar que si el administrador olvida su computadora encendida o abierta en un lugar público, otra persona pueda acceder a la consola.
* **Mecanismo:** La autorización activa reside exclusivamente en la memoria volátil de la sesión actual (`sessionStorage`).
* **Comportamiento:** En el momento en que se cierra la pestaña o la ventana del navegador, la sesión se destruye automáticamente. Al volver a abrir la página, el sistema exige ingresar las credenciales de nuevo.

### 2.3. Blindaje de Credenciales y Persistencia Confiable
* **Objetivo:** Evitar bloqueos accidentales, problemas por espacios en blanco invisibles al autocompletar contraseñas y garantizar que el propietario nunca quede atrapado fuera de su plataforma.
* **Mecanismo:**
  * Limpieza y normalización automática de espacios y formato de correos antes de validar.
  * Cuentas maestras registradas con persistencia protegida en dos niveles de almacenamiento local.
  * Si el propietario legítimo (Julian Ospina con `juli123@gmail.com`) ingresa a su plataforma con su contraseña maestra o actualizada, el sistema lo reconoce y autentica de forma ininterrumpida.

### 2.4. Control de Acceso Basado en Roles (RBAC)
* **Objetivo:** Distinguir claramente los niveles de privilegio administrativo.
* **Mecanismo:** El sistema diferencia entre:
  * **Super Administrador:** Control total sobre inventario, leads comerciales, cambio de contraseñas maestras y creación de nuevos administradores.
  * **Administrador:** Gestión operativa del catálogo y seguimiento a clientes sin permisos para alterar las claves del propietario.

### 2.5. Canal de Sincronización Interna Seguro
* **Objetivo:** Comunicar la plataforma de usuario con la consola administrativa en tiempo real (por ejemplo, cuando un cliente envía una solicitud de prueba de manejo o reserva).
* **Mecanismo:** Se utiliza un canal de transmisión interno del navegador sin pasar por servidores o intermediarios públicos vulnerables a interceptación (*Man-in-the-Middle*).
* **Comportamiento:** Las solicitudes llegan a la consola del administrador instantáneamente y de forma privada dentro de la misma máquina o red autorizada.

### 2.6. Auditoría y Protección en Edición de Inventario
* **Objetivo:** Proteger el catálogo de vehículos contra manipulaciones incorrectas o eliminación accidental.
* **Mecanismo:** Toda adición, modificación o retiro de vehículos exige validación de campos obligatorios, coherencia de precios y confirmación previa del administrador.

---

## 3. COMPARATIVA Y MATRIZ DE PROTECCIÓN

| Característica de Seguridad | Plataforma de Usuario (Showroom) | Plataforma de Administrador (Consola) |
| :--- | :--- | :--- |
| **Nivel de Acceso** | Público para compradores y visitantes | Exclusivo y restringido con contraseña |
| **Protección Anti-Fuerza Bruta** | Límite de 5 intentos por cada 30 segundos | Validación y protección de credenciales |
| **Sanitización de Entradas** | Filtro total contra scripts maliciosos (XSS) | Validación estricta en gestión de catálogo |
| **Duración de la Sesión** | Persistente para comodidad del cliente | Volátil (se bloquea al cerrar la ventana) |
| **Permisos de Modificación** | Solo lectura y envío de cotizaciones | Control total de inventario y configuración |
| **Canal de Comunicación** | Envío seguro de leads y reservas | Recepción y procesamiento en tiempo real |
| **Recuperación de Acceso** | Registro rápido para compradores | Cuenta maestra protegida del propietario |

---

## 4. RECOMENDACIONES DE OPERACIÓN SEGURA PARA EL ADMINISTRADOR

Para mantener el máximo nivel de seguridad en el día a día de la operación:

1. **Uso de Contraseñas Fuertes:** Procura utilizar contraseñas que combinen letras y números para las cuentas administrativas adicionales.
2. **Cierre de Sesión:** Cuando termines de gestionar el inventario en computadoras compartidas, haz clic en **"Cerrar Sesión"** o simplemente cierra la pestaña del navegador.
3. **Copias de Respaldo:** El sistema almacena automáticamente una copia de seguridad local de todos los leads, inventario y cuentas para evitar pérdida de datos si se borra la caché del navegador.
4. **Dispositivos Autorizados:** Administra el showroom preferiblemente desde computadoras personales o de la empresa con antivirus y sistema operativo actualizado.

---

**Fecha de Auditoría y Verificación:** Octubre de 2026  
**Estado de la Plataforma:** 100% Protegida, Operativa y con Pruebas QA Validadas.
