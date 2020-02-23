const _ = require('lodash');

module.exports = function(zeros) {
  /**
   * Expose new instance of `Plugins`
   */
  return new Plugins();

  function Plugins() {
    this.load = require('./load')(zeros);

    // Bind the context of all instance methods
    _.bindAll(this);
  }
};
