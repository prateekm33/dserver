// route: /api/reviews
const router = require("express").Router();
const {
  createVendorReview,
  updateVendorReview
} = require("../../db/controllers");
const auth = require("../../middleware/auth");
const Errors = require("../../constants/Errors");
const { createNewError } = require("../../utils");

router.post("/vendor/:vendorId", auth.isCustomer, (req, res) => {
  if (!req.body.review)
    return res
      .status(400)
      .send(createNewError(Errors.MISSING_PARAMETER("review")));
  if (req.body.review.constructor.prototype !== Object.prototype) {
    return res
      .status(400)
      .send(
        createNewError(
          Errors.PARAMETER_IS_NOT_EXPECTED_TYPE(
            "review",
            "Object",
            req.body.review
          )
        )
      );
  }

  createVendorReview({
    vendor_uuid: req.params.vendorId,
    customer_uuid: req.user.uuid,
    review: req.body.review
  })
    .then(review => res.status(200).send({ review }))
    .catch(res.sendError);
});

router.put("/vendor/:vendorId", auth.isCustomer, (req, res) => {
  if (!req.body.updates)
    return res
      .status(400)
      .send(createNewError(Errors.MISSING_PARAMETER("updates")));
  if (req.body.updates.constructor.prototype !== Object.prototype) {
    return res
      .status(400)
      .send(
        createNewError(
          Errors.PARAMETER_IS_NOT_EXPECTED_TYPE(
            "updates",
            "Object",
            req.body.updates
          )
        )
      );
  }
  updateVendorReview({
    vendor_uuid: req.params.vendorId,
    customer_uuid: req.user.uuid,
    updates: req.body.updates
  })
    .then(review => res.status(200).send({ review }))
    .catch(res.sendError);
});

module.exports = router;
