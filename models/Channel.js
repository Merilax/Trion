import { DataTypes } from "sequelize";
import { sequelize } from './SQL.js';
import { Message } from './Message.js';

const Channel = sequelize.define("channel", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    }
}, {
    sequelize,
    tableName: "channel",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: false,
    deletedAt: false
});

Channel.hasMany(Message, {
    sourceKey: 'id',
    foreignKey: 'channelId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
});
Message.belongsTo(Channel);

export { Channel }; 