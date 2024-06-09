import { DataTypes } from "sequelize";
import { sequelize } from './SQL.js';
import { Channel } from "./Channel.js";
import { UserGroups } from "./UserGroups.js";

const Group = sequelize.define("group", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    iconBlob: {
        type: DataTypes.BLOB
    },
    allowJoining: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    sequelize,
    tableName: "group",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: false,
    deletedAt: false
});

Group.hasMany(Channel, {
    sourceKey: 'id',
    foreignKey: 'groupId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
});
Group.hasMany(UserGroups, {
    sourceKey: 'id',
    foreignKey: 'groupId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
});
Channel.belongsTo(Group);
UserGroups.belongsTo(Group);

export { Group }; 