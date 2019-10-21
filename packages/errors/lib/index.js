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

// 500 - InnerError
function InnerError (message, data) {
  ZeroError.call(this, message, 'InnerError', 500, 'inner-error', data);
}

inheritsFrom(InnerError, ZeroError);

module.exports = Object.assign({ ZeroError }, feathersErrors);
