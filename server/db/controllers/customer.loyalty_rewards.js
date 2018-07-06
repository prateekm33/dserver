const sequelize = require("..").db;
const { Customer } = require("../");
const { createNewError } = require("../../utils");
const Errors = require("../../constants/Errors");

exports.getVendorCustomerLoyaltyRewardCard = (vendor_uuid, where) => {
  const bind = {
    customer_uuid: where.customer_uuid,
    vendor_uuid,
    loyalty_reward_uuid: where.loyalty_reward_uuid
  };
  let query =
    "select json_build_object('loyalty_reward', cr, 'vendor', v)\"data\" from (select lr.*,cr.points,cr.num_points_redeemed  from (select * from customer_rewards cr where cr.customer_uuid=$customer_uuid and cr.loyalty_reward_uuid=$loyalty_reward_uuid and cr.vendor_uuid=$vendor_uuid)cr inner join loyalty_rewards lr on lr.uuid=cr.loyalty_reward_uuid)cr inner join vendors v on v.uuid=cr.vendor_uuid";
  return sequelize
    .query(query, { bind, type: sequelize.QueryTypes.SELECT })
    .then(res => {
      if (!res || !res.length)
        throw createNewError(Errors.CUSTOMER_REWARD_CARD_NOT_FOUND);
      return res[0];
    });
};

exports.getVendorCustomerLoyaltyRewardCards = (
  vendor_uuid,
  { where, limit, offset }
) => {
  const bind = { customer_uuid: where.customer_uuid, limit, offset };
  let query =
    "select json_build_object('loyalty_reward', cr, 'vendor', v)\"data\" from (select lr.*,cr.points,cr.num_points_redeemed,cr.\"createdAt\"  from (select * from customer_rewards cr where cr.customer_uuid=$customer_uuid)cr inner join loyalty_rewards lr on lr.uuid=cr.loyalty_reward_uuid)cr inner join vendors v on v.uuid=cr.vendor_uuid";

  if (vendor_uuid) {
    bind.vendor_uuid = vendor_uuid;
    query += "and v.uuid=$vendor_uuid";
  }
  const count_query = sequelize.query(
    `select count(*) from (${query}) as rewards`,
    {
      bind,
      type: sequelize.QueryTypes.SELECT
    }
  );
  query += " limit $limit offset $offset";
  const select_query = sequelize.query(query, {
    bind,
    type: sequelize.QueryTypes.SELECT
  });
  return Promise.all([count_query, select_query]).then(results => {
    const count = results[0][0].count;
    const loyalty_rewards = results[1];
    if (!loyalty_rewards.length) return { loyalty_rewards, end: true, count };
    return { loyalty_rewards, end: false, count };
  });
};

exports.createVendorCustomerLoyaltyRewardCard = (vendor_uuid, new_card) =>
  Customer.LoyaltyReward.create(Object.assign({}, new_card, { vendor_uuid }));

exports.updateVendorCustomerLoyaltyRewardCard = (vendor_uuid, where, updates) =>
  Customer.LoyaltyReward.findOne({
    where: Object.assign({}, where || {}, { vendor_uuid })
  }).then(card => {
    if (!card) throw createNewError(Errors.CUSTOMER_REWARD_CARD_NOT_FOUND);
    return card.updateAttributes(updates);
  });

exports.deleteVendorCustomerLoyaltyRewardCard = (vendor_uuid, where) =>
  Customer.LoyaltyReward.destroy({
    where: Object.assign({}, where || {}, { vendor_uuid })
  }).then(rows => {
    if (!rows) throw createNewError(Errors.NOT_DELETED);
  });
