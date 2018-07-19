const bcrypt = require("bcrypt");
const { VendorEmployee } = require("../..");
const {
  removeProtected,
  findOrCreate,
  validateVendorEmployee,
  validatePassword,
  isValidPassword
} = require("./utils");
const Errors = require("../../../constants/Errors");
const { createNewError } = require("../../../utils");

exports.loginVendorEmployee = submittedCreds => {
  const where = { username: submittedCreds.username };
  if (submittedCreds.vendor_uuid)
    where.vendor_uuid = submittedCreds.vendor_uuid;
  return VendorEmployee.findOne({ where })
    .then(employee => {
      if (!employee) throw createNewError(Errors.ACCOUNT_NOT_FOUND);
      return employee;
    })
    .then(employee => validatePassword(employee, submittedCreds))
    .then(removeProtected);
};

exports.getVendorEmployee = where => {
  return VendorEmployee.findOne({
    where
  })
    .then(employee => {
      if (employee) return employee;
      throw createNewError(Errors.EMPLOYEE_NOT_FOUND, {
        stackTrace: new Error(Errors.EMPLOYEE_NOT_FOUND)
      });
    })
    .then(removeProtected);
};

exports.getVendorEmployees = where => {
  return VendorEmployee.findAll({
    where
  });
};

exports.createVendorEmployee = employee => {
  delete employee.uuid;
  return findOrCreate(employee).then(removeProtected);
};
exports.updateVendorEmployee = (uuid, updates) => {
  return VendorEmployee.findById(uuid)
    .then(employee => {
      if (!employee) throw createNewError(Errors.EMPLOYEE_NOT_FOUND);
      return employee;
    })
    .then(employee => {
      if (!updates.password) return employee;
      if (!isValidPassword(updates.password))
        throw createNewError(Errors.PASSWORD_INVALID_COMPLEXITY);
      return bcrypt
        .genSalt()
        .then(salt => bcrypt.hash(updates.password, salt))
        .then(hash => {
          updates.password = hash;
          return employee;
        });
    })
    .then(employee => {
      delete updates.uuid;
      for (let attr in updates) {
        employee[attr] = updates[attr];
      }
      return employee;
    })
    .then(validateVendorEmployee)
    .then(removeProtected);
};

exports.deleteVendorEmployee = uuid =>
  VendorEmployee.destroy({ where: { uuid } }).then(rows => {
    if (!rows) throw createNewError(Errors.NOT_DELETED);
  });
