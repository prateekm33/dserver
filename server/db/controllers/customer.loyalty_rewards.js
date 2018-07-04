const { Customer, LoyaltyReward } = require("../");
const { createNewError } = require("../../utils");
const Errors = require("../../constants/Errors");

exports.getVendorCustomerLoyaltyRewardCard = (vendor_uuid, where) =>
  Customer.LoyaltyReward.findOne({
    where: Object.assign({}, where || {}, { vendor_uuid })
  }).then(card => {
    if (!card) throw createNewError(Errors.REWARD_CARD_NOT_FOUND);
    return card;
  });

exports.getVendorCustomerLoyaltyRewardCards = (
  vendor_uuid,
  { where, limit, offset }
) =>
  Customer.LoyaltyReward.findAndCountAll({
    where: Object.assign({}, where || {}, vendor_uuid ? { vendor_uuid } : {}),
    limit,
    offset,
    include: [
      {
        association: LoyaltyReward,
        through: {
          attributes: ["points", "num_points_redeemed"]
        },
        where: Object.assign({}, vendor_uuid ? { vendor_uuid } : {}),
        attributes: ["uuid", "code", "name", "short_desc", "long_desc"]
      }
    ]
  }).then(res => {
    return {
      loyalty_rewards: res.rows,
      count: res.count
    };
  });

exports.createVendorCustomerLoyaltyRewardCard = (vendor_uuid, new_card) =>
  Customer.LoyaltyReward.create(Object.assign({}, new_card, { vendor_uuid }));

exports.updateVendorCustomerLoyaltyRewardCard = (vendor_uuid, where, updates) =>
  Customer.LoyaltyReward.findOne({
    where: Object.assign({}, where || {}, { vendor_uuid })
  }).then(card => {
    if (!card) throw createNewError(Errors.REWARD_CARD_NOT_FOUND);
    return card.updateAttributes(updates);
  });

exports.deleteVendorCustomerLoyaltyRewardCard = (vendor_uuid, where) =>
  Customer.LoyaltyReward.destroy({
    where: Object.assign({}, where || {}, { vendor_uuid })
  });
