module.exports = sequelize => {
  const Vendor = require("./vendor.model")(sequelize);
  const VendorEmployee = require("./vendor.employee.model")(sequelize, Vendor);
  const LoyaltyReward = require("./loyalty_reward.model")(sequelize, Vendor);
  const Deal = require("./deal.model")(sequelize, Vendor);
  const Customer = require("./customer.model")(
    sequelize,
    Vendor,
    LoyaltyReward,
    Deal
  );
  return {
    Customer,
    VendorEmployee,
    LoyaltyReward,
    Deal
  };
};
