const Sequelize = require("sequelize");

module.exports = (sequelize, Customer) => {
  const PasswordRecoveryCustomer = sequelize.define(
    "vendor_password_recovery",
    {
      token: { type: Sequelize.STRING },
      expiration_date: { type: Sequelize.DATE }
    },
    { underscored: true }
  );

  PasswordRecoveryCustomer.belongsTo(Customer);
  return PasswordRecoveryCustomer;
};
