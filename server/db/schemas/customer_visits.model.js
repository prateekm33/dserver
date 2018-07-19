const Sequelize = require("sequelize");

module.exports = (sequelize, Customer, Vendor) => {
  const CustomerVisits = sequelize.define(
    "customer_visits",
    {
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
    },
    { underscored: true }
  );
  CustomerVisits.belongsTo(Customer);
  return CustomerVisits;
};
