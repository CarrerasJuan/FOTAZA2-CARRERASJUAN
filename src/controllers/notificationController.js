const {
    Notification,
    NotificationComment,
    NotificationRating,
    NotificationFollow,
    NotificationInterest,
    NotificationReport,
    Comment,
    Rating,
    Report,
    User,
    Interest,
    Post
} = require("../models");

const parseNotificationId = (value) => {
    const parsedId = Number.parseInt(value, 10);
    return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;
};

const index = async (req, res, next) => {
    try {
        const notifications = await Notification.findAll({
            where: {
                user_id: req.session.user.id
            },
            include: [
                {
                    model: User,
                    as: "actor",
                    attributes: ["id", "username", "avatar_url"]
                },
                {
                    model: NotificationComment,
                    as: "notificationComment",
                    include: [
                        {
                            model: Comment,
                            as: "comment",
                            attributes: ["id", "post_id", "content"]
                        }
                    ]
                },
                {
                    model: NotificationRating,
                    as: "notificationRating",
                    include: [
                        {
                            model: Rating,
                            as: "rating",
                            attributes: ["id", "post_id", "points"]
                        }
                    ]
                },
                {
                    model: NotificationFollow,
                    as: "notificationFollow",
                    include: [
                        {
                            model: User,
                            as: "follower",
                            attributes: ["id", "username"]
                        }
                    ]
                },
                {
                    model: NotificationInterest,
                    as: "notificationInterest",
                    include: [
                        {
                            model: Interest,
                            as: "interest",
                            attributes: ["id", "post_id", "created_at"],
                            include: [
                                {
                                    model: Post,
                                    as: "post",
                                    attributes: ["id", "title", "user_id"]
                                }
                            ]
                        }
                    ]
                },
                {
                    model: NotificationReport,
                    as: "notificationReport",
                    include: [
                        {
                            model: Report,
                            as: "report",
                            attributes: ["id", "post_id", "reason", "status"]
                        }
                    ]
                }
            ],
            order: [["created_at", "DESC"]]
        });

        return res.status(200).render("notifications/index", {
            title: "Notificaciones",
            notifications
        });
    } catch (error) {
        return next(error);
    }
};

const markAsRead = async (req, res, next) => {
    try {
        const notificationId = parseNotificationId(req.params.id);

        if (!notificationId) {
            return res.status(404).json({
                message: "Notificación no encontrada."
            });
        }

        const notification = await Notification.findOne({
            where: {
                id: notificationId,
                user_id: req.session.user.id
            }
        });

        if (!notification) {
            return res.status(404).json({
                message: "Notificación no encontrada."
            });
        }

        await notification.update({
            is_read: true
        });

        return res.redirect("/notifications");
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    index,
    markAsRead
};
