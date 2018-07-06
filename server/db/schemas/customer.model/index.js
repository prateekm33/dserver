const Sequelize = require("sequelize");
const { USER_ROLES } = require("../constants");
const phone = require("phone");
const { createNewError } = require("../../../utils");
const Errors = require("../../../constants/Errors");

module.exports = (sequelize, Vendor, LoyaltyReward, Deal) => {
  const Customer = sequelize.define(
    "customer",
    {
      uuid: {
        type: Sequelize.DataTypes.UUID,
        primaryKey: true,
        defaultValue: Sequelize.DataTypes.UUIDV1
      },
      is_searchable: { type: Sequelize.BOOLEAN, defaultValue: false },
      email: {
        type: Sequelize.STRING,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      password: { type: Sequelize.STRING },
      role: {
        type: Sequelize.ENUM,
        values: [USER_ROLES.CUSTOMER],
        defaultValue: USER_ROLES.CUSTOMER
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

  const CustomerReward = sequelize.define(
    "customer_reward",
    {
      points: { type: Sequelize.INTEGER, defaultValue: 0 },
      num_points_redeemed: { type: Sequelize.INTEGER, defaultValue: 0 }
    },
    { underscored: true }
  );
  const CustomerDeal = sequelize.define(
    "customer_deal",
    {
      is_saved: { type: Sequelize.BOOLEAN, defaultValue: true },
      is_used: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_archived: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_deleted: { type: Sequelize.BOOLEAN, defaultValue: false }
    },
    { underscored: true }
  );
  CustomerReward.belongsTo(Vendor);
  CustomerDeal.belongsTo(Vendor);

  // TODO...reevaluate if this is how we want to save these
  Customer.LoyaltyRewardRelation = Customer.belongsToMany(LoyaltyReward, {
    through: CustomerReward
  });
  LoyaltyReward.CustomerRelation = LoyaltyReward.belongsToMany(Customer, {
    through: CustomerReward
  });
  Customer.LoyaltyReward = CustomerReward;
  LoyaltyReward.Customer = CustomerReward;

  Customer.Deal = CustomerDeal;
  Customer.DealRelation = Customer.belongsToMany(Deal, {
    through: CustomerDeal
  });
  Deal.Customer = CustomerDeal;
  Deal.CustomerRelation = Deal.belongsToMany(Customer, {
    through: CustomerDeal
  });

  return Customer;
};
