const { Post, Comment, Notification, NotificationComment } = require("../models");

const parsePostId = (value) => {
    const parsedId = Number.parseInt(value, 10);
    return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;
};

const buildRedirectPath = (req, postId) => {
    const redirectTo = req.body.redirect_to ? req.body.redirect_to.trim() : "";

    if (redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
        return redirectTo;
    }

    const referer = req.get("referer");

    if (referer && (referer.includes("/posts") || referer.includes("/search"))) {
        return referer;
    }

    return `/posts/${postId}`;
};

const wantsJson = (req) => {
    const acceptHeader = req.get("accept") || "";
    const requestedWith = req.get("x-requested-with") || "";

    return req.xhr
        || requestedWith.toLowerCase() === "xmlhttprequest"
        || acceptHeader.includes("application/json");
};

const create = async (req, res, next) => {
    const content = req.body.content ? req.body.content.trim() : "";

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

        if (!content) {
            return res.redirect(buildRedirectPath(req, post.id));
        }

        const now = new Date();

        const comment = await Comment.create({
            post_id: post.id,
            user_id: req.currentUser.id,
            content,
            status: "active"
            ,
            created_at: now,
            updated_at: now
        });

        if (post.user_id !== req.currentUser.id) {
            const notification = await Notification.create({
                user_id: post.user_id,
                actor_id: req.currentUser.id,
                type: "comment",
                is_read: false,
                created_at: now
            });

            await NotificationComment.create({
                notification_id: notification.id,
                comment_id: comment.id
            });
        }

        return res.redirect(buildRedirectPath(req, post.id));
    } catch (error) {
        return next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        const postId = parsePostId(req.params.id);
        const commentId = Number.parseInt(req.params.commentId, 10);

        if (!postId || !Number.isInteger(commentId) || commentId <= 0) {
            return res.status(404).render("posts/show", {
                title: "PublicaciÃ³n no encontrada",
                post: null
            });
        }

        const post = await Post.findByPk(postId);

        if (!post) {
            return res.status(404).render("posts/show", {
                title: "PublicaciÃ³n no encontrada",
                post: null
            });
        }

        const comment = await Comment.findOne({
            where: {
                id: commentId,
                post_id: post.id
            }
        });

        if (!comment) {
            if (wantsJson(req)) {
                return res.status(404).json({
                    success: false,
                    message: "Comentario no encontrado."
                });
            }

            return res.redirect(buildRedirectPath(req, post.id));
        }

        const canDeleteComment = req.currentUser
            && (req.currentUser.id === comment.user_id || req.currentUser.id === post.user_id);

        if (!canDeleteComment) {
            const payload = {
                success: false,
                message: "No tienes permisos para eliminar este comentario."
            };

            if (wantsJson(req)) {
                return res.status(403).json(payload);
            }

            return res.status(403).json(payload);
        }

        const notificationLinks = await NotificationComment.findAll({
            where: {
                comment_id: comment.id
            },
            attributes: ["notification_id"]
        });
        const notificationIds = notificationLinks.map((link) => link.notification_id);

        await NotificationComment.destroy({
            where: {
                comment_id: comment.id
            }
        });

        if (notificationIds.length) {
            await Notification.destroy({
                where: {
                    id: notificationIds
                }
            });
        }

        await comment.destroy();

        if (wantsJson(req)) {
            const remainingComments = await Comment.count({
                where: {
                    post_id: post.id
                }
            });

            return res.status(200).json({
                success: true,
                postId: post.id,
                commentId: comment.id,
                remainingComments
            });
        }

        return res.redirect(buildRedirectPath(req, post.id));
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    create,
    remove
};
