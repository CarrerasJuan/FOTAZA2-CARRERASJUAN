const { DataTypes, Model } = require("sequelize");

class NotificationComment extends Model {}

const initializeNotificationComment = (sequelize) => {
    NotificationComment.init(
        {
            notification_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false
            },
            comment_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            }
        },
        {
            sequelize,
            modelName: "NotificationComment",
            tableName: "notification_comments",
            timestamps: false
        }
    );

    return NotificationComment;
};

module.exports = {
    NotificationComment,
    initializeNotificationComment
};
