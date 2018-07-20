const Sequelize = require("sequelize");
const { createNewError } = require("../../utils");
const Errors = require("../../constants/Errors");

module.exports = (sequelize, Vendor) => {
  const LoyaltyReward = sequelize.define(
    "loyalty_reward",
    {
      uuid: {
        type: Sequelize.DataTypes.UUID,
        primaryKey: true,
        defaultValue: Sequelize.DataTypes.UUIDV1
      },
      code: { type: Sequelize.STRING, defaultValue: "", unique: true },
      name: { type: Sequelize.STRING, defaultValue: "" },
      short_desc: { type: Sequelize.CHAR({ length: 100 }), defaultValue: "" },
      long_desc: { type: Sequelize.CHAR({ length: 255 }), defaultValue: "" },
      points_reward_ratio: { type: Sequelize.DOUBLE },
      tags: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      }
    },
    { underscored: true }
  );

  LoyaltyReward.belongsTo(Vendor);
  return LoyaltyReward;
};
