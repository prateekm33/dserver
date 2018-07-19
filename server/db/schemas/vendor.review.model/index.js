const Sequelize = require("sequelize");
const REVIEW_METRICS = require("./constants").REVIEW_METRICS;
module.exports = (sequelize, Customer, Vendor) => {
  const schema = {
    uuid: {
      type: Sequelize.DataTypes.UUID,
      primaryKey: true,
      defaultValue: Sequelize.DataTypes.UUIDV1
    },
    vendor_uuid: {
      type: Sequelize.DataTypes.UUID,
      references: {
        model: Vendor,
        key: "uuid"
      }
    }
  };

  REVIEW_METRICS.forEach(metric => {
    schema[metric] = {
      type: Sequelize.INTEGER,
      defaultValue: 0
    };
  });
  const VendorReview = sequelize.define("vendor_password_recovery", schema, {
    underscored: true
  });

  VendorReview.belongsTo(Customer);
  return VendorReview;
};
