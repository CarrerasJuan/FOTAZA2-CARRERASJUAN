const { sequelize } = require("../config/database");
const { User, initializeUser } = require("./User");
const { Post, initializePost } = require("./Post");
const { Media, initializeMedia } = require("./Media");
const { Comment, initializeComment } = require("./Comment");

const initializeModels = () => {
    if (!User.sequelize) {
        initializeUser(sequelize);
    }

    if (!Post.sequelize) {
        initializePost(sequelize);
    }

    if (!Media.sequelize) {
        initializeMedia(sequelize);
    }

    if (!Comment.sequelize) {
        initializeComment(sequelize);
    }

    User.hasMany(Post, {
        foreignKey: "user_id",
        as: "posts"
    });

    Post.belongsTo(User, {
        foreignKey: "user_id",
        as: "user"
    });

    Post.hasMany(Media, {
        foreignKey: "post_id",
        as: "media"
    });

    Media.belongsTo(Post, {
        foreignKey: "post_id",
        as: "post"
    });

    User.hasMany(Comment, {
        foreignKey: "user_id",
        as: "comments"
    });

    Comment.belongsTo(User, {
        foreignKey: "user_id",
        as: "user"
    });

    Post.hasMany(Comment, {
        foreignKey: "post_id",
        as: "comments"
    });

    Comment.belongsTo(Post, {
        foreignKey: "post_id",
        as: "post"
    });

    return {
        sequelize,
        User,
        Post,
        Media,
        Comment
    };
};

module.exports = initializeModels();
