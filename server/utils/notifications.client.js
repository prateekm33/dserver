const PushNotifications = require("node-pushnotifications");
const config = require("../config");
const { createNewError, catchControllerErrors } = require(".");
const logger = require("../middleware/logger");
const Notifications = require("../constants/Notifications");

const options = {
  // gcm: {
  //     id: null,
  // },
  apn: {
    token: {
      key: "../certs/dineable_apns_dev_key.p8",
      keyId: config.APNS.KEY_ID,
      teamId: config.APNS.DEVELOPER_TEAM_ID,
      production: false
    }
  }
};

const notifications_client = new PushNotifications(options);

// let dtoken = user.device_token;
//   const note = new apn.Notification();

//   note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
//   note.sound = "ping.aiff";
//   note.alert = `${user.email} accepted your friend request!`;
//   note.payload = {
//     messageFrom: requestAcceptedUser,
//     type: "FRIEND_REQUEST_ACCEPTED",
//     body: `${user.email} accepted your friend request!`
//   };
//   note.topic = config.APP_BUNDLE_ID;

/**
 * NOTIFICATION OBJECT SHAPE :
 *
 * @prop expiry     @type Date
 * @prop sound      @type String
 * @prop alert      @type String
 * @prop payload    @type Object<{any}>
 * @prop topic      @type String<APP_BUNDLE_ID>
 *
 */
const oldSend = notifications_client.send;
notifications_client.send = (device_tokens, data) => {
  return oldSend(device_tokens, data)
    .then(result => {
      if (result.failure > 0)
        throw createNewError(Errors.NOTIFICATION_ERROR, null, result);
    })
    .catch(catchControllerErrors);
};

notifications_client.sendNotification = (device_tokens, options) => {
  if (!Array.isArray(device_tokens)) device_tokens = [device_tokens];
  options = options || {};
  if (!options.type) return logger.error("NEED TO PASS NOTIFICATION TYPE");
  let note = {};
  note.topic = config.APP_BUNDLE_ID;
  note.sound = "ping.aiff";
  note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
  note.payload = note.payload || {};
  note.payload.message_from = options.message_from;
  note.payload.type = options.type;
  note.payload.body = options.body;
  switch (options.type) {
    // case Notifications.PARTICIPANT_ADDED_TO_EVENT:
    //   note.alert = `${messageFrom} added you to a${
    //     req.params.type.toLowerCase === "item" ? "n" : ""
    //   } ${req.params.type.toLowerCase()}`;
    //   note.payload.body = note.alert;
    //   break;
    default:
      break;
  }
  note = { ...note, ...options };
  return notifications_client.send(device_tokens, note);
};

module.exports = notifications_client;
