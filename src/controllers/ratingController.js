const { Post, Rating, Notification, NotificationRating } = require("../models");

const parsePostId = (value) => {
    const parsedId = Number.parseInt(value, 10);
    return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;
};

const ratePost = async (req, res, next) => {
    const postId = parsePostId(req.params.id);
    const parsedPoints = Number.parseInt(req.body.points, 10);

    try {
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

        if (!Number.isInteger(parsedPoints) || parsedPoints < 1 || parsedPoints > 5) {
            return res.redirect(`/posts/${post.id}?error=${encodeURIComponent("La valoración debe estar entre 1 y 5.")}`);
        }

        const now = new Date();
        const [rating, created] = await Rating.findOrCreate({
            where: {
                post_id: post.id,
                user_id: req.session.user.id
            },
            defaults: {
                post_id: post.id,
                user_id: req.session.user.id,
                points: parsedPoints,
                created_at: now
            }
        });

        if (!created) {
            await rating.update({
                points: parsedPoints
            });
        } else if (post.user_id !== req.session.user.id) {
            const notification = await Notification.create({
                user_id: post.user_id,
                actor_id: req.session.user.id,
                type: "rating",
                is_read: false,
                created_at: now
            });

            await NotificationRating.create({
                notification_id: notification.id,
                rating_id: rating.id
            });
        }

        return res.redirect(`/posts/${post.id}`);
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    ratePost
};
