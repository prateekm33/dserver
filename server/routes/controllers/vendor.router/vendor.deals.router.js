// route: /api/vendors/deals
const router = require("express").Router();
const formidable = require("formidable");
const auth = require("../../../middleware/auth");
const {
  getVendorDeal,
  getVendorDeals,
  createVendorDeal,
  updateVendorDeal,
  deleteVendorDeal
} = require("../../../db/controllers");
const {
  createNewError,
  isVendorEmployee,
  sendUnauthorizedMessage
} = require("../../../utils");
const Errors = require("../../../constants/Errors");
const { USER_ROLES } = require("../../../db/schemas/constants");
const cloudinary = require("../../../utils/cloudinary.client");

router.get("/:vendorId/:dealId?", (req, res) => {
  if (
    !(
      req.user.role === USER_ROLES.SUPERADMIN ||
      req.user.role === USER_ROLES.CUSTOMER ||
      isVendorEmployee(req)
    )
  )
    return sendUnauthorizedMessage(res);

  let promise;
  if (req.params.dealId) {
    promise = getVendorDeal(req.params.vendorId, {
      uuid: req.params.dealId
    }).then(deal => ({ deal }));
  } else {
    promise = getVendorDeals(req.params.vendorId, {
      limit: +req.query.limit || 20,
      offset: +req.query.offset || 0
    });
  }
  promise
    .then(response => res.status(200).sendResponseWithUser(response))
    .catch(res.sendError);
});

router.post(
  "/images/:vendorId",
  auth.canAccessVendor,
  auth.isAdmin,
  (req, res) => {
    const form = new formidable.IncomingForm();
    form.parse(req, function(err, fields) {
      if (err) return res.status(400).end();
      cloudinary.v2.uploader.upload(
        fields.image,
        {
          public_id: `${fields.deal_uuid}/${req.params.vendorId}`
        },
        function(err, result) {
          if (err) return res.status(500).end();
          updateVendorDeal(
            req.params.vendorId,
            { uuid: fields.deal_uuid },
            {
              thumbnail_url: `/${req.params.vendorId}/${fields.deal_uuid}.jpg`
            }
          )
            .then(deal => res.status(200).send({ deal }))
            .catch(res.sendError);
          // shape of result
          // {
          //   public_id: "qebhdjfspnz3jio8zaxf",
          //   version: 1531884096,
          //   signature: "02b0de50debca875d42088a6213a167485042b5b",
          //   width: 3024,
          //   height: 4032,
          //   format: "jpg",
          //   resource_type: "image",
          //   created_at: "2018-07-18T03:21:36Z",
          //   tags: [],
          //   bytes: 5923487,
          //   type: "upload",
          //   etag: "e261e22461ea694229e130bb27582cc9",
          //   placeholder: false,
          //   url:
          //     "http://res.cloudinary.com/dlk4o3ttz/image/upload/v1531884096/qebhdjfspnz3jio8zaxf.jpg",
          //   secure_url:
          //     "https://res.cloudinary.com/dlk4o3ttz/image/upload/v1531884096/qebhdjfspnz3jio8zaxf.jpg"
          // };
        }
      );
    });
  }
);
router.post("/:vendorId", auth.canAccessVendor, auth.isAdmin, (req, res) => {
  if (!req.body.deal) {
    return res
      .status(400)
      .send(createNewError(Errors.MISSING_PARAMETER("deal")));
  }
  if (req.body.deal.constructor.prototype !== Object.prototype) {
    return res
      .status(400)
      .send(
        createNewError(
          Errors.PARAMETER_IS_NOT_EXPECTED_TYPE("deal", "Object", req.body.deal)
        )
      );
  }
  createVendorDeal(req.params.vendorId, req.body.deal)
    .then(deal => res.status(200).sendResponseWithUser({ deal }))
    .catch(res.sendError);
});

router.put(
  "/:vendorId/:dealId",
  auth.canAccessVendor,
  auth.isAdmin,
  (req, res) => {
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

    delete req.body.updates.vendor_uuid;
    updateVendorDeal(
      req.params.vendorId,
      {
        uuid: req.params.dealId
      },
      req.body.updates
    )
      .then(deal => res.status(200).sendResponseWithUser({ deal }))
      .catch(res.sendError);
  }
);

router.delete(
  "/:vendorId/:dealId",
  auth.canAccessVendor,
  auth.isAdmin,
  (req, res) => {
    deleteVendorDeal(req.params.vendorId, {
      deal_uuid: req.params.dealId
    })
      .then(deleted_rows =>
        res.status(200).sendResponseWithUser({ deleted_rows })
      )
      .catch(res.sendError);
  }
);

module.exports = router;
