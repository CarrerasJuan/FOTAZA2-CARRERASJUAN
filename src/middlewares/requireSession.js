const requireSession = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }

    if (req.accepts("html")) {
        return res.redirect("/auth/login");
    }

    return res.status(401).json({
        message: "Debes iniciar sesión para acceder a este recurso."
    });
};

module.exports = requireSession;
