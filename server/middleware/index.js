const bodyParser = require("body-parser");
const logger = require("./logger");
// const notificationsClient = require("../utils/notifications.client");

module.exports = app => {
  app.use(bodyParser.json({ urlencoded: true }));
  app.use(logger.HTTP_LOGGER);
  app.use((req, res, next) => {
    res.sendError = error => {
      logger.error(error);
      res.status(error.statusCode || 500).send(error);
    };
    // notificationsClient.saveRequest(req);
    next();
  });
};
