const { catchControllerErrors } = require("../../utils");

const controllers = {
  ...require("./customers"),
  ...require("./vendor.employee"),
  ...require("./vendor"),
  ...require("./customer.loyalty_rewards"),
  ...require("./customer.deals"),
  ...require("./vendor.rewards"),
  ...require("./vendor.deals"),
  ...require("./deals"),
  ...require("./loyalty_rewards")
};

const wrappedControllers = {};
for (let key in controllers) {
  wrappedControllers[key] = (...args) =>
    controllers[key](...args).catch(catchControllerErrors);
}

module.exports = wrappedControllers;
