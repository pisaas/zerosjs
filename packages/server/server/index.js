var App = require('./App');

// 单例模式
function AppFactory() {
  return App;
}

module.exports = new AppFactory();
