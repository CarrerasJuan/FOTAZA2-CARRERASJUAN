const { User, Post, Media, Follow } = require("../models");

const parseUserId = (value) => {
    const parsedId = Number.parseInt(value, 10);
    return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;
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

        const isFollowing = req.session?.user
            ? Boolean(
                await Follow.findOne({
                    where: {
                        follower_id: req.session.user.id,
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

        if (req.session.user.id !== profileUser.id) {
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

        if (req.session.user.id !== profileUser.id) {
            return res.status(403).json({
                message: "No tienes permisos para editar este perfil."
            });
        }

        await profileUser.update({
            username,
            email,
            biography: biography || null,
            avatar_url: avatar_url || null
        });

        req.session.user = {
            ...req.session.user,
            username: profileUser.username,
            email: profileUser.email
        };

        return res.redirect(`/users/${profileUser.id}`);
    } catch (error) {
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

        return next(error);
    }
};

module.exports = {
    show,
    showEditForm,
    update
};
