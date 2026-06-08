const multer = require("multer");

const MAX_AVATAR_SIZE_BYTES = 1 * 1024 * 1024;
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_AVATAR_SIZE_BYTES
    },
    fileFilter: (req, file, callback) => {
        if (!allowedMimeTypes.has(file.mimetype)) {
            req.fileUploadErrorMessage = "El avatar debe ser JPG, PNG o WEBP.";
            return callback(null, false);
        }

        return callback(null, true);
    }
});

const uploadAvatar = (req, res, next) => {
    upload.single("avatar_file")(req, res, (error) => {
        if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
            req.fileUploadErrorMessage = "El avatar no puede superar 1 MB.";
            return next();
        }

        if (error) {
            return next(error);
        }

        return next();
    });
};

module.exports = {
    uploadAvatar,
    MAX_AVATAR_SIZE_BYTES
};
