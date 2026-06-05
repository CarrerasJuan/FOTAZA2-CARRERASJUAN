const { Sequelize } = require("sequelize");
const pg = require("pg");

require("dotenv").config({ quiet: true });

const shouldUseSsl = process.env.DB_SSL !== "false";
const commonOptions = {
    dialect: "postgres",
    dialectModule: pg
};

if (shouldUseSsl) {
    commonOptions.dialectOptions = {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    };
}

const sequelize = process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, commonOptions)
    : new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            ...commonOptions,
            host: process.env.DB_HOST,
            port: process.env.DB_PORT
        }
    );

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
    sequelize,
    testDatabaseConnection
};
