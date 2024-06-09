import { DataTypes } from "sequelize";
import { sequelize } from './SQL.js';
import { Message } from './Message.js';

const DirectChannel = sequelize.define("directChannel", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    sequelize,
    tableName: "directChannel",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: false,
    deletedAt: false
});

DirectChannel.hasMany(Message, {
    sourceKey: 'id',
    foreignKey: 'channelId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
});
Message.belongsTo(DirectChannel);

export { DirectChannel }; 