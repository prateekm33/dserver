const { createNewError } = require("../utils");
const Errors = require("../constants/Errors");
const auth = require("../middleware/auth");

module.exports = app => {
  app.use(
    "/api/customers",
    auth.validateJWT,
    require("./controllers/customers.router")
  );
  app.use("/api/vendors", auth.validateJWT, require("./controllers/vendors"));
  app.use(
    "/api/deals",
    auth.validateJWT,
    require("./controllers/deals.router")
  );
  app.use(
    "/api/loyalty_rewards",
    auth.validateJWT,
    require("./controllers/loyalty_rewards.router")
  );
  app.use("*", (req, res) => {
    res.status(404).send(createNewError(Errors.RESOURCE_NOT_FOUND));
  });
};
