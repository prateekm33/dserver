const { Vendor } = require("../..");
const { findOrCreate, validateVendor } = require("./utils");
const Errors = require("../../../constants/Errors");
const { createNewError } = require("../../../utils");

exports.getVendor = id =>
  Vendor.findById(id).then(user => {
    if (user) return user;
    throw createNewError(Errors.VENDOR_NOT_FOUND, {
      stackTrace: new Error(Errors.VENDOR_NOT_FOUND)
    });
  });

exports.createVendor = vendor => {
  return findOrCreate(vendor).catch(err => {
    if (err.IS_HASH_ERROR) throw err;
    else if (err.name === "SequelizeValidationError") {
      console.log("---------TODO...HANDLE ERROR BETTER: ");
      throw createNewError(Errors.INTERNAL_SERVER_ERROR, null, err);
      // if (err.errors[0].path === "email") {
      //   throw createNewError(Errors.INVALID_EMAIL, {
      //     stackTrace: new Error(Errors.INVALID_EMAIL)
      //   });
      // }
    }
  });
};
exports.updateVendor = id => {
  return Vendor.findById(id)
    .then(vendor => {
      if (!vendor) throw createNewError(Errors.VENDOR_NOT_FOUND);
      console.log(
        "------TODO...need to check if this actually works...., might have to call customer.get first"
      );
      for (let attr in updates) {
        vendor[attr] = updates[attr];
      }
      return vendor;
    })
    .then(validateVendor);
};
exports.deleteVendor = uuid => Vendor.destroy({ where: { uuid } });
