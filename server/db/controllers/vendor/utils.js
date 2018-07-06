const { Vendor } = require("../../");
const Errors = require("../../../constants/Errors");
const { createNewError } = require("../../../utils");

exports.validateVendor = vendor => {
  return vendor.validate().then(validated =>
    validated.save({
      fields: [
        "name",
        "business_email",
        "business_phone",
        "type",
        "primary_contact_name",
        "primary_contact_email",
        "primary_contact_phone",
        "address"
      ]
    })
  );
};

exports.findOrCreate = vendor => {
  return Vendor.findOne({
    where: { name: vendor.name, address: vendor.address }
  })
    .then(found => {
      if (!!found) throw createNewError(Errors.VENDOR_EXISTS);
    })
    .then(() => {
      return Vendor.build(vendor);
    })
    .then(exports.validateVendor);
};
