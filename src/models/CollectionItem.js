const { DataTypes, Model } = require("sequelize");

class CollectionItem extends Model {}

const initializeCollectionItem = (sequelize) => {
    CollectionItem.init(
        {
            collection_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false
            },
            post_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false
            }
        },
        {
            sequelize,
            modelName: "CollectionItem",
            tableName: "collection_items",
            timestamps: false
        }
    );

    return CollectionItem;
};

module.exports = {
    CollectionItem,
    initializeCollectionItem
};
