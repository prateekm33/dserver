const { LoyaltyReward } = require("../");
const { createNewError } = require("../../utils");
const Errors = require("../../constants/Errors");

exports.getVendorReward = where =>
  LoyaltyReward.findOne({ where }).then(reward => {
    if (!reward) throw createNewError(Errors.RESOURCE_NOT_FOUND);
    return reward;
  });

exports.getVendorRewards = where => LoyaltyReward.findAll({ where });

exports.createVendorReward = reward => LoyaltyReward.create(reward);

exports.updateVendorReward = (where, updates) =>
  exports
    .getVendorReward(where)
    .then(reward => reward.updateAttributes(updates));

exports.deleteVendorReward = where => LoyaltyReward.destroy({ where });
