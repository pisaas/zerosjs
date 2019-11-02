/**
 * Module dependencies.
 */

const util = require('util');
const events = require('events');
const _ = require('lodash');
const CaptainsLog = require('captains-log');
const loadZero = require('./load');
const mixinAfter = require('./private/after');

/**
 * Construct a Zero (app) instance.
 *
 * @constructor
 */
function Zero() {
  // Inherit methods from EventEmitter
  events.EventEmitter.call(this);

  // Remove memory-leak warning about max listeners
  // See: http://nodejs.org/docs/latest/api/events.html#events_emitter_setmaxlisteners_n
  this.setMaxListeners(0);

  // Keep track of spawned child processes
  this.childProcesses = [];

  // Ensure CaptainsLog exists
  this.log = CaptainsLog();

  // Mixin `load()` method to load the pieces
  // of a Zero app
  this.load = loadZero(this);

  // Mixin support for `Zero.prototype.after()`
  mixinAfter(this);

  // Bind `this` context for all `Zero.prototype.*` methods
  this.load = _.bind(this.load, this);
  this.start = _.bind(this.start, this);
  this.stop = _.bind(this.stop, this);

  this.initialize = _.bind(this.initialize, this);
  this.exposeGlobals = _.bind(this.exposeGlobals, this);
  this.getPlugins = _.bind(this.getPlugins, this);
  this.reloadPlugins = _.bind(this.reloadPlugins, this);
}

// Extend from EventEmitter to allow hooks to listen to stuff
util.inherits(Zero, events.EventEmitter);

Zero.prototype.start = require('./start');

Zero.prototype.stop = require('./stop');

Zero.prototype.reloadPlugins = require('./reload-plugins');
Zero.prototype.getPlugins = require('./get-plugins');
Zero.prototype.registerPlugin = require('./register-plugin');
Zero.prototype.registerPluginHook = require('./register-plugin-hook');

// Private methods:
Zero.prototype.initialize = require('./private/initialize');
Zero.prototype.exposeGlobals = require('./private/exposeGlobals');

// Expose Zero constructor:
module.exports = Zero;
