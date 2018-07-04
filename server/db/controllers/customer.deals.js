const { Customer, Deal } = require("../");
const { createNewError } = require("../../utils");
const Errors = require("../../constants/Errors");

exports.getVendorCustomerDeal = (vendor_uuid, where) =>
  Customer.Deal.findOne({
    where: Object.assign({}, where || {}, { vendor_uuid })
  }).then(deal => {
    if (!deal) throw createNewError(Errors.CUSTOMER_DEAL_NOT_FOUND);
    return deal;
  });

exports.getVendorCustomerDeals = (vendor_uuid, { where, limit, offset }) =>
  Customer.Deal.findAndCountAll({
    where: Object.assign({}, where || {}, vendor_uuid ? { vendor_uuid } : {}),
    limit,
    offset,
    include: [
      {
        association: Deal,
        through: {
          attributes: ["is_saved", "is_used", "is_archived", "is_deleted"]
        },
        where: Object.assign({}, vendor_uuid ? { vendor_uuid } : {}),
        attributes: ["uuid", "code", "name", "short_desc", "long_desc"]
      }
    ]
  }).then(res => {
    return {
      deals: res.rows,
      count: res.count
    };
  });

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
  }).then(res => {
    console.log("----deleted ? ", res);
    return res;
  });
