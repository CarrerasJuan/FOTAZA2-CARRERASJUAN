const { DataTypes, Model } = require("sequelize");

class Follow extends Model {}

const initializeFollow = (sequelize) => {
    Follow.init(
        {
            follower_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false
            },
            following_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false
            }
        },
        {
            sequelize,
            modelName: "Follow",
            tableName: "follows",
            timestamps: false
        }
    );

    return Follow;
};

module.exports = {
    Follow,
    initializeFollow
};
