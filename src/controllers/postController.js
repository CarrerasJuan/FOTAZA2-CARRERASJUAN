const { Op } = require("sequelize");
const { Post, User, Media, Comment, Rating, Report, Collection, Interest, Tag, PostTag, Follow } = require("../models");

const parsePostId = (value) => {
    const parsedId = Number.parseInt(value, 10);
    return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;
};

const parseTagId = (value) => {
    const parsedId = Number.parseInt(value, 10);
    return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;
};

const normalizeTagNames = (rawTags) => {
    if (!rawTags) {
        return [];
    }

    const uniqueTags = new Map();

    rawTags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .forEach((tag) => {
            const normalizedKey = tag.toLowerCase();

            if (!uniqueTags.has(normalizedKey)) {
                uniqueTags.set(normalizedKey, tag);
            }
        });

    return Array.from(uniqueTags.values());
};

const syncPostTags = async (postId, rawTags) => {
    const tagNames = normalizeTagNames(rawTags);

    await PostTag.destroy({
        where: {
            post_id: postId
        }
    });

    for (const tagName of tagNames) {
        let tag = await Tag.findOne({
            where: {
                name: {
                    [Op.iLike]: tagName
                }
            }
        });

        if (!tag) {
            tag = await Tag.create({
                name: tagName,
                created_at: new Date()
            });
        }

        await PostTag.findOrCreate({
            where: {
                post_id: postId,
                tag_id: tag.id
            },
            defaults: {
                post_id: postId,
                tag_id: tag.id
            }
        });
    }
};

const hasInvalidTagLength = (rawTags) => normalizeTagNames(rawTags).some((tag) => tag.length > 50);

const ACTIVE_REPORT_STATUSES = ["pending", "active"];

const getActiveReportCount = async (postId) => {
    return Report.count({
        where: {
            post_id: postId,
            status: {
                [Op.in]: ACTIVE_REPORT_STATUSES
            }
        }
    });
};

const buildEditValues = (post, overrides = {}) => ({
    title: overrides.title ?? post.title,
    description: overrides.description ?? (post.description || ""),
    comments_enabled: overrides.comments_enabled ?? post.comments_enabled,
    media_url: overrides.media_url ?? (post.media && post.media.length ? post.media[0].url : ""),
    tags: overrides.tags ?? (post.tags && post.tags.length ? post.tags.map((tag) => tag.name).join(", ") : "")
});

const postFeedInclude = [
    {
        model: User,
        as: "user",
        attributes: ["id", "username", "avatar_url"]
    },
    {
        model: Media,
        as: "media",
        attributes: ["id", "type", "url", "license", "watermark_text", "created_at"]
    },
    {
        model: Rating,
        as: "ratings",
        attributes: ["id", "user_id", "points"]
    },
    {
        model: Tag,
        as: "tags",
        attributes: ["id", "name"],
        through: {
            attributes: []
        }
    }
];

const index = async (req, res, next) => {
    try {
        const posts = await Post.findAll({
            include: postFeedInclude,
            order: [["created_at", "DESC"]]
        });

        return res.status(200).render("posts/index", {
            title: "Publicaciones",
            posts,
            currentTag: null,
            feedDescription: "Explorá el contenido publicado por la comunidad, abrí detalles, seguí autores y navegá por tags.",
            emptyTitle: "Todavía no hay publicaciones",
            emptyMessage: "Cuando existan registros, el feed las mostrará acá con sus datos principales."
        });
    } catch (error) {
        return next(error);
    }
};

