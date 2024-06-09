import { DataTypes } from "sequelize";
import { sequelize } from './SQL.js';

const UserGroups = sequelize.define("userGroups", {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
    },
    groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
    },
    isOwner: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    canManageGroup: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    canCreateChannels: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    canManageChannels: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    sequelize,
    tableName: "userGroups",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: false,
    deletedAt: false
});

export { UserGroups }; 