const config = require("../config");
const compose = require("compose-middleware").compose;
const {
  createNewError,
  sendUnauthorizedMessage,
  isVendorEmployee,
  isVendorEmployeeUtility
} = require("../utils");
const expressJWT = require("express-jwt");
const { getCustomer, getVendorEmployee } = require("../db/controllers");
const { USER_ROLES } = require("../db/schemas/constants");
const { TokenBlacklist } = require("../db");
const Errors = require("../constants/Errors");
const { getSuperAdmin } = require("../routes/controllers/gotham.router");

exports.isAdmin = (req, res, next) => {
  if (
    req.user.role !== USER_ROLES.SUPERADMIN &&
    req.user.role !== USER_ROLES.VENDOR_ADMIN &&
    req.user.role !== USER_ROLES.VENDOR_ACCOUNT_OWNER
  ) {
    return sendUnauthorizedMessage(res);
  } else if (
    req.user.role === USER_ROLES.VENDOR_ADMIN &&
    req.params.vendorId !== req.user.vendor_uuid
  ) {
    return sendUnauthorizedMessage(res);
  } else if (
    req.user.role === USER_ROLES.VENDOR_ACCOUNT_OWNER &&
    req.params.vendorId !== req.user.vendor_uuid
  )
    return sendUnauthorizedMessage(res);
  else next();
};

exports.isVendorEmployee = (req, res, next) => {
  if (isVendorEmployee(req)) return next();
  else return sendUnauthorizedMessage(res);
};

// only SUPERADMIN and employees of vendor can access; and CUSTOMER can access self
exports.canAccessCustomerRewards = (req, res, next) => {
  if (req.user.role === USER_ROLES.SUPERADMIN) next();
  else if (
    req.user.role === USER_ROLES.CUSTOMER &&
    req.user.uuid === req.params.customerId
  )
    next();
  else exports.isVendorEmployee(req, res, next);
};

// only SUPERADMIN and employees (VENDOR_ADMIN + VENDOR_EMPLOYEE) of vendor can modify
exports.canModifyCustomerRewards = (req, res, next) => {
  if (req.user.role === USER_ROLES.SUPERADMIN) return next();
  else exports.isVendorEmployee(req, res, next);
};

// only SUPERADMIN can access; CUSTOMER can access self
exports.canAccessCustomer = (req, res, next) => {
  if (req.user.role === USER_ROLES.SUPERADMIN) return next();
  else if (req.user.role !== USER_ROLES.CUSTOMER)
    return sendUnauthorizedMessage(res);
  else if (req.params.customerId === req.user.uuid) return next();
  else sendUnauthorizedMessage(res);
};

// only SUPERADMIN and VENDOR_ADMINs of vendor can access; VENDOR_EMPLOYEE can access self
exports.canAccessVendorEmployee = (req, res, next) => {
  if (
    req.user.role === USER_ROLES.VENDOR_EMPLOYEE &&
    req.user.uuid === req.params.userId
  )
    next();
  else exports.isAdmin(req, res, next);
};

// only SUPERADMIN and employees (VENDOR_ADMIN + VENDOR_EMPLOYEE) of vendor can access vendor
exports.canAccessVendor = (req, res, next) => {
  if (req.user.role === USER_ROLES.SUPERADMIN) next();
  else exports.isVendorEmployee(req, res, next);
};

// only SUPERADMIN and VENDOR_ADMINs of vendor can modify vendor
exports.canModifyVendor = (req, res, next) => {
  if (req.user.role === USER_ROLES.SUPERADMIN) next();
  else if (
    req.user.role === USER_ROLES.CUSTOMER ||
    req.params.vendorId !== req.user.vendor_uuid
  )
    return sendUnauthorizedMessage(res);
  else if (
    req.user.role !== USER_ROLES.VENDOR_ACCOUNT_OWNER &&
    req.user.role !== USER_ROLES.VENDOR_ADMIN
  )
    return sendUnauthorizedMessage(res);

  next();
};

exports.validateJWT = compose([
  expressJWT({
    secret: config.JWT_SESSION_SECRET,
    getToken(req) {
      return exports.getToken(req);
    },
    isRevoked(req, payload, done) {
      try {
        const token = exports.getToken(req);
        TokenBlacklist.findOne({
          where: { token }
        })
          .then(found => {
            if (found) throw true;
            return;
          })
          .then(() => {
            let promise;
            if (payload.role === USER_ROLES.CUSTOMER)
              promise = getCustomer(payload.uuid);
            else if (isVendorEmployeeUtility(payload, payload.vendor_uuid)) {
              promise = getVendorEmployee({
                uuid: payload.uuid,
                vendor_uuid: payload.vendor_uuid
              });
            } else if (payload.role === USER_ROLES.SUPERADMIN) {
              promise = getSuperAdmin({
                where: { username: payload.username }
              });
            } else return done(true);

            promise
              .then(user => {
                if (
                  payload.role === USER_ROLES.SUPERADMIN &&
                  payload.username === user.username &&
                  payload.uuid === user.uuid
                ) {
                  return done(null, false);
                } else if (
                  payload.role !== USER_ROLES.SUPERADMIN &&
                  user.email === payload.email &&
                  user.uuid === payload.uuid
                ) {
                  return done(null, false);
                } else {
                  done(true);
                }
              })
              .catch(err => {
                done(err);
              });
          })
          .catch(err => done(err));
      } catch (e) {
        done(true);
      }
    }
  }),
  (err, req, res, next) => {
    if (err) {
      const error = createNewError(Errors.INVALID_TOKEN, null, err);
      res.sendError(error);
    } else {
      next();
    }
  }
]);

exports.getToken = req => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    return req.headers.authorization.split(" ")[1];
  } else if (req.query && req.query.token) {
    return req.query.token;
  }
  throw "invalid";
};
