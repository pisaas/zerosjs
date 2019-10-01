const debug = require('debug')('@zero/errors');
const feathersErrors = require('@feathersjs/errors');

function inheritsFrom (Child, Parent) {
  Child.prototype = Object.create(Parent.prototype);
  Child.prototype.constructor = Child;
}

function ZeroError (msg, name, code, className, data) {
  FeathersError.call(this, msg, name, code, className, data);
}

inheritsFrom(ZeroError, feathersErrors.FeathersError);

module.exports = Object.assign({ ZeroError }, feathersErrors);
