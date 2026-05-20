const { Post, Comment } = require("../models");

const create = async (req, res, next) => {
    const { content } = req.body;

    try {
        const post = await Post.findByPk(req.params.id);

        if (!post) {
            return res.status(404).render("posts/show", {
                title: "Publicación no encontrada",
                post: null
            });
        }

        if (!post.comments_enabled) {
            return res.status(403).json({
                message: "Los comentarios están deshabilitados para esta publicación."
            });
        }

        const now = new Date();

        await Comment.create({
            post_id: post.id,
            user_id: req.session.user.id,
            content,
            status: "active"
            ,
            created_at: now,
            updated_at: now
        });

        return res.redirect(`/posts/${post.id}`);
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    create
};
