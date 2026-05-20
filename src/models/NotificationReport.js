const { DataTypes, Model } = require("sequelize");

class NotificationReport extends Model {}

const initializeNotificationReport = (sequelize) => {
    NotificationReport.init(
        {
            notification_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false
            },
            report_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            }
        },
        {
            sequelize,
            modelName: "NotificationReport",
            tableName: "notification_reports",
            timestamps: false
        }
    );

    return NotificationReport;
};

module.exports = {
    NotificationReport,
    initializeNotificationReport
};
