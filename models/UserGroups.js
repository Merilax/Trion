import { sequelize } from './SQL.js';
import { Group } from './Group.js';
import { User } from './User.js';

const UserGroups = sequelize.define("userGroups", {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    sequelize,
    tableName: "userGroups",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: false,
    deletedAt: false
});

User.hasMany(UserGroups, {
    sourceKey: 'id',
    foreignKey: 'userId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
});
Group.hasMany(UserGroups, {
    sourceKey: 'id',
    foreignKey: 'groupId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
});
UserGroups.belongsTo(User, {
    sourceKey: 'userId',
    foreignKey: 'id'
});
UserGroups.belongsTo(Group, {
    sourceKey: 'groupId',
    foreignKey: 'id'
});

export { UserGroups }; 