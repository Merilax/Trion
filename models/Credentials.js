import { DataTypes } from "sequelize";
import { sequelize } from './SQL.js';

const Credentials = sequelize.define("credentials", {
    userId: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    salt: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    sequelize,
    tableName: "credentials",
    timestamps: true,
    createdAt: false,
    updatedAt: "updatedAt",
    deletedAt: false
});

export { Credentials }; 