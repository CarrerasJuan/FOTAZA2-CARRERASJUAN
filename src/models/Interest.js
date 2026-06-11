const { DataTypes, Model } = require("sequelize");

class Interest extends Model {}

const initializeInterest = (sequelize) => {
    Interest.init(
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
            post_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            message: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false
            }
        },
        {
            sequelize,
            modelName: "Interest",
            tableName: "interests",
            timestamps: false,
            indexes: [
                {
                    unique: true,
                    fields: ["user_id", "post_id"]
                }
            ]
        }
    );

    return Interest;
};

module.exports = {
    Interest,
    initializeInterest
};
