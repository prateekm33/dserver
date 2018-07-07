const jwt = require("jsonwebtoken");
const router = require("express").Router();
const { SuperAdmin } = require("../../db");
const { JWT_SESSION_SECRET } = require("../../config");
const Errors = require("../../constants/Errors");
const { createNewError } = require("../../utils");

router.post("/enter", (req, res) => {
  const creds = req.body.creds;
  if (!creds) return res.status(400).send("Missing `creds` object in body.");
  exports
    .getSuperAdmin({
      where: { username: creds.username, password: creds.password }
    })
    .then(admin => {
      const trimmedAdmin = {
        username: admin.username,
        role: admin.role,
        uuid: admin.uuid
      };
      const token = jwt.sign(trimmedAdmin, JWT_SESSION_SECRET, {
        // expiresIn: "3d"
        expiresIn: 60 * 60 * 24 * 3 // 3 days
      });
      trimmedAdmin.token = token;
      res.status(200).sendResponseWithUser(trimmedAdmin);
    })
    .catch(res.sendError);
});

router.getSuperAdmin = ({ where }) =>
  SuperAdmin.findOne({
    where
  }).then(admin => {
    if (!admin) throw createNewError(Errors.UNAUTHORIZED);
    return admin;
  });

module.exports = router;
