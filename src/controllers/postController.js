const { Op } = require("sequelize");
const {
    Post,
    User,
    Media,
    Comment,
    Rating,
    Report,
    Collection,
    Interest,
    Tag,
    PostTag,
    Follow,
    CollectionItem,
    Notification,
    NotificationComment,
    NotificationRating,
    NotificationReport,
    NotificationInterest,
    sequelize
} = require("../models");
const { applyMediaVisibilityToPost, applyMediaVisibilityToPosts } = require("../utils/mediaVisibility");
const {
    isSupabaseStorageConfigured,
    uploadPostImage: uploadPostImageToStorage,
    removePostImage
} = require("../services/mediaStorageService");
const postWriteController = require("./postWriteController");

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

const syncPostTags = async (postId, rawTags, transaction = null) => {
    const tagNames = normalizeTagNames(rawTags);

    await PostTag.destroy({
        where: {
            post_id: postId
        },
        transaction
    });

    for (const tagName of tagNames) {
        let tag = await Tag.findOne({
            where: {
                name: {
                    [Op.iLike]: tagName
                }
            },
            transaction
        });

        if (!tag) {
            tag = await Tag.create({
                name: tagName,
                created_at: new Date()
            }, { transaction });
        }

        await PostTag.findOrCreate({
            where: {
                post_id: postId,
                tag_id: tag.id
            },
            defaults: {
                post_id: postId,
                tag_id: tag.id
            },
            transaction
        });
    }
};

const hasInvalidTagLength = (rawTags) => normalizeTagNames(rawTags).some((tag) => tag.length > 50);

const ACTIVE_REPORT_STATUSES = ["pending", "active"];
const DEFAULT_MEDIA_LICENSE = "standard";
const MAX_MEDIA_LICENSE_LENGTH = 30;
const MAX_WATERMARK_LENGTH = 100;
const PRESET_MEDIA_LICENSES = new Set(["standard", "copyright", "cc-by", "cc-by-nc", "public-domain"]);

const normalizeMediaLicense = (licenseOption, customLicense) => {
    const trimmedCustomLicense = customLicense ? customLicense.trim() : "";
    const trimmedLicenseOption = licenseOption ? licenseOption.trim() : "";

    if (trimmedCustomLicense) {
        return trimmedCustomLicense;
    }

    return trimmedLicenseOption || DEFAULT_MEDIA_LICENSE;
};

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

