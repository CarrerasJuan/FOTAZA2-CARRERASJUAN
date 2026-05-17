# Fotaza

Aplicacion web comunitaria para compartir fotografias y videos.

17/05/2026 - 01:30 AM

Resumen técnico del avance actual — FOTAZA2-CARRERASJUAN

Hasta este punto, el proyecto se construyó de forma progresiva mediante commits pequeños y controlados, evitando implementar funcionalidades antes de tener una base técnica estable.

Avances realizados:

1. Inicializa estructura base del proyecto

Se creó la estructura inicial de una aplicación Node.js con Express y PUG, siguiendo una organización MVC simple.  
El servidor quedó funcionando en localhost:3000 y renderizando una vista inicial mediante PUG.

Resultado:
- Express funcionando.
- PUG configurado.
- Vista inicial renderizada.
- Estructura base creada.
- Proyecto ejecutable con npm start.

2. Configura variables de entorno iniciales

Se incorporó dotenv para manejar configuración mediante variables de entorno.  
El puerto de la aplicación se lee desde process.env.PORT, usando 3000 como valor por defecto.  
También se creó .env.example como guía de configuración, sin incluir credenciales reales.

Resultado:
- dotenv instalado.
- PORT configurable.
- .env.example creado.
- .env ignorado por Git.
- Sin credenciales reales en el repositorio.

3. Configura Sequelize con PostgreSQL

Se instalaron las dependencias necesarias para usar PostgreSQL con Sequelize:

- sequelize
- pg
- pg-hstore
- sequelize-cli como dependencia de desarrollo

También se creó src/config/database.js con una configuración mínima de Sequelize usando variables de entorno.

Resultado:
- Sequelize instalado.
- PostgreSQL definido como motor de base de datos.
- Configuración centralizada en src/config/database.js.
- Sin modelos, migraciones ni tablas todavía.

4. Verifica conexión inicial con PostgreSQL

Se agregó una verificación de conexión usando sequelize.authenticate().  
La aplicación puede comprobar si logra conectarse correctamente a la base PostgreSQL local.

Resultado:
- Conexión a PostgreSQL verificada.
- Mensajes claros en consola.
- Sin sequelize.sync().
- Sin creación automática de tablas.
- Sin modelos todavía.

5. Agrega script inicial de base de datos

Se agregó el comando:

npm run db:init

Este comando ejecuta un script inicial ubicado en src/scripts/dbInit.js.  
Por ahora, el script verifica la conexión con PostgreSQL usando la instancia de Sequelize existente y finaliza correctamente.

Resultado:
- npm run db:init existe y funciona.
- El script conecta correctamente con PostgreSQL.
- No crea tablas todavía.
- No ejecuta migraciones todavía.
- No carga seeders todavía.
- Deja preparado el mecanismo inicial exigido por la consigna.

Estado técnico actual:

- Express + PUG funcionando.
- Variables de entorno configuradas.
- PostgreSQL local creado.
- Sequelize configurado.
- Conexión a PostgreSQL verificada.
- npm run db:init existe y funciona.
- Todavía no hay tablas, modelos, migraciones ni seeders.

Conclusión:

El proyecto ya tiene una base técnica inicial ordenada y verificable.  
Antes de avanzar con funcionalidades como autenticación, publicaciones o comentarios, se preparó correctamente el entorno, la configuración, la conexión a base de datos y el comando inicial de base requerido por la consigna.
