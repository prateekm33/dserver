// route: /api/reviews
const router = require("express").Router();
const {
  createVendorReview,
  updateVendorReview,
  getVendorReviews,
  getVendorReviewMetrics,
  getCustomerVendorReviewMetrics
} = require("../../db/controllers");
const auth = require("../../middleware/auth");
const Errors = require("../../constants/Errors");
const {
  createNewError,
  isVendorEmployee,
  sendUnauthorizedMessage
} = require("../../utils");
const { USER_ROLES } = require("../../db/schemas/constants");

router.get("/vendor/metrics/:vendorId", (req, res) => {
  if (
    !isVendorEmployee(req) &&
    req.user.role !== USER_ROLES.CUSTOMER &&
    req.user.role !== USER_ROLES.SUPERADMIN
  ) {
    return sendUnauthorizedMessage(res);
  }
  getVendorReviewMetrics({ vendor_uuid: req.params.vendorId })
    .then(reviews => res.status(200).send({ reviews }))
    .catch(res.sendError);
});

router.get(
  "/vendor/metrics/:vendorId/:customerId",
  auth.canAccessCustomer,
  (req, res) => {
    getCustomerVendorReviewMetrics({
      vendor_uuid: req.params.vendorId,
      customer_uuid: req.params.customerId
    })
      .then(reviews => res.status(200).send({ reviews }))
      .catch(res.sendError);
  }
);

router.get("/vendor/:vendorId", (req, res) => {
  if (
    !isVendorEmployee(req) &&
    req.user.role !== USER_ROLES.CUSTOMER &&
    req.user.role !== USER_ROLES.SUPERADMIN
  ) {
    return sendUnauthorizedMessage(res);
  }
  const limit = +req.query.limit || 20;
  const offset = +req.query.offset || 0;
  return getVendorReviews({
    vendor_uuid: req.params.vendorId,
    limit,
    offset
  })
    .then(response => res.status(200).send(response))
    .catch(res.sendError);
});

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
