const { User, Post, Media, Tag } = require("../models");
const { Op } = require("sequelize");

const index = async (req, res, next) => {
    const query = req.query.q ? req.query.q.trim() : "";

    try {
        let users = [];
        let posts = [];

        if (query) {
            users = await User.findAll({
                where: {
                    [Op.or]: [
                        { username: { [Op.iLike]: `%${query}%` } },
                        { email: { [Op.iLike]: `%${query}%` } }
                    ]
                },
                attributes: ["id", "username", "email", "avatar_url"]
            });

            posts = await Post.findAll({
                where: {
                    [Op.or]: [
                        { title: { [Op.iLike]: `%${query}%` } },
                        { description: { [Op.iLike]: `%${query}%` } }
                    ]
                },
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
                    },
                    {
                        model: Tag,
                        as: "tags",
                        attributes: ["id", "name"],
                        through: {
                            attributes: []
                        },
                        required: false
                    }
                ],
                order: [["created_at", "DESC"]]
            });
        }

        return res.status(200).render("search/index", {
            title: "Búsqueda",
            query,
            users,
            posts
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    index
};
