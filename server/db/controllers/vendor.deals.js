const Sequelize = require("sequelize");
const { Deal, db, neo4j } = require("../");
const sequelize = db;
const { createNewError } = require("../../utils");
const Errors = require("../../constants/Errors");

exports.getVendorDeal = (vendor_uuid, where) => {
  let query =
    "select json_build_object('deal', d, 'vendor', v)\"data\" from (select * from deals d where d.vendor_uuid=$vendor_uuid and d.uuid=$uuid)d inner join vendors v on v.uuid=d.vendor_uuid";
  const bind = {
    vendor_uuid,
    uuid: where.uuid
  };
  return sequelize
    .query(query, { bind, type: Sequelize.QueryTypes.SELECT })
    .then(res => {
      if (!res || !res.length)
        throw createNewError(Errors.VENDOR_DEAL_NOT_FOUND);
      return res[0];
    });
};

exports.getVendorDeals = (vendor_uuid, { limit, offset }) => {
  let query =
    "select json_build_object('deal', d, 'vendor', v)\"data\" from (select * from deals d where d.vendor_uuid=$vendor_uuid)d inner join vendors v on v.uuid=d.vendor_uuid";
  const bind = { vendor_uuid, limit, offset };
  const count_query = sequelize.query(
    `select count(*) from (${query}) as deals`,
    {
      bind,
      type: Sequelize.QueryTypes.SELECT
    }
  );
  query += ` limit $limit offset $offset`;
  const select_query = sequelize.query(query, {
    bind,
    type: Sequelize.QueryTypes.SELECT
  });
  return Promise.all([count_query, select_query]).then(results => {
    const count = results[0][0].count;
    const deals = results[1];
    if (!deals.length) return { deals, end: true, count };
    return { deals, end: false, count };
  });
};

exports.createVendorDeal = (vendor_uuid, deal) => {
  delete deal.uuid;
  let tags = [];
  if (Array.isArray(deal.tags))
    tags = deal.tags
      .map(d => {
        if (typeof d !== "string") return false;
        return d.toLowerCase();
      })
      .filter(d => !!d);
  return Deal.create(Object.assign({}, deal, { vendor_uuid }), {
    fields: [
      "code",
      "name",
      "short_desc",
      "long_desc",
      "expiration",
      "discount_amount",
      "vendor_uuid",
      "thumbnail_url",
      "tags"
    ]
  }).then(new_deal => {
    const session = neo4j.session();
    return session
      .run(
        `
        UNWIND {tags} as tag
        MERGE (t:Tag { title: tag })
        MERGE (d:Deal { 
          uuid: {uuid},
          vendor_uuid: {vendor_uuid}
        })
        MERGE (v:Vendor { uuid: {vendor_uuid} })
        CREATE (d)-[r1:FOR_VENDOR]->(v)
        CREATE (d)-[r2:HAS_TAG]->(t)
      `,
        {
          uuid: new_deal.uuid,
          vendor_uuid,
          tags
        }
      )
      .then(results => {
        session.close();
        return true;
      })
      .catch(err => {
        // TODO....send push notification that tags were not saved
        session.close();
        return false;
      })
      .then(() => new_deal);
  });
};

// TODO...add in neo4j query to update tags
exports.updateVendorDeal = (vendor_uuid, where, updates) => {
  delete updates.uuid;
  return Deal.findOne({
    where: Object.assign({}, where || {}, { vendor_uuid })
  }).then(deal => {
    if (!deal) throw createNewError(Errors.VENDOR_DEAL_NOT_FOUND);
    return deal.updateAttributes(updates);
  });
};

// TODO...add in neo4j query to delete deal from neo4j db
exports.deleteVendorDeal = (vendor_uuid, where) =>
  Deal.destroy({ where: Object.assign({}, where || {}, { vendor_uuid }) }).then(
    rows => {
      if (!rows) throw createNewError(Errors.NOT_DELETED);
    }
  );
