const { DataTypes, Model } = require("sequelize");

class PostTag extends Model {}

const initializePostTag = (sequelize) => {
    PostTag.init(
        {
            post_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false
            },
            tag_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false
            }
        },
        {
            sequelize,
            modelName: "PostTag",
            tableName: "post_tags",
            timestamps: false
        }
    );

    return PostTag;
};

module.exports = {
    PostTag,
    initializePostTag
};
