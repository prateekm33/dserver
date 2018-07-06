const Sequelize = require("sequelize");
const sequelize = require("..").db;

exports.getLoyaltyRewards = ({ where, limit, offset }) => {
  const bind = { limit, offset };
  let query =
    "select json_build_object('loyalty_reward', lr)\"data\" from (select lr.*, json_build_object('data', v)vendor from loyalty_rewards lr inner join vendors v on v.uuid=lr.vendor_uuid)lr";
  const count_query = sequelize.query(query, {
    bind,
    type: Sequelize.QueryTypes.SELECT
  });
  query += " limit $limit offset $offset";
  const select_query = sequelize.query(query, {
    bind,
    type: Sequelize.QueryTypes.SELECT
  });
  return Promise.all([count_query, select_query]).then(results => {
    const count = results[0][0].count;
    const loyalty_rewards = results[1];
    return {
      loyalty_rewards,
      count,
      end: !loyalty_rewards.length
    };
  });
};
