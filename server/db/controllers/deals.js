const { Deal } = require("..");

exports.getDeals = ({ limit, offset, where }) =>
  Deal.findAndCountAll({ limit, offset, where: where || {} }).then(result => ({
    deals: result.rows,
    count: result.count
  }));
