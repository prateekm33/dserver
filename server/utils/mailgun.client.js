const config = require("../config");

const api_key = config.MAILGUN.API_KEY;
const DOMAIN = config.MAILGUN.DOMAIN;
const mailgun_client = require("mailgun-js")({
  apiKey: api_key,
  domain: DOMAIN
});

module.exports = mailgun_client;
