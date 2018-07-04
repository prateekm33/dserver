// route: /api/vendors/customers/deal
const router = require("express").Router();
const {
  getVendorCustomerDeal,
  getVendorCustomerDeals,
  createVendorCustomerDeal,
  updateVendorCustomerDeal,
  deleteVendorCustomerDeal
} = require("../../../db/controllers");
const { createNewError, sendUnauthorizedMessage } = require("../../../utils");
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
      .then(customer_deal => res.status(200).send({ customer_deal }))
      .catch(res.sendError);
  }
);

router.get("/:customerId", auth.canAccessCustomerRewards, (req, res) => {
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
router.post("/:customerId/:vendorId/:dealId", (req, res) => {
  if (
    req.user.role !== USER_ROLES.SUPERADMIN &&
    req.user.role !== USER_ROLES.CUSTOMER
  )
    return sendUnauthorizedMessage(res);
  if (
    req.user.role === USER_ROLES.CUSTOMER &&
    req.user.uuid !== req.params.customerId
  )
    return sendUnauthorizedMessage(res);

  const new_customer_deal = {
    customer_uuid: req.params.customerId,
    deal_uuid: req.params.dealId
  };
  createVendorCustomerDeal(req.params.vendorId, new_customer_deal)
    .then(customer_deal => res.status(200).send({ customer_deal }))
    .catch(res.sendError);
});

// used when needed to update whether customer has used this deal or not
// or when customer archives the deal
router.put(
  "/:customerId/:vendorId/:dealId",
  auth.canModifyCustomerRewards,
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

    const where = {
      customer_uuid: req.params.customerId,
      deal_uuid: req.params.dealId
    };

    updateVendorCustomerDeal(req.params.vendorId, where, req.body.updates)
      .then(customer_deal => res.status(200).send({ customer_deal }))
      .catch(res.sendError);
  }
);

router.delete("/:customerId/:vendorId/:dealId", (req, res) => {
  if (
    req.user.uuid !== req.params.customerId &&
    req.user.role !== USER_ROLES.SUPERADMIN
  ) {
    return sendUnauthorizedMessage(res);
  }

  deleteVendorCustomerDeal(req.params.vendorId, {
    deal_uuid: req.params.dealId,
    customer_uuid: req.params.customerId,
    is_used: false
  })
    .then(() => res.status(200).end())
    .catch(res.sendError);
});

module.exports = router;
