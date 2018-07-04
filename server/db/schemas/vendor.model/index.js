const Sequelize = require("sequelize");
const { VENDOR_TYPES } = require("./constants");
const phone = require("phone");

module.exports = sequelize => {
  const Vendor = sequelize.define(
    "vendor",
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
      name: {
        type: Sequelize.STRING,
        defaultValue: ""
      },
      business_email: {
        type: Sequelize.STRING,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      business_phone: {
        type: Sequelize.STRING,
        unique: true,
        validate: {
          isPhone(value) {
            return !!phone(value, "USA").length;
          }
        }
      },
      type: {
        type: Sequelize.STRING,
        validate: {
          immutable() {
            return false;
          }
        }
      },
      primary_contact_name: { type: Sequelize.STRING },
      primary_contact_email: {
        type: Sequelize.STRING,
        validate: {
          isEmail: true
        }
      },
      primary_contact_phone: {
        type: Sequelize.STRING,
        validate: {
          isPhone(value) {
            return !!phone(value, "USA").length;
          }
        }
      },
      address: {
        type: Sequelize.STRING,
        defaultValue: ""
      }
    },
    { underscored: true }
  );
  return Vendor;
};
