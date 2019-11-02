const path = require('path');
const includeAll = require('include-all');

module.exports = () => {
  return (app) => {
    configurePlugins(app);
  };
};

function configurePlugins (app, options) {
  let dirname = path.join(__dirname, '.');

  options = Object.assign({
    dirname :  dirname,
    filter  :  /(.+hook)\.js$/,
    depth : 1
  }, options);

  const plugins = includeAll(options);

  // plugins排序

  return plugins;
}
