const Sequelize = require("sequelize");

module.exports = (sequelize, Vendor) => {
  const Deal = sequelize.define(
    "deal",
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
      thumbnail_url: { type: Sequelize.STRING },
      expiration: { type: Sequelize.DATE },
      discount_amount: { type: Sequelize.DOUBLE },
      tags: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      }
    },
    { underscored: true }
  );

  Deal.belongsTo(Vendor);
  return Deal;
};
