const { DataTypes, Model } = require("sequelize");

class NotificationRating extends Model {}

const initializeNotificationRating = (sequelize) => {
    NotificationRating.init(
        {
            notification_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false
            },
            rating_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            }
        },
        {
            sequelize,
            modelName: "NotificationRating",
            tableName: "notification_ratings",
            timestamps: false
        }
    );

    return NotificationRating;
};

module.exports = {
    NotificationRating,
    initializeNotificationRating
};
