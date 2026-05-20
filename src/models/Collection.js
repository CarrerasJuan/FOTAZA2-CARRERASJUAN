const { DataTypes, Model } = require("sequelize");

class Collection extends Model {}

const initializeCollection = (sequelize) => {
    Collection.init(
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
            name: {
                type: DataTypes.STRING(80),
                allowNull: false
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
            modelName: "Collection",
            tableName: "collections",
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at"
        }
    );

    return Collection;
};

module.exports = {
    Collection,
    initializeCollection
};
