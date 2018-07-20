const Sequelize = require("sequelize");
const { LoyaltyReward, db } = require("../");
const sequelize = db;
const { createNewError } = require("../../utils");
const Errors = require("../../constants/Errors");

exports.getVendorReward = (vendor_uuid, where) => {
  let query =
    "select json_build_object('loyalty_reward', lr, 'vendor', v)\"data\" from (select * from loyalty_rewards lr where lr.vendor_uuid=$vendor_uuid and lr.uuid=$uuid)lr inner join vendors v on v.uuid=lr.vendor_uuid";
  const bind = {
    vendor_uuid,
    uuid: where.uuid
  };
  return sequelize
    .query(query, { bind, type: Sequelize.QueryTypes.SELECT })
    .then(res => {
      if (!res || !res.length)
        throw createNewError(Errors.VENDOR_REWARD_NOT_FOUND);
      return res[0];
    });
};

exports.getVendorRewards = (vendor_uuid, { limit, offset }) => {
  let query =
    "select json_build_object('loyalty_reward', lr, 'vendor', v)\"data\" from (select * from loyalty_rewards lr where lr.vendor_uuid=$vendor_uuid)lr inner join vendors v on v.uuid=lr.vendor_uuid";
  const bind = { vendor_uuid, limit, offset };
  const count_query = sequelize.query(
    `select count(*) from (${query}) as loyalty_rewards`,
    {
      bind,
      type: Sequelize.QueryTypes.SELECT
    }
  );
  query += ` limit $limit offset $offset`;
  const select_query = sequelize.query(query, {
    bind,
    type: Sequelize.QueryTypes.SELECT
  });
  return Promise.all([count_query, select_query]).then(results => {
    const count = results[0][0].count;
    const loyalty_rewards = results[1];
    if (!loyalty_rewards.length) return { loyalty_rewards, end: true, count };
    return { loyalty_rewards, end: false, count };
  });
};
// LoyaltyReward.findAll({ where });

exports.createVendorReward = (vendor_uuid, reward) => {
  delete reward.uuid;
  let tags = [];
  if (Array.isArray(reward.tags))
    tags = reward.tags
      .map(r => {
        if (typeof r !== "string") return false;
        return r.toLowerCase();
      })
      .filter(r => !!r);
  return LoyaltyReward.create(Object.assign({}, reward, { vendor_uuid }), {
    fields: [
      "code",
      "name",
      "short_desc",
      "long_desc",
      "vendor_uuid",
      "points_reward_ratio",
      "tags"
    ]
  }).then(new_reward => {
    const session = neo4j.session();
    return session
      .run(
        `
        UNWIND {tags} as tag
        MERGE (t:Tag { title: tag })
        MERGE (r:Reward { 
          uuid: {uuid},
          vendor_uuid: {vendor_uuid}
        })
        MERGE (v:Vendor { uuid: {vendor_uuid} })
        CREATE (r)-[r1:FOR_VENDOR]->(v)
        CREATE (r)-[r2:HAS_TAG]->(t)
      `,
        {
          uuid: new_reward.uuid,
          vendor_uuid,
          tags
        }
      )
      .then(results => {
        session.close();
        return true;
      })
      .catch(err => {
        // TODO....send push notification that tags were not saved
        session.close();
        return false;
      })
      .then(() => new_reward);
  });
};

exports.updateVendorReward = (vendor_uuid, where, updates) => {
  delete updates.uuid;
  return LoyaltyReward.findOne({
    where: Object.assign({}, where || {}, { vendor_uuid })
  }).then(reward => {
    if (!reward) throw createNewError(Errors.VENDOR_REWARD_NOT_FOUND);
    return reward.updateAttributes(updates);
  });
};

exports.deleteVendorReward = where =>
  LoyaltyReward.destroy({ where }).then(rows => {
    if (!rows) throw createNewError(Errors.NOT_DELETED);
  });
