const { DataTypes, Model } = require("sequelize");

class NotificationFollow extends Model {}

const initializeNotificationFollow = (sequelize) => {
    NotificationFollow.init(
        {
            notification_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false
            },
            follower_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            }
        },
        {
            sequelize,
            modelName: "NotificationFollow",
            tableName: "notification_follows",
            timestamps: false
        }
    );

    return NotificationFollow;
};

module.exports = {
    NotificationFollow,
    initializeNotificationFollow
};
