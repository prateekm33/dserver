const { createNewError } = require("../utils");
const Errors = require("../constants/Errors");
const auth = require("../middleware/auth");

module.exports = app => {
  app.use("/password_recovery", require("./controllers/password.router"));
  app.use("/api/customers", require("./controllers/customers.router"));
  app.use("/api/employees", require("./controllers/employees.router"));
  app.use("/api/vendors", require("./controllers/vendor.router"));
  app.use(
    "/api/reviews",
    auth.validateJWT,
    require("./controllers/reviews.router")
  );
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
  app.use(
    "/api/search",
    auth.validateJWT,
    require("./controllers/search.router")
  );
  app.use("/gotham/batcave", require("./controllers/gotham.router"));

  app.use("*", (req, res) => {
    res.status(404).send(createNewError(Errors.RESOURCE_NOT_FOUND));
  });
};
