// route: /password_recovery
const router = require("express").Router();
const path = require("path");
const Errors = require("../../constants/Errors");
const { createNewError } = require("../../utils");
const {
  PasswordRecoveryCustomer,
  PasswordRecoveryVendor
} = require("../../db");
const {
  updateCustomer,
  updateVendorEmployee
} = require("../../db/controllers");

router.get("/invalid", (req, res) => {
  res.sendFile("password_recovery_invalid.html", {
    root: "server/static"
  });
});

router.post("/vendor/change_password", (req, res) => {
  if (!req.query.token)
    return res
      .status(400)
      .send(createNewError(Errors.MISSING_PASSWORD_RESET_TOKEN));

  PasswordRecoveryVendor.findOne({
    where: {
      token: req.query.token
    }
  })
    .then(found => {
      if (!found) throw createNewError(Errors.INVALID_TOKEN);
      return updateVendorEmployee(found.vendor_employee_uuid, {
        password: req.body.password
      });
    })
    .then(done => res.status(200).end())
    .catch(res.sendError);
});

router.get("/vendor", (req, res) => {
  if (!req.query.token)
    return res.sendFile("password_recovery_invalid.html", {
      root: "server/static"
    });

  PasswordRecoveryVendor.findOne({
    where: {
      token: req.query.token
    }
  })
    .then(found => {
      if (!found) return res.redirect("/password_recovery/invalid");
      // return res.sendFile("password_recovery_invalid.html", {
      //   root: "server/static"
      // });
      return res.sendFile("vendor_password_recovery.html", {
        root: "server/static"
      });
    })
    .catch(() => {
      return res.redirect("/password_recovery/invalid");
      // return res.sendFile("password_recovery_invalid.html", {
      //   root: "server/static"
      // });
    });
});

router.post("/change_password", (req, res) => {
  if (!req.query.token)
    return res
      .status(400)
      .send(createNewError(Errors.MISSING_PASSWORD_RESET_TOKEN));

  // find the token in db
  // if it doesn't exist -- throw an error
  // if it does, then update the password
  PasswordRecoveryCustomer.findOne({
    where: {
      token: req.query.token
    }
  })
    .then(found => {
      if (!found) throw createNewError(Errors.INVALID_TOKEN);
      return updateCustomer(found.customer_uuid, {
        password: req.body.password
      });
    })
    .then(() => res.status(200).end())
    .catch(res.sendError);
});

router.get("/", (req, res) => {
  if (!req.query.token)
    return res.sendFile("password_recovery_invalid.html", {
      root: "server/static"
    });

  PasswordRecoveryCustomer.findOne({
    where: {
      token: req.query.token
    }
  })
    .then(found => {
      if (!found) return res.redirect("/password_recovery/invalid");
      // return res.sendFile("password_recovery_invalid.html", {
      //   root: "server/static"
      // });
      return res.sendFile("password_recovery.html", {
        root: "server/static"
      });
    })
    .catch(() => {
      return res.redirect("/password_recovery/invalid");
      // return res.sendFile("password_recovery_invalid.html", {
      //   root: "server/static"
      // });
    });
});

module.exports = router;
