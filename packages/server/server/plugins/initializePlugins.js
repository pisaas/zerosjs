/**
 * Module dependencies
 */

var util = require('util');
var _ = require('lodash');
var async = require('async');
var __plugin = require('./plugin');

/**
 * @param  {ZerosApp} zeros
 * @returns {Function}
 */
module.exports = function(zeros) {
  var Plugin = __plugin(zeros);

  // Keep an array of all the plugin timeouts.
  // This way if a plugin fails to load, we can clear all the timeouts at once.
  var pluginTimeouts = [];
  // NOTE: There's no particular reason this (^^) is outside of the function being returned below.

  /**
   * Resolve the plugin definitions and then finish loading them
   *
   * @api private
   */
  return function initializePlugins(plugins, cb) {
    /**
     * FUTURE: extrapolate
     * @param  {[type]} id [description]
     * @return {[type]}    [description]
     */
    function preparePlugin(id) {
      var rawPluginFn = plugins[id];

      // Allow disabling of plugins by setting them to `false`.
      if (rawPluginFn === false) {
        delete plugins[id];
        return;
      }

      if (!_.isFunction(rawPluginFn)) {
        zeros.log.error('Malformed plugin! (' + id + ')');
        zeros.log.error('Plugins should be a function with one argument (`zeros`)');
        zeros.log.error('But instead, got:', rawPluginFn);
        process.exit(1);
      }

      // Instantiate the zeros
      var def = rawPluginFn(zeros);

      // Mix in an `identity` property to plugin definition
      def.identity = id.toLowerCase();

      // If a config key was defined for this plugin when it was loaded,
      // (probably because a user is overridding the default config key)
      // set it on the plugin definition
      def.configKey = rawPluginFn.configKey || def.identity;

      // New up an actual Plugin instance
      plugins[id] = new Plugin(def);
    }

    /**
     * Apply a plugin's "defaults" property
     *
     * FUTURE: extrapolate
     *
     * @param  {[type]} plugin [description]
     * @return {[type]}      [description]
     */
    function applyDefaults(plugin) {
      // Get the plugin defaults
      var defaults = (_.isFunction(plugin.defaults) ?
        plugin.defaults(zeros.config) :
        plugin.defaults) || {};

      // Replace the special __configKey__ key with the actual config key
      if (plugin.defaults.__configKey__ && plugin.configKey) {
        plugin.defaults[plugin.configKey] = plugin.defaults.__configKey__;
        delete plugin.defaults.__configKey__;
      }

      _.defaultsDeep(zeros.config, defaults);
    }

    /**
     * Load a plugin (bind its routes, load any modules and initialize it)
     *
     * FUTURE: extrapolate
     *
     * @param  {[type]}   id [description]
     * @param  {Function} cb [description]
     * @return {[type]}      [description]
     */
    function loadPlugin(id, cb) {
      // Validate `pluginTimeout` setting, if present.
      if (!_.isUndefined(zeros.config.pluginTimeout)) {
        if (!_.isNumber(zeros.config.pluginTimeout) || zeros.config.pluginTimeout < 1 || Math.floor(zeros.config.pluginTimeout) !== zeros.config.pluginTimeout) {
          return cb(new Error('Invalid `pluginTimeout` config!  If set, this should be a positive whole number, but instead got `'+zeros.config.pluginTimeout+'`.  Please change this setting, then try starting again.'));
        }
      }

      var timestampBeforeLoad = Date.now();
      var DEFAULT_PLUGIN_TIMEOUT = 40000;

      var timeoutInterval = (zeros.config[plugins[id].configKey || id]
        && zeros.config[plugins[id].configKey || id]._pluginTimeout)
        || zeros.config.pluginTimeout
        || DEFAULT_PLUGIN_TIMEOUT;

      var pluginTimeout = setTimeout(function tooLong() {
        var err = new Error(
          'Zeros is taking too long to load.\n'+
          '\n'+
          '  -• Please check plugin `'+id+'`.\n'+
          '    (*If* `initialize()` is using a callback, make sure it\'s being called.)\n'+
          '--  --  --  --  --  --  --  --  --  --  --  --  --  --  --  --  --  --  --  --  --\n'
        );
        err.code = 'E_PLUGIN_TIMEOUT';
        cb(err);
      }, timeoutInterval);

      pluginTimeouts.push(pluginTimeout);

      plugins[id].load(function(err) {
        // Sanity check: (see https://trello.com/c/1jCljHHP for an example of a
        // potential bug this catches)
        if (!process.nextTick) {
          return cb(new Error('Consistency violation: Hmm... it looks like something is wrong with Node\'s `process` global.  Check it out:\n'+util.inspect(process)));
        }
        
        clearTimeout(pluginTimeout);

        if (err) {
          // Clear all plugin timeouts so that the process doesn't hang because
          // something is waiting for this failed plugin to load.
          _.each(pluginTimeouts, function(pluginTimeout) {clearTimeout(pluginTimeout);});
          zeros.log.error('A plugin (`' + id + '`) failed to load!');
          zeros.emit('plugin:' + id + ':error');

          // Defer a tick to allow other stuff to happen
          process.nextTick(function(){ cb(err); });
          return;
        }

        zeros.log.verbose(id, 'plugin loaded successfully. ('+(Date.now() - timestampBeforeLoad)+'ms)');
        zeros.emit('plugin:' + id + ':loaded');

        // Defer a tick to allow other stuff to happen
        process.nextTick(function(){ cb(); });
      });
    }

    // Now do a few things, one after another.
    async.series(
      {
        // Prepare all other plugins
        prepare: function(cb) {
          async.each(_.keys(plugins), function (id, cb) {
            preparePlugin(id);
            // Defer to next tick to allow other stuff to happen
            process.nextTick(cb);
          }, cb);
        },

        // Apply the default config for all other plugins
        defaults: function(cb) {
          async.each(_.keys(plugins), function (id, cb) {
            var plugin = plugins[id];
            applyDefaults(plugin);
            // Defer to next tick to allow other stuff to happen
            process.nextTick(cb);
          }, cb);
        },

        // Run configuration method for all other plugins
        configure: function(cb) {
          async.each(_.keys(plugins), function (id, cb) {
            var plugin = plugins[id];
            try {
              plugin.configure();
            } catch (err) {
              return process.nextTick(function(){ cb(err); });
            }
            // Defer to next tick to allow other stuff to happen
            process.nextTick(cb);
          }, cb);
        },

        // Load all other plugins
        load: function(cb) {
          async.each(_.keys(plugins), function (id, cb) {
            zeros.log.silly('Loading plugin: ' + id);
            loadPlugin(id, cb);
          }, cb);
        }
      },

      function afterwards(err) {
        if (err) { return cb(err); }
        return cb();
      }
    );
  };
};
