const { Post, User, Media, Comment, Rating, Report, Collection } = require("../models");

const parsePostId = (value) => {
    const parsedId = Number.parseInt(value, 10);
    return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;
};

const index = async (req, res, next) => {
    try {
        const posts = await Post.findAll({
            include: [
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
                }
            ],
            order: [["created_at", "DESC"]]
        });

        return res.status(200).render("posts/index", {
            title: "Publicaciones",
            posts
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

        const userCollections = req.session?.user
            ? await Collection.findAll({
                where: {
                    user_id: req.session.user.id
                },
                attributes: ["id", "name"],
                order: [["name", "ASC"]]
            })
            : [];

        return res.status(200).render("posts/show", {
            title: post.title,
            post,
            ratingSummary: {
                total: totalRatings,
                average: ratingAverage,
                currentUserRating
            },
            totalReports,
            userCollections
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
            media_url: ""
        }
    });
};

const create = async (req, res, next) => {
    const { title, description, comments_enabled, media_url } = req.body;

    try {
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

        return res.redirect(`/posts/${post.id}`);
    } catch (error) {
        return res.status(400).render("posts/create", {
            title: "Crear publicación",
            error: "No se pudo crear la publicación. Verificá los datos ingresados.",
            values: {
                title,
                description,
                comments_enabled: comments_enabled === "on",
                media_url
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

        return res.status(200).render("posts/edit", {
            title: "Editar publicación",
            error: null,
            post,
        values: {
            title: post.title,
            description: post.description || "",
            comments_enabled: post.comments_enabled,
            media_url: post.media && post.media.length ? post.media[0].url : ""
        }
    });
    } catch (error) {
        return next(error);
    }
};

const update = async (req, res, next) => {
    const { title, description, comments_enabled, media_url } = req.body;

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

        await post.update({
            title,
            description: description || null,
            comments_enabled: comments_enabled === "on"
        });

        const currentMedia = post.media && post.media.length ? post.media[0] : null;
        const trimmedMediaUrl = media_url ? media_url.trim() : "";

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
                media_url
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

module.exports = {
    index,
    show,
    showCreateForm,
    create,
    showEditForm,
    update,
    remove
};