const show = async (req, res, next) => {
    try {
        const postId = parsePostId(req.params.id);

        if (!postId) {
            return res.status(404).render("posts/show", {
                title: "Publicación no encontrada",
                post: null
            });
        }

        const post = await Post.findByPk(postId, {
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "username", "avatar_url", "biography"]
                },
                {
                    model: Media,
                    as: "media",
                    attributes: ["id", "type", "url", "license", "watermark_text", "created_at"]
                },
                {
                    model: Comment,
                    as: "comments",
                    attributes: ["id", "user_id", "content", "status", "created_at", "updated_at"],
                    include: [
                        {
                            model: User,
                            as: "user",
                            attributes: ["id", "username", "avatar_url"]
                        }
                    ]
                },
                {
                    model: Rating,
                    as: "ratings",
                    attributes: ["id", "user_id", "points", "created_at"],
                    include: [
                        {
                            model: User,
                            as: "user",
                            attributes: ["id", "username", "avatar_url"]
                        }
                    ]
                },
                {
                    model: Report,
                    as: "reports",
                    attributes: ["id", "reporter_id", "reason", "status", "created_at"]
                },
                {
                    model: Tag,
                    as: "tags",
                    attributes: ["id", "name"],
                    through: {
                        attributes: []
                    }
                }
            ],
            order: [[{ model: Comment, as: "comments" }, "created_at", "ASC"]]
        });

        if (!post) {
            return res.status(404).render("posts/show", {
                title: "Publicación no encontrada",
                post: null
            });
        }

        const ratings = post.ratings || [];
        const totalRatings = ratings.length;
        const ratingAverage = totalRatings
            ? (ratings.reduce((sum, rating) => sum + rating.points, 0) / totalRatings).toFixed(1)
            : null;
        const currentUserRating = req.session?.user
            ? ratings.find((rating) => rating.user_id === req.session.user.id) || null
            : null;
        const totalReports = post.reports ? post.reports.length : 0;
        const hasActiveReports = post.reports
            ? post.reports.some((report) => ACTIVE_REPORT_STATUSES.includes(report.status))
            : false;
        const currentUserOwnsPost = Boolean(req.session?.user && post.user_id === req.session.user.id);
        const currentUserCanRate = Boolean(req.session?.user && !currentUserOwnsPost && !currentUserRating);
        const currentUserCanReport = Boolean(
            req.session?.user
            && !currentUserOwnsPost
            && !(post.reports || []).some((report) => report.reporter_id === req.session.user.id && ACTIVE_REPORT_STATUSES.includes(report.status))
        );

        const userCollections = req.session?.user
            ? await Collection.findAll({
                where: {
                    user_id: req.session.user.id
                },
                attributes: ["id", "name"],
                order: [["name", "ASC"]]
            })
            : [];

        const currentUserInterest = req.session?.user
            ? await Interest.findOne({
                where: {
                    user_id: req.session.user.id,
                    post_id: post.id
                }
            })
            : null;

        return res.status(200).render("posts/show", {
            title: post.title,
            post,
            ratingSummary: {
                total: totalRatings,
                average: ratingAverage,
                currentUserRating
            },
            totalReports,
            userCollections,
            currentUserInterest,
            formError: req.query.error || null,
            currentUserOwnsPost,
            currentUserCanRate,
            currentUserCanReport,
            isEditBlocked: currentUserOwnsPost && hasActiveReports
        });
    } catch (error) {
        return next(error);
    }
};

const showCreateForm = (req, res) => {
    return res.status(200).render("posts/create", {
        title: "Crear publicación",
        error: null,
        values: {
            title: "",
            description: "",
            comments_enabled: true,
            media_url: "",
            tags: ""
        }
    });
};

const followingFeed = async (req, res, next) => {
    try {
        const followedUsers = await Follow.findAll({
            where: {
                follower_id: req.session.user.id
            },
            attributes: ["following_id"]
        });

        const followedUserIds = followedUsers
            .map((follow) => follow.following_id)
            .filter((userId) => userId !== req.session.user.id);

        const posts = followedUserIds.length
            ? await Post.findAll({
                where: {
                    user_id: {
                        [Op.in]: followedUserIds
                    }
                },
                include: postFeedInclude,
                order: [["created_at", "DESC"]]
            })
            : [];

        return res.status(200).render("posts/index", {
            title: "Publicaciones de seguidos",
            posts,
            currentTag: null,
            feedDescription: "Revisá solo las publicaciones activas de los usuarios que seguís dentro de la comunidad.",
            emptyTitle: "Todavía no hay publicaciones de usuarios seguidos",
            emptyMessage: "Cuando las personas que seguís publiquen contenido activo, aparecerá en este feed."
        });
    } catch (error) {
        return next(error);
    }
};

