const { clone } = require("lodash");

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

function generateDirectives(new_config, nonce) {
  const { srcDefaults, helmetConfig } = new_config;
  const defaults = srcDefaults;
  const directives =
    ((helmetConfig || {}).contentSecurityPolicy || {}).directives || {};
  const fullDirectives = {};
  const defaultConf = {};
  for (let policy of srcPolicies) {
    defaultConf[policy] = defaults;
  }
  for (let key of Object.keys(defaultConf)) {
    fullDirectives[key] = clone(defaults);
    for (let val of directives[key] || []) {
      fullDirectives[key].push(val);
    }
  }
  if (nonce) {
    (fullDirectives.scriptSrc || []).push(`'nonce-${nonce}'`);
    (fullDirectives.styleSrc || []).push(`'nonce-${nonce}'`);
  }
  return fullDirectives;
}

module.exports = (config, nonce) => {
  const { helmetConfig = {} } = config;
  helmetConfig.contentSecurityPolicy = {
    useDefaults: true,
    directives: generateDirectives(config, nonce),
  };
  return config.helmetConfig;
};
