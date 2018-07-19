const sequelize = require("..").db;
const { Customer, CustomerVisits } = require("../");
const { createNewError } = require("../../utils");
const Errors = require("../../constants/Errors");

exports.createVisit = ({ customer_uuid, vendor_uuid }) => {
  return CustomerVisits.create({ customer_uuid, vendor_uuid });
};
