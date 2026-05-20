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

app.get("/", (req, res) => {
    res.render("index");
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
