// route: /api/vendors
const router = require("express").Router();
const Errors = require("../../../constants/Errors");
const { createNewError, saveVendorEmployeeSession } = require("../../../utils");
const { loginVendorEmployee } = require("../../../db/controllers");
const auth = require("../../../middleware/auth");

router.post("/employees/login/:vendorId", (req, res) => {
  if (!req.body.employee)
    return res
      .status(400)
      .send(createNewError(Errors.MISSING_PARAMETER("employee")));
  if (req.body.employee.constructor.prototype !== Object.prototype) {
    return res
      .status(400)
      .send(
        createNewError(
          Errors.PARAMETER_IS_NOT_EXPECTED_TYPE(
            "employee",
            "Object",
            req.body.employee
          )
        )
      );
  }
  req.body.employee.vendor_uuid = req.params.vendorId;
  loginVendorEmployee(req.body.employee)
    .then(saveVendorEmployeeSession)
    .then(employee =>
      res.status(200).send({ employee, user_token: employee.token })
    )
    .catch(res.sendError);
});

router.use(
  "/employees",
  auth.validateJWT,
  require("./vendor.employees.router")
);
router.use(
  "/customers/reward",
  auth.validateJWT,
  require("./vendor.customer.reward.router")
);
router.use(
  "/customers/deal",
  auth.validateJWT,
  require("./vendor.customer.deal.router")
);
router.use("/rewards", auth.validateJWT, require("./vendor.rewards.router"));
router.use("/deals", auth.validateJWT, require("./vendor.deals.router"));
router.use("/", auth.validateJWT, require("./vendor.index.router"));

module.exports = router;
