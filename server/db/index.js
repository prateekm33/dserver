const Sequelize = require("sequelize");
const initSchemas = require("./schemas");
const {
  DBNAME,
  DBUSER,
  DBPW,
  DBHOST,
  FORCE_SYNC
} = require("../config").DATABASE;
const SUPERADMIN_PASSWORD_CONFIDENTIAL = require("../config")
  .SUPERADMIN_PASSWORD_CONFIDENTIAL;

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
    return sequelize.sync({
      force: process.env.FORCE ? process.env.FORCE === "true" : FORCE_SYNC
    });
  })
  .then(() => {
    if (process.env.FORCE !== "true" || !FORCE_SYNC) return;
    const date = new Date().toISOString();
    sequelize.query(
      `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; insert into superadmins (uuid,role,username,password,"created_at","updated_at") values((select uuid_generate_v1()), 'SUPERADMIN', 'dineable_admin', '${
        config.SUPERADMIN_PASSWORD_CONFIDENTIAL
      }', '${date}', '${date}');`
    );
  })
  .catch(err => {
    console.error("Unable to connect to the database:", err);
  });

module.exports = {
  db: sequelize,
  ...schemas,
  neo4j: require("./neo4j")
};
