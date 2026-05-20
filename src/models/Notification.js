const { DataTypes, Model } = require("sequelize");

class Notification extends Model {}

const initializeNotification = (sequelize) => {
    Notification.init(
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
            actor_id: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            type: {
                type: DataTypes.STRING(30),
                allowNull: false
            },
            is_read: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false
            }
        },
        {
            sequelize,
            modelName: "Notification",
            tableName: "notifications",
            timestamps: false
        }
    );

    return Notification;
};

module.exports = {
    Notification,
    initializeNotification
};
