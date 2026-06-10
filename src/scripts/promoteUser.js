require("dotenv").config({ override: true, quiet: true });

const { User, sequelize } = require("../models");

const email = process.argv[2];
const role = process.argv[3] || "validator";

if (!email) {
    console.error("Uso: npm run db:promote <email> [rol]");
    console.error("Ejemplo: npm run db:promote johntest@gmail.com");
    console.error("Ejemplo: npm run db:promote otro@email.com admin");
    process.exit(1);
}

const promoteUser = async () => {
    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            console.error(`Usuario con email "${email}" no encontrado.`);
            process.exit(1);
        }

        await user.update({ role, updated_at: new Date() });

        console.log(`✅ Usuario "${user.username}" (${email}) ahora tiene rol: ${role}`);
        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error("Error al promover usuario:", error.message);
        await sequelize.close();
        process.exit(1);
    }
};

promoteUser();
