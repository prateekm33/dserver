const { LoyaltyReward } = require("..");

exports.getLoyaltyRewards = ({ limit, offset, where }) =>
  LoyaltyReward.findAndCountAll({ limit, offset, where: where || {} }).then(
    result => ({
      loyalty_rewards: result.rows,
      count: result.count
    })
  );
