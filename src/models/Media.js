const { DataTypes, Model } = require("sequelize");

class Media extends Model {}

const initializeMedia = (sequelize) => {
    Media.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            post_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            type: {
                type: DataTypes.STRING(20),
                allowNull: false
            },
            url: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            license: {
                type: DataTypes.STRING(30),
                allowNull: false
            },
            watermark_text: {
                type: DataTypes.STRING(100),
                allowNull: true
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false
            }
        },
        {
            sequelize,
            modelName: "Media",
            tableName: "media",
            timestamps: false
        }
    );

    return Media;
};

module.exports = {
    Media,
    initializeMedia
};
