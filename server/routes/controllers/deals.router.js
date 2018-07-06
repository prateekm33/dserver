// route: /api/deals
const router = require("express").Router();
const { getDeals } = require("../../db/controllers");
const { sendUnauthorizedMessage } = require("../../utils");
const { USER_ROLES } = require("../../db/schemas/constants");

router.get("/", (req, res) => {
  if (
    req.user.role !== USER_ROLES.CUSTOMER &&
    req.user.role !== USER_ROLES.SUPERADMIN
  )
    return sendUnauthorizedMessage(res);
  const where = {};

  getDeals({
    where,
    limit: +req.query.limit || 20,
    offset: +req.query.offset || 0
  })
    .then(response => res.status(200).send(response))
    .catch(res.sendError);
});

module.exports = router;
