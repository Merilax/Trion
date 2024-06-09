import { DataTypes } from "sequelize";
import { sequelize } from './SQL.js';

const Message = sequelize.define("message", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER
    },
    channelId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    directChannelId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    }
}, {
    sequelize,
    tableName: "message",
    timestamps: true,
    createdAt: "sentAt",
    updatedAt: "updatedAt",
    deletedAt: "deletedAt",
    paranoid: true
});

export { Message }; 