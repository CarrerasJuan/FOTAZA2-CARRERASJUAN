const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        const currentUser = req.session?.user;

        if (!currentUser) {
            return res.status(401).json({
                message: "Debes iniciar sesión para acceder a este recurso."
            });
        }

        if (!allowedRoles.includes(currentUser.role)) {
            return res.status(403).json({
                message: "No tienes permisos suficientes para realizar esta acción."
            });
        }

        return next();
    };
};

module.exports = requireRole;
