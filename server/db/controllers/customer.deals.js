const sequelize = require("..").db;
const { Customer, Deal } = require("../");
const { createNewError } = require("../../utils");
const Errors = require("../../constants/Errors");

exports.getVendorCustomerDeal = (vendor_uuid, where) => {
  const bind = {
    customer_uuid: where.customer_uuid,
    vendor_uuid,
    deal_uuid: where.deal_uuid
  };
  let query =
    "select json_build_object('deal', cd, 'vendor', v)\"data\" from (select d.*,cd.is_used, cd.is_archived,cd.is_deleted,cd.is_saved from (select * from customer_deals cd where cd.customer_uuid=$customer_uuid and cd.deal_uuid=$deal_uuid and cd.vendor_uuid=$vendor_uuid)cd inner join deals d on d.uuid=cd.deal_uuid)cd inner join vendors v on v.uuid=cd.vendor_uuid";
  return sequelize
    .query(query, { bind, type: sequelize.QueryTypes.SELECT })
    .then(res => {
      if (!res || !res.length)
        throw createNewError(Errors.CUSTOMER_DEAL_NOT_FOUND);
      return res[0];
    });
};

exports.getVendorCustomerDeals = (vendor_uuid, { where, limit, offset }) => {
  const bind = { customer_uuid: where.customer_uuid, limit, offset };
  let query =
    "select json_build_object('deal', cd, 'vendor', v)\"data\" from (select d.*,cd.is_used, cd.is_archived,cd.is_deleted,cd.is_saved,cd.\"createdAt\" from (select * from customer_deals cd where cd.customer_uuid=$customer_uuid)cd inner join deals d on d.uuid=cd.deal_uuid)cd inner join vendors v on v.uuid=cd.vendor_uuid";
  if (vendor_uuid) {
    bind.vendor_uuid = vendor_uuid;
    query += "and v.uuid=$vendor_uuid";
  }
  const count_query = sequelize.query(
    `select count(*) from (${query}) as deals`,
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
    const deals = results[1];
    if (!deals.length) return { deals, end: true, count };
    return { deals, end: false, count };
  });
};

exports.createVendorCustomerDeal = (vendor_uuid, new_deal) =>
  Customer.Deal.findOrCreate({
    where: Object.assign({}, new_deal, { vendor_uuid })
  }).spread((deal, created) => {
    if (!created) throw createNewError(Errors.DEAL_ALREADY_SAVED);
    return deal;
  });

exports.updateVendorCustomerDeal = (vendor_uuid, where, updates) =>
  Customer.Deal.findOne({
    where: Object.assign({}, where || {}, { vendor_uuid })
  }).then(deal => {
    if (!deal) throw createNewError(Errors.CUSTOMER_DEAL_NOT_FOUND);
    return deal.updateAttributes(updates);
  });

// TODO--- check what none deleted returns...
exports.deleteVendorCustomerDeal = (vendor_uuid, where) =>
  Customer.Deal.destroy({
    where: Object.assign({}, where || {}, { vendor_uuid })
  }).then(rows => {
    if (!rows) throw createNewError(Errors.NOT_DELETED);
  });
