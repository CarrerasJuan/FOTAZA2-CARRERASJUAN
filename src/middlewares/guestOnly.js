const guestOnly = (req, res, next) => {
    if (!req.session || !req.session.user) {
        return next();
    }

    return res.status(403).json({
        message: "Este recurso solo está disponible para usuarios no autenticados."
    });
};

module.exports = guestOnly;
