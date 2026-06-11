const { DataTypes, Model } = require("sequelize");

class Message extends Model {}

const initializeMessage = (sequelize) => {
    Message.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            interest_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            sender_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            content: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false
            }
        },
        {
            sequelize,
            modelName: "Message",
            tableName: "messages",
            timestamps: false
        }
    );

    return Message;
};

module.exports = {
    Message,
    initializeMessage
};
