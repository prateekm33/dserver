const { Customer } = require("../../");
const bcrypt = require("bcrypt");
const Errors = require("../../../constants/Errors");
const { createNewError } = require("../../../utils");

exports.removeProtected = customer => {
  const protectedCustomer = { ...customer.get() };
  delete protectedCustomer.password;
  return protectedCustomer;
};

exports.validateCustomer = customer => {
  return customer.validate().then(validated =>
    validated.save({
      fields: [
        "is_searchable",
        "email",
        "password",
        "device_token",
        "device_uuid",
        "phone"
      ]
    })
  );
};

exports.findOrCreate = customer => {
  return Customer.findOne({ where: { email: customer.email } })
    .then(found => {
      if (!!found) {
        throw createNewError(Errors.ACCOUNT_EXISTS);
      }
    })
    .then(() => {
      if (!exports.isValidPassword(customer.password))
        throw createNewError(Errors.PASSWORD_INVALID_COMPLEXITY);
      return bcrypt
        .genSalt()
        .then(salt => bcrypt.hash(customer.password, salt))
        .then(hash => {
          customer.password = hash;
          return customer;
        });
    })
    .then(customer => Customer.build(customer))
    .then(exports.validateCustomer);
};

exports.validatePassword = (customer, submittedCredentials) => {
  return bcrypt
    .compare(submittedCredentials.password, customer.password)
    .then(match => {
      if (match) return customer;
      else
        throw createNewError(Errors.INCORRECT_PASSWORD, {
          stackTrace: new Error(Errors.INCORRECT_PASSWORD)
        });
    });
};

exports.isValidPassword = password => {
  const hasValidLength = password.length >= 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasNonalphas = /\W/.test(password);
  return (
    hasValidLength && hasUpperCase && hasLowerCase && hasNumbers && hasNonalphas
  );
};
