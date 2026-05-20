const { Collection, CollectionItem, Post, Media, User } = require("../models");

const parseCollectionId = (value) => {
    const parsedId = Number.parseInt(value, 10);
    return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;
};

const parsePostId = (value) => {
    const parsedId = Number.parseInt(value, 10);
    return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;
};

const index = async (req, res, next) => {
    try {
        const collections = await Collection.findAll({
            where: {
                user_id: req.session.user.id
            },
            include: [
                {
                    model: CollectionItem,
                    as: "items",
                    attributes: ["collection_id", "post_id", "created_at"]
                }
            ],
            order: [["created_at", "DESC"]]
        });

        return res.status(200).render("collections/index", {
            title: "Mis colecciones",
            collections
        });
    } catch (error) {
        return next(error);
    }
};

const showCreateForm = (req, res) => {
    return res.status(200).render("collections/create", {
        title: "Crear colección",
        error: null,
        values: {
            name: ""
        }
    });
};

const create = async (req, res, next) => {
    const name = req.body.name ? req.body.name.trim() : "";

    try {
        if (!name) {
            return res.status(400).render("collections/create", {
                title: "Crear colección",
                error: "Debes ingresar un nombre para la colección.",
                values: {
                    name
                }
            });
        }

        const collection = await Collection.create({
            user_id: req.session.user.id,
            name
        });

        return res.redirect(`/collections/${collection.id}`);
    } catch (error) {
        return next(error);
    }
};

const show = async (req, res, next) => {
    try {
        const collectionId = parseCollectionId(req.params.id);

        if (!collectionId) {
            return res.status(404).render("collections/show", {
                title: "Colección no encontrada",
                collection: null
            });
        }

        const collection = await Collection.findByPk(collectionId, {
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "username"]
                },
                {
                    model: CollectionItem,
                    as: "items",
                    include: [
                        {
                            model: Post,
                            as: "post",
                            include: [
                                {
                                    model: User,
                                    as: "user",
                                    attributes: ["id", "username"]
                                },
                                {
                                    model: Media,
                                    as: "media",
                                    attributes: ["id", "type", "url"]
                                }
                            ]
                        }
                    ]
                }
            ],
            order: [[{ model: CollectionItem, as: "items" }, "created_at", "DESC"]]
        });

        if (!collection) {
            return res.status(404).render("collections/show", {
                title: "Colección no encontrada",
                collection: null
            });
        }

        if (collection.user_id !== req.session.user.id) {
            return res.status(403).json({
                message: "No tienes permisos para acceder a esta colección."
            });
        }

        return res.status(200).render("collections/show", {
            title: collection.name,
            collection
        });
    } catch (error) {
        return next(error);
    }
};

const addItem = async (req, res, next) => {
    try {
        const collectionId = parseCollectionId(req.params.id);
        const postId = parsePostId(req.body.post_id);

        if (!collectionId || !postId) {
            return res.status(404).render("collections/show", {
                title: "Colección no encontrada",
                collection: null
            });
        }

        const collection = await Collection.findByPk(collectionId);

        if (!collection) {
            return res.status(404).render("collections/show", {
                title: "Colección no encontrada",
                collection: null
            });
        }

        if (collection.user_id !== req.session.user.id) {
            return res.status(403).json({
                message: "No tienes permisos para modificar esta colección."
            });
        }

        const post = await Post.findByPk(postId);

        if (!post) {
            return res.status(404).render("posts/show", {
                title: "Publicación no encontrada",
                post: null
            });
        }

        await CollectionItem.findOrCreate({
            where: {
                collection_id: collection.id,
                post_id: post.id
            },
            defaults: {
                collection_id: collection.id,
                post_id: post.id,
                created_at: new Date()
            }
        });

        return res.redirect(`/collections/${collection.id}`);
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    index,
    showCreateForm,
    create,
    show,
    addItem
};
