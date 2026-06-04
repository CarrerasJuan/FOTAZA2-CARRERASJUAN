const multer = require("multer");

const MAX_POST_IMAGE_SIZE_BYTES = 3 * 1024 * 1024;
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_POST_IMAGE_SIZE_BYTES
    },
    fileFilter: (req, file, callback) => {
        if (!allowedMimeTypes.has(file.mimetype)) {
            req.fileUploadErrorMessage = "La imagen debe ser JPG, PNG o WEBP.";
            return callback(null, false);
        }

        return callback(null, true);
    }
});

const uploadPostImage = (req, res, next) => {
    upload.single("media_file")(req, res, (error) => {
        if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
            req.fileUploadErrorMessage = "La imagen no puede superar los 3 MB.";
            return next();
        }

        if (error) {
            return next(error);
        }

        return next();
    });
};

module.exports = {
    uploadPostImage,
    MAX_POST_IMAGE_SIZE_BYTES
};
