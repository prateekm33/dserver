// route: /api/vendors/rewards
const router = require("express").Router();
const auth = require("../../../middleware/auth");
const {
  getVendorReward,
  getVendorRewards,
  createVendorReward,
  updateVendorReward,
  deleteVendorReward
} = require("../../../db/controllers");
const {
  createNewError,
  sendUnauthorizedMessage,
  isVendorEmployee
} = require("../../../utils");
const Errors = require("../../../constants/Errors");
const { USER_ROLES } = require("../../../db/schemas/constants");

router.get("/:vendorId/:loyaltyRewardId?", (req, res) => {
  if (
    !(
      req.user.role === USER_ROLES.SUPERADMIN ||
      req.user.role === USER_ROLES.CUSTOMER ||
      isVendorEmployee(req)
    )
  )
    return sendUnauthorizedMessage(res);

  let promise;
  if (req.params.loyaltyRewardId) {
    promise = getVendorReward({
      loyalty_reward_uuid: req.params.loyaltyRewardId,
      vendor_uuid: req.params.vendorId
    }).then(loyalty_reward => ({ loyalty_reward }));
  } else {
    promise = getVendorRewards({
      vendor_uuid: req.params.vendorId
    }).then(loyalty_rewards => ({ loyalty_rewards }));
  }
  promise.then(response => res.status(200).send(response)).catch(res.sendError);
});

router.post("/:vendorId", auth.canAccessVendor, auth.isAdmin, (req, res) => {
  if (!req.body.loyalty_reward) {
    return res
      .status(400)
      .send(createNewError(Errors.MISSING_PARAMETER("loyalty_reward")));
  }
  if (req.body.loyalty_reward.constructor.prototype !== Object.prototype) {
    return res
      .status(400)
      .send(
        createNewError(
          Errors.PARAMETER_IS_NOT_EXPECTED_TYPE(
            "loyalty_reward",
            "Object",
            req.body.loyalty_reward
          )
        )
      );
  }
  const loyalty_reward = req.body.loyalty_reward;
  loyalty_reward.vendor_uuid = req.params.vendorId;
  createVendorReward(loyalty_reward, req.params.vendorId)
    .then(loyalty_reward => res.status(200).send({ loyalty_reward }))
    .catch(res.sendError);
});

router.put(
  "/:vendorId/:loyaltyRewardId",
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
    updateVendorReward(
      {
        loyalty_reward_uuid: req.params.loyaltyRewardId,
        vendor_uuid: req.params.vendorId
      },
      req.body.updates
    )
      .then(loyalty_reward => res.status(200).send({ loyalty_reward }))
      .catch(res.sendError);
  }
);

router.delete(
  "/:vendorId/:loyaltyRewardId",
  auth.canAccessVendor,
  auth.isAdmin,
  (req, res) => {
    deleteVendorReward({
      vendor_uuid: req.params.vendorId,
      loyalty_reward_uuid: req.params.loyaltyRewardId
    })
      .then(() => res.status(200).end())
      .catch(res.sendError);
  }
);

module.exports = router;
