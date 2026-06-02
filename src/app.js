const express = require("express");
const session = require("express-session");
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
const { Post, User, Media, Tag } = require("./models");
const { applyMediaVisibilityToPosts } = require("./utils/mediaVisibility");

const app = express();
const SESSION_COOKIE_NAME = "connect.sid";

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    session({
        secret: process.env.SESSION_SECRET || "fotaza_session_secret",
        resave: false,
        saveUninitialized: false,
        name: SESSION_COOKIE_NAME
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
            limit: 4
        });
        const visibleFeaturedPosts = applyMediaVisibilityToPosts(featuredPosts, Boolean(req.currentUser));

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

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok"
    });
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
