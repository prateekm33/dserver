const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const { db, neo4j, Deal } = require("..");
const sequelize = db;

exports.getDeals = ({ where, limit, offset }) => {
  const bind = { limit, offset };
  let query =
    "select json_build_object('deal', d)\"data\" from (select d.*, json_build_object('data', v)vendor from deals d inner join vendors v on v.uuid=d.vendor_uuid)d";
  const count_query = sequelize.query(
    `select count(*) from (${query}) as deals`,
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
    const deals = results[1];
    return {
      deals,
      count,
      end: !deals.length
    };
  });
};

exports.searchDeals = ({ search, limit, offset }) => {
  const session = neo4j.session();
  return session
    .run(
      `MATCH (t:Tag)<-[r:HAS_TAG]-(d:Deal) 
      WHERE t.title STARTS WITH {search} 
      return d skip {offset} limit {limit}
      `,
      { search: (search || "").toLowerCase(), limit, offset }
    )
    .then(results => {
      session.close();
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
