const Sequelize = require("sequelize");
const { USER_ROLES } = require("../constants");
const phone = require("phone");
module.exports = (sequelize, Vendor, LoyaltyReward, Deal) => {
  const Customer = sequelize.define(
    "customer",
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
      isSearchable: { type: Sequelize.BOOLEAN, defaultValue: false },
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
        defaultValue: USER_ROLES.CUSTOMER,
        validate: {
          immutable(value) {
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
      is_saved: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_used: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_archived: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_deleted: { type: Sequelize.BOOLEAN, defaultValue: false }
    },
    { underscored: true }
  );
  CustomerReward.belongsTo(Vendor);
  CustomerDeal.belongsTo(Vendor);

  Customer.LoyaltyReward = Customer.belongsToMany(LoyaltyReward, {
    through: CustomerReward
  });
  LoyaltyReward.Customer = LoyaltyReward.belongsToMany(Customer, {
    through: CustomerReward
  });
  Customer.Deal = Customer.belongsToMany(Deal, { through: CustomerDeal });
  Deal.Customer = Deal.belongsToMany(Customer, { through: CustomerDeal });

  return Customer;
};
