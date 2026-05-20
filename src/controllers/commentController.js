const { Post, Comment, Notification, NotificationComment } = require("../models");

const parsePostId = (value) => {
    const parsedId = Number.parseInt(value, 10);
    return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;
};

const create = async (req, res, next) => {
    const { content } = req.body;

    try {
        const postId = parsePostId(req.params.id);

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

        if (!post.comments_enabled) {
            return res.status(403).json({
                message: "Los comentarios están deshabilitados para esta publicación."
            });
        }

        const now = new Date();

        const comment = await Comment.create({
            post_id: post.id,
            user_id: req.session.user.id,
            content,
            status: "active"
            ,
            created_at: now,
            updated_at: now
        });

        if (post.user_id !== req.session.user.id) {
            const notification = await Notification.create({
                user_id: post.user_id,
                actor_id: req.session.user.id,
                type: "comment",
                is_read: false,
                created_at: now
            });

            await NotificationComment.create({
                notification_id: notification.id,
                comment_id: comment.id
            });
        }

        return res.redirect(`/posts/${post.id}`);
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    create
};
