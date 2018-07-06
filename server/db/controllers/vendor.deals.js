const Sequelize = require("sequelize");
const { Deal, db } = require("../");
const sequelize = db;
const { createNewError } = require("../../utils");
const Errors = require("../../constants/Errors");

exports.getVendorDeal = (vendor_uuid, where) => {
  let query =
    "select json_build_object('deal', d, 'vendor', v)\"data\" from (select * from deals d where d.vendor_uuid=$vendor_uuid and d.uuid=$uuid)d inner join vendors v on v.uuid=d.vendor_uuid";
  const bind = {
    vendor_uuid,
    uuid: where.uuid
  };
  return sequelize
    .query(query, { bind, type: Sequelize.QueryTypes.SELECT })
    .then(res => {
      if (!res || !res.length)
        throw createNewError(Errors.VENDOR_DEAL_NOT_FOUND);
      return res[0];
    });
};

exports.getVendorDeals = (vendor_uuid, { limit, offset }) => {
  let query =
    "select json_build_object('deal', d, 'vendor', v)\"data\" from (select * from deals d where d.vendor_uuid=$vendor_uuid)d inner join vendors v on v.uuid=d.vendor_uuid";
  const bind = { vendor_uuid, limit, offset };
  const count_query = sequelize.query(
    `select count(*) from (${query}) as deals`,
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
    const deals = results[1];
    if (!deals.length) return { deals, end: true, count };
    return { deals, end: false, count };
  });
};

exports.createVendorDeal = (vendor_uuid, deal) => {
  delete deal.uuid;
  return Deal.create(Object.assign({}, deal, { vendor_uuid }), {
    fields: ["code", "name", "short_desc", "long_desc", "vendor_uuid"]
  });
};

exports.updateVendorDeal = (vendor_uuid, where, updates) => {
  delete updates.uuid;
  return Deal.findOne({
    where: Object.assign({}, where || {}, { vendor_uuid })
  }).then(deal => {
    if (!deal) throw createNewError(Errors.VENDOR_DEAL_NOT_FOUND);
    return deal.updateAttributes(updates);
  });
};

exports.deleteVendorDeal = (vendor_uuid, where) =>
  Deal.destroy({ where: Object.assign({}, where || {}, { vendor_uuid }) }).then(
    rows => {
      if (!rows) throw createNewError(Errors.NOT_DELETED);
    }
  );
