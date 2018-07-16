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
  try {
    if (error.IS_HASH_ERROR) throw error;
    else if (error.name === "SequelizeValidationError") {
      const errors = error.errors.map(err => err.message);
      throw exports.createNewError(Errors.MULTIPLE_ERRORS(errors));
    } else if (error.name && error.name.includes("Sequelize")) {
      const SequelizeErrorCode = error.original.code;
      const detail = error.original.detail || "";
      switch (SequelizeErrorCode) {
        case "23503":
          throw exports.createNewError(
            Errors.FOREIGN_KEY_DNE(
              detail
                .split("=")[0]
                .split("(")[1]
                .split(")")[0]
                .push("ss")
            )
          );
        default:
          throw exports.createNewError(
            Errors.INTERNAL_SERVER_ERROR,
            null,
            error
          );
      }
    } else {
      let newError;
      if (error.constructor.prototype === Error.prototype) {
        newError = {
          code: error.code,
          message: error.message
        };
      }
      newError = newError || Errors.INTERNAL_SERVER_ERROR;

      throw exports.createNewError(
        newError,
        {
          statusCode: 500,
          stackTrace: new Error(Errors.INTERNAL_SERVER_ERROR)
        },
        error
      );
    }
  } catch (e) {
    if (e.IS_HASH_ERROR) throw e;
    throw exports.createNewError(Errors.INTERNAL_SERVER_ERROR, undefined, e);
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
    // first_name: customer.first_name,
    // last_name: customer.last_name,
    username: customer.username,
    role: customer.role
  };
  const token = jwt.sign(trimmedCustomer, config.JWT_SESSION_SECRET, {
    // expiresIn: "3d"
    expiresIn: 60 * 60 * 24 * 3 // 3 days
  });
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
    // first_name: employee.first_name,
    // last_name: employee.last_name,
    username: employee.username,
    vendor_uuid: employee.vendor_uuid,
    role: employee.role
  };
  const token = jwt.sign(trimmedEmployee, config.JWT_SESSION_SECRET, {
    expiresIn: 60 * 60 * 24 * 3 // 3 days
  });
  employee.token = token;
  return employee;
};

exports.isVendorEmployee = req => {
  return exports.isVendorEmployeeUtility(req.user, req.params.vendorId);
};

exports.isVendorEmployeeUtility = (user, vendor_uuid) => {
  return !(
    user.role === USER_ROLES.CUSTOMER ||
    user.role === USER_ROLES.SUPERADMIN ||
    vendor_uuid !== user.vendor_uuid
  );
};
