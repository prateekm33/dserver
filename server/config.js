const env = process.env.NODE_ENV || "prod";

switch (env.toLowerCase()) {
  case "local":
    module.exports = require("./config.dev");
    return;
  case "dev":
  case "development":
    module.exports = require("./config.prod.dev");
    return;
  case "prod":
  case "production":
  default:
    module.exports = require("./config.prod.prod");
    return;
}
