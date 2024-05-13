import { Sequelize, DataTypes, Model } from "sequelize";

const sequelize = new Sequelize("bw2slbtnackrf8e2q6we", "uvok1mgwgwe30cstjj1d", "xZx3Q89bl8cLImhyl3NN7q826W2Bq9", {
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

class Message extends Model { }
Message.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
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
export { Message };