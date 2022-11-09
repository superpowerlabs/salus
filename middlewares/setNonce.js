const crypto = require("crypto");

module.exports = (req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString("hex");
  next();
};
