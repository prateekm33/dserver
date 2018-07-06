const Sequelize = require("sequelize");
const sequelize = require("..").db;

exports.getDeals = ({ where, limit, offset }) => {
  const bind = { limit, offset };
  let query =
    "select json_build_object('deal', d)\"data\" from (select d.*, json_build_object('data', v)vendor from deals d inner join vendors v on v.uuid=d.vendor_uuid)d";
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
    const deals = results[1];
    return {
      deals,
      count,
      end: !deals.length
    };
  });
};
