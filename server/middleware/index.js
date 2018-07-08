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
      let user_with_token;
      if (req.user.role === USER_ROLES.CUSTOMER) method = saveCustomerSession;
      else if (isVendorEmployee(req)) method = saveVendorEmployeeSession;

      if (
        modified_user &&
        req.user.role === modified_user.role &&
        req.user.uuid === modified_user.uuid
      )
        user_with_token = method(modified_user);
      else user_with_token = method(req.user);

      res.send(
        Object.assign({}, response, {
          user_token: user_with_token.token,
          user_uuid: user_with_token.uuid
        })
      );
    };

    res.sendError = error => {
      logger.error(error);
      res.status(error.statusCode || 500).send(error);
    };
    // notificationsClient.saveRequest(req);
    next();
  });
};
