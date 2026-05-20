const { Post, Report, Notification, NotificationReport } = require("../models");

const parsePostId = (value) => {
    const parsedId = Number.parseInt(value, 10);
    return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;
};

const reportPost = async (req, res, next) => {
    const postId = parsePostId(req.params.id);
    const reason = req.body.reason ? req.body.reason.trim() : "";
    const description = req.body.description ? req.body.description.trim() : "";

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

        if (!reason) {
            return res.status(400).redirect(`/posts/${post.id}`);
        }

        const report = await Report.create({
            reporter_id: req.session.user.id,
            reported_user_id: post.user_id,
            post_id: post.id,
            comment_id: null,
            reason,
            description: description || null,
            status: "pending"
        });

        if (post.user_id && post.user_id !== req.session.user.id) {
            const notification = await Notification.create({
                user_id: post.user_id,
                actor_id: req.session.user.id,
                type: "report",
                is_read: false,
                created_at: new Date()
            });

            await NotificationReport.create({
                notification_id: notification.id,
                report_id: report.id
            });
        }

        return res.redirect(`/posts/${post.id}`);
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    reportPost
};
