const { VendorReviews } = require("..");
const REVIEW_METRICS = require("../schemas/vendor.review.model/constants");

exports.createVendorReview = ({ customer_uuid, vendor_uuid, review }) => {
  return VendorReviews.create(
    {
      customer_uuid,
      vendor_uuid,
      ...review
    },
    { fields: REVIEW_METRICS } // TODO....
  );
};

exports.updateVendorReview = ({ customer_uuid, vendor_uuid, updates }) => {
  return VendorReviews.findOne({
    where: {
      customer_uuid,
      vendor_uuid
    }
  }).then(review => {
    return review.updateAttributes(updates, { fields: REVIEW_METRICS });
  });
};
