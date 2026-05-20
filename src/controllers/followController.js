const { Follow, User, Notification, NotificationFollow } = require("../models");

const parseUserId = (value) => {
    const parsedId = Number.parseInt(value, 10);
    return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;
};

const followUser = async (req, res, next) => {
    try {
        const targetUserId = parseUserId(req.params.id);

        if (!targetUserId) {
            return res.status(404).render("users/show", {
                title: "Usuario no encontrado",
                profileUser: null
            });
        }

        if (targetUserId === req.session.user.id) {
            return res.redirect(`/users/${targetUserId}`);
        }

        const targetUser = await User.findByPk(targetUserId);

        if (!targetUser) {
            return res.status(404).render("users/show", {
                title: "Usuario no encontrado",
                profileUser: null
            });
        }

        const [follow, created] = await Follow.findOrCreate({
            where: {
                follower_id: req.session.user.id,
                following_id: targetUserId
            },
            defaults: {
                follower_id: req.session.user.id,
                following_id: targetUserId,
                created_at: new Date()
            }
        });

        if (created) {
            const now = new Date();
            const notification = await Notification.create({
                user_id: targetUserId,
                actor_id: req.session.user.id,
                type: "follow",
                is_read: false,
                created_at: now
            });

            await NotificationFollow.create({
                notification_id: notification.id,
                follower_id: follow.follower_id
            });
        }

        return res.redirect(`/users/${targetUserId}`);
    } catch (error) {
        return next(error);
    }
};

const unfollowUser = async (req, res, next) => {
    try {
        const targetUserId = parseUserId(req.params.id);

        if (!targetUserId) {
            return res.status(404).render("users/show", {
                title: "Usuario no encontrado",
                profileUser: null
            });
        }

        await Follow.destroy({
            where: {
                follower_id: req.session.user.id,
                following_id: targetUserId
            }
        });

        return res.redirect(`/users/${targetUserId}`);
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    followUser,
    unfollowUser
};
