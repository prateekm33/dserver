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
const { createNewError, sendUnauthorizedMessage } = require("../../../utils");
const Errors = require("../../../constants/Errors");
const { USER_ROLES } = require("../../../db/schemas/constants");
const { TokenBlacklist } = require("../../../db");

router.post("/logout", (req, res) => {
  TokenBlacklist.create({
    token: auth.getToken(req)
  })
    .then(token => {
      res.status(200).end(true);
    })
    .catch(res.sendError);
});

router.get(
  "/:vendorId/:employeeId?",
  auth.canAccessVendorEmployee,
  (req, res) => {
    const vendor_uuid = req.user.vendor_uuid;
    if (req.user.role !== USER_ROLES.SUPERADMIN && !vendor_uuid)
      return res
        .status(400)
        .send(createNewError(Errors.NOT_AUTHORIZED_FOR_VENDOR));
    if (req.params.employeeId)
      getVendorEmployee({ uuid: req.params.employeeId, vendor_uuid })
        .then(employee => res.status(200).sendResponseWithUser({ employee }))
        .catch(res.sendError);
    else
      getVendorEmployees({ vendor_uuid })
        .then(employees => res.status(200).sendResponseWithUser({ employees }))
        .catch(res.sendError);
  }
);

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
  if (
    req.user.role !== USER_ROLES.SUPERADMIN &&
    req.user.role !== USER_ROLES.VENDOR_ACCOUNT_OWNER &&
    req.body.employee.role === USER_ROLES.VENDOR_ACCOUNT_OWNER
  ) {
    return sendUnauthorizedMessage(res);
  }

  req.body.employee.vendor_uuid = req.params.vendorId;
  createVendorEmployee(req.body.employee)
    .then(employee => res.status(200).sendResponseWithUser({ employee }))
    .catch(res.sendError);
});

router.put(
  "/:vendorId/:employeeId",
  auth.canAccessVendorEmployee,
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

    if (req.user.role !== USER_ROLES.SUPERADMIN) {
      if (
        !!req.body.updates.vendor_uuid &&
        req.body.updates.vendor_uuid !== req.params.vendorId
      )
        return res
          .status(400)
          .send(createNewError(Errors.NOT_AUTHORIZED_FOR_VENDOR));
    }

    if (
      req.user.role !== USER_ROLES.SUPERADMIN &&
      req.user.role !== USER_ROLES.VENDOR_ACCOUNT_OWNER &&
      req.body.updates.role === USER_ROLES.VENDOR_ACCOUNT_OWNER
    ) {
      return sendUnauthorizedMessage(res);
    }

    updateVendorEmployee(req.params.employeeId, req.body.updates)
      .then(employee =>
        res.status(200).sendResponseWithUser({ employee }, employee)
      )
      .catch(res.sendError);
  }
);

router.delete(
  "/:vendorId/:employeeId",
  auth.canAccessVendorEmployee,
  (req, res) => {
    deleteVendorEmployee(req.params.employeeId)
      .then(deleted_rows =>
        res.status(200).sendResponseWithUser({ deleted_rows })
      )
      .catch(res.sendError);
  }
);

module.exports = router;
