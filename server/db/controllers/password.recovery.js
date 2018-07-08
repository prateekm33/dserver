const crypto = require("crypto");
const config = require("../../config");
const { PasswordRecoveryCustomer, PasswordRecoveryVendor } = require("../");
const { findCustomer } = require("./customers");
const { getVendorEmployee } = require("./vendor.employee");
const Errors = require("../../constants/Errors");
const { createNewError } = require("../../utils");
const moment = require("moment");
const mailgun = require("../../utils/mailgun.client");

exports.generatePasswordResetLinkCustomer = customer => {
  const customer_where = {};
  if (customer.email) customer_where.email = customer.email;
  if (customer.username) customer_where.username = customer.username;
  return findCustomer(customer_where)
    .then(customer => {
      return PasswordRecoveryCustomer.findOne({
        where: {
          customer_uuid: customer.uuid
        }
      }).then(found => {
        console.log("-----found ? ", found);
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
  return getVendorEmployee(employee_where)
    .then(employee => {
      return PasswordRecoveryEmployee.findOne({
        where: {
          employee_uuid: employee.uuid
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
  const data = {
    from: config.MAILGUN.FROM_ADDRESS,
    to: "prateekm33@gmail.com", // TODO...replace with email variable
    subject: `Password Recovery Instructions - Dineable`,
    html: `<a href='${config.SERVER.PROTOCOL}://${config.SERVER.DOMAIN}${
      config.SERVER.PORT ? ":" + config.SERVER.PORT : ""
    }/password_recovery?token=${token}'>Recover your password</a>`
  };

  return mailgun.messages().send(data);
}
