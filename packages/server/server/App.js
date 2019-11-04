/**
 * Module dependencies.
 */
const Proto = require('uberproto');
const CaptainsLog = require('captains-log');
const Zeros = require('@zerosjs/zeros');

const loadApp = require('./load');
const mixinAfter = require('./private/after');

const App = Proto.mixin({
  log: CaptainsLog(),

  start: require('./start'),
  stop: require('./stop'),

  initialize: require('./private/initialize'),
  exposeGlobals: require('./private/exposeGlobals')
}, Zeros());

App.load = loadApp(App);

mixinAfter(App);

module.exports = App;

// /**
//  * Construct a Zeros (app) instance.
//  *
//  * @constructor
//  */
// function Zeros() {
//   // Inherit methods from EventEmitter
//   events.EventEmitter.call(this);

//   // Remove memory-leak warning about max listeners
//   // See: http://nodejs.org/docs/latest/api/events.html#events_emitter_setmaxlisteners_n
//   this.setMaxListeners(0);

//   // Keep track of spawned child processes
//   this.childProcesses = [];

//   // Ensure CaptainsLog exists
//   this.log = CaptainsLog();

//   // Mixin `load()` method to load the pieces
//   // of a Zeros app
//   this.load = loadZeros(this);

//   // Mixin support for `Zeros.prototype.after()`
//   mixinAfter(this);

//   // Bind `this` context for all `Zeros.prototype.*` methods
//   this.load = _.bind(this.load, this);
//   this.start = _.bind(this.start, this);
//   this.stop = _.bind(this.stop, this);

//   this.initialize = _.bind(this.initialize, this);
//   this.exposeGlobals = _.bind(this.exposeGlobals, this);
//   this.getPlugins = _.bind(this.getPlugins, this);
//   this.reloadPlugins = _.bind(this.reloadPlugins, this);
// }

// // Extend from EventEmitter to allow hooks to listen to stuff
// util.inherits(Zeros, events.EventEmitter);

// Zeros.prototype.start = require('./start');
// Zeros.prototype.stop = require('./stop');

// Zeros.prototype.reloadPlugins = require('./reload-plugins');
// Zeros.prototype.getPlugins = require('./get-plugins');
// Zeros.prototype.registerPlugin = require('./register-plugin');
// Zeros.prototype.registerPluginHook = require('./register-plugin-hook');

// // Private methods:
// Zeros.prototype.initialize = require('./private/initialize');
// Zeros.prototype.exposeGlobals = require('./private/exposeGlobals');

// // Expose Zeros constructor:
// module.exports = Zeros;
