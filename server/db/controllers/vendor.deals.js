const { Deal } = require("../");
const { createNewError } = require("../../utils");
const Errors = require("../../constants/Errors");

exports.getVendorDeal = (vendor_uuid, where) =>
  Deal.findOne({ where: Object.assign({}, where || {}, { vendor_uuid }) }).then(
    deal => {
      if (!deal) throw createNewError(Errors.RESOURCE_NOT_FOUND);
      return deal;
    }
  );

exports.getVendorDeals = (vendor_uuid, where) =>
  Deal.findAll({ where: Object.assign({}, where || {}, { vendor_uuid }) });

exports.createVendorDeal = (vendor_uuid, deal) =>
  Deal.create(Object.assign({}, deal, { vendor_uuid }));

exports.updateVendorDeal = (vendor_uuid, where, updates) =>
  exports
    .getVendorDeal(vendor_uuid, where)
    .then(deal => deal.updateAttributes(updates));

exports.deleteVendorDeal = (vendor_uuid, where) =>
  Deal.destroy({ where: Object.assign({}, where || {}, { vendor_uuid }) });
