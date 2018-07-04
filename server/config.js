const env = process.env.NODE_ENV || "prod";

switch (env.toLowerCase()) {
  case "dev":
  case "development":
    module.exports = require("./config.dev");
    return;
  case "prod":
  case "production":
  default:
    module.exports = require("./config.prod");
    return;
}
