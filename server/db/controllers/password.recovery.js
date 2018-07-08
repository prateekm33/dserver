const crypto = require("crypto");
const {
  PasswordRecoveryCustomer,
  PasswordRecoveryVendor,
  Customer,
  VendorEmployee
} = require("../");
const { findCustomer } = require("./customers");
const { getVendorEmployee } = require("./vendor.employee");
const Errors = require("../../constants/Errors");
const { createNewError } = require("../../utils");
const moment = require("moment");

exports.generatePasswordResetLinkCustomer = customer => {
  const customer_where = {};
  if (customer.email) customer_where.email = customer.email;
  if (customer.username) customer_where.username = customer.username;
  return findCustomer(where)
    .then(customer => {
      return PasswordRecoveryCustomer.findOne({
        where: {
          uuid: customer.uuid
        }
      }).then(found => {
        if (!found) return customer;
        throw createNewError(Errors.EXISTING_PASSWORD_RESET_REQUEST);
      });
    })
    .then(customer => {
      return generatePasswordResetToken().then(token => {
        return PasswordRecoveryCustomer.create({
          customer_uuid: customer.uuid,
          token,
          expiration_date: moment().add(1, "h")
        }).then(result => ({
          token: result.token,
          email: customer.email
        }));
      });
    })
    .then(({ email, token }) => {
      return emailPasswordRecoveryLinkCustomer(email, token);
    });
};

exports.generatePasswordResetLinkVendor = employee => {
  const employee_where = {};
  if (employee.email) employee_where.email = employee.email;
  if (employee.username) employee_where.username = employee.username;
  return getVendorEmployee(where)
    .then(employee => {
      return PasswordRecoveryEmployee.findOne({
        where: {
          uuid: employee.uuid
        }
      }).then(found => {
        if (!found) return employee;
        throw createNewError(Errors.EXISTING_PASSWORD_RESET_REQUEST);
      });
    })
    .then(employee => {
      return generatePasswordResetToken().then(token => {
        return PasswordRecoveryVendor.create({
          employee_uuid: employee.uuid,
          token,
          expiration_date: moment().add(1, "h")
        }).then(result => ({
          token: result.token,
          email: customer.email
        }));
      });
    })
    .then(({ email, token }) => {
      return emailPasswordRecoveryLinkVendor(email, token);
    });
};

function generatePasswordResetToken() {
  return new Promise((res, rej) => {
    crypto.randomBytes(256, (err, buff) => {
      if (err) return rej(err);
      res(buff.toString("hex" /* utf-8 is default type */));
    });
  });
}

function emailPasswordRecoveryLinkCustomer(email, token) {
  console.warn(
    "------TODO...complete. need an email service (ie: nodemailer), a landing page for resetting passwords, a proper landing page url, etc"
  );
}
