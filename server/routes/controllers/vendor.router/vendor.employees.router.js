// route: /api/vendors/employees
const router = require("express").Router();
const auth = require("../../../middleware/auth");
const {
  getVendorEmployee,
  getVendorEmployees,
  createVendorEmployee,
  updateVendorEmployee,
  deleteVendorEmployee
} = require("../../../db/controllers");
const { createNewError } = require("../../../utils");
const Errors = require("../../../constants/Errors");
const { USER_ROLES } = require("../../../db/schemas/constants");

router.get("/:vendorId/:userId?", auth.canAccessVendorEmployee, (req, res) => {
  const vendor_uuid = req.user.vendor_uuid;
  // TODO--- make sure that vendor_uuid is in req.user
  if (req.user.role !== USER_ROLES.SUPERADMIN && !vendor_uuid)
    return res.status(400).send(createNewError(Errors.FORBIDDEN));
  if (req.params.userId)
    getVendorEmployee({ uuid: req.params.userId, vendor_uuid })
      .then(employee => res.status(200).send({ employee }))
      .catch(res.sendError);
  else
    getVendorEmployees({ vendor_uuid })
      .then(employees => res.status(200).send({ employees }))
      .catch(res.sendError);
});

router.post("/:vendorId", auth.isAdmin, (req, res) => {
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

  if (req.user.role !== USER_ROLES.SUPERADMIN) {
    if (
      !!req.body.employee.vendor_uuid &&
      req.body.employee.vendor_uuid !== req.params.vendorId
    )
      return res
        .status(400)
        .send(createNewError(Errors.NOT_AUTHORIZED_FOR_VENDOR));
  }

  req.body.employee.vendor_uuid = req.params.vendorId;
  createVendorEmployee(req.body.employee)
    .then(employee => res.status(200).send({ employee }))
    .catch(res.sendError);
});

router.put("/:vendorId/:userId", auth.canAccessVendorEmployee, (req, res) => {
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

  if (req.user.role !== USER_ROLES.SUPERADMIN) {
    if (
      !!req.body.updates.vendor_uuid &&
      req.body.updates.vendor_uuid !== req.params.vendorId
    )
      return res
        .status(400)
        .send(createNewError(Errors.NOT_AUTHORIZED_FOR_VENDOR));
  }

  updateVendorEmployee(req.params.userId, req.body.updates)
    .then(employee => res.status(200).send({ employee }))
    .catch(res.sendError);
});

router.delete(
  "/:vendorId/:userId",
  auth.canAccessVendorEmployee,
  (req, res) => {
    deleteVendorEmployee(req.params.userId)
      .then(deleted_rows => res.status(200).send({ deleted_rows }))
      .catch(res.sendError);
  }
);

module.exports = router;
