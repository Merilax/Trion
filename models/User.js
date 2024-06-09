import { DataTypes } from "sequelize";
import { sequelize } from './SQL.js';
import { Credentials } from "./Credentials.js";
import { DirectChannel } from "./DirectChannel.js";
import { Message } from "./Message.js";
import { UserGroups } from "./UserGroups.js";

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

User.hasOne(Credentials, {
    sourceKey: 'id',
    foreignKey: 'userId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
});
User.hasMany(DirectChannel, {
    sourceKey: 'id',
    foreignKey: 'userId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
});
User.hasMany(Message, {
    sourceKey: 'id',
    foreignKey: 'userId',
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
});
User.hasMany(UserGroups, {
    sourceKey: 'id',
    foreignKey: 'userId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
});
Credentials.belongsTo(User);
DirectChannel.belongsTo(User);
Message.belongsTo(User);
UserGroups.belongsTo(User);

export { User }; 