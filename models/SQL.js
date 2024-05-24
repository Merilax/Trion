import { Sequelize, DataTypes } from "sequelize";

const sequelize = new Sequelize(process.env.SQLURL, {
    host: 'bw2slbtnackrf8e2q6we-postgresql.services.clever-cloud.com',
    dialect: 'postgres',
    logging: false,
    port: 50013,
    //storage: 'database.sqlite',
    ssl: false
});
sequelize.authenticate()
    .then(console.log("Sequelize connected to database succesfully."))
    .catch(err => console.log("Error connecting to Sequelize database: " + err));

const Message = sequelize.define("message", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    userId: {
        type: DataTypes.STRING,
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

const User = sequelize.define("user", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    nickname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    avatarBlob: {
        type: DataTypes.BLOB
    }
});

sequelize.sync({ force: false, alter: true });

export { Message, User };