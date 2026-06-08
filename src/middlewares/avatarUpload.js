const { upload } = require("./postImageUpload");

const uploadAvatar = (req, res, next) => {
    upload.single("avatar_file")(req, res, (error) => {
        if (error) {
            return next(error);
        }

        return next();
    });
};

module.exports = {
    uploadAvatar
};
