const { User } = require("../models");

const SESSION_COOKIE_NAME = "connect.sid";
const INVALID_CREDENTIALS_MESSAGE = "Sus credenciales son incorrectas.";

const index = (req, res) => {
    return res.redirect("/auth/login");
};

const showLogin = (req, res) => {
    return res.status(200).render("auth/login", {
        title: "Iniciar sesión",
        error: null,
        values: {
            email: ""
        }
    });
};

const showRegister = (req, res) => {
    return res.status(200).render("auth/register", {
        title: "Registrarse",
        error: null,
        values: {
            username: "",
            email: ""
        }
    });
};

const register = async (req, res, next) => {
    const username = req.body.username ? req.body.username.trim() : "";
    const email = req.body.email ? req.body.email.trim() : "";
    const password = req.body.password ? req.body.password.trim() : "";

    try {
        if (!username || !email || !password) {
            return res.status(400).render("auth/register", {
                title: "Registrarse",
                error: "Debes completar usuario, correo y contraseña.",
                values: {
                    username,
                    email
                }
            });
        }

        if (/\d/.test(username)) {
            return res.status(400).render("auth/register", {
                title: "Registrarse",
                error: "El nombre de usuario no puede contener números.",
                values: {
                    username,
                    email
                }
            });
        }

        const user = await User.create({
            username,
            email,
            password
        });

        req.session.userId = user.id;

        return res.redirect("/posts");
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(400).render("auth/register", {
                title: "Registrarse",
                error: "El usuario o el correo ya se encuentran registrados.",
                values: {
                    username,
                    email
                }
            });
        }

        return next(error);
    }
};

const login = async (req, res, next) => {
    const email = req.body.email ? req.body.email.trim() : "";
    const password = req.body.password ? req.body.password.trim() : "";

    try {
        if (!email || !password) {
            return res.status(400).render("auth/login", {
                title: "Iniciar sesión",
                error: "Debes completar correo y contraseña.",
                values: {
                    email
                }
            });
        }

        const user = await User.findOne({
            where: { email }
        });

        if (!user) {
            return res.status(401).render("auth/login", {
                title: "Iniciar sesión",
                error: INVALID_CREDENTIALS_MESSAGE,
                values: {
                    email
                }
            });
        }

        if (user.status !== "active") {
            return res.status(403).render("auth/login", {
                title: "Iniciar sesión",
                error: "Tu cuenta está inactiva y no puede iniciar sesión.",
                values: {
                    email
                }
            });
        }

        const isValidPassword = await user.validatePassword(password);

        if (!isValidPassword) {
            return res.status(401).render("auth/login", {
                title: "Iniciar sesión",
                error: INVALID_CREDENTIALS_MESSAGE,
                values: {
                    email
                }
            });
        }

        req.session.userId = user.id;

        return res.redirect("/posts");
    } catch (error) {
        return next(error);
    }
};

const logout = (req, res, next) => {
    req.session.destroy((error) => {
        if (error) {
            return next(error);
        }

        res.clearCookie(SESSION_COOKIE_NAME);
        return res.redirect("/auth/login");
    });
};

module.exports = {
    index,
    showLogin,
    showRegister,
    register,
    login,
    logout
};
