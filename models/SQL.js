import { Sequelize, DataTypes } from "sequelize";

const sequelize = new Sequelize(process.env.SQLURL, {
    host: 'bw2slbtnackrf8e2q6we-postgresql.services.clever-cloud.com',
    dialect: 'postgres',
    logging: false,
    port: 50013,
    //storage: 'database.sqlite',
    ssl: false,
    pool: {
        max: 3,
        acquire: 15000,
        idle: 10000
    }
});
sequelize.authenticate()
    .then(console.log("Sequelize connected to database succesfully."))
    .catch(err => console.log("Error connecting to Sequelize database: " + err));

const User = sequelize.define("user", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    anonymous: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
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
    },
    allowJoining: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    sequelize,
    tableName: "channel",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: false,
    deletedAt: false
});

Group.hasMany(Channel, {
    sourceKey: 'id',
    foreignKey: 'groupId'
})
Channel.belongsTo(Group, {
    sourceKey: 'groupId',
    foreignKey: 'id'
});

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
    groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
Message.belongsTo(User, {
    sourceKey: 'userId',
    foreignKey: 'id',
});
Message.belongsTo(Group, {
    sourceKey: 'groupId',
    foreignKey: 'id'
});
Message.belongsTo(Channel, {
    sourceKey: 'channelId',
    foreignKey: 'id'
});

sequelize.sync({ force: false, alter: true });

export { User, Credentials, Group, UserGroups, Channel, Message };