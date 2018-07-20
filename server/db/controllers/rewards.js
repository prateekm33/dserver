const Sequelize = require("sequelize");
const sequelize = require("..").db;

exports.getLoyaltyRewards = ({ where, limit, offset }) => {
  const bind = { limit, offset };
  let query =
    "select json_build_object('loyalty_reward', lr)\"data\" from (select lr.*, json_build_object('data', v)vendor from loyalty_rewards lr inner join vendors v on v.uuid=lr.vendor_uuid)lr";
  const count_query = sequelize.query(
    `select count(*) from (${query}) as rewards`,
    {
      bind,
      type: Sequelize.QueryTypes.SELECT
    }
  );
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

exports.searchDeals = ({ search, limit, offset }) => {
  const session = neo4j.session();
  return session
    .run(
      `
      MATCH 
        (r:Reward)-[re1:HAS_TAG]->(t:Tag), 
        (r)-[:FOR_VENDOR]->(v:Vendor)
      WHERE 
        t.title STARTS WITH {search} OR
        v.name STARTS WITH {search}
      RETURN v
      `,
      { search: (search || "").toLowerCase(), limit, offset }
    )
    .then(results => {
      session.close();
      console.log("-----> results :", results);
      return results.records.map(record => record._fields[0].properties);
    })
    .catch(error => {
      session.close();
      throw error;
    })
    .then(deals => {
      const uuids = deals.map(deal => deal.uuid);
      return Deal.findAll({
        where: { uuid: { [Op.in]: uuids } }
      }).then(deals => ({ deals }));
    });
};
