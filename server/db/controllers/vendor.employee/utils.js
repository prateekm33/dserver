const { VendorEmployee } = require("../../");
const bcrypt = require("bcrypt");
const Errors = require("../../../constants/Errors");

exports.removeProtected = user => {
  const protectedUser = { ...user.get() };
  delete protectedUser.password;
  return protectedUser;
};

exports.validateVendorEmployee = user => {
  return user.validate().then(validated => validated.save());
};

exports.findOrCreate = employee => {
  return VendorEmployee.findOne({
    where: { email: employee.email, vendor_uuid: employee.vendor_uuid }
  })
    .then(found => {
      if (!!found) {
        throw createNewError(Errors.ACCOUNT_EXISTS);
      }
    })
    .then(() => {
      if (!isValidPassword(employee.password))
        throw createNewError(Errors.PASSWORD_INVALID_COMPLEXITY);
      return bcrypt
        .genSalt()
        .then(salt => bcrypt.hash(employee.password, salt))
        .then(hash => {
          employee.password = hash;
          return employee;
        });
    })
    .then(employee => VendorEmployee.build(employee))
    .then(exports.validateVendorEmployee);
};

function isValidPassword(password) {
  const hasValidLength = password.length >= 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasNonalphas = /\W/.test(password);
  return (
    hasValidLength && hasUpperCase && hasLowerCase && hasNumbers && hasNonalphas
  );
}