const deletePostDependencies = async (postId) => {
    const comments = await Comment.findAll({
        where: {
            post_id: postId
        },
        attributes: ["id"]
    });
    const commentIds = comments.map((comment) => comment.id);

    if (commentIds.length) {
        const notificationCommentRows = await NotificationComment.findAll({
            where: {
                comment_id: {
                    [Op.in]: commentIds
                }
            },
            attributes: ["notification_id"]
        });
        const notificationIds = notificationCommentRows.map((row) => row.notification_id);

        await NotificationComment.destroy({
            where: {
                comment_id: {
                    [Op.in]: commentIds
                }
            }
        });

        if (notificationIds.length) {
            await Notification.destroy({
                where: {
                    id: {
                        [Op.in]: notificationIds
                    }
                }
            });
        }

        await Comment.destroy({
            where: {
                id: {
                    [Op.in]: commentIds
                }
            }
        });
    }

    const ratings = await Rating.findAll({
        where: {
            post_id: postId
        },
        attributes: ["id"]
    });
    const ratingIds = ratings.map((rating) => rating.id);

    if (ratingIds.length) {
        const notificationRatingRows = await NotificationRating.findAll({
            where: {
                rating_id: {
                    [Op.in]: ratingIds
                }
            },
            attributes: ["notification_id"]
        });
        const notificationIds = notificationRatingRows.map((row) => row.notification_id);

        await NotificationRating.destroy({
            where: {
                rating_id: {
                    [Op.in]: ratingIds
                }
            }
        });

        if (notificationIds.length) {
            await Notification.destroy({
                where: {
                    id: {
                        [Op.in]: notificationIds
                    }
                }
            });
        }

        await Rating.destroy({
            where: {
                id: {
                    [Op.in]: ratingIds
                }
            }
        });
    }

    const reports = await Report.findAll({
        where: {
            post_id: postId
        },
        attributes: ["id"]
    });
    const reportIds = reports.map((report) => report.id);

    if (reportIds.length) {
        const notificationReportRows = await NotificationReport.findAll({
            where: {
                report_id: {
                    [Op.in]: reportIds
                }
            },
            attributes: ["notification_id"]
        });
        const notificationIds = notificationReportRows.map((row) => row.notification_id);

        await NotificationReport.destroy({
            where: {
                report_id: {
                    [Op.in]: reportIds
                }
            }
        });

        if (notificationIds.length) {
            await Notification.destroy({
                where: {
                    id: {
                        [Op.in]: notificationIds
                    }
                }
            });
        }

        await Report.destroy({
            where: {
                id: {
                    [Op.in]: reportIds
                }
            }
        });
    }

    const interests = await Interest.findAll({
        where: {
            post_id: postId
        },
        attributes: ["id"]
    });
    const interestIds = interests.map((interest) => interest.id);

    if (interestIds.length) {
        const notificationInterestRows = await NotificationInterest.findAll({
            where: {
                interest_id: {
                    [Op.in]: interestIds
                }
            },
            attributes: ["notification_id"]
        });
        const notificationIds = notificationInterestRows.map((row) => row.notification_id);

        await NotificationInterest.destroy({
            where: {
                interest_id: {
                    [Op.in]: interestIds
                }
            }
        });

        if (notificationIds.length) {
            await Notification.destroy({
                where: {
                    id: {
                        [Op.in]: notificationIds
                    }
                }
            });
        }

        await Interest.destroy({
            where: {
                id: {
                    [Op.in]: interestIds
                }
            }
        });
    }

    await CollectionItem.destroy({
        where: {
            post_id: postId
        }
    });

    await PostTag.destroy({
        where: {
            post_id: postId
        }
    });

    await Media.destroy({
        where: {
            post_id: postId
        }
    });
};

const buildEditValues = (post, overrides = {}) => {
    const currentMedia = post.media && post.media.length ? post.media[0] : null;
    const currentLicense = currentMedia ? currentMedia.license : "";
    const usesPresetLicense = PRESET_MEDIA_LICENSES.has(currentLicense);

    return {
        title: overrides.title ?? post.title,
        description: overrides.description ?? (post.description || ""),
        comments_enabled: overrides.comments_enabled ?? post.comments_enabled,
        media_url: overrides.media_url ?? (currentMedia ? currentMedia.url : ""),
        license_option: overrides.license_option ?? (usesPresetLicense ? currentLicense : DEFAULT_MEDIA_LICENSE),
        license_custom: overrides.license_custom ?? (currentMedia && !usesPresetLicense ? currentLicense : ""),
        watermark_text: overrides.watermark_text ?? (currentMedia ? (currentMedia.watermark_text || "") : ""),
        tags: overrides.tags ?? (post.tags && post.tags.length ? post.tags.map((tag) => tag.name).join(", ") : "")
    };
};

const buildCreateValues = (overrides = {}) => {
    return {
        title: overrides.title ?? "",
        description: overrides.description ?? "",
        comments_enabled: overrides.comments_enabled ?? true,
        media_url: overrides.media_url ?? "",
        license_option: overrides.license_option ?? DEFAULT_MEDIA_LICENSE,
        license_custom: overrides.license_custom ?? "",
        watermark_text: overrides.watermark_text ?? "",
        tags: overrides.tags ?? ""
    };
};

const buildPostFormValuesFromRequest = (req) => {
    return {
        title: req.body.title ? req.body.title.trim() : "",
        description: req.body.description ? req.body.description.trim() : "",
        media_url: req.body.media_url ? req.body.media_url.trim() : "",
        license_option: req.body.license_option ? req.body.license_option.trim() : DEFAULT_MEDIA_LICENSE,
        license_custom: req.body.license_custom ? req.body.license_custom.trim() : "",
        watermark_text: req.body.watermark_text ? req.body.watermark_text.trim() : "",
        tags: req.body.tags ? req.body.tags.trim() : "",
        comments_enabled: req.body.comments_enabled === "on"
    };
};

