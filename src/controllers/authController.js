const bcrypt = require("bcryptjs");
const { User } = require("../models");

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

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            email,
            password: passwordHash
        });

        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        };

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
                error: "Credenciales inválidas.",
                values: {
                    email
                }
            });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).render("auth/login", {
                title: "Iniciar sesión",
                error: "Credenciales inválidas.",
                values: {
                    email
                }
            });
        }

        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        };

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
