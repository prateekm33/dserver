const router = require("express").Router();
const {
  getVendor,
  createVendor,
  updateVendor,
  deleteVendor
} = require("../../../db/controllers");
const { createNewError } = require("../../../utils");
const Errors = require("../../../constants/Errors");
const auth = require("../../../middleware/auth");
const { USER_ROLES } = require("../../../db/schemas/constants");

router.get("/:vendorId", (req, res) => {
  getVendor(req.params.vendorId)
    .then(vendor => res.status(200).send({ vendor }))
    .catch(res.sendError);
});

router.post("/signup", (req, res) => {
  console.log(
    "-----TODO...make sure to set up mailgun so that we can send these signup requests to an email account"
  );
  // TODO...or to a slack channel
  // or both
  res.end();
});

router.post("/", (req, res) => {
  if (req.user.role !== USER_ROLES.SUPERADMIN)
    return res.status(401).send(createNewError(Errors.UNAUTHORIZED));

  if (!req.body.vendor)
    return res
      .status(400)
      .send(createNewError(Errors.MISSING_PARAMETER("vendor")));
  if (req.body.vendor.constructor.prototype !== Object.prototype) {
    return res
      .status(400)
      .send(
        createNewError(
          Errors.PARAMETER_IS_NOT_EXPECTED_TYPE(
            "vendor",
            "Object",
            req.body.vendor
          )
        )
      );
  }
  createVendor(req.body.vendor)
    .then(vendor => res.status(200).send({ vendor }))
    .catch(res.sendError);
});

router.put("/:vendorId", auth.canModifyVendor, (req, res) => {
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

  updateVendor(req.params.vendorId, req.body.updates)
    .then(vendor => res.status(200).send({ vendor }))
    .catch(res.sendError);
});

router.delete("/:vendorId", auth.canModifyVendor, (req, res) => {
  deleteVendor(req.params.vendorId)
    .then(deleted_rows => res.status(200).send({ deleted_rows }))
    .catch(res.sendError);
});

module.exports = router;
