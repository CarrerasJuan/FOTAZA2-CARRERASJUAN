require("dotenv").config();

const app = require("./app");
const { testDatabaseConnection } = require("./config/database");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    await testDatabaseConnection();

    app.listen(PORT, () => {
        console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });
};

startServer();