const renderCreateFormWithError = (res, error, values, statusCode = 400) => {
    return res.status(statusCode).render("posts/create", {
        title: "Crear publicación",
        error,
        values: buildCreateValues(values)
    });
};

const resolveMediaSource = async (req) => {
    if (req.file) {
        if (!isSupabaseStorageConfigured()) {
            throw new Error("La subida de imágenes requiere configurar Supabase Storage en el servidor.");
        }

        return uploadPostImageToStorage({
            file: req.file,
            userId: req.currentUser.id
        });
    }

    const manualUrl = req.body.media_url ? req.body.media_url.trim() : "";

    return {
        publicUrl: manualUrl || null,
        storagePath: null
    };
};

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
        model: Comment,
        as: "comments",
        attributes: ["id", "user_id", "content", "created_at"],
        include: [
            {
                model: User,
                as: "user",
                attributes: ["id", "username", "avatar_url"]
            }
        ]
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
            order: [
                ["created_at", "DESC"],
                [{ model: Comment, as: "comments" }, "created_at", "DESC"]
            ]
        });
        const visiblePosts = applyMediaVisibilityToPosts(posts, Boolean(req.currentUser));

        return res.status(200).render("posts/index", {
            title: "Publicaciones",
            posts: visiblePosts,
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
            ? (ratings.reduce((sum, rating) => sum + Number(rating.points), 0) / totalRatings)
            : null;
        const currentUserRating = req.currentUser
            ? ratings.find((rating) => rating.user_id === req.currentUser.id) || null
            : null;
        const totalReports = post.reports ? post.reports.length : 0;
        const hasActiveReports = post.reports
            ? post.reports.some((report) => ACTIVE_REPORT_STATUSES.includes(report.status))
            : false;
        const currentUserOwnsPost = Boolean(req.currentUser && post.user_id === req.currentUser.id);
        const currentUserCanRate = Boolean(req.currentUser && !currentUserOwnsPost && !currentUserRating);
        const currentUserCanReport = Boolean(
            req.currentUser
            && !currentUserOwnsPost
            && !(post.reports || []).some((report) => report.reporter_id === req.currentUser.id && ACTIVE_REPORT_STATUSES.includes(report.status))
        );

        const userCollections = req.currentUser
            ? await Collection.findAll({
                where: {
                    user_id: req.currentUser.id
                },
                attributes: ["id", "name"],
                order: [["name", "ASC"]]
            })
            : [];

        const currentUserInterest = req.currentUser
            ? await Interest.findOne({
                where: {
                    user_id: req.currentUser.id,
                    post_id: post.id
                }
            })
            : null;
        applyMediaVisibilityToPost(post, Boolean(req.currentUser));

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
        values: buildCreateValues()
    });
};

