const Sequelize = require("sequelize");

module.exports = (sequelize, Vendor) => {
  const LoyaltyReward = sequelize.define(
    "loyalty_reward",
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
      code: { type: Sequelize.STRING, defaultValue: "" },
      name: { type: Sequelize.STRING, defaultValue: "" },
      short_desc: { type: Sequelize.CHAR({ length: 100 }), defaultValue: "" },
      long_desc: { type: Sequelize.CHAR({ length: 255 }), defaultValue: "" }
    },
    { underscored: true }
  );

  LoyaltyReward.belongsTo(Vendor);
  return LoyaltyReward;
};
