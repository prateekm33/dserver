// route: /api/search
const router = require("express").Router();
const {
  searchVendors,
  searchDeals,
  searchRewards
} = require("../../db/controllers");

router.get("/vendors", (req, res) => {
  const limit = +req.query.limit || 50;
  const offset = +req.query.offset || 0;
  const search = req.query.search || "";
  searchVendors({ search, limit, offset })
    .then(response => res.status(200).send(response))
    .catch(res.sendError);
});

router.get("/deals", (req, res) => {
  const limit = +req.query.limit || 50;
  const offset = +req.query.offset || 0;
  const search = req.query.search || "";
  searchDeals({ search, limit, offset })
    .then(response => res.status(200).send(response))
    .catch(res.sendError);
});

router.get("/rewards", (req, res) => {
  const limit = +req.query.limit || 50;
  const offset = +req.query.offset || 0;
  const search = req.query.search || "";
  searchRewards({ search, limit, offset })
    .then(response => res.status(200).send(response))
    .catch(res.sendError);
});

module.exports = router;
