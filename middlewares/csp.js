const csp = require("helmet-csp");
const _ = require("lodash");

let srcPolicies = [
  "defaultSrc",
  "scriptSrc",
  "connectSrc",
  "fontSrc",
  "imgSrc",
  "styleSrc",
];

function generateDirectives(config, nonce) {
  let defaults = config.contentSecurityPolicy.srcDefaults;
  let directives = config.contentSecurityPolicy.directives;
  let fullDirectives = {};
  let defaultConf = {};

  for (let policy of srcPolicies) {
    defaultConf[policy] = defaults;
  }
  for (let key of Object.keys(defaultConf)) {
    fullDirectives[key] = _.clone(defaults);
    for (let val of directives[key] || []) {
      fullDirectives[key].push(val);
    }
  }
  if (nonce) {
    fullDirectives.scriptSrc.push(`'nonce-${nonce}'`);
    fullDirectives.styleSrc.push(`'nonce-${nonce}'`);
  }
  return fullDirectives;
}

module.exports = (config) => (req, res, next) => {
  const directives = generateDirectives(config, res.locals.nonce);
  // console.log("... calling CSP", req.originalUrl);
  csp({
    useDefaults: true,
    directives,
  })(req, res, next);
};
