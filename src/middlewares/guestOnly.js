const guestOnly = (req, res, next) => {
    if (!req.currentUser) {
        return next();
    }

    if (req.accepts("html")) {
        return res.redirect("/posts");
    }

    return res.status(403).json({
        message: "Este recurso solo está disponible para usuarios no autenticados."
    });
};

module.exports = guestOnly;
