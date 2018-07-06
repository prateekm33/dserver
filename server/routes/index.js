const { createNewError } = require("../utils");
const Errors = require("../constants/Errors");
const auth = require("../middleware/auth");

module.exports = app => {
  app.use("/api/customers", require("./controllers/customers.router"));
  app.use("/api/vendors", require("./controllers/vendor.router"));
  app.use(
    "/api/deals",
    auth.validateJWT,
    require("./controllers/deals.router")
  );
  app.use(
    "/api/rewards",
    auth.validateJWT,
    require("./controllers/rewards.router")
  );
  app.use("/gotham/batcave", require("./controllers/gotham.router"));

  app.use("*", (req, res) => {
    res.status(404).send(createNewError(Errors.RESOURCE_NOT_FOUND));
  });
};
