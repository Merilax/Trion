import { sequelize } from './SQL.js';
import { Message } from './Message.js';
import { User } from './User.js';

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

User.hasMany(DirectChannel, {
    sourceKey: 'id',
    foreignKey: 'userId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
});
DirectChannel.belongsTo(User, {
    sourceKey: 'userId',
    foreignKey: 'id',
});
Message.belongsTo(DirectChannel, {
    sourceKey: 'channelId',
    foreignKey: 'id'
});

export { DirectChannel }; 