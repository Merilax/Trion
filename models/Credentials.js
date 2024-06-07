import { sequelize } from './SQL.js';
import { User } from './User.js';

const Credentials = sequelize.define("credentials", {
    userId: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    salt: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    sequelize,
    tableName: "credentials",
    timestamps: true,
    createdAt: false,
    updatedAt: "updatedAt",
    deletedAt: false,
    paranoid: true
});

User.hasOne(Credentials, {
    sourceKey: 'id',
    foreignKey: 'userId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
});
Credentials.belongsTo(User, {
    sourceKey: 'userId',
    foreignKey: 'id'
});

export { Credentials }; 