const { Post, User, Media } = require("../models");

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
        const post = await Post.findByPk(req.params.id, {
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
                }
            ]
        });

        if (!post) {
            return res.status(404).render("posts/show", {
                title: "Publicación no encontrada",
                post: null
            });
        }

        return res.status(200).render("posts/show", {
            title: post.title,
            post
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
            comments_enabled: true
        }
    });
};

const create = async (req, res, next) => {
    const { title, description, comments_enabled } = req.body;

    try {
        const post = await Post.create({
            user_id: req.session.user.id,
            title,
            description: description || null,
            comments_enabled: comments_enabled === "on",
            status: "active"
        });

        return res.redirect(`/posts/${post.id}`);
    } catch (error) {
        return res.status(400).render("posts/create", {
            title: "Crear publicación",
            error: "No se pudo crear la publicación. Verificá los datos ingresados.",
            values: {
                title,
                description,
                comments_enabled: comments_enabled === "on"
            }
        });
    }
};

const showEditForm = async (req, res, next) => {
    try {
        const post = await Post.findByPk(req.params.id);

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
                comments_enabled: post.comments_enabled
            }
        });
    } catch (error) {
        return next(error);
    }
};

const update = async (req, res, next) => {
    const { title, description, comments_enabled } = req.body;

    try {
        const post = await Post.findByPk(req.params.id);

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
                comments_enabled: comments_enabled === "on"
            }
        });
    }
};

const remove = async (req, res, next) => {
    try {
        const post = await Post.findByPk(req.params.id);

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
