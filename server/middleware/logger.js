exports.HTTP_LOGGER = (req, res, next) => {
  exports.sectionStart();
  console.log(`METHOD  : ${req.method}`);
  console.log(`PATH    : ${req.originalUrl}`);
  console.log(`HEADERS : `);
  for (let key in req.headers) {
    console.log(`     ${key} : ${req.headers[key]}`);
  }
  console.log(`BODY : `);
  for (let key in req.body) {
    console.log(`     ${key} : `);
    console.log("-----------------------");
    console.log(req.body[key]);
    console.log("-----------------------");
  }
  if (req.session) {
    console.log(`SESSION : `);
    for (let key in req.session) {
      console.log(`     ${key} : ${JSON.stringify(req.session[key])}`);
    }
  }
  exports.sectionEnd();
  next();
};

exports.error = (error, message, stackTrace) => {
  exports.sectionStart();
  console.log(`[ERROR] : `);
  if (message) console.log(message);
  if (error) console.log(error);
  if (stackTrace) console.log(stackTrace);
  exports.sectionEnd();
};

exports.warn = message => {
  exports.sectionStart();
  console.log("[WARN] ", message);
  exports.sectionEnd();
};

exports.log = message => {
  exports.sectionStart();
  console.log("[LOG] ", message);
  exports.sectionEnd();
};

exports.sectionStart = () => {
  console.log("\n");
  console.log("--------------------------------");
};
exports.sectionEnd = () => {
  console.log("--------------------------------");
  console.log("\n");
};
