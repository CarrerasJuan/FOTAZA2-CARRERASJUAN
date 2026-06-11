const { Interest, Post, User, Media, Notification, NotificationInterest, sequelize } = require("../models");

const parsePostId = (value) => {
    const parsedId = Number.parseInt(value, 10);
    return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;
};

const index = async (req, res, next) => {
    try {
        const interests = await Interest.findAll({
            where: {
                user_id: req.currentUser.id
            },
            include: [
                {
                    model: Post,
                    as: "post",
                    include: [
                        {
                            model: User,
                            as: "user",
                            attributes: ["id", "username"]
                        },
                        {
                            model: Media,
                            as: "media",
                            attributes: ["id", "type", "url"]
                        }
                    ]
                }
            ],
            order: [["created_at", "DESC"]]
        });

        return res.status(200).render("interests/index", {
            title: "Mis intereses",
            interests
        });
    } catch (error) {
        return next(error);
    }
};

const create = async (req, res, next) => {
    try {
        const postId = parsePostId(req.body.post_id);

        if (!postId) {
            return res.status(404).render("posts/show", {
                title: "Publicación no encontrada",
                post: null
            });
        }

        const post = await Post.findByPk(postId);

        if (!post) {
            return res.status(404).render("posts/show", {
                title: "Publicación no encontrada",
                post: null
            });
        }

        if (post.user_id === req.currentUser.id) {
            return res.redirect(`/posts/${post.id}?error=${encodeURIComponent("No puedes marcar interés en tu propia publicación.")}`);
        }

        const message = req.body.message ? req.body.message.trim() : null;
        const now = new Date();
        const [interest, created] = await Interest.findOrCreate({
            where: {
                user_id: req.currentUser.id,
                post_id: post.id
            },
            defaults: {
                user_id: req.currentUser.id,
                post_id: post.id,
                message,
                created_at: now
            }
        });

        if (!created && message) {
            await interest.update({ message });
        }

        if (created && post.user_id !== req.currentUser.id) {
            const notification = await Notification.create({
                user_id: post.user_id,
                actor_id: req.currentUser.id,
                type: "interest",
                is_read: false,
                created_at: now
            });

            await NotificationInterest.create({
                notification_id: notification.id,
                interest_id: interest.id
            });
        }

        return res.redirect(`/posts/${post.id}`);
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            return res.redirect(`/posts/${req.body.post_id}`);
        }

        return next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        const postId = parsePostId(req.params.postId);

        if (!postId) {
            return res.status(404).render("posts/show", {
                title: "Publicación no encontrada",
                post: null
            });
        }

        const interest = await Interest.findOne({
            where: {
                user_id: req.currentUser.id,
                post_id: postId
            }
        });

        if (!interest) {
            return res.redirect(`/posts/${postId}`);
        }

        // Buscar y eliminar notificación asociada
        const notificationLink = await NotificationInterest.findOne({
            where: { interest_id: interest.id }
        });

        if (notificationLink) {
            await notificationLink.destroy();

            await Notification.destroy({
                where: { id: notificationLink.notification_id }
            });
        }

        await interest.destroy();

        return res.redirect(`/posts/${postId}`);
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    index,
    create,
    remove
};
