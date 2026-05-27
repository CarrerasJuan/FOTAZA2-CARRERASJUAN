const { Interest, Post, User, Media, Notification, NotificationInterest } = require("../models");

const parsePostId = (value) => {
    const parsedId = Number.parseInt(value, 10);
    return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;
};

const index = async (req, res, next) => {
    try {
        const interests = await Interest.findAll({
            where: {
                user_id: req.session.user.id
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

        if (post.user_id === req.session.user.id) {
            return res.redirect(`/posts/${post.id}?error=${encodeURIComponent("No puedes marcar interés en tu propia publicación.")}`);
        }

        const now = new Date();
        const [interest, created] = await Interest.findOrCreate({
            where: {
                user_id: req.session.user.id,
                post_id: post.id
            },
            defaults: {
                user_id: req.session.user.id,
                post_id: post.id,
                created_at: now
            }
        });

        if (created && post.user_id !== req.session.user.id) {
            const notification = await Notification.create({
                user_id: post.user_id,
                actor_id: req.session.user.id,
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

        await Interest.destroy({
            where: {
                user_id: req.session.user.id,
                post_id: postId
            }
        });

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
