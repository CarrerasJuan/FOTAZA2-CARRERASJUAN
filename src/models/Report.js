const { DataTypes, Model } = require("sequelize");

class Report extends Model {}

const initializeReport = (sequelize) => {
    Report.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            reporter_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            reported_user_id: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            post_id: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            comment_id: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            reason: {
                type: DataTypes.STRING(100),
                allowNull: false
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            status: {
                type: DataTypes.STRING(20),
                allowNull: false,
                defaultValue: "pending"
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
            modelName: "Report",
            tableName: "reports",
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at"
        }
    );

    return Report;
};

module.exports = {
    Report,
    initializeReport
};
