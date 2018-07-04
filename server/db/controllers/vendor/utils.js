const { Vendor } = require("../../");
const Errors = require("../../../constants/Errors");
const { createNewError } = require("../../../utils");

exports.validateVendor = vendor => {
  return vendor.validate().then(validated => validated.save());
};

exports.findOrCreate = vendor => {
  return Vendor.findOrCreate({
    where: { name: vendor.name, address: vendor.address }
  }).spread((created_vendor, created) => {
    if (!created) throw createNewError(Errors.VENDOR_EXISTS);
    return created_vendor;
  });
};

//   return Vendor.findOne({
//     where: { name: vendor.name, address: vendor.address }
//   })
//     .then(found => {
//       if (!!found) {
//         throw createNewError(Errors.VENDOR_EXISTS, {
//           userExists: true,
//           stackTrace: new Error(Errors.VENDOR_EXISTS)
//         });
//       }
//     })
//     .then(() => Vendor.build(vendor))
//     .then(exports.validateVendor);
// };
