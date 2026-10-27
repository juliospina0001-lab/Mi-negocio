# Backend Setup Instructions

## Prerequisitos
- **Node.js** (v18 o superior) y **npm** instalados.
- **Docker Desktop** corriendo (se usará para la base de datos PostgreSQL).

## Pasos para iniciar el proyecto
1. **Instalar dependencias**
   ```bash
   cd "C:/Users/julian ospina/Desktop/mi negocio/backend"
   npm install
   ```
2. **Crear y levantar la base de datos**
   - Docker Desktop debe estar abierto.
   - En la terminal, dentro de la carpeta `backend`, ejecuta:
   ```bash
   docker compose up -d
   ```
   - Espera unos segundos y verifica que el contenedor está saludable:
   ```bash
   docker ps   # debería aparecer "mi_negocio_db"
   ```
3. **Ejecutar migraciones iniciales** (se ejecutan automáticamente al iniciar el servidor).
4. **Iniciar el servidor backend**
   ```bash
   npm run dev   # usa nodemon para recarga automática
   # o simplemente:
   npm start
   ```
   - El servidor escuchará en **http://localhost:4000**.
5. **Acceder a la consola administrativa**
   - Abre tu navegador y visita **http://localhost:4000/admin**.
   - La ruta muestra la página de admin (admin.html) con el menú lateral.
6. **Probar la API**
   - Puedes usar herramientas como **Postman** o **curl**.
   - Ejemplo: obtener lista de vehículos
     ```bash
     curl http://localhost:4000/api/vehicles
     ```
   - Registro / login:
     ```bash
     curl -X POST http://localhost:4000/api/auth/register \
          -H "Content-Type: application/json" \
          -d '{"email":"admin@example.com","password":"Secret123","role":"admin"}'
     ```

## Variables de entorno (`.env`)
| Variable | Valor por defecto | Comentario |
|----------|-------------------|------------|
| DB_HOST | `postgres` | Nombre del contenedor PostgreSQL (definido en docker‑compose) |
| DB_PORT | `5432` | Puerto de PostgreSQL |
| DB_NAME | `mi_negocio` |
| DB_USER | `admin` |
| DB_PASSWORD | `securepassword` |
| JWT_SECRET | `supersecretkey` | Clave usada para firmar los tokens JWT |

## Notas importantes
- La base de datos está **dockerizada**, por lo que se persiste en un volumen llamado `db_data`.
- En producción, deberías restringir `cors` a los dominios de tu sitio y cambiar las credenciales por valores seguros.
- La ruta `/admin` sirve el archivo `admin.html`. Puedes extenderla añadiendo más secciones (leads, usuarios, etc.) y conectarlas a los endpoints del backend.

---
*Este archivo está generado automáticamente por Antigravity. Ajusta cualquier configuración según tus requerimientos.*
