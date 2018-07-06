const { Customer } = require("../..");
const {
  removeProtected,
  findOrCreate,
  validateCustomer,
  validatePassword
} = require("./utils");
const { createNewError, saveCustomerSession } = require("../../../utils");
const Errors = require("../../../constants/Errors");

exports.loginCustomer = submittedCreds =>
  Customer.findOne({ where: { email: submittedCreds.email } })
    .then(customer => {
      if (!customer) throw createNewError(Errors.ACCOUNT_NOT_FOUND);
      console.log("---->>>>", customer);
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

exports.createCustomer = customer => {
  delete customer.uuid;
  return findOrCreate(customer).then(removeProtected);
  // .catch(err => {
  //   console.log("-----TODO...double check this --", err);
  //   if (err.IS_HASH_ERROR) throw err;
  //   else if (err.name === "SequelizeValidationError") {
  //     if (err.errors[0].path === "email") {
  //       throw createNewError(Errors.INVALID_EMAIL, {
  //         stackTrace: new Error(Errors.INVALID_EMAIL)
  //       });
  //     }
  //   }
  // });
};

exports.updateCustomer = (id, updates) => {
  return Customer.findById(id)
    .then(customer => {
      if (!customer) throw createNewError(Errors.CUSTOMER_NOT_FOUND);
      console.log(
        "------TODO...need to check if this actually works...., might have to call customer.get first"
      );
      delete updates.uuid;
      for (let attr in updates) {
        customer[attr] = updates[attr];
      }
      return customer;
    })
    .then(validateCustomer)
    .then(removeProtected)
    .then(saveCustomerSession);
};

exports.deleteCustomer = uuid =>
  Customer.destroy({ where: { uuid } }).then(rows => {
    if (!rows) throw createNewError(Errors.NOT_DELETED);
  });
