const { Post, Rating } = require("../models");

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
            return res.status(400).redirect(`/posts/${post.id}`);
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
        }

        return res.redirect(`/posts/${post.id}`);
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    ratePost
};
