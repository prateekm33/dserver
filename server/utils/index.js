const jwt = require("jsonwebtoken");
const config = require("../config");
const Errors = require("../constants/Errors");
const logger = require("../middleware/logger");
const { USER_ROLES } = require("../db/schemas/constants");

exports.createNewError = (message, details, error) => {
  details = details || {};
  logger.error(error, message, details.stackTrace);
  message = message || Errors.INTERNAL_SERVER_ERROR;
  if (message === Errors.INTERNAL_SERVER_ERROR) details.statusCode = 500;

  const newError = {
    error: message,
    statusCode: details.statusCode || 401,
    IS_HASH_ERROR: true,
    details
  };
  return newError;
};

exports.createNewSuccessMsg = (message, details) => {
  message = message || "";
  details = details || {};
  return {
    error: false,
    details,
    message
  };
};

exports.sendUnauthorizedMessage = res => {
  res.status(401).send(
    exports.createNewError(Errors.FORBIDDEN, {
      stackTrace: new Error(Errors.FORBIDDEN)
    })
  );
};

exports.catchControllerErrors = error => {
  if (error.IS_HASH_ERROR) throw error;
  else {
    let newError;
    if (error.constructor.prototype === Error.prototype) {
      newError = {
        code: error.code,
        message: error.message
      };
    }
    newError = newError || Errors.INTERNAL_SERVER_ERROR;

    newError = parseStripeErrors(newError);

    throw exports.createNewError(
      newError,
      {
        statusCode: 500,
        stackTrace: new Error(Errors.INTERNAL_SERVER_ERROR)
      },
      error
    );
  }
};

exports.paramsHasCustomerId = req => {
  return (
    req.params.paramsHasCustomerId !== undefined &&
    req.params.paramsHasCustomerId !== null &&
    req.params.paramsHasCustomerId !== ""
  );
};

exports.saveCustomerSession = customer => {
  const trimmedCustomer = {
    uuid: customer.uuid,
    email: customer.email,
    device_token: customer.device_token,
    device_uuid: customer.device_uuid,
    first_name: customer.first_name,
    last_name: customer.last_name,
    username: customer.username
  };
  const token = jwt.sign(trimmedCustomer, config.JWT_SESSION_SECRET);
  customer.token = token;
  return customer;
};

exports.saveVendorEmployeeSession = employee => {
  // Configure employee to only contain the properties that we want to save
  const trimmedEmployee = {
    uuid: employee.uuid,
    email: employee.email,
    device_token: employee.device_token,
    device_uuid: employee.device_uuid,
    first_name: employee.first_name,
    last_name: employee.last_name,
    username: employee.username,
    vendor_uuid: employee.vendor_uuid
  };
  const token = jwt.sign(trimmedEmployee, config.JWT_SESSION_SECRET);
  employee.token = token;
  return employee;
};

exports.isVendorEmployee = req => {
  return !(
    req.user.role === USER_ROLES.CUSTOMER ||
    req.user.role === USER_ROLES.SUPERADMIN ||
    req.params.vendorId !== req.user.vendor_uuid
  );
};
