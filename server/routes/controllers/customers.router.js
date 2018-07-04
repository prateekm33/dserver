// route: /api/customers
const router = require("express").Router();
const auth = require("../../middleware/auth");
const {
  loginCustomer,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer
} = require("../../db/controllers");
const Errors = require("../../constants/Errors");
const { createNewError, saveCustomerSession } = require("../../utils");

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
    .then(customer => res.status(200).send({ customer }))
    .catch(res.sendError);
});

// router.get("/logout", (req, res) => {});

router.get("/:customerId", auth.canAccessCustomer, (req, res) => {
  getCustomer(req.params.customerId)
    .then(customer => res.status(200).send({ customer }))
    .catch(res.sendError);
});

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
    .then(customer => res.status(200).send({ customer }))
    .catch(res.sendError);
});

router.put("/:customerId", auth.canAccessCustomer, (req, res) => {
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
    .then(customer => res.status(200).send({ customer }))
    .catch(res.sendError);
});

router.delete("/:customerId", (req, res) => {
  deleteCustomer(req.params.customerId)
    .then(() => res.status(200).end())
    .catch(res.sendError);
});

module.exports = router;
