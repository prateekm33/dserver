const jwt = require("jsonwebtoken");
const router = require("express").Router();
const { getSuperAdmin } = require("../../db/controllers");
const { JWT_SESSION_SECRET } = require("../../config");

router.post("/enter", (req, res) => {
  const creds = req.body.creds;
  if (!creds) return res.status(400).send("Missing `creds` object in body.");
  getSuperAdmin({
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

module.exports = router;
