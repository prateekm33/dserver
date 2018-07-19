const { SuperAdmin } = require("../");
const { createNewError } = require("../../utils");
const Errors = require("../../constants/Errors");

exports.getSuperAdmin = ({ where }) =>
  SuperAdmin.findOne({
    where
  }).then(admin => {
    if (!admin) throw createNewError(Errors.UNAUTHORIZED);
    return admin;
  });
