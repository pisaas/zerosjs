module.exports = {
  get json() {
    return require('./json');
  },

  get logger() {
    return require('./logger');
  },

  get service() {
    return require('./service');
  },

  get resc() {
    return require('./resc');
  }
};
