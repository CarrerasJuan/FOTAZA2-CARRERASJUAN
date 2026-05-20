const { User, Post, Media } = require("../models");

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

        return res.status(200).render("users/show", {
            title: `Perfil de ${profileUser.username}`,
            profileUser
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    show
};
