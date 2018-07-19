const Sequelize = require("sequelize");
const { USER_ROLES } = require("./constants");
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
  const SuperAdmin = sequelize.define("superadmin", {
    uuid: {
      type: Sequelize.DataTypes.UUID,
      primaryKey: true,
      defaultValue: Sequelize.DataTypes.UUIDV1
    },
    role: {
      type: Sequelize.STRING,
      defaultValue: USER_ROLES.SUPERADMIN
    },
    username: { type: Sequelize.STRING, unique: true },
    password: { type: Sequelize.STRING }
  });
  const PasswordRecoveryVendor = require("./password.recovery.vendor.model")(
    sequelize,
    VendorEmployee
  );
  const PasswordRecoveryCustomer = require("./password.recovery.customer.model")(
    sequelize,
    Customer
  );
  const TokenBlacklist = require("./token.blacklist.model")(sequelize);
  const CustomerVisits = require("./customer_visits.model")(
    sequelize,
    Customer,
    Vendor
  );
  const VendorReviews = require("./vendor.review.model")(
    sequelize,
    Customer,
    Vendor
  );
  return {
    Customer,
    VendorEmployee,
    LoyaltyReward,
    Deal,
    SuperAdmin,
    Vendor,
    PasswordRecoveryVendor,
    PasswordRecoveryCustomer,
    TokenBlacklist,
    CustomerVisits,
    VendorReviews
  };
};
