# Fotaza

## Descripción general

FOTAZA2 es una aplicación web comunitaria para compartir fotografías y videos, desarrollada con Node.js, Express, PUG, PostgreSQL y Sequelize. El proyecto fue organizado como una aplicación MVC orientada al trabajo progresivo por módulos, integrando autenticación, publicaciones, interacción social y navegación básica sobre una base relacional real.

## Tecnologías utilizadas

- Node.js
- Express
- PUG
- PostgreSQL
- Sequelize
- bcrypt
- express-session
- dotenv

## Arquitectura

El proyecto sigue una organización orientada al patrón MVC, separando responsabilidades entre:

- `models`: definición de entidades y asociaciones con Sequelize
- `views`: vistas PUG para la interfaz renderizada del lado del servidor
- `controllers`: lógica de cada módulo funcional
- `routes`: definición de rutas por recurso o módulo
- `middlewares`: validación de sesión, control de acceso y manejo de errores

## Funcionalidades implementadas

- registro de usuarios
- login con autenticación real
- hash de contraseñas con bcrypt
- manejo de sesión con express-session
- logout
- control de acceso a rutas protegidas
- publicaciones
- listado de publicaciones
- detalle de publicación
- creación de publicaciones
- edición de publicaciones propias
- eliminación de publicaciones propias
- imágenes por URL
- comentarios
- valoraciones
- denuncias
- perfiles de usuario
- edición básica de perfil
- seguimiento entre usuarios
- intereses
- búsqueda básica
- colecciones
- agregado de publicaciones a colecciones
- tags en publicaciones
- notificaciones básicas
- validación de modelos Sequelize
- verificación de conexión a PostgreSQL

## Autenticación

La autenticación se implementó usando `bcrypt` y `express-session`.

- `bcrypt` se utiliza para hashear las contraseñas antes de guardarlas en la base de datos.
- `express-session` se utiliza para mantener la sesión del usuario del lado del servidor.
- Las contraseñas no se almacenan en texto plano.
- Durante la sesión, el identificador del usuario autenticado se conserva en la sesión para validar permisos y proteger rutas privadas.

## Modelos implementados

- User
- Post
- Media
- Comment
- Rating
- Report
- Follow
- Notification
- Interest
- Collection
- CollectionItem
- Tag
- PostTag
- NotificationComment
- NotificationRating
- NotificationFollow
- NotificationInterest
- NotificationReport

## Scripts disponibles

- `npm start`
  - levanta el servidor de la aplicación

- `npm run db:init`
  - verifica la conexión inicial con PostgreSQL

- `npm run db:models`
  - valida la carga de modelos Sequelize y sus asociaciones

## Variables de entorno

Ejemplo de configuración:

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

El esquema SQL base del proyecto se encuentra en:

`database/fotaza_schema.sql`

Ese archivo se utiliza como referencia estructural para los modelos Sequelize y para la organización relacional del sistema.

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
  views/

database/
  fotaza_schema.sql

public/
  css/
  js/
  img/
```

## Módulos principales

- Usuarios: registro, login, logout, perfil y edición básica de perfil.
- Publicaciones: listado, detalle, creación, edición, eliminación y asociación de media por URL.
- Comentarios: alta de comentarios simples sobre publicaciones.
- Valoraciones: valoración básica sobre publicaciones.
- Denuncias: denuncias simples sobre publicaciones.
- Seguimiento: seguimiento y dejar de seguir entre usuarios.
- Intereses: guardado básico de publicaciones de interés.
- Colecciones: creación de colecciones y agregado de publicaciones.
- Tags: asociación y visualización de tags en publicaciones.
- Notificaciones: listado de notificaciones básicas generadas por interacciones.
- Búsqueda: búsqueda básica de usuarios y publicaciones.

## Estado actual

El proyecto cuenta con una base funcional integrada y se encuentra en etapa de revisión final de permisos, validaciones, documentación y preparación para entrega académica.

## Alcance académico

Durante el desarrollo se priorizó:

- organización del código
- separación de responsabilidades
- arquitectura MVC
- conexión real con PostgreSQL
- modelado relacional con Sequelize
- autenticación real con sesiones
- funcionalidades verificables desde navegador
- código progresivo y mantenible

## Próximos pasos

- revisar permisos sobre rutas protegidas
- revisar validaciones de formularios
- revisar manejo de registros inexistentes
- revisar consistencia de vistas PUG
- preparar listado final de endpoints
- preparar instrucciones finales de instalación
- preparar dump SQL actualizado para restauración de base de datos
