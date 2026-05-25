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

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    session({
        secret: process.env.SESSION_SECRET || "fotaza_session_secret",
        resave: false,
        saveUninitialized: false
    })
);
app.use((req, res, next) => {
    res.locals.sessionUser = req.session?.user || null;
    next();
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
                    attributes: ["id", "type", "url"]
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

        const featuredTags = await Tag.findAll({
            attributes: ["id", "name"],
            order: [["created_at", "DESC"]],
            limit: 8
        });

        res.render("index", {
            title: "Inicio",
            featuredPosts,
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
