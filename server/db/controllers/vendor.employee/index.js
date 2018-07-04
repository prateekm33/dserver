const { VendorEmployee } = require("../..");
const {
  removeProtected,
  findOrCreate,
  validateVendorEmployee
} = require("./utils");
const Errors = require("../../../constants/Errors");
const { createNewError, saveVendorEmployeeSession } = require("../../../utils");

exports.loginVendorEmployee = submittedCreds =>
  VendorEmployee.findOne({
    where: {
      email: submittedCreds.email,
      vendor_uuid: submittedCreds.vendor_uuid
    }
  })
    .then(employee => validatePassword(employee, submittedCreds))
    .then(removeProtected);

exports.getVendorEmployee = where => {
  return VendorEmployee.findOne({ where })
    .then(employee => {
      if (employee) return employee;
      throw createNewError(Errors.USER_NOT_FOUND, {
        stackTrace: new Error(Errors.USER_NOT_FOUND)
      });
    })
    .then(removeProtected);
};

exports.createVendorEmployee = employee => {
  return findOrCreate(employee)
    .then(removeProtected)
    .catch(err => {
      console.log("-----TODO...double check this --", err);
      if (err.IS_HASH_ERROR) throw err;
      else if (err.name === "SequelizeValidationError") {
        if (err.errors[0].path === "email") {
          throw createNewError(Errors.INVALID_EMAIL, {
            stackTrace: new Error(Errors.INVALID_EMAIL)
          });
        }
      }
    });
};
exports.updateVendorEmployee = (uuid, updates) => {
  return VendorEmployee.findById(uuid)
    .then(employee => {
      if (!employee) throw createNewError(Errors.USER_NOT_FOUND);
      console.log(
        "------TODO...need to check if this actually works...., might have to call employee.get first"
      );
      for (let attr in updates) {
        employee[attr] = updates[attr];
      }
      return employee;
    })
    .then(validateVendorEmployee)
    .then(removeProtected)
    .then(saveVendorEmployeeSession);
};

exports.deleteVendorEmployee = uuid =>
  VendorEmployee.destroy({ where: { uuid } });
