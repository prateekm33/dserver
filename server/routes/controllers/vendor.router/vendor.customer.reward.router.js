// route: /api/vendors/customers/reward
const router = require("express").Router();
const {
  getVendorCustomerLoyaltyRewardCard,
  getVendorCustomerLoyaltyRewardCards,
  createVendorCustomerLoyaltyRewardCard,
  updateVendorCustomerLoyaltyRewardCard,
  deleteVendorCustomerLoyaltyRewardCard
} = require("../../../db/controllers");
const { createNewError, sendUnauthorizedMessage } = require("../../../utils");
const Errors = require("../../../constants/Errors");
const { USER_ROLES } = require("../../../db/schemas/constants");
const auth = require("../../../middleware/auth");

router.get(
  "/:customerId/:vendorId/:loyaltyRewardId",
  auth.canAccessCustomerRewards,
  (req, res) => {
    getVendorCustomerLoyaltyRewardCard(req.params.vendorId, {
      customer_uuid: req.params.customerId,
      loyalty_reward_uuid: req.params.loyaltyRewardId
    })
      .then(loyalty_reward =>
        res.status(200).sendResponseWithUser({ loyalty_reward })
      )
      .catch(res.sendError);
  }
);

router.get("/:customerId", auth.canAccessCustomerRewards, (req, res) => {
  const where = { customer_uuid: req.params.customerId };

  const limit = +req.query.limit || 20;
  const offset = +req.query.offset || 0;
  getVendorCustomerLoyaltyRewardCards(undefined, { where, limit, offset })
    .then(response => res.status(200).sendResponseWithUser(response))
    .catch(res.sendError);
});

router.post("/:customerId/:vendorId/:loyaltyRewardId", (req, res) => {
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

  const new_customer_card = {
    customer_uuid: req.params.customerId,
    loyalty_reward_uuid: req.params.loyaltyRewardId
  };
  createVendorCustomerLoyaltyRewardCard(req.params.vendorId, new_customer_card)
    .then(loyalty_reward =>
      res.status(200).sendResponseWithUser({ loyalty_reward })
    )
    .catch(res.sendError);
});

router.put(
  "/:customerId/:vendorId/:loyaltyRewardId",
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
      loyalty_reward_uuid: req.params.loyaltyRewardId
    };

    updateVendorCustomerLoyaltyRewardCard(
      req.params.vendorId,
      where,
      req.body.updates
    )
      .then(loyalty_reward => {
        res.status(200).sendResponseWithUser({ loyalty_reward });
        let promise = Promise.resolve(req.body.device_token);
        if (!req.body.device_token)
          promise = getCustomerDeviceToken(req.params.customerId);
        return promise.then(token => {
          if (!req.body.type) return;
          let message;
          if (req.body.type === "earn") {
            message =
              "Congratulations, you earned some points! Keep racking up those points and cash 'em in for some awesome rewards.";
          } else if (req.body.type === "redeem") {
            message = `Awesome, You redeemed some points! Unleash the power of loyalty.`;
          }

          return notifications_client.sendNotification(token, {
            message_from: req.user.vendor_uuid,
            body: {
              message
            }
          });
        });
      })
      .catch(res.sendError);
  }
);

router.delete(
  "/:customerId/:vendorId/:loyaltyRewardId",
  auth.canAccessCustomerRewards,
  (req, res) => {
    deleteVendorCustomerLoyaltyRewardCard(req.params.vendorId, {
      loyalty_reward_uuid: req.params.loyaltyRewardId,
      customer_uuid: req.params.customerId
    })
      .then(deleted_rows =>
        res.status(200).sendResponseWithUser({ deleted_rows })
      )
      .catch(res.sendError);
  }
);

module.exports = router;
