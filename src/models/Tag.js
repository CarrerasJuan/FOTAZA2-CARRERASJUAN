const { DataTypes, Model } = require("sequelize");

class Tag extends Model {}

const initializeTag = (sequelize) => {
    Tag.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.STRING(50),
                allowNull: false,
                unique: true
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false
            }
        },
        {
            sequelize,
            modelName: "Tag",
            tableName: "tags",
            timestamps: false
        }
    );

    return Tag;
};

module.exports = {
    Tag,
    initializeTag
};
