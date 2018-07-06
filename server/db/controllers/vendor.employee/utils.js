const { VendorEmployee } = require("../../");
const bcrypt = require("bcrypt");
const Errors = require("../../../constants/Errors");
const { createNewError } = require("../../../utils");

exports.removeProtected = user => {
  const protectedUser = { ...user.get() };
  delete protectedUser.password;
  return protectedUser;
};

exports.validateVendorEmployee = user => {
  return user.validate().then(validated =>
    validated.save({
      fields: [
        "first_name",
        "last_name",
        "email",
        "password",
        "role",
        "device_token",
        "device_uuid",
        "phone",
        "vendor_uuid"
      ]
    })
  );
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

exports.validatePassword = (employee, submittedCredentials) => {
  return bcrypt
    .compare(submittedCredentials.password, employee.password)
    .then(match => {
      if (match) return employee;
      else
        throw createNewError(Errors.INCORRECT_PASSWORD, {
          stackTrace: new Error(Errors.INCORRECT_PASSWORD)
        });
    });
};

function isValidPassword(password) {
  const hasValidLength = password.length >= 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasNonalphas = /\W/.test(password);
  console.log(
    hasValidLength,
    hasUpperCase,
    hasLowerCase,
    hasNonalphas,
    hasNumbers
  );
  return (
    hasValidLength && hasUpperCase && hasLowerCase && hasNumbers && hasNonalphas
  );
}
