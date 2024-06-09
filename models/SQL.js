import { Sequelize, DataTypes } from "sequelize";

const sequelize = new Sequelize(process.env.SQLURL, {
    host: 'bw2slbtnackrf8e2q6we-postgresql.services.clever-cloud.com',
    dialect: 'postgres',
    logging: false,
    port: 50013,
    //storage: 'database.sqlite',
    ssl: false,
    pool: {
        max: 2,
        acquire: 15000,
        idle: 10000
    }
});
sequelize.authenticate()
    .then(console.log("Sequelize connected to database succesfully."))
    .catch(err => console.log("Error connecting to Sequelize database: " + err));

sequelize.sync({ force: false, alter: true });

export { sequelize };