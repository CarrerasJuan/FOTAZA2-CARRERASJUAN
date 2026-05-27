# FOTAZA2

FOTAZA2 es una aplicación web comunitaria para publicar imágenes, navegar perfiles, guardar intereses, organizar colecciones e interactuar con otras publicaciones mediante comentarios, valoraciones, denuncias y seguimiento.

El proyecto está desarrollado con Express, Sequelize, PostgreSQL y PUG siguiendo una estructura MVC.

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

## Instalación local

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
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fotaza_db
DB_USER=postgres
DB_PASSWORD=your_password_here
SESSION_SECRET=your_session_secret_here
```

## Base de datos

El proyecto usa PostgreSQL con Sequelize, pero la estructura principal se inicializa desde SQL.

`npm run db:init`:

1. valida variables de entorno;
2. elimina y recrea el esquema `public`;
3. ejecuta `database/fotaza_schema.sql`;
4. ejecuta `database/fotaza_seed.sql`.

Importante:

- `npm run db:init` reinicia la base completa.
- no se usa `sequelize.sync()`;
- no hay migraciones automáticas en este proyecto.

Para verificar modelos y asociaciones:

- `npm run db:models`

## Scripts disponibles

- `npm start`: inicia el servidor Express.
- `npm run db:init`: reinicializa base y carga datos semilla.
- `npm run db:models`: valida modelos Sequelize y asociaciones.
- `npm run db:sample-post`: crea una publicación de ejemplo.

## Usuarios de prueba

| Rol | Usuario | Correo | Contraseña |
| --- | --- | --- | --- |
| regular | `ana_fotaza` | `ana.fotaza@example.com` | `fotaza123` |
| validator | `validador_fotaza` | `validador.fotaza@example.com` | `validator123` |
| regular | `bruno_comunidad` | `bruno.comunidad@example.com` | `comunidad123` |

## Funcionalidades principales

- registro, login y logout
- perfil de usuario y edición de perfil
- publicaciones con imagen, licencia y marca de agua mínima
- edición y eliminación de publicaciones
- comentarios
- valoraciones
- denuncias
- tags
- seguimiento entre usuarios
- intereses
- colecciones
- notificaciones
- moderación básica para usuario `validator`
- visibilidad restringida de media para usuarios anónimos según licencia

## Rutas principales

Vistas públicas:

- `/`
- `/health`
- `/auth/login`
- `/auth/register`
- `/posts`
- `/posts/:id`
- `/search`

Vistas con sesión:

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

Moderación:

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
- La media usa una sola imagen principal por publicación.
- Las licencias y la visibilidad anónima se resuelven con los campos existentes de `media`.
