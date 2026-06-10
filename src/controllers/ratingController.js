const { Post, Rating, Notification, NotificationRating } = require("../models");

const parsePostId = (value) => {
    const parsedId = Number.parseInt(value, 10);
    return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;
};

const ratePost = async (req, res, next) => {
    const postId = parsePostId(req.params.id);
    const parsedPoints = Number.parseFloat(req.body.points);

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

        if (isNaN(parsedPoints) || parsedPoints < 1 || parsedPoints > 5 || ![1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].includes(parsedPoints)) {
            return res.redirect(`/posts/${post.id}?error=${encodeURIComponent("La valoración debe ser 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5 o 5.")}`);
        }

        if (post.user_id === req.currentUser.id) {
            return res.redirect(`/posts/${post.id}?error=${encodeURIComponent("No puedes valorar tu propia publicación.")}`);
        }

        const existingRating = await Rating.findOne({
            where: {
                post_id: post.id,
                user_id: req.currentUser.id
            }
        });

        if (existingRating) {
            return res.redirect(`/posts/${post.id}?error=${encodeURIComponent("Ya valoraste esta publicación y no puedes volver a hacerlo.")}`);
        }

        const now = new Date();
        const rating = await Rating.create({
            post_id: post.id,
            user_id: req.currentUser.id,
            points: parsedPoints,
            created_at: now
        });

        const notification = await Notification.create({
            user_id: post.user_id,
            actor_id: req.currentUser.id,
            type: "rating",
            is_read: false,
            created_at: now
        });

        await NotificationRating.create({
            notification_id: notification.id,
            rating_id: rating.id
        });

        return res.redirect(`/posts/${post.id}`);
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            return res.redirect(`/posts/${postId}?error=${encodeURIComponent("Ya valoraste esta publicación y no puedes volver a hacerlo.")}`);
        }

        return next(error);
    }
};

module.exports = {
    ratePost
};
