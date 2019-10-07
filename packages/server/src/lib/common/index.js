module.exports = {
  get logger() {
    return require('./logger');
  },

  get service() {
    return require('./service');
  }
};
