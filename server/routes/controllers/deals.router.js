const router = require("express").Router();
const { sendUnauthorizedMessage } = require("../../utils");
const { USER_ROLES } = require("../../db/schemas/constants");
const { getDeals, getCustomerDeals } = require("../../db/controllers");

router.get("/", (req, res) => {
  if (
    req.user.role !== USER_ROLES.SUPERADMIN &&
    req.user.role !== USER_ROLES.CUSTOMER
  )
    return sendUnauthorizedMessage(res);

  getDeals({
    limit: +req.query.limit || 20,
    offset: +req.query.offset || 0
  })
    .then(response => res.status(200).send(response))
    .catch(res.sendError);
});

module.exports = router;
