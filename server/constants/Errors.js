// [TAG::TODO:REFACTOR] - ORGANIZE AND ORDER THESE ACCORDING TO SIMILARITIES

// UPDATE API CONSTANTS FILE IN CLIENT WHENEVER UPDATES TO THIS ARE MADE

const _ERRORS = [
  [
    "RESOURCE_NOT_FOUND",
    code => ({
      message: "404. Not found.",
      code
    })
  ],
  [
    "MULTIPLE_ERRORS",
    code => errors => ({
      errors,
      code
    })
  ],
  [
    "UNAUTHORIZED",
    code => ({
      message: "UNAUTHORIZED",
      code
    })
  ],
  [
    "FORBIDDEN",
    code => ({
      message: "Forbidden.",
      code
    })
  ],
  [
    "INTERNAL_SERVER_ERROR",
    code => ({
      message: "Internal server error.",
      code
    })
  ],
  [
    "FOREIGN_KEY_DNE",
    code => key => ({
      message: `Given value for [ ${key} ] does not exist.`,
      code
    })
  ],
  ["USER_NOT_FOUND", code => ({ message: "User not found.", code })],
  ["CUSTOMER_NOT_FOUND", code => ({ message: "Customer not found.", code })],
  ["VENDOR_NOT_FOUND", code => ({ message: "Vendor does not exist.", code })],
  ["MODEL_NOT_FOUND", code => ({ message: "Model not found.", code })],
  [
    "VENDOR_DEAL_NOT_FOUND",
    code => ({ message: "Could not find this coupon.", code })
  ],
  [
    "VENDOR_REWARD_NOT_FOUND",
    code => ({ message: "Could not find this rewards card.", code })
  ],
  [
    "CUSTOMER_REWARD_CARD_NOT_FOUND",
    code => ({
      message: "Could not find a loyalty rewards account for this customer.",
      code
    })
  ],
  [
    "CUSTOMER_DEAL_NOT_FOUND",
    code => ({
      message: "Could not find the coupon for this customer.",
      code
    })
  ],
  [
    "ACCOUNT_NOT_FOUND",
    code => ({
      message: "Account with that username/email not found.",
      code
    })
  ],
  [
    "ACCOUNT_EXISTS",
    code => ({
      message: "An account with that email already exists.",
      code
    })
  ],
  ["VENDOR_EXISTS", code => ({ message: "Vendor already exists.", code })],
  ["INVALID_EMAIL", code => ({ message: "Invalid email.", code })],
  ["INCORRECT_PASSWORD", code => ({ message: "Incorrect password.", code })],
  [
    "PASSWORD_INVALID_COMPLEXITY",
    code => ({
      message: `Passwords must be at least six characters long and must contain characters from the following: uppercase characters, lowercase characters, alphanumeric characters, and special characters (e.g.,!, #, $).`,
      code
    })
  ],
  [
    "INVALID_EMPLOYEE_ACCOUNT_TYPE",
    code => ({
      message: "Account type is either not allowed or invaild.",
      code
    })
  ],
  [
    "INVALID_VENDOR_TYPE",
    code => ({
      message: "Vendor type provided is either not allowed or invalid.",
      code
    })
  ],
  [
    "INVALID_PHONE",
    code => ({
      message: "Phone number provided is not of a valid format.",
      code
    })
  ],
  ["NOT_DELETED", code => ({ message: "Could not delete resource.", code })],
  [
    "CONSULT_ACCOUNT_ADMINISTRATOR",
    code => ({
      message: "Please consult your administrator to complete this action.",
      code
    })
  ],
  [
    "NOT_AUTHORIZED_FOR_VENDOR",
    code => ({
      message:
        "You are not authorized to perform operations for this organization. Please contact support at Dineable for more details.",
      code
    })
  ],
  [
    "DEAL_ALREADY_SAVED",
    code => ({
      message: "Coupon has already been saved.",
      code
    })
  ],
  [
    "MISSING_QUERY",
    code => parameter => ({
      message: `Missing required parameter [ ${query} ] in request query string.`,
      code
    })
  ],
  [
    "MISSING_PARAMETER",
    code => parameter => ({
      message: `Missing required parameter [ ${parameter} ] in request body.`,
      code
    })
  ],
  [
    "PARAMETER_IS_NOT_EXPECTED_TYPE",
    code => (parameterName, expected, parameter) => ({
      message: `Expected paramter ${parameterName} to be of type ${expected}. Got type ${
        parameter.constructor.name
      } instead.`,
      code
    })
  ]
];

const Errors = {};
_ERRORS.forEach((err, idx) => (Errors[err[0]] = err[1](idx)));
module.exports = Errors;
