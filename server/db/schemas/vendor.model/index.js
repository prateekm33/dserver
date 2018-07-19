const Sequelize = require("sequelize");
const { VENDOR_TYPES } = require("./constants");
const phone = require("phone");
const { createNewError } = require("../../../utils");
const Errors = require("../../../constants/Errors");

module.exports = sequelize => {
  const Vendor = sequelize.define(
    "vendor",
    {
      uuid: {
        type: Sequelize.DataTypes.UUID,
        primaryKey: true,
        defaultValue: Sequelize.DataTypes.UUIDV1
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
            if (!phone(value, "USA").length)
              throw createNewError(Errors.INVALID_PHONE);
            return true;
          }
        }
      },
      type: {
        type: Sequelize.ENUM,
        values: [VENDOR_TYPES.RESTAURANT],
        validate: {
          isValidVendorType(value) {
            if (value !== VENDOR_TYPES.RESTAURANT)
              throw createNewError(Errors.INVALID_VENDOR_TYPE);
            return true;
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
            if (!phone(value, "USA").length)
              throw createNewError(Errors.INVALID_PHONE);
          }
        }
      },
      address: {
        type: Sequelize.STRING
      },
      latitude: {
        type: Sequelize.DOUBLE
      },
      longitude: {
        type: Sequelize.DOUBLE
      },
      cuisines: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      }
    },
    { underscored: true }
  );
  return Vendor;
};
