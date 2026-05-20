# Fotaza

Aplicación web comunitaria para compartir fotografías y videos.

## Descripción general

FOTAZA2 es una aplicación web construida con Node.js, Express, PUG y PostgreSQL.  
En esta etapa del proyecto se trabajó sobre la base técnica del backend, organizando la estructura general y dejando preparados los componentes principales para avanzar más adelante con funcionalidades concretas.

## Tecnologías utilizadas

- Node.js
- Express
- PUG
- PostgreSQL
- Sequelize
- dotenv

## Estado actual del proyecto

Hasta este punto, el proyecto cuenta con una base funcional y ordenada para continuar el desarrollo.  
La aplicación ya puede levantar correctamente, conectarse con PostgreSQL y cargar la estructura principal del backend sin errores.

Actualmente se encuentra implementado:

- estructura inicial del proyecto con organización tipo MVC
- servidor Express funcionando en `http://localhost:3000`
- vista inicial renderizada con PUG
- configuración de variables de entorno con `dotenv`
- archivo `.env.example` como referencia de configuración
- conexión inicial a PostgreSQL verificada con Sequelize
- script `npm run db:init` para validar la conexión a la base
- modelos Sequelize definidos a partir del esquema SQL del proyecto
- asociaciones entre modelos verificadas correctamente
- middlewares base para sesión, control de acceso y manejo de errores
- rutas base organizadas por módulo
- controladores base creados y conectados con sus rutas
- integración mínima en `app.js` para responder rutas básicas y un endpoint de verificación

## Modelos implementados

Se encuentran definidos los siguientes modelos Sequelize:

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
  - levanta el servidor en el puerto configurado

- `npm run db:init`
  - verifica la conexión inicial con PostgreSQL

- `npm run db:models`
  - valida la carga de los modelos Sequelize y sus asociaciones

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

public/
  css/
  js/
  img/
```

## Base de datos

El proyecto incluye un esquema SQL base en:

`database/fotaza_schema.sql`

Ese archivo define la estructura relacional general de la aplicación y fue tomado como referencia para la implementación de los modelos Sequelize.

## Alcance de esta etapa

En esta instancia se trabajó únicamente sobre la base técnica del proyecto.  
Todavía no se desarrollaron funcionalidades completas de negocio, formularios finales, autenticación, CRUDs ni flujos de uso avanzados.

La intención fue dejar una estructura consistente, verificable y lista para continuar con las siguientes etapas del desarrollo.
