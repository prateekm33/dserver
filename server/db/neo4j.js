const neo4j = require("neo4j-driver").v1;
const config = require("../config");
const driver = neo4j.driver(
  config.NEO4J.URI,
  neo4j.auth.basic("neo4j", config.NEO4J.PASSWORD)
);

module.exports = driver;
