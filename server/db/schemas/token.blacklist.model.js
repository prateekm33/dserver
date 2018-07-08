const Sequelize = require("sequelize");

module.exports = sequelize => {
  const TokenBlacklist = sequelize.define(
    "token_blacklist",
    {
      token: { type: Sequelize.TEXT }
    },
    { underscored: true }
  );

  return TokenBlacklist;
};
