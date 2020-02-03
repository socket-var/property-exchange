const debug = require("debug")("property-exchange:db-connection");
const { Sequelize, DataTypes } = require("sequelize");
const { DB_USER, DB_PWD, DB_HOST, DB_PORT, DB_NAME } = process.env;

const dbUrl = `postgres://${DB_USER}:${DB_PWD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

const sequelize = new Sequelize(dbUrl);

sequelize
  .authenticate()
  .then(() => {
    debug("Connection has been established successfully.");
  })
  .catch(err => {
    debug("Unable to connect to the database:", err);
  });

module.exports = { sequelize, DataTypes };
