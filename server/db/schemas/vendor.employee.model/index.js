const Sequelize = require("sequelize");
const { USER_ROLES } = require("../constants");
const phone = require("phone");
const { createNewError } = require("../../../utils");
const Errors = require("../../../constants/Errors");

module.exports = (sequelize, Vendor) => {
  const VendorEmployee = sequelize.define(
    "vendor_employee",
    {
      uuid: {
        type: Sequelize.DataTypes.UUID,
        primaryKey: true,
        defaultValue: Sequelize.DataTypes.UUIDV1
      },
      first_name: { type: Sequelize.STRING, defaultValue: "" },
      last_name: { type: Sequelize.STRING, defaultValue: "" },
      email: {
        type: Sequelize.STRING,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      username: { type: Sequelize.STRING, unique: true },
      password: { type: Sequelize.STRING },
      role: {
        type: Sequelize.STRING,
        defaultValue: USER_ROLES.VENDOR_EMPLOYEE,
        validate: {
          isValidEmployeeType(value) {
            if (
              value !== USER_ROLES.VENDOR_ADMIN &&
              value !== USER_ROLES.VENDOR_EMPLOYEE
            )
              throw createNewError(Errors.INVALID_EMPLOYEE_ACCOUNT_TYPE);
          }
        }
      },
      device_token: { type: Sequelize.STRING, defaultValue: "" },
      device_uuid: { type: Sequelize.STRING, defaultValue: "" },
      phone: {
        type: Sequelize.STRING,
        unique: true,
        validate: {
          isPhone(value) {
            if (!phone(value, "USA").length)
              throw createNewError(Errors.INVALID_PHONE);
          }
        }
      }
    },
    { underscored: true }
  );
  VendorEmployee.belongsTo(Vendor);
  return VendorEmployee;
};
