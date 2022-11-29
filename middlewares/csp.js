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

function getSrcDefaults(config) {
  let defaults = [];
  if (typeof config.contentSecurityPolicy !== 'undefined') {
    defaults = config.contentSecurityPolicy.srcDefaults || [];
  }
  return defaults;
};

function getDirectives(config) {
  let directives = {};
  if (typeof config.contentSecurityPolicy !== 'undefined') {
    directives = config.contentSecurityPolicy.directives || {};
  }
  return directives;
};

function generateDirectives(config, nonce) {
  let defaults = getSrcDefaults(config);
  let directives = getDirectives(config);
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
  config.contentSecurityPolicy = {
    useDefaults: true,
    directives,
  };
  next();
};
