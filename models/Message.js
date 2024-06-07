import { sequelize } from './SQL.js';
import { Channel } from './Channel.js';
import { User } from './User.js';

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
        allowNull: false,
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

User.hasMany(Message, {
    sourceKey: 'id',
    foreignKey: 'userId',
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
});
Channel.hasMany(Message, {
    sourceKey: 'id',
    foreignKey: 'channelId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
});
Message.belongsTo(User, {
    sourceKey: 'userId',
    foreignKey: 'id',
});
Message.belongsTo(Channel, {
    sourceKey: 'channelId',
    foreignKey: 'id'
});

export { Message }; 