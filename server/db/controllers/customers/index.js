const bcrypt = require("bcrypt");
const { Customer } = require("../..");
const {
  removeProtected,
  findOrCreate,
  validateCustomer,
  validatePassword,
  isValidPassword
} = require("./utils");
const { createNewError } = require("../../../utils");
const Errors = require("../../../constants/Errors");

exports.loginCustomer = submittedCreds =>
  Customer.findOne({ where: { email: submittedCreds.email } })
    .then(customer => {
      if (!customer) throw createNewError(Errors.ACCOUNT_NOT_FOUND);
      return customer;
    })
    .then(customer => validatePassword(customer, submittedCreds))
    .then(removeProtected);

exports.getCustomer = id =>
  Customer.findById(id)
    .then(customer => {
      if (customer) return customer;
      throw createNewError(Errors.CUSTOMER_NOT_FOUND, {
        stackTrace: new Error(Errors.CUSTOMER_NOT_FOUND)
      });
    })
    .then(removeProtected);
exports.findCustomer = where =>
  Customer.findOne({ where })
    .then(customer => {
      if (customer) return customer;
      throw createNewError(Errors.CUSTOMER_NOT_FOUND, {
        stackTrace: new Error(Errors.CUSTOMER_NOT_FOUND)
      });
    })
    .then(removeProtected);
exports.createCustomer = customer => {
  delete customer.uuid;
  return findOrCreate(customer).then(removeProtected);
};

exports.updateCustomer = (id, updates) => {
  return Customer.findById(id)
    .then(customer => {
      if (!customer) throw createNewError(Errors.CUSTOMER_NOT_FOUND);
      return customer;
    })
    .then(customer => {
      if (!updates.password) return customer;
      if (!isValidPassword(updates.password))
        throw createNewError(Errors.PASSWORD_INVALID_COMPLEXITY);
      return bcrypt
        .genSalt()
        .then(salt => bcrypt.hash(updates.password, salt))
        .then(hash => {
          updates.password = hash;
          return customer;
        });
    })
    .then(customer => {
      delete updates.uuid;
      for (let attr in updates) {
        customer[attr] = updates[attr];
      }
      return customer;
    })
    .then(validateCustomer)
    .then(removeProtected);
};

exports.deleteCustomer = uuid =>
  Customer.destroy({ where: { uuid } }).then(rows => {
    if (!rows) throw createNewError(Errors.NOT_DELETED);
  });

exports.getCustomerDeviceToken = uuid =>
  exports.getCustomer(uuid).then(customer => customer.device_token);
