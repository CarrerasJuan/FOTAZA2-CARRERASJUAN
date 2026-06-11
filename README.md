# FOTAZA2

FOTAZA2 es una aplicacion web comunitaria para publicar imagenes, navegar perfiles, guardar intereses con mensaje privado, organizar colecciones e interactuar con otras publicaciones mediante comentarios, valoraciones, denuncias, seguimiento y chat entre usuarios.

El proyecto esta desarrollado con Express, Sequelize, PostgreSQL y PUG siguiendo una estructura MVC.

## Stack

- Node.js
- Express
- PostgreSQL
- Sequelize
- PUG
- bcrypt
- express-session
- dotenv

## Requisitos previos

- Node.js 18 o superior
- npm
- PostgreSQL 14 o superior
- una base de datos PostgreSQL creada previamente

## Instalacion local

1. Clonar el repositorio.
2. Ejecutar `npm install`.
3. Copiar `.env.example` a `.env`.
4. Completar las variables de entorno.
5. Ejecutar `npm run db:init` para crear schema y cargar datos semilla.
6. Ejecutar `npm start`.

Servidor local por defecto:

- `http://localhost:3000`

## Variables de entorno

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fotaza_db
DB_USER=postgres
DB_PASSWORD=your_password_here
SESSION_SECRET=your_session_secret_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_STORAGE_BUCKET=fotaza-media
```

## Base de datos

El proyecto usa PostgreSQL con Sequelize, pero la estructura principal se inicializa desde SQL.

`npm run db:init`:

1. valida variables de entorno;
2. elimina y recrea el esquema `public`;
3. ejecuta `database/fotaza_schema.sql`;
4. carga datos demo mediante Sequelize.

Importante:

- `npm run db:init` reinicia la base completa.
- no se usa `sequelize.sync()`.
- no hay migraciones automaticas en este proyecto.
- si `DATABASE_URL` existe, los scripts usan esa conexion en lugar de `DB_HOST`/`DB_PORT`.

Para verificar modelos y asociaciones:

- `npm run db:models`

## Produccion en Vercel

Para produccion, la app puede leer una URL completa de PostgreSQL desde `process.env.DATABASE_URL`.

Configuracion minima esperada:

```env
DATABASE_URL=valor_de_POSTGRES_URL
NODE_ENV=production
SESSION_SECRET=your_session_secret_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_STORAGE_BUCKET=fotaza-media
```

Si trabajas en desarrollo local con variables separadas, podes seguir usando:

```env
DB_HOST=
DB_PORT=5432
DB_NAME=
DB_USER=
DB_PASSWORD=
```

## Scripts disponibles

- `npm start`: inicia el servidor Express.
- `npm run db:init`: reinicializa base y carga datos semilla.
- `npm run db:models`: valida modelos Sequelize y asociaciones.
- `npm run db:sample-post`: crea una publicacion de ejemplo.

## Usuarios de prueba

> ⚠️ Los datos demo se cargan con `npm run db:seed` y crean 4 usuarios (ana, bruno, clara, tomas).
> Las cuentas reales abajo fueron registradas desde la app en producción.

| Rol | Usuario | Correo | Contrasena |
| --- | --- | --- | --- |
| validator | Juan | `johntest@gmail.com` | `test123` |
| regular | Leo | `leomessi@gmail.com` | `lacuartaesnuestra` |
| regular | Angel | `angel@gmail.com` | `angeldimaria` |
| regular | Kylian | `kylian@gmail.com` | `cebollita` |

## Funcionalidades principales

- registro, login y logout ✅
- perfil de usuario y edicion de perfil
- publicaciones con imagen, licencia y marca de agua minima
- edicion y eliminacion de publicaciones
- comentarios
- valoraciones
- denuncias
- tags
- seguimiento entre usuarios
- intereses con mensaje privado y chat entre interesado y autor
- colecciones
- notificaciones con badge de no leídas
- mensajería privada entre usuarios por cada interés
- moderacion basica para usuario `validator`
- visibilidad restringida de media para usuarios anonimos segun licencia

## Rutas principales

Vistas publicas:

- `/`
- `/health`
- `/auth/login`
- `/auth/register`
- `/posts`
- `/posts/:id`
- `/search`

Vistas con sesion:

- `/posts/create`
- `/posts/:id/edit`
- `/users/:id`
- `/users/:id/edit`
- `/collections`
- `/collections/create`
- `/collections/:id`
- `/interests`
- `/notifications`
- `/posts/following`

Moderacion:

- `/validator`

## Estructura principal

```text
src/
  app.js
  server.js
  config/
  controllers/
  middlewares/
  models/
  routes/
  scripts/
  utils/
  views/

database/
  fotaza_schema.sql
  fotaza_seed.sql

public/
  css/
```

## Observaciones

- El renderizado es del lado del servidor con PUG.
- La media usa una sola imagen principal por publicacion.
- Las licencias y la visibilidad anonima se resuelven con los campos existentes de `media`.
