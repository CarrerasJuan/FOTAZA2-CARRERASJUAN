const { Sequelize } = require("sequelize");
const pg = require("pg");

require("dotenv").config({ quiet: true });

const DEFAULT_DB_PORT = 5432;
const isDatabaseUrlConfigured = Boolean(process.env.DATABASE_URL);

const createSslConfig = () => ({
    require: true,
    rejectUnauthorized: false
});

const shouldUseSsl = isDatabaseUrlConfigured || process.env.DB_SSL === "true";
const commonOptions = {
    dialect: "postgres",
    dialectModule: pg,
    logging: false
};

if (shouldUseSsl) {
    commonOptions.dialectOptions = {
        ssl: createSslConfig()
    };
}

const sequelize = isDatabaseUrlConfigured
    ? new Sequelize(process.env.DATABASE_URL, commonOptions)
    : new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            ...commonOptions,
            host: process.env.DB_HOST,
            port: Number.parseInt(process.env.DB_PORT, 10) || DEFAULT_DB_PORT
        }
    );

const createPgConnectionConfig = () => {
    if (isDatabaseUrlConfigured) {
        return {
            connectionString: process.env.DATABASE_URL,
            ssl: shouldUseSsl ? createSslConfig() : undefined
        };
    }

    return {
        host: process.env.DB_HOST,
        port: Number.parseInt(process.env.DB_PORT, 10) || DEFAULT_DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: process.env.DB_SSL === "true" ? createSslConfig() : undefined
    };
};

const testDatabaseConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log("Conexión a PostgreSQL establecida correctamente.");
    } catch (error) {
        console.error("Error al conectar con PostgreSQL.");
        throw error;
    }
};

module.exports = {
    createPgConnectionConfig,
    sequelize,
    testDatabaseConnection
};
