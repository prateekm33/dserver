// [TAG::TODO:REFACTOR] - ORGANIZE AND ORDER THESE ACCORDING TO SIMILARITIES

// UPDATE API CONSTANTS FILE IN CLIENT WHENEVER UPDATES TO THIS ARE MADE

module.exports = {
  RESOURCE_NOT_FOUND: { message: "404. Not found.", code: -1 },
  UNAUTHORIZED: { message: "UNAUTHORIZED", code: 0 },
  FORBIDDEN: { message: "Forbidden.", code: 1 },
  INTERNAL_SERVER_ERROR: { message: "Internal server error.", code: 2 },
  USER_NOT_FOUND: { message: "User not found.", code: 3 },
  CUSTOMER_NOT_FOUND: { message: "User not found.", code: 4 },
  INCORRECT_PASSWORD: { message: "Incorrect password.", code: 5 },
  ACCOUNT_EXISTS: {
    message: "An account with that email already exists.",
    code: 6
  },
  VENDOR_EXISTS: { message: "Vendor already exists.", code: 7 },
  VENDOR_NOT_FOUND: { message: "Vendor does not exist.", code: 8 },
  INVALID_EMAIL: { message: "Invalid email.", code: 9 },
  PASSWORD_INVALID_COMPLEXITY: {
    message: `Passwords must be at least six characters long and must contain characters from three of the following: uppercase characters, lowercase characters, alphanumeric characters, and special characters (e.g.,!, #, $).`,
    code: 10
  },
  MODEL_NOT_FOUND: { message: "Model not found.", code: 11 },
  NOT_DELETED: { message: "Could not delete resource.", code: 12 },
  MISSING_QUERY: parameter => ({
    message: `Missing required parameter [ ${query} ] in request query string.`,
    code: 13
  }),
  MISSING_PARAMETER: parameter => ({
    message: `Missing required parameter [ ${parameter} ] in request body.`,
    code: 14
  }),
  PARAMETER_IS_NOT_EXPECTED_TYPE: (parameterName, expected, parameter) => ({
    message: `Expected paramter ${parameterName} to be of type ${expected}. Got type ${
      parameter.constructor.name
    } instead.`,
    code: 15
  }),
  CONSULT_ACCOUNT_ADMINISTRATOR: {
    message: "Please consult your administrator to complete this action.",
    code: 16
  },
  REWARD_CARD_NOT_FOUND: {
    message: "Could not find a loyalty rewards account for this customer.",
    code: 17
  },
  CUSTOMER_DEAL_NOT_FOUND: {
    message: "Could not find the coupon for this customer.",
    code: 18
  },
  CANNOT_CREATE_EMPLOYEE_FOR_DIFFERENT_VENDOR_UNAUTHORIZED: {
    message:
      "Cannot create an employee account for an organization that you are not part of. Action is unauthorized.",
    code: 19
  },
  CONTACT_SYSTEM_ADMINISTRATOR_UNAUTHORIZED: {
    message:
      "Unable to perform operation. Please contact your system administrator for further advice. Action is unauthorized.",
    code: 20
  },
  DEAL_ALREADY_SAVED: {
    message: "Coupon has already been saved.",
    code: 21
  }
};