const create = async (req, res, next) => {
    const title = req.body.title ? req.body.title.trim() : "";
    const description = req.body.description ? req.body.description.trim() : "";
    const media_url = req.body.media_url ? req.body.media_url.trim() : "";
    const tags = req.body.tags ? req.body.tags.trim() : "";
    const comments_enabled = req.body.comments_enabled;

    try {
        if (!title) {
            return res.status(400).render("posts/create", {
                title: "Crear publicación",
                error: "El título es obligatorio.",
                values: {
                    title,
                    description,
                    comments_enabled: comments_enabled === "on",
                    media_url,
                    tags
                }
            });
        }

        if (hasInvalidTagLength(tags)) {
            return res.status(400).render("posts/create", {
                title: "Crear publicación",
                error: "Cada tag debe tener como máximo 50 caracteres.",
                values: {
                    title,
                    description,
                    comments_enabled: comments_enabled === "on",
                    media_url,
                    tags
                }
            });
        }

        const now = new Date();

        const post = await Post.create({
            user_id: req.session.user.id,
            title,
            description: description || null,
            comments_enabled: comments_enabled === "on",
            status: "active",
            created_at: now,
            updated_at: now
        });

        if (media_url && media_url.trim()) {
            await Media.create({
                post_id: post.id,
                type: "image",
                url: media_url.trim(),
                license: "standard",
                watermark_text: null
                ,
                created_at: now
            });
        }

        await syncPostTags(post.id, tags);

        return res.redirect(`/posts/${post.id}`);
    } catch (error) {
        return res.status(400).render("posts/create", {
            title: "Crear publicación",
            error: "No se pudo crear la publicación. Verificá los datos ingresados.",
            values: {
                title,
                description,
                comments_enabled: comments_enabled === "on",
                media_url,
                tags
            }
        });
    }
};

const showEditForm = async (req, res, next) => {
    try {
        const postId = parsePostId(req.params.id);

        if (!postId) {
            return res.status(404).render("posts/show", {
                title: "Publicación no encontrada",
                post: null
            });
        }

        const post = await Post.findByPk(postId, {
            include: [
                {
                    model: Media,
                    as: "media"
                },
                {
                    model: Tag,
                    as: "tags",
                    attributes: ["id", "name"],
                    through: {
                        attributes: []
                    }
                }
            ]
        });

        if (!post) {
            return res.status(404).render("posts/show", {
                title: "Publicación no encontrada",
                post: null
            });
        }

        if (post.user_id !== req.session.user.id) {
            return res.status(403).json({
                message: "No tienes permisos para editar esta publicación."
            });
        }

        const activeReportCount = await getActiveReportCount(post.id);

        if (activeReportCount > 0) {
            return res.redirect(`/posts/${post.id}?error=${encodeURIComponent("No puedes editar esta publicación porque tiene denuncias activas.")}`);
        }

        return res.status(200).render("posts/edit", {
            title: "Editar publicación",
            error: null,
            post,
            values: buildEditValues(post)
        });
    } catch (error) {
        return next(error);
    }
};

