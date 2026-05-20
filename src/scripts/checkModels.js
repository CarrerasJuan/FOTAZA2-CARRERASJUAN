const { sequelize, User, Post, Media, Comment } = require("../models");

const checkModels = async () => {
    try {
        await sequelize.authenticate();

        const loadedModels = [User, Post, Media, Comment]
            .map((model) => model.name)
            .join(", ");

        console.log("Conexión a PostgreSQL establecida correctamente.");
        console.log(`Modelos cargados correctamente: ${loadedModels}.`);
        console.log("Asociaciones básicas inicializadas sin errores.");
    } catch (error) {
        console.error("Error al verificar los modelos Sequelize.");
        throw error;
    } finally {
        await sequelize.close();
    }
};

checkModels();
