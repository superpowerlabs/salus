module.exports = (req, res, next) => {
  req.ip =
    req.headers["x-real-ip"] ||
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress;
  next();
};
