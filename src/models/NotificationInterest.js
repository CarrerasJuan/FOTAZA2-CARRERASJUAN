const { DataTypes, Model } = require("sequelize");

class NotificationInterest extends Model {}

const initializeNotificationInterest = (sequelize) => {
    NotificationInterest.init(
        {
            notification_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false
            },
            interest_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            }
        },
        {
            sequelize,
            modelName: "NotificationInterest",
            tableName: "notification_interests",
            timestamps: false
        }
    );

    return NotificationInterest;
};

module.exports = {
    NotificationInterest,
    initializeNotificationInterest
};
