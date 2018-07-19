const Op = require("sequelize").Op;
const { Vendor, neo4j } = require("../../");
const { findOrCreate, validateVendor } = require("./utils");
const Errors = require("../../../constants/Errors");
const { createNewError } = require("../../../utils");

exports.getVendor = id =>
  Vendor.findById(id).then(vendor => {
    if (vendor) return vendor;
    throw createNewError(Errors.VENDOR_NOT_FOUND, {
      stackTrace: new Error(Errors.VENDOR_NOT_FOUND)
    });
  });

exports.getVendors = ({ where, limit, offset }) =>
  Vendor.findAll({
    where: where || {},
    limit,
    offset
  }).then(res => {
    return {
      end: !(res || []).length,
      vendors: res,
      count: (res || []).length
    };
  });

exports.createVendor = vendor => {
  delete vendor.uuid;
  let cuisines = [];
  if (Array.isArray(vendor.cuisines))
    cuisines = vendor.cuisines
      .map(c => {
        if (typeof c !== "string") return false;
        return c.toLowerCase();
      })
      .filter(c => !!c);
  return findOrCreate(vendor).then(new_vendor => {
    if (!cuisines.length) return new_vendor;
    const session = neo4j.session();
    return session
      .run(
        `UNWIND {cuisines} as cuisine
        MERGE (c:Cuisine { title: cuisine })
        MERGE (v:Vendor { 
          uuid: {uuid}
        })
        CREATE (v)-[r:IS_CUISINE]->(c) `,
        {
          cuisines,
          uuid: new_vendor.uuid
        }
      )
      .then(() => {
        session.close();
        return true;
      })
      .catch(() => {
        session.close();
        return false;
      })
      .then(() => new_vendor);
  });
};

// TODO...add in neo4j query to update cuisine tags
exports.updateVendor = id => {
  return Vendor.findById(id)
    .then(vendor => {
      if (!vendor) throw createNewError(Errors.VENDOR_NOT_FOUND);
      delete updates.uuid;
      for (let attr in updates) {
        vendor[attr] = updates[attr];
      }
      return vendor;
    })
    .then(validateVendor);
};

// TODO...add in neo4j query to delete vendor from neo4j
exports.deleteVendor = uuid =>
  Vendor.destroy({ where: { uuid } }).then(rows => {
    if (!rows) throw createNewError(Errors.NOT_DELETED);
  });

exports.searchVendors = ({ search, limit, offset }) => {
  const session = neo4j.session();
  return session
    .run(
      `MATCH (c:Cuisine)<-[r:IS_CUISINE]-(v:Vendor) 
        WHERE (
          c.title STARTS WITH {search} OR 
          v.name STARTS WITH {search}
        )
        return v skip {offset} limit {limit}
        `,
      { search: (search || "").toLowerCase(), limit, offset }
    )
    .then(results => {
      session.close();
      return results.records.map(record => record._fields[0].properties);
    })
    .catch(error => {
      session.close();
      throw error;
    })
    .then(vendors => {
      const uuids = vendors.map(vendor => vendor.uuid);
      return Vendor.findAll({
        where: { uuid: { [Op.in]: uuids } }
      }).then(vendors => ({ vendors }));
    });
};
