const { Op } = require("sequelize");
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
            return res.redirect(`/posts/${post.id}?error=${encodeURIComponent("Debes indicar un motivo para la denuncia.")}`);
        }

        if (post.user_id === req.currentUser.id) {
            return res.redirect(`/posts/${post.id}?error=${encodeURIComponent("No puedes denunciar tu propia publicación.")}`);
        }

        const existingReport = await Report.findOne({
            where: {
                reporter_id: req.currentUser.id,
                post_id: post.id,
                status: {
                    [Op.in]: ["pending", "active"]
                }
            }
        });

        if (existingReport) {
            return res.redirect(`/posts/${post.id}?error=${encodeURIComponent("Ya denunciaste esta publicación.")}`);
        }

        const now = new Date();
        const report = await Report.create({
            reporter_id: req.currentUser.id,
            reported_user_id: post.user_id,
            post_id: post.id,
            comment_id: null,
            reason,
            description: description || null,
            status: "pending",
            created_at: now,
            updated_at: now
        });

        const notification = await Notification.create({
            user_id: post.user_id,
            actor_id: req.currentUser.id,
            type: "report",
            is_read: false,
            created_at: now
        });

        await NotificationReport.create({
            notification_id: notification.id,
            report_id: report.id
        });

        return res.redirect(`/posts/${post.id}`);
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            return res.redirect(`/posts/${postId}?error=${encodeURIComponent("Ya denunciaste esta publicación.")}`);
        }

        return next(error);
    }
};

module.exports = {
    reportPost
};
