const { sequelize } = require("../config/database");

const initializeDatabase = async () => {
    console.log("Inicializando base de datos...");

    try {
        await sequelize.authenticate();
        console.log("Conexión a PostgreSQL verificada correctamente.");
        console.log("Inicialización finalizada.");
    } catch (error) {
        console.error("Error al inicializar la base de datos.");
        throw error;
    } finally {
        await sequelize.close();
    }
};

initializeDatabase();