const followingFeed = async (req, res, next) => {
    try {
        const followedUsers = await Follow.findAll({
            where: {
                follower_id: req.currentUser.id
            },
            attributes: ["following_id"]
        });

        const followedUserIds = followedUsers
            .map((follow) => follow.following_id)
            .filter((userId) => userId !== req.currentUser.id);

        const posts = followedUserIds.length
            ? await Post.findAll({
                where: {
                    user_id: {
                        [Op.in]: followedUserIds
                    }
                },
                include: postFeedInclude,
                order: [
                    ["created_at", "DESC"],
                    [{ model: Comment, as: "comments" }, "created_at", "DESC"]
                ]
            })
            : [];
        const visiblePosts = applyMediaVisibilityToPosts(posts, Boolean(req.currentUser));

        return res.status(200).render("posts/index", {
            title: "Publicaciones de seguidos",
            posts: visiblePosts,
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
    const values = buildPostFormValuesFromRequest(req);
    const license = normalizeMediaLicense(values.license_option, values.license_custom);
    const hasMediaSource = Boolean(values.media_url || req.file);
    let uploadedMedia = null;
    let transaction = null;

    try {
        if (req.fileUploadErrorMessage) {
            return renderCreateFormWithError(res, req.fileUploadErrorMessage, values);
        }

        if (!values.title) {
            return res.status(400).render("posts/create", {
                title: "Crear publicación",
                error: "El título es obligatorio.",
                values: {
                    title,
                    description,
                    comments_enabled: comments_enabled === "on",
                    media_url,
                    license_option,
                    license_custom,
                    watermark_text,
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
                    license_option,
                    license_custom,
                    watermark_text,
                    tags
                }
            });
        }

        if (media_url && license.length > MAX_MEDIA_LICENSE_LENGTH) {
            return res.status(400).render("posts/create", {
                title: "Crear publicación",
                error: "La licencia no puede superar los 30 caracteres.",
                values: {
                    title,
                    description,
                    comments_enabled: comments_enabled === "on",
                    media_url,
                    license_option,
                    license_custom,
                    watermark_text,
                    tags
                }
            });
        }

        if (media_url && watermark_text.length > MAX_WATERMARK_LENGTH) {
            return res.status(400).render("posts/create", {
                title: "Crear publicación",
                error: "La marca de agua no puede superar los 100 caracteres.",
                values: {
                    title,
                    description,
                    comments_enabled: comments_enabled === "on",
                    media_url,
                    license_option,
                    license_custom,
                    watermark_text,
                    tags
                }
            });
        }

        const now = new Date();

        const post = await Post.create({
            user_id: req.currentUser.id,
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
                license,
                watermark_text: watermark_text || null,
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
                license_option,
                license_custom,
                watermark_text,
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

        if (post.user_id !== req.currentUser.id) {
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
    const license_option = req.body.license_option ? req.body.license_option.trim() : DEFAULT_MEDIA_LICENSE;
    const license_custom = req.body.license_custom ? req.body.license_custom.trim() : "";
    const license = normalizeMediaLicense(license_option, license_custom);
    const watermark_text = req.body.watermark_text ? req.body.watermark_text.trim() : "";
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

        if (post.user_id !== req.currentUser.id) {
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
                    license_option,
                    license_custom,
                    watermark_text,
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
                    license_option,
                    license_custom,
                    watermark_text,
                    tags
                })
            });
        }

        if (media_url && license.length > MAX_MEDIA_LICENSE_LENGTH) {
            return res.status(400).render("posts/edit", {
                title: "Editar publicación",
                error: "La licencia no puede superar los 30 caracteres.",
                post,
                values: buildEditValues(post, {
                    title,
                    description,
                    comments_enabled: comments_enabled === "on",
                    media_url,
                    license_option,
                    license_custom,
                    watermark_text,
                    tags
                })
            });
        }

        if (media_url && watermark_text.length > MAX_WATERMARK_LENGTH) {
            return res.status(400).render("posts/edit", {
                title: "Editar publicación",
                error: "La marca de agua no puede superar los 100 caracteres.",
                post,
                values: buildEditValues(post, {
                    title,
                    description,
                    comments_enabled: comments_enabled === "on",
                    media_url,
                    license_option,
                    license_custom,
                    watermark_text,
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
                    url: trimmedMediaUrl,
                    license,
                    watermark_text: watermark_text || null
                });
            } else {
                const now = new Date();
                await Media.create({
                    post_id: post.id,
                    type: "image",
                    url: trimmedMediaUrl,
                    license,
                    watermark_text: watermark_text || null,
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
                license_option,
                license_custom,
                watermark_text,
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

        if (post.user_id !== req.currentUser.id) {
            return res.status(403).json({
                message: "No tienes permisos para eliminar esta publicación."
            });
        }

        await deletePostDependencies(post.id);
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
                ...postFeedInclude.slice(0, 4),
                {
                    ...postFeedInclude[4],
                    where: {
                        id: tag.id
                    }
                }
            ],
            order: [
                ["created_at", "DESC"],
                [{ model: Comment, as: "comments" }, "created_at", "DESC"]
            ]
        });
        const visiblePosts = applyMediaVisibilityToPosts(posts, Boolean(req.currentUser));

        return res.status(200).render("posts/index", {
            title: `Publicaciones con tag: ${tag.name}`,
            posts: visiblePosts,
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
    create: postWriteController.create,
    showEditForm,
    update: postWriteController.update,
    remove,
    showByTag
};
