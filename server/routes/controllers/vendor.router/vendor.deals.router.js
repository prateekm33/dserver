// route: /api/vendors/deals
const router = require("express").Router();
const auth = require("../../../middleware/auth");
const {
  getVendorDeal,
  getVendorDeals,
  createVendorDeal,
  updateVendorDeal,
  deleteVendorDeal
} = require("../../../db/controllers");
const {
  createNewError,
  isVendorEmployee,
  sendUnauthorizedMessage
} = require("../../../utils");
const Errors = require("../../../constants/Errors");
const { USER_ROLES } = require("../../../db/schemas/constants");

router.get("/:vendorId/:dealId?", (req, res) => {
  if (
    !(
      req.user.role === USER_ROLES.SUPERADMIN ||
      req.user.role === USER_ROLES.CUSTOMER ||
      isVendorEmployee(req)
    )
  )
    return sendUnauthorizedMessage(res);

  let promise;
  if (req.params.dealId) {
    promise = getVendorDeal(req.params.vendorId, {
      uuid: req.params.dealId
    }).then(deal => ({ deal }));
  } else {
    promise = getVendorDeals(req.params.vendorId, {
      limit: +req.query.limit || 20,
      offset: +req.query.offset || 0
    });
  }
  promise
    .then(response => res.status(200).sendResponseWithUser(response))
    .catch(res.sendError);
});

router.post("/:vendorId", auth.canAccessVendor, auth.isAdmin, (req, res) => {
  if (!req.body.deal) {
    return res
      .status(400)
      .send(createNewError(Errors.MISSING_PARAMETER("deal")));
  }
  if (req.body.deal.constructor.prototype !== Object.prototype) {
    return res
      .status(400)
      .send(
        createNewError(
          Errors.PARAMETER_IS_NOT_EXPECTED_TYPE("deal", "Object", req.body.deal)
        )
      );
  }
  createVendorDeal(req.params.vendorId, req.body.deal)
    .then(deal => res.status(200).sendResponseWithUser({ deal }))
    .catch(res.sendError);
});

router.put(
  "/:vendorId/:dealId",
  auth.canAccessVendor,
  auth.isAdmin,
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

    delete req.body.updates.vendor_uuid;
    updateVendorDeal(
      req.params.vendorId,
      {
        uuid: req.params.dealId
      },
      req.body.updates
    )
      .then(deal => res.status(200).sendResponseWithUser({ deal }))
      .catch(res.sendError);
  }
);

router.delete(
  "/:vendorId/:dealId",
  auth.canAccessVendor,
  auth.isAdmin,
  (req, res) => {
    deleteVendorDeal(req.params.vendorId, {
      deal_uuid: req.params.dealId
    })
      .then(deleted_rows =>
        res.status(200).sendResponseWithUser({ deleted_rows })
      )
      .catch(res.sendError);
  }
);

module.exports = router;
