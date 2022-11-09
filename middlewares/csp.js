const helmet = require("helmet");
const _ = require("lodash");

srcPolicies = [
  "defaultSrc",
  "scriptSrc",
  "connectSrc",
  "fontSrc",
  "imgSrc",
  "styleSrc"
];

module.exports = (config) => (req, res, next) => {
  let defaults = config.contentSecurityPolicy.srcDefaults;
  let directives = config.contentSecurityPolicy.directives;

  let fullDirectives = {};
  let defaultConf = {};

  for(policy of srcPolicies) {
    defaultConf[policy] = defaults;
  } 
  
  for (let key of Object.keys(defaultConf)) {
    fullDirectives[key] = _.clone(defaults);
    for (let val of directives[key] || []) {
      fullDirectives[key].push(val);
    }
  }

  if (res.local.nonce) {
    conf.script.push(`'nonce-${res.locals.nonce}'`);
    conf.style.push(`'nonce-${res.locals.nonce}'`);  
  }

  helmet.contentSecurityPolicy({
    useDefaults: true,
    fullDirectives,
  })(req, res, next);
};
