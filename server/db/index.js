const Sequelize = require("sequelize");
const initSchemas = require("./schemas");
const {
  DBNAME,
  DBUSER,
  DBPW,
  DBHOST,
  FORCE_SYNC
} = require("../config").DATABASE;

const sequelize = new Sequelize(DBNAME, DBUSER, DBPW, {
  host: DBHOST,
  dialect: "postgres",
  operatorsAliases: false,

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});
const schemas = initSchemas(sequelize);
sequelize
  .authenticate()
  .then(() => {
    console.log("DB Connection has been established successfully.");
    sequelize.sync({
      force: process.env.FORCE ? process.env.FORCE === "true" : FORCE_SYNC
    });
  })
  .catch(err => {
    console.error("Unable to connect to the database:", err);
  });

module.exports = {
  db: sequelize,
  ...schemas
};
