const _ = require("lodash");

let srcPolicies = [
  "defaultSrc",
  "scriptSrc",
  "connectSrc",
  "fontSrc",
  "imgSrc",
  "styleSrc",
  "frameSrc",
  "childSrc",
];

function generateDirectives(config, nonce) {
  const {srcDefaults: defaults, helmetConfig} = config;
  const directives = ((helmetConfig || {}).contentSecurityPolicy || {}).directives || {};
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

module.exports = (config, nonce) => {
  let new_config = _.clone(config);
  const directives = generateDirectives(new_config, nonce);
  new_config.helmetConfig.contentSecurityPolicy = {
    useDefaults: true,
    directives,
  };
  return new_config;
};
