require("dotenv").config({ override: true, quiet: true });

const fs = require("fs/promises");
const path = require("path");
const { Client } = require("pg");
const { createPgConnectionConfig } = require("../config/database");
const { sequelize } = require("../models");
const { seedDemoData } = require("./seedDemoData");

const schemaPath = path.resolve(__dirname, "..", "..", "database", "fotaza_schema.sql");

const ensureEnvironment = () => {
    if (process.env.DATABASE_URL) {
        return;
    }

    const requiredEnvironmentVariables = [
        "DB_HOST",
        "DB_PORT",
        "DB_NAME",
        "DB_USER",
        "DB_PASSWORD"
    ];
    const missingVariables = requiredEnvironmentVariables.filter((variableName) => !process.env[variableName]);

    if (missingVariables.length) {
        throw new Error(`Faltan variables de entorno requeridas: ${missingVariables.join(", ")}`);
    }
};

const readSqlFile = async (filePath) => {
    return fs.readFile(filePath, "utf8");
};

const createClient = () => {
    return new Client(createPgConnectionConfig());
};

const resetPublicSchema = async (client) => {
    await client.query("DROP SCHEMA IF EXISTS public CASCADE;");
    await client.query("CREATE SCHEMA public;");
};

const initializeDatabase = async () => {
    ensureEnvironment();

    const schemaSql = await readSqlFile(schemaPath);
    const client = createClient();

    console.log("Inicializando base de datos...");

    try {
        await client.connect();
        console.log("Conexion a PostgreSQL establecida.");

        console.log("Recreando esquema publico...");
        await resetPublicSchema(client);

        console.log("Ejecutando schema SQL oficial...");
        await client.query(schemaSql);

        console.log("Cargando datos demo con Sequelize...");
        await seedDemoData();

        console.log("Inicializacion finalizada correctamente.");
    } catch (error) {
        console.error("Error al inicializar la base de datos.");
        throw error;
    } finally {
        await sequelize.close();
        await client.end();
    }
};

initializeDatabase().catch((error) => {
    console.error(error.message);
    process.exit(1);
});
