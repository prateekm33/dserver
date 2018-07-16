const { Vendor } = require("../../");
const { findOrCreate, validateVendor } = require("./utils");
const Errors = require("../../../constants/Errors");
const { createNewError } = require("../../../utils");

exports.getVendor = id =>
  Vendor.findById(id).then(vendor => {
    if (vendor) return vendor;
    throw createNewError(Errors.VENDOR_NOT_FOUND, {
      stackTrace: new Error(Errors.VENDOR_NOT_FOUND)
    });
  });

exports.getVendors = ({ where, limit, offset }) =>
  Vendor.findAll({
    where: where || {},
    limit,
    offset
  }).then(res => {
    return {
      end: !(res || []).length,
      vendors: res,
      count: (res || []).length
    };
  });

exports.createVendor = vendor => {
  delete vendor.uuid;
  return findOrCreate(vendor);
};

exports.updateVendor = id => {
  return Vendor.findById(id)
    .then(vendor => {
      if (!vendor) throw createNewError(Errors.VENDOR_NOT_FOUND);
      console.log(
        "------TODO...need to check if this actually works...., might have to call vendor.get first"
      );
      delete updates.uuid;
      for (let attr in updates) {
        vendor[attr] = updates[attr];
      }
      return vendor;
    })
    .then(validateVendor);
};
exports.deleteVendor = uuid =>
  Vendor.destroy({ where: { uuid } }).then(rows => {
    if (!rows) throw createNewError(Errors.NOT_DELETED);
  });
