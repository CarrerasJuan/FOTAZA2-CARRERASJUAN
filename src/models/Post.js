const { DataTypes, Model } = require("sequelize");

class Post extends Model {}

const initializePost = (sequelize) => {
    Post.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            title: {
                type: DataTypes.STRING(120),
                allowNull: false
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            comments_enabled: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            status: {
                type: DataTypes.STRING(20),
                allowNull: false,
                defaultValue: "active"
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false
            }
        },
        {
            sequelize,
            modelName: "Post",
            tableName: "posts",
            defaultScope: {
                where: {
                    status: "active"
                }
            },
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at"
        }
    );

    return Post;
};

module.exports = {
    Post,
    initializePost
};
