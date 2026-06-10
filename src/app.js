const express = require("express");
const session = require("express-session");
const PgSession = require("connect-pg-simple")(session);
const { Pool } = require("pg");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const searchRoutes = require("./routes/searchRoutes");
const userRoutes = require("./routes/userRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const collectionRoutes = require("./routes/collectionRoutes");
const validatorRoutes = require("./routes/validatorRoutes");
const interestRoutes = require("./routes/interestRoutes");
const { notFoundHandler, errorHandler } = require("./middlewares/handleErrors");
const { sequelize, Post, User, Media, Tag } = require("./models");
const { applyMediaVisibilityToPosts } = require("./utils/mediaVisibility");

const app = express();
const SESSION_COOKIE_NAME = "connect.sid";

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const getSessionPool = () => {
    if (process.env.DATABASE_URL) {
        const dbUrl = new URL(process.env.DATABASE_URL);
        return new Pool({
            host: dbUrl.hostname,
            port: Number.parseInt(dbUrl.port, 10) || 5432,
            database: dbUrl.pathname.slice(1),
            user: decodeURIComponent(dbUrl.username),
            password: decodeURIComponent(dbUrl.password),
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
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

const sessionPool = getSessionPool();

app.use(
    session({
        store: new PgSession({
            pool: sessionPool,
            tableName: "session",
            createTableIfMissing: true
        }),
        secret: process.env.SESSION_SECRET || "fotaza_session_secret",
        resave: false,
        saveUninitialized: false,
        name: SESSION_COOKIE_NAME,
        cookie: {
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        }
    })
);
app.use(async (req, res, next) => {
    req.currentUser = null;

    if (!req.session?.userId) {
        res.locals.sessionUser = null;
        return next();
    }

    try {
        const currentUser = await User.findByPk(req.session.userId, {
            attributes: ["id", "username", "email", "role", "status"]
        });

        if (!currentUser) {
            return req.session.destroy((error) => {
                if (error) {
                    return next(error);
                }

                res.clearCookie(SESSION_COOKIE_NAME);

                if (req.accepts("html")) {
                    return res.redirect("/auth/login");
                }

                return res.status(401).json({
                    message: "Tu sesión ya no es válida. Inicia sesión nuevamente."
                });
            });
        }

        req.currentUser = currentUser;
        res.locals.sessionUser = currentUser;
        return next();
    } catch (error) {
        return next(error);
    }
});
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/", async (req, res, next) => {
    try {
        const featuredPosts = await Post.findAll({
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "username"]
                },
                {
                    model: Media,
                    as: "media",
                    attributes: ["id", "type", "url", "license", "watermark_text"]
                },
                {
                    model: Tag,
                    as: "tags",
                    attributes: ["id", "name"],
                    through: {
                        attributes: []
                    }
                }
            ],
            order: [["created_at", "DESC"]],
            limit: 12
        });
        const featuredPostsWithVisibility = applyMediaVisibilityToPosts(featuredPosts, Boolean(req.currentUser));
        const visibleFeaturedPosts = featuredPostsWithVisibility
            .filter((post) => post.canShowPrimaryMedia)
            .concat(featuredPostsWithVisibility.filter((post) => !post.canShowPrimaryMedia))
            .slice(0, 4);

        const featuredTags = await Tag.findAll({
            attributes: ["id", "name"],
            order: [["created_at", "DESC"]],
            limit: 8
        });

        res.render("index", {
            title: "Inicio",
            featuredPosts: visibleFeaturedPosts,
            featuredTags
        });
    } catch (error) {
        next(error);
    }
});

app.get("/health", async (req, res) => {
    try {
        await sequelize.authenticate();

        res.status(200).json({
            status: "ok",
            database: "connected"
        });
    } catch (error) {
        res.status(503).json({
            status: "degraded",
            database: "unavailable"
        });
    }
});

app.use("/auth", authRoutes);
app.use("/posts", postRoutes);
app.use("/search", searchRoutes);
app.use("/users", userRoutes);
app.use("/notifications", notificationRoutes);
app.use("/collections", collectionRoutes);
app.use("/validator", validatorRoutes);
app.use("/interests", interestRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
