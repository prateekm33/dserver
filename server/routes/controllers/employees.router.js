// route: /api/employess
const router = require("express").Router();
const { loginVendorEmployee } = require("../../db/controllers");
const { saveVendorEmployeeSession } = require("../../utils");

router.post("/login", (req, res) => {
  if (!req.body.employee)
    return res
      .status(400)
      .send(createNewError(Errors.MISSING_PARAMETER("employee")));
  if (req.body.employee.constructor.prototype !== Object.prototype) {
    return res
      .status(400)
      .send(
        createNewError(
          Errors.PARAMETER_IS_NOT_EXPECTED_TYPE(
            "employee",
            "Object",
            req.body.employee
          )
        )
      );
  }

  loginVendorEmployee({
    username: req.body.employee.username,
    password: req.body.employee.password
  })
    .then(saveVendorEmployeeSession)
    .then(employee =>
      res.status(200).send({ employee, user_token: employee.token })
    )
    .catch(res.sendError);
});

module.exports = router;
