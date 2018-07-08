// route: /api/customers
const router = require("express").Router();
const auth = require("../../middleware/auth");
const {
  loginCustomer,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  generatePasswordResetLinkCustomer
} = require("../../db/controllers");
const { TokenBlacklist } = require("../../db");
const Errors = require("../../constants/Errors");
const { createNewError, saveCustomerSession } = require("../../utils");

router.post("/forgot_password", (req, res) => {
  const customer = req.body.customer;
  if (!customer)
    return res
      .status(400)
      .send(
        createNewError(createNewError(Errors.MISSING_PARAMETER("customer")))
      );
  if (customer.constructor.prototype !== Object.prototype)
    return res
      .status(400)
      .send(
        createNewError(
          Errors.PARAMETER_IS_NOT_EXPECTED_TYPE("customer", "Object", customer)
        )
      );

  generatePasswordResetLinkCustomer(customer)
    .then(() => res.status(200).end())
    .catch(res.sendError);
});

router.get("/forgot_password", (req, res) => {
  const token = req.query.token;
  if (!token)
    return res
      .status(400)
      .send(createNewError(Errors.MISSING_PASSWORD_RESET_TOKEN));
});

router.post("/login", (req, res) => {
  if (!req.body.customer)
    return res
      .status(400)
      .send(createNewError(Errors.MISSING_PARAMETER("customer")));
  if (req.body.customer.constructor.prototype !== Object.prototype) {
    return res
      .status(400)
      .send(
        createNewError(
          Errors.PARAMETER_IS_NOT_EXPECTED_TYPE(
            "customer",
            "Object",
            req.body.customer
          )
        )
      );
  }

  loginCustomer(req.body.customer)
    .then(saveCustomerSession)
    .then(customer =>
      res.status(200).send({ customer, user_token: customer.token })
    )
    .catch(res.sendError);
});

router.get("/logout", (req, res) => {
  TokenBlacklist.create({
    token: auth.getToken(req)
  })
    .then(token => {
      res.status(200).end(true);
    })
    .catch(res.sendError);
});

router.get(
  "/:customerId",
  auth.validateJWT,
  auth.canAccessCustomer,
  (req, res) => {
    getCustomer(req.params.customerId)
      .then(customer => res.status(200).sendResponseWithUser({ customer }))
      .catch(res.sendError);
  }
);

router.post("/", (req, res) => {
  if (!req.body.customer)
    return res
      .status(400)
      .send(createNewError(Errors.MISSING_PARAMETER("customer")));
  if (req.body.customer.constructor.prototype !== Object.prototype) {
    return res
      .status(400)
      .send(
        createNewError(
          Errors.PARAMETER_IS_NOT_EXPECTED_TYPE(
            "customer",
            "Object",
            req.body.customer
          )
        )
      );
  }

  createCustomer(req.body.customer)
    .then(saveCustomerSession)
    .then(customer =>
      res.status(200).send({ customer, user_token: customer.token })
    )
    .catch(res.sendError);
});

router.put(
  "/:customerId",
  auth.validateJWT,
  auth.canAccessCustomer,
  (req, res) => {
    if (!req.body.updates)
      return res
        .status(400)
        .send(createNewError(Errors.MISSING_PARAMETER("updates")));
    if (req.body.updates.constructor.prototype !== Object.prototype) {
      return res
        .status(400)
        .send(
          createNewError(
            Errors.PARAMETER_IS_NOT_EXPECTED_TYPE(
              "updates",
              "Object",
              req.body.updates
            )
          )
        );
    }

    updateCustomer(req.params.customerId, req.body.updates)
      .then(customer =>
        res.status(200).sendResponseWithUser({ customer }, customer)
      )
      .catch(res.sendError);
  }
);

router.delete("/:customerId", auth.validateJWT, (req, res) => {
  deleteCustomer(req.params.customerId)
    .then(deleted_rows =>
      res.status(200).sendResponseWithUser({ deleted_rows })
    )
    .catch(res.sendError);
});

module.exports = router;