const update = async (req, res, next) => {
    const title = req.body.title ? req.body.title.trim() : "";
    const description = req.body.description ? req.body.description.trim() : "";
    const media_url = req.body.media_url ? req.body.media_url.trim() : "";
    const tags = req.body.tags ? req.body.tags.trim() : "";
    const comments_enabled = req.body.comments_enabled;

    try {
        const postId = parsePostId(req.params.id);

        if (!postId) {
            return res.status(404).render("posts/show", {
                title: "Publicación no encontrada",
                post: null
            });
        }

        const post = await Post.findByPk(postId, {
            include: [
                {
                    model: Media,
                    as: "media"
                },
                {
                    model: Tag,
                    as: "tags",
                    attributes: ["id", "name"],
                    through: {
                        attributes: []
                    }
                }
            ]
        });

        if (!post) {
            return res.status(404).render("posts/show", {
                title: "Publicación no encontrada",
                post: null
            });
        }

        if (post.user_id !== req.session.user.id) {
            return res.status(403).json({
                message: "No tienes permisos para editar esta publicación."
            });
        }

        const activeReportCount = await getActiveReportCount(post.id);

        if (activeReportCount > 0) {
            return res.redirect(`/posts/${post.id}?error=${encodeURIComponent("No puedes editar esta publicación porque tiene denuncias activas.")}`);
        }

        if (!title) {
            return res.status(400).render("posts/edit", {
                title: "Editar publicación",
                error: "El título es obligatorio.",
                post,
                values: buildEditValues(post, {
                    title,
                    description,
                    comments_enabled: comments_enabled === "on",
                    media_url,
                    tags
                })
            });
        }

        if (hasInvalidTagLength(tags)) {
            return res.status(400).render("posts/edit", {
                title: "Editar publicación",
                error: "Cada tag debe tener como máximo 50 caracteres.",
                post,
                values: buildEditValues(post, {
                    title,
                    description,
                    comments_enabled: comments_enabled === "on",
                    media_url,
                    tags
                })
            });
        }

        await post.update({
            title,
            description: description || null,
            comments_enabled: comments_enabled === "on"
        });

        const currentMedia = post.media && post.media.length ? post.media[0] : null;
        const trimmedMediaUrl = media_url;

        if (trimmedMediaUrl) {
            if (currentMedia) {
                await currentMedia.update({
                    url: trimmedMediaUrl
                });
            } else {
                const now = new Date();
                await Media.create({
                    post_id: post.id,
                    type: "image",
                    url: trimmedMediaUrl,
                    license: "standard",
                    watermark_text: null,
                    created_at: now
                });
            }
        } else if (currentMedia) {
            await currentMedia.destroy();
        }

        await syncPostTags(post.id, tags);

        return res.redirect(`/posts/${post.id}`);
    } catch (error) {
        return res.status(400).render("posts/edit", {
            title: "Editar publicación",
            error: "No se pudo actualizar la publicación. Verificá los datos ingresados.",
            post: {
                id: req.params.id
            },
            values: {
                title,
                description,
                comments_enabled: comments_enabled === "on",
                media_url,
                tags
            }
        });
    }
};

const remove = async (req, res, next) => {
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

        if (post.user_id !== req.session.user.id) {
            return res.status(403).json({
                message: "No tienes permisos para eliminar esta publicación."
            });
        }

        await post.destroy();

        return res.redirect("/posts");
    } catch (error) {
        return next(error);
    }
};

const showByTag = async (req, res, next) => {
    try {
        const tagId = parseTagId(req.params.tagId);

        if (!tagId) {
            return res.status(404).render("posts/index", {
                title: "Tag no encontrado",
                posts: [],
                currentTag: null
            });
        }

        const tag = await Tag.findByPk(tagId, {
            attributes: ["id", "name"]
        });

        if (!tag) {
            return res.status(404).render("posts/index", {
                title: "Tag no encontrado",
                posts: [],
                currentTag: null
            });
        }

        const posts = await Post.findAll({
            include: [
                ...postFeedInclude.slice(0, 3),
                {
                    ...postFeedInclude[3],
                    where: {
                        id: tag.id
                    }
                }
            ],
            order: [["created_at", "DESC"]]
        });

        return res.status(200).render("posts/index", {
            title: `Publicaciones con tag: ${tag.name}`,
            posts,
            currentTag: tag,
            feedDescription: "Explorá el contenido publicado por la comunidad, abrí detalles, seguí autores y navegá por tags.",
            emptyTitle: "Todavía no hay publicaciones",
            emptyMessage: "Cuando existan registros, el feed las mostrará acá con sus datos principales."
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    index,
    show,
    showCreateForm,
    followingFeed,
    create,
    showEditForm,
    update,
    remove,
    showByTag
};
