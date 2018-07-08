const Sequelize = require("sequelize");

module.exports = (sequelize, VendorEmployee) => {
  const PasswordRecoveryVendor = sequelize.define(
    "vendor_password_recovery",
    {
      token: { type: Sequelize.STRING },
      expiration_date: { type: Sequelize.DATE }
    },
    { underscored: true }
  );

  PasswordRecoveryVendor.belongsTo(VendorEmployee);
  return PasswordRecoveryVendor;
};
