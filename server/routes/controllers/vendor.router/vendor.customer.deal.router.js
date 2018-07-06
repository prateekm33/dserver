// route: /api/vendors/customers/deal
const router = require("express").Router();
const {
  getVendorCustomerDeal,
  getVendorCustomerDeals,
  createVendorCustomerDeal,
  updateVendorCustomerDeal,
  deleteVendorCustomerDeal
} = require("../../../db/controllers");
const {
  createNewError,
  sendUnauthorizedMessage,
  isVendorEmployee
} = require("../../../utils");
const Errors = require("../../../constants/Errors");
const { USER_ROLES } = require("../../../db/schemas/constants");
const auth = require("../../../middleware/auth");

router.get(
  "/:customerId/:vendorId/:dealId",
  auth.canAccessCustomerRewards,
  (req, res) => {
    getVendorCustomerDeal(req.params.vendorId, {
      customer_uuid: req.params.customerId,
      deal_uuid: req.params.dealId
    })
      .then(deal => res.status(200).send({ deal }))
      .catch(res.sendError);
  }
);

router.get("/:customerId", auth.canAccessCustomer, (req, res) => {
  const where = { customer_uuid: req.params.customerId };
  if (req.query.is_saved) {
    if (req.query.is_saved.toLowerCase() === "true") {
      where.is_saved = true;
    } else if (req.query.is_saved.toLowerCase() === "false") {
      where.is_saved = false;
    }
  }
  const limit = +req.query.limit || 20;
  const offset = +req.query.offset || 0;
  getVendorCustomerDeals(undefined, { where, limit, offset })
    .then(response => res.status(200).send(response))
    .catch(res.sendError);
});

// used when needed to update whether customer has saved this deal
router.post(
  "/:customerId/:vendorId/:dealId",
  auth.canAccessCustomer,
  (req, res) => {
    const new_customer_deal = {
      customer_uuid: req.params.customerId,
      deal_uuid: req.params.dealId,
      is_saved: !!req.body.deal.is_saved,
      is_archived: !!req.body.deal.is_archived,
      is_deleted: !!req.body.deal.is_deleted
    };
    createVendorCustomerDeal(req.params.vendorId, new_customer_deal)
      .then(deal => res.status(200).send({ deal }))
      .catch(res.sendError);
  }
);

// used when needed to update whether customer has used this deal or not
// or when customer archives the deal
router.put("/:customerId/:vendorId/:dealId", (req, res) => {
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

  let updates = {};
  if (isVendorEmployee(req)) {
    updates = {
      is_used: req.body.updates.is_used
    };
  } else if (req.user.role === USER_ROLES.CUSTOMER && req.params.customerId) {
    const { is_saved, is_deleted, is_archived } = req.body.updates;
    updates = {
      is_archived,
      is_deleted,
      is_saved
    };
  } else if (req.user.role === USER_ROLES.SUPERADMIN) {
    updates = req.body.updates;
  } else return sendUnauthorizedMessage(res);

  const where = {
    customer_uuid: req.params.customerId,
    deal_uuid: req.params.dealId
  };

  updateVendorCustomerDeal(req.params.vendorId, where, updates)
    .then(deal => res.status(200).send({ deal }))
    .catch(res.sendError);
});

router.delete(
  "/:customerId/:vendorId/:dealId",
  auth.canAccessCustomerRewards,
  (req, res) => {
    // TODO...if requesting user is a CUSTOMER...
    // then convert this to a find api call, which checks if deal is_used
    // if deal is used, send back unauth message

    deleteVendorCustomerDeal(req.params.vendorId, {
      deal_uuid: req.params.dealId,
      customer_uuid: req.params.customerId,
      is_used: false
    })
      .then(deleted_rows => res.status(200).send({ deleted_rows }))
      .catch(res.sendError);
  }
);

module.exports = router;
