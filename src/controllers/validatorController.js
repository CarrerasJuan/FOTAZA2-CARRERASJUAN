const { Op, fn, literal } = require("sequelize");
const { Post, User, Report } = require("../models");

const ACTIVE_REPORT_STATUSES = ["pending", "active"];
const REMOVED_POST_STATUS = "removed";
const INACTIVE_USER_STATUS = "inactive";

const getDashboardData = async () => {
    const flaggedRows = await Report.findAll({
        attributes: [
            "post_id",
            [fn("COUNT", literal("DISTINCT \"Report\".\"reporter_id\"")), "distinctReporters"]
        ],
        where: {
            post_id: {
                [Op.ne]: null
            },
            status: {
                [Op.in]: ACTIVE_REPORT_STATUSES
            }
        },
        group: ["post_id"],
        having: literal('COUNT(DISTINCT "Report"."reporter_id") > 3'),
        order: [[literal('"distinctReporters"'), "DESC"], ["post_id", "ASC"]],
        raw: true
    });

    if (!flaggedRows.length) {
        return [];
    }

    const flaggedPostIds = flaggedRows.map((row) => row.post_id);
    const posts = await Post.unscoped().findAll({
        where: {
            id: {
                [Op.in]: flaggedPostIds
            },
            status: {
                [Op.ne]: REMOVED_POST_STATUS
            }
        },
        include: [
            {
                model: User,
                as: "user",
                attributes: ["id", "username", "status"]
            },
            {
                model: Report,
                as: "reports",
                attributes: ["id", "reason", "status", "reporter_id", "created_at"],
                where: {
                    status: {
                        [Op.in]: ACTIVE_REPORT_STATUSES
                    }
                },
                required: false
            }
        ]
    });

    const distinctReportersByPostId = new Map(
        flaggedRows.map((row) => [row.post_id, Number(row.distinctReporters) || 0])
    );

    return posts.map((post) => {
        const reasonMap = new Map();

        for (const report of post.reports || []) {
            const reason = report.reason || "Sin motivo";
            reasonMap.set(reason, (reasonMap.get(reason) || 0) + 1);
        }

        const topReasons = Array.from(reasonMap.entries())
            .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
            .slice(0, 3)
            .map(([reason, count]) => ({
                reason,
                count
            }));

        return {
            id: post.id,
            title: post.title,
            status: post.status,
            author: post.user,
            distinctReporters: distinctReportersByPostId.get(post.id) || 0,
            topReasons
        };
    }).sort((left, right) => right.distinctReporters - left.distinctReporters || left.id - right.id);
};

const index = async (req, res, next) => {
    try {
        const flaggedPosts = await getDashboardData();

        return res.status(200).render("validator/index", {
            title: "Panel de validación",
            flaggedPosts,
            feedbackMessage: req.query.message || null
        });
    } catch (error) {
        return next(error);
    }
};

const dismissReports = async (req, res, next) => {
    const postId = Number.parseInt(req.params.postId, 10);

    try {
        if (!Number.isInteger(postId) || postId <= 0) {
            return res.redirect(`/validator?message=${encodeURIComponent("La publicación indicada no es válida.")}`);
        }

        const [updatedReports] = await Report.update(
            {
                status: "dismissed",
                updated_at: new Date()
            },
            {
                where: {
                    post_id: postId,
                    status: {
                        [Op.in]: ACTIVE_REPORT_STATUSES
                    }
                }
            }
        );

        if (!updatedReports) {
            return res.redirect(`/validator?message=${encodeURIComponent("No había denuncias activas para desestimar en esa publicación.")}`);
        }

        return res.redirect(`/validator?message=${encodeURIComponent("Las denuncias activas de la publicación fueron desestimadas.")}`);
    } catch (error) {
        return next(error);
    }
};

const deactivatePost = async (req, res, next) => {
    const postId = Number.parseInt(req.params.postId, 10);

    try {
        if (!Number.isInteger(postId) || postId <= 0) {
            return res.redirect(`/validator?message=${encodeURIComponent("La publicación indicada no es válida.")}`);
        }

        const post = await Post.unscoped().findByPk(postId, {
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "username", "status"]
                },
                {
                    model: Report,
                    as: "reports",
                    attributes: ["id", "status", "reporter_id"],
                    where: {
                        status: {
                            [Op.in]: ACTIVE_REPORT_STATUSES
                        }
                    },
                    required: false
                }
            ]
        });

        if (!post) {
            return res.redirect(`/validator?message=${encodeURIComponent("La publicación indicada no existe.")}`);
        }

        if (post.status === REMOVED_POST_STATUS) {
            return res.redirect(`/validator?message=${encodeURIComponent("La publicación ya estaba dada de baja.")}`);
        }

        const distinctReporters = new Set((post.reports || []).map((report) => report.reporter_id)).size;

        if (distinctReporters <= 3) {
            return res.redirect(`/validator?message=${encodeURIComponent("La publicación todavía no supera el umbral de más de 3 denunciantes distintos.")}`);
        }

        await post.update({
            status: REMOVED_POST_STATUS,
            updated_at: new Date()
        });

        const removedPostsCount = await Post.unscoped().count({
            where: {
                user_id: post.user_id,
                status: REMOVED_POST_STATUS
            }
        });

        let feedbackMessage = "La publicación fue dada de baja correctamente.";

        if (removedPostsCount >= 3 && post.user && post.user.status !== INACTIVE_USER_STATUS) {
            await post.user.update({
                status: INACTIVE_USER_STATUS,
                updated_at: new Date()
            });

            feedbackMessage = "La publicación fue dada de baja y el autor quedó inactivo por acumular 3 bajas.";
        }

        return res.redirect(`/validator?message=${encodeURIComponent(feedbackMessage)}`);
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    index,
    dismissReports,
    deactivatePost
};
