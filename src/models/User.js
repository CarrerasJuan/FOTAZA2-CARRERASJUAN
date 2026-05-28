const bcrypt = require("bcrypt");
const { DataTypes, Model } = require("sequelize");

class User extends Model {
    validatePassword(password) {
        return bcrypt.compare(password, this.password);
    }
}

const initializeUser = (sequelize) => {
    User.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            username: {
                type: DataTypes.STRING(50),
                allowNull: false,
                unique: true
            },
            email: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true
            },
            password: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            biography: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            avatar_url: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            role: {
                type: DataTypes.STRING(20),
                allowNull: false,
                defaultValue: "regular"
            },
            status: {
                type: DataTypes.STRING(20),
                allowNull: false,
                defaultValue: "active"
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
            modelName: "User",
            tableName: "users",
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
            hooks: {
                beforeSave: async (user) => {
                    if (!user.changed("password")) {
                        return;
                    }

                    user.password = await bcrypt.hash(user.password, 10);
                }
            }
        }
    );

    return User;
};

module.exports = {
    User,
    initializeUser
};
