const { DataTypes, Model } = require("sequelize");

class Rating extends Model {}

const initializeRating = (sequelize) => {
    Rating.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            post_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            points: {
                type: DataTypes.DECIMAL(3,1),
                allowNull: false,
                validate: {
                    min: 1,
                    max: 5
                }
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false
            }
        },
        {
            sequelize,
            modelName: "Rating",
            tableName: "ratings",
            timestamps: false,
            indexes: [
                {
                    unique: true,
                    fields: ["post_id", "user_id"]
                }
            ]
        }
    );

    return Rating;
};

module.exports = {
    Rating,
    initializeRating
};
