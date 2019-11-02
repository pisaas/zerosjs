/**
 * Module dependencies
 */

var util = require('util');
var _ = require('lodash');
var async = require('async');
var defaultsDeep = require('merge-defaults');// « TODO: Get rid of this
var __plugins = require('../../plugins');

/**
 * @param  {ZeroApp} zero
 * @returns {Function}
 */
module.exports = function(zero) {
  var Plugin = __plugins(zero);

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

      // Handle folder-defined modules (default to index.js)
      // Since a plugin definition must be a function
      if (_.isObject(rawPluginFn) && !_.isArray(rawPluginFn) && !_.isFunction(rawPluginFn)) {
        rawPluginFn = rawPluginFn.index;
      }

      if (!_.isFunction(rawPluginFn)) {
        zero.log.error('Malformed plugin! (' + id + ')');
        zero.log.error('Plugins should be a function with one argument (`zero`)');
        zero.log.error('But instead, got:', rawPluginFn);
        process.exit(1);
      }

      // Instantiate the zero
      var def = rawPluginFn(zero);

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
        plugin.defaults(zero.config) :
        plugin.defaults) || {};

      // Replace the special __configKey__ key with the actual config key
      if (plugin.defaults.__configKey__ && plugin.configKey) {
        plugin.defaults[plugin.configKey] = plugin.defaults.__configKey__;
        delete plugin.defaults.__configKey__;
      }

      defaultsDeep(zero.config, defaults);
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
      if (!_.isUndefined(zero.config.pluginTimeout)) {
        if (!_.isNumber(zero.config.pluginTimeout) || zero.config.pluginTimeout < 1 || Math.floor(zero.config.pluginTimeout) !== zero.config.pluginTimeout) {
          return cb(new Error('Invalid `pluginTimeout` config!  If set, this should be a positive whole number, but instead got `'+zero.config.pluginTimeout+'`.  Please change this setting, then try starting again.'));
        }
      }

      var timestampBeforeLoad = Date.now();
      var DEFAULT_PLUGIN_TIMEOUT = 40000;

      var timeoutInterval = (zero.config[plugins[id].configKey || id]
        && zero.config[plugins[id].configKey || id]._pluginTimeout)
        || zero.config.pluginTimeout
        || DEFAULT_PLUGIN_TIMEOUT;

      var pluginTimeout = setTimeout(function tooLong() {
        var err = new Error(
          'Zero is taking too long to load.\n'+
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
          zero.log.error('A plugin (`' + id + '`) failed to load!');
          zero.emit('plugin:' + id + ':error');

          // Defer a tick to allow other stuff to happen
          process.nextTick(function(){ cb(err); });
          return;
        }

        zero.log.verbose(id, 'plugin loaded successfully. ('+(Date.now() - timestampBeforeLoad)+'ms)');
        zero.emit('plugin:' + id + ':loaded');

        // Defer a tick to allow other stuff to happen
        process.nextTick(function(){ cb(); });
      });
    }

    // Now do a few things, one after another.
    async.series(
      {
        // First load the moduleloader (if any)
        moduleloader: function(cb) {
          if (!plugins.moduleloader) {
            return cb();
          }
          preparePlugin('moduleloader');
          applyDefaults(plugins['moduleloader']);
          plugins['moduleloader'].configure();
          loadPlugin('moduleloader', cb);
        },

        // Prepare all other plugins
        prepare: function(cb) {
          async.each(_.without(_.keys(plugins), 'moduleloader'), function (id, cb) {
            preparePlugin(id);
            // Defer to next tick to allow other stuff to happen
            process.nextTick(cb);
          }, cb);
        },

        // Apply the default config for all other plugins
        defaults: function(cb) {
          async.each(_.without(_.keys(plugins), 'moduleloader'), function (id, cb) {
            var plugin = plugins[id];
            applyDefaults(plugin);
            // Defer to next tick to allow other stuff to happen
            process.nextTick(cb);
          }, cb);
        },

        // Run configuration method for all other plugins
        configure: function(cb) {
          async.each(_.without(_.keys(plugins), 'moduleloader'), function (id, cb) {
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
          async.each(_.without(_.keys(plugins), 'moduleloader'), function (id, cb) {
            zero.log.silly('Loading plugin: ' + id);
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
