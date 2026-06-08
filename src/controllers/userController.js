const { User, Post, Media, Follow } = require("../models");
const {
    isSupabaseStorageConfigured,
    uploadAvatar,
    removeAvatar
} = require("../services/mediaStorageService");

const parseUserId = (value) => {
    const parsedId = Number.parseInt(value, 10);
    return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;
};

const renderEditForm = (res, error, values) => {
    return res.status(400).render("users/edit", {
        title: "Editar perfil",
        error,
        profileUser: {
            id: res.req.params.id
        },
        values
    });
};

const show = async (req, res, next) => {
    try {
        const userId = parseUserId(req.params.id);

        if (!userId) {
            return res.status(404).render("users/show", {
                title: "Usuario no encontrado",
                profileUser: null
            });
        }

        const profileUser = await User.findByPk(userId, {
            attributes: ["id", "username", "email", "biography", "avatar_url", "status", "created_at"],
            include: [
                {
                    model: Post,
                    as: "posts",
                    required: false,
                    include: [
                        {
                            model: Media,
                            as: "media",
                            attributes: ["id", "type", "url"]
                        }
                    ]
                }
            ],
            order: [[{ model: Post, as: "posts" }, "created_at", "DESC"]]
        });

        if (!profileUser) {
            return res.status(404).render("users/show", {
                title: "Usuario no encontrado",
                profileUser: null
            });
        }

        const followersCount = await Follow.count({
            where: {
                following_id: profileUser.id
            }
        });

        const followingCount = await Follow.count({
            where: {
                follower_id: profileUser.id
            }
        });

        const isFollowing = req.currentUser
            ? Boolean(
                await Follow.findOne({
                    where: {
                        follower_id: req.currentUser.id,
                        following_id: profileUser.id
                    }
                })
            )
            : false;

        return res.status(200).render("users/show", {
            title: `Perfil de ${profileUser.username}`,
            profileUser,
            followSummary: {
                followersCount,
                followingCount,
                isFollowing
            }
        });
    } catch (error) {
        return next(error);
    }
};

const showEditForm = async (req, res, next) => {
    try {
        const userId = parseUserId(req.params.id);

        if (!userId) {
            return res.status(404).render("users/show", {
                title: "Usuario no encontrado",
                profileUser: null
            });
        }

        const profileUser = await User.findByPk(userId, {
            attributes: ["id", "username", "email", "biography", "avatar_url"]
        });

        if (!profileUser) {
            return res.status(404).render("users/show", {
                title: "Usuario no encontrado",
                profileUser: null
            });
        }

        if (req.currentUser.id !== profileUser.id) {
            return res.status(403).json({
                message: "No tienes permisos para editar este perfil."
            });
        }

        return res.status(200).render("users/edit", {
            title: "Editar perfil",
            error: null,
            profileUser,
            values: {
                username: profileUser.username || "",
                email: profileUser.email || "",
                biography: profileUser.biography || "",
                avatar_url: profileUser.avatar_url || ""
            }
        });
    } catch (error) {
        return next(error);
    }
};

const update = async (req, res, next) => {
    const username = req.body.username ? req.body.username.trim() : "";
    const email = req.body.email ? req.body.email.trim() : "";
    const biography = req.body.biography ? req.body.biography.trim() : "";
    const avatar_url = req.body.avatar_url ? req.body.avatar_url.trim() : "";
    let uploadedAvatar = null;

    try {
        const userId = parseUserId(req.params.id);

        if (!userId) {
            return res.status(404).render("users/show", {
                title: "Usuario no encontrado",
                profileUser: null
            });
        }

        if (req.fileUploadErrorMessage) {
            return renderEditForm(res, req.fileUploadErrorMessage, {
                username,
                email,
                biography,
                avatar_url
            });
        }

        const profileUser = await User.findByPk(userId, {
            attributes: ["id", "username", "email", "biography", "avatar_url", "avatar_storage_path"]
        });

        if (!profileUser) {
            return res.status(404).render("users/show", {
                title: "Usuario no encontrado",
                profileUser: null
            });
        }

        if (req.currentUser.id !== profileUser.id) {
            return res.status(403).json({
                message: "No tienes permisos para editar este perfil."
            });
        }

        let finalAvatarUrl = avatar_url || null;
        let finalStoragePath = null;

        if (req.file) {
            if (!isSupabaseStorageConfigured()) {
                return renderEditForm(res, "La subida de avatar requiere configurar Supabase Storage en el servidor.", {
                    username,
                    email,
                    biography,
                    avatar_url
                });
            }

            uploadedAvatar = await uploadAvatar({
                file: req.file,
                userId: profileUser.id
            });

            finalAvatarUrl = uploadedAvatar.publicUrl;
            finalStoragePath = uploadedAvatar.storagePath;
        } else if (!avatar_url) {
            finalAvatarUrl = profileUser.avatar_url;
            finalStoragePath = profileUser.avatar_storage_path;
        }

        await profileUser.update({
            username,
            email,
            biography: biography || null,
            avatar_url: finalAvatarUrl,
            avatar_storage_path: finalStoragePath
        });

        if (uploadedAvatar && profileUser.avatar_storage_path) {
            try {
                await removeAvatar(profileUser.avatar_storage_path);
            } catch (cleanupError) {
                console.error("No se pudo eliminar el avatar anterior:", cleanupError.message);
            }
        }

        return res.redirect(`/users/${profileUser.id}`);
    } catch (error) {
        if (uploadedAvatar && uploadedAvatar.storagePath) {
            try {
                await removeAvatar(uploadedAvatar.storagePath);
            } catch (cleanupError) {
                console.error("No se pudo limpiar avatar fallido:", cleanupError.message);
            }
        }

        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(400).render("users/edit", {
                title: "Editar perfil",
                error: "El usuario o el correo ya se encuentran registrados.",
                profileUser: {
                    id: req.params.id
                },
                values: {
                    username,
                    email,
                    biography,
                    avatar_url
                }
            });
        }

        if (
            error.message === "La subida de avatar requiere configurar Supabase Storage en el servidor."
            || error.message === "No se pudo subir el avatar a Supabase Storage."
        ) {
            return renderEditForm(res, error.message, {
                username,
                email,
                biography,
                avatar_url
            });
        }

        return next(error);
    }
};

module.exports = {
    show,
    showEditForm,
    update
};
