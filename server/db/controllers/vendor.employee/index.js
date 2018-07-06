const { VendorEmployee } = require("../..");
const {
  removeProtected,
  findOrCreate,
  validateVendorEmployee,
  validatePassword
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
    .then(employee => {
      if (!employee) throw createNewError(Errors.ACCOUNT_NOT_FOUND);
      return employee;
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
  delete employee.uuid;
  return findOrCreate(employee).then(removeProtected);
  // .catch(err => {
  //   if (err.IS_HASH_ERROR) throw err;
  //   else if (err.name === "SequelizeValidationError") {
  //     throw err.errors[0].message;
  //   }
  // });
};
exports.updateVendorEmployee = (uuid, updates) => {
  return VendorEmployee.findById(uuid)
    .then(employee => {
      if (!employee) throw createNewError(Errors.USER_NOT_FOUND);
      console.log(
        "------TODO...need to check if this actually works...., might have to call employee.get first"
      );
      delete updates.uuid;
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
  VendorEmployee.destroy({ where: { uuid } }).then(rows => {
    if (!rows) throw createNewError(Errors.NOT_DELETED);
  });
