import { sequelize } from './SQL.js';

const User = sequelize.define("user", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    anonymous: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    avatarBlob: {
        type: DataTypes.BLOB
    }
}, {
    sequelize,
    tableName: "user",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: false,
    deletedAt: "deletedAt",
    paranoid: true
});

export { User }; 