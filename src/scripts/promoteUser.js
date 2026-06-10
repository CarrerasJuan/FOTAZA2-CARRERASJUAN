require("dotenv").config({ override: true, quiet: true });

const { Pool } = require("pg");

const email = process.argv[2];
const role = process.argv[3] || "validator";

if (!email) {
    console.error("Uso: npm run db:promote <email> [rol]");
    console.error("Ejemplo: npm run db:promote johntest@gmail.com");
    console.error("Ejemplo: npm run db:promote otro@email.com admin");
    process.exit(1);
}

const getPool = () => {
    if (process.env.DATABASE_URL) {
        const dbUrl = new URL(process.env.DATABASE_URL);
        return new Pool({
            host: dbUrl.hostname,
            port: Number.parseInt(dbUrl.port, 10) || 5432,
            database: dbUrl.pathname.slice(1),
            user: decodeURIComponent(dbUrl.username),
            password: decodeURIComponent(dbUrl.password),
            ssl: { rejectUnauthorized: false }
        });
    }

    return new Pool({
        host: process.env.DB_HOST || "localhost",
        port: Number.parseInt(process.env.DB_PORT, 10) || 5432,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    });
};

const promoteUser = async () => {
    let pool;

    try {
        pool = getPool();

        const result = await pool.query(
            "UPDATE users SET role = $1, updated_at = NOW() WHERE email = $2 RETURNING username, email, role",
            [role, email]
        );

        if (result.rows.length === 0) {
            console.error(`Usuario con email "${email}" no encontrado.`);
            process.exit(1);
        }

        const user = result.rows[0];
        console.log(`✅ Usuario "${user.username}" (${user.email}) ahora tiene rol: ${user.role}`);
        process.exit(0);
    } catch (error) {
        console.error("Error al promover usuario:", error.message);
        process.exit(1);
    } finally {
        if (pool) await pool.end();
    }
};

promoteUser();
