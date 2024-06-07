import { sequelize } from './SQL.js';

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
    direct: {
        type: DataTypes.BOOLEAN,
        allowNull: false
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

export { Group }; 