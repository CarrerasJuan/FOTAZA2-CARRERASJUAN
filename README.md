# FOTAZA2

Aplicacion web comunitaria para compartir fotografias, desarrollada con Node.js, Express, Pug, PostgreSQL y Sequelize bajo una arquitectura MVC.

## Tecnologias utilizadas

- Node.js
- Express
- Pug
- PostgreSQL
- Sequelize
- bcrypt
- express-session
- dotenv

## Requisitos previos

- Node.js 18 o superior
- npm
- PostgreSQL 14 o superior
- Una base de datos PostgreSQL vacia creada previamente

## Instalacion y puesta en marcha

Seguir exactamente este orden:

1. Clonar el repositorio.
2. Ejecutar `npm install`.
3. Crear una base PostgreSQL vacia.
4. Copiar `.env.example` a `.env`.
5. Configurar en `.env` las variables `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` y `DB_PASSWORD`.
6. Ejecutar `npm run db:init`.
7. Ejecutar `npm start`.

Una vez iniciado el servidor, la aplicacion queda disponible en:

- `http://localhost:3000`

## Variables de entorno

Ejemplo de configuracion:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fotaza_db
DB_USER=postgres
DB_PASSWORD=your_password_here
SESSION_SECRET=your_session_secret_here
```

## Inicializacion de base de datos

El comando `npm run db:init` realiza una inicializacion completa para evaluacion:

1. Se conecta a PostgreSQL usando las variables del archivo `.env`.
2. Elimina y recrea el esquema `public`.
3. Ejecuta `database/fotaza_schema.sql`.
4. Ejecuta `database/fotaza_seed.sql`.
5. Deja la aplicacion lista para navegar con datos de prueba.

Importante:

- No se utiliza `sequelize.sync()`.
- La estructura sale del SQL oficial del proyecto.
- Los datos semilla incluyen usuarios, publicaciones, media, tags, comentarios, follows, intereses, colecciones y notificaciones basicas.

## Usuarios de prueba

Las contrasenas de prueba estan hasheadas con bcrypt y funcionan con el login real de la aplicacion.

| Rol | Usuario | Correo | Contrasena |
| --- | --- | --- | --- |
| regular | `ana_fotaza` | `ana.fotaza@example.com` | `fotaza123` |
| validator | `validador_fotaza` | `validador.fotaza@example.com` | `validator123` |
| regular | `bruno_comunidad` | `bruno.comunidad@example.com` | `comunidad123` |

## Roles disponibles

- `regular`
- `validator`

## Scripts disponibles

- `npm start`
  - Inicia el servidor Express en el puerto configurado.

- `npm run db:init`
  - Inicializa la base de datos desde el schema SQL oficial y carga datos semilla.

- `npm run db:models`
  - Verifica la carga de modelos Sequelize y sus asociaciones.

- `npm run db:sample-post`
  - Crea una publicacion de ejemplo utilizando el flujo del proyecto.

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
  fotaza_seed.sql

public/
  css/
  js/
  img/
```

## Modulos implementados

- Autenticacion de usuarios
- Publicaciones
- Comentarios
- Valoraciones basicas
- Denuncias basicas
- Perfiles de usuario
- Seguimiento entre usuarios
- Intereses
- Busqueda
- Colecciones
- Tags
- Notificaciones

## Informe breve de problemas solucionados

Durante la estabilizacion tecnica de entrega se resolvieron los siguientes puntos:

1. Inicializacion real de base de datos desde SQL
   - El script `src/scripts/dbInit.js` paso de validar solamente la conexion a ejecutar el schema oficial y una carga controlada de datos de prueba.

2. Carga de datos de prueba
   - Se agrego `database/fotaza_seed.sql` con usuarios de prueba, publicaciones, media, tags e interacciones minimas para que la aplicacion no quede vacia despues de la instalacion.

3. Correccion de edicion de perfil
   - Se corrigio `src/controllers/userController.js` para que el formulario de edicion de perfil cargue correctamente los datos reales del usuario autenticado.

## Observaciones de uso

- La base de datos se reinicializa por completo cada vez que se ejecuta `npm run db:init`.
- El proyecto utiliza renderizado del lado del servidor con Pug.
- La configuracion se resuelve por variables de entorno.
