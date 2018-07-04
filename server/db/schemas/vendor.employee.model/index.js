const Sequelize = require("sequelize");
const { USER_ROLES } = require("../constants");
const phone = require("phone");

module.exports = (sequelize, Vendor) => {
  const VendorEmployee = sequelize.define(
    "vendor_employee",
    {
      uuid: {
        type: Sequelize.DataTypes.UUID,
        primaryKey: true,
        defaultValue: Sequelize.DataTypes.UUIDV1,
        validate: {
          immutable() {
            return false;
          }
        }
      },
      first_name: { type: Sequelize.STRING, defaultValue: "" },
      last_name: { type: Sequelize.STRING, defaultValue: "" },
      username: { type: Sequelize.STRING, defaultValue: "" },
      email: {
        type: Sequelize.STRING,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      password: { type: Sequelize.STRING },
      role: {
        type: Sequelize.STRING,
        defaultValue: USER_ROLES.VENDOR_EMPLOYEE,
        validate: {
          immutable() {
            return false;
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
            return !!phone(value, "USA").length;
          }
        }
      }
    },
    { underscored: true }
  );
  VendorEmployee.belongsTo(Vendor);
  return VendorEmployee;
};
