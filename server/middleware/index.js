const bodyParser = require("body-parser");
const logger = require("./logger");
const {
  saveCustomerSession,
  saveVendorEmployeeSession,
  isVendorEmployee
} = require("../utils");
const { USER_ROLES } = require("../db/schemas/constants");
// const notificationsClient = require("../utils/notifications.client");

module.exports = app => {
  app.use(bodyParser.json({ urlencoded: true }));
  app.use(logger.HTTP_LOGGER);
  app.use((req, res, next) => {
    res.sendResponseWithUser = (response, modified_user) => {
      if (!req.user) return res.send(response);
      if (req.user.role === USER_ROLES.CUSTOMER) method = saveCustomerSession;
      else if (isVendorEmployee(req)) method = saveVendorEmployeeSession;

      let user_with_token;
      if (
        modified_user &&
        modified_user.uuid === req.user.uuid &&
        modified_user.role !== req.user.role &&
        (modified_user.email !== req.user.email ||
          modified_user.device_token !== req.user.device_token ||
          modified_user.device_uuid !== req.user.device_uuid ||
          modified_user.username !== req.user.username)
      ) {
        user_with_token = method(modified_user);
      }
      let final_response = response;
      if (user_with_token)
        final_response = Object.assign({}, response, {
          user_token: user_with_token.token,
          user_uuid: user_with_token.uuid
        });
      res.send(final_response);
    };

    res.sendError = error => {
      logger.error(error);
      res.status(error.statusCode || 500).send(error);
    };
    // notificationsClient.saveRequest(req);
    next();
  });
};
