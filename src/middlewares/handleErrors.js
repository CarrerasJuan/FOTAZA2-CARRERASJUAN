const notFoundHandler = (req, res, next) => {
    const error = new Error("Recurso no encontrado.");
    error.status = 404;
    next(error);
};

const errorHandler = (error, req, res, next) => {
    const statusCode = error.status || 500;

    res.status(statusCode).json({
        message: error.message || "Error interno del servidor."
    });
};

module.exports = {
    notFoundHandler,
    errorHandler
};
