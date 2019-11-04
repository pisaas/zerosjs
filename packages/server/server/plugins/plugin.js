var _ = require('lodash');
var flaverr = require('flaverr');
var async = require('async');
var STRIP_COMMENTS_RX = /(\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s*=[^,\)]*(('(?:\\'|[^'\r\n])*')|("(?:\\"|[^"\r\n])*"))|(\s*=[^,\)]*))/mg;

module.exports = function(zeros) {
  /**
   * Expose plugin constructor
   *
   * @api private
   */
  return function Plugin(definition) {
    // Flags to indicate whether or not this plugin's `initialize` function is asynchronous (i.e. declared with `async`)
    // and whether or not it has any parameters.
    var hasAsyncInit;
    var initSeemsToExpectParameters;

    // A few sanity checks to make sure te provided definition does not contain any reserved properties.
    if (!_.isObject(definition)) {
      // This particular behavior can be made a bit less genteel in future versions (it is currently
      // forgiving for backwards compatibility)
      definition = definition || {};
    }

    if (_.isFunction(definition.config)) {
      throw flaverr({ name: 'userError', code: 'E_INVALID_PLUGIN_CONFIG' }, new Error('Error defining plugin: `config` is a reserved property and cannot be used as a custom plugin method.'));
    }

    if (_.isFunction(definition.hooks)) {
      throw flaverr({ name: 'userError', code: 'E_INVALID_PLUGIN_CONFIG' }, new Error('Error defining plugin: `hooks` is a reserved property and cannot be used as a custom plugin method.'));
    }

    /**
     * Load the plugin asynchronously
     *
     * @api private
     */
    this.load = function(cb) {
      var self = this;

      // Determine if this plugin should load based on zeros environment & plugin config
      if (this.config.envs &&
        this.config.envs.length > 0 &&
        this.config.envs.indexOf(zeros.config.environment) === -1) {
        return cb();
      }

      async.auto({
        modules: function(cb) {
          return self.loadModules(cb);
        }
      }, function(err) {
        if (err) { return cb(err); }

        // console.log(self.identity, self.initialize.toString());
        try {
          var seemsToExpectCallback = true;
          if (zeros.config.implementationSniffingTactic === 'analogOrClassical') {
            seemsToExpectCallback = initSeemsToExpectParameters;
            // (TODO: also locate and update relevant error messages)
          }

          if (hasAsyncInit) {
            var promise;
            if (seemsToExpectCallback) {
              promise = self.initialize(cb);
            } else {
              promise = self.initialize(function(unusedErr){
                cb(new Error('Unexpected attempt to invoke callback.  Since this "initialize" function does not appear to expect a callback parameter, this stub callback was provided instead.  Please either explicitly list the callback parameter among the arguments or change this code to no longer use a callback.'));
              }).then(function(){
                cb();
              });
            }

            promise.catch(function(e) {
              cb(e);
              // (Note that we don't do `return proceed(e)` here.  That's on purpose--
              // to avoid sending the wrong idea to you, dear reader)
            });
          } else {
            if (seemsToExpectCallback) {
              self.initialize(cb);
            } else {
              self.initialize(function(unusedErr){
                cb(new Error('Unexpected attempt to invoke callback.  Since this "initialize" function does not appear to expect a callback parameter, this stub callback was provided instead.  Please either explicitly list the callback parameter among the arguments or change this code to no longer use a callback.'));
              });
              return cb();
            }
          }
        } catch (e) { return cb(e); }
      });
    };

    /**
     * `defaults`
     *
     * Default configuration for this plugin.
     *
     * Hooks may override this function, or use a dictionary instead.
     *
     * @type {Function|Dictionary}
     *       @returns {Dictionary} [default configuration for this plugin to be merged into zeros.config]
     */
    this.defaults = function() {
      return {};
    };

    /**
     * `configure`
     *
     * If this plugin provides this function, the provided implementation should
     * normalize and validate configuration related to this plugin.  That config is
     * already in `zeros.config` at the time this function is called.  Any modifications
     * should be made in place on `zeros.config`
     *
     * Hooks may override this function.
     *
     * @type {Function}
     */
    this.configure = function() {
    };

    /**
     * `loadModules`
     *
     * Load any modules as a dictionary and pass the loaded modules to the callback when finished.
     *
     * Hooks may override this function (This runs before `initialize()`!)
     *
     * @type {Function}
     * @async
     */
    this.loadModules = function(cb) {
      return cb();
    };


    /**
     * `initialize`
     *
     * If provided, this implementation should prepare the plugin, then trigger the callback.
     *
     * Hooks may override this function.
     *
     * @type {Function}
     * @async
     */
    this.initialize = function(cb) {
      return cb();
    };

    // Ensure that the plugin definition has valid properties
    _normalize(this);
    definition = _normalize(definition);

    // Merge default definition with overrides in the definition passed in
    _.extend(definition.config, this.config, definition.config);
    _.extend(definition.hooks, this.hooks, definition.hooks);
    _.extend(this, definition);

    // Set a flag if this plugin has an async `initialize` function, and
    // whether or not that function seems to be expecting any parameters.
    hasAsyncInit = this.initialize.constructor.name === 'AsyncFunction';
    initSeemsToExpectParameters = (function(fn){
      var fnStr = fn.toString().replace(STRIP_COMMENTS_RX, '');
      var parametersAsString = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')'));
      // console.log('::',parametersAsString, parametersAsString.replace(/\s*/g,'').length);
      return parametersAsString.replace(/\s*/g,'').length !== 0;
    })(this.initialize);//†

    // Bind context of new methods from definition
    _.bindAll(this);

    /**
     * Ensure that a plugin definition has the required properties.
     *
     * @returns {Dictionary} [coerced plugin definition]
     * @api private
     */
    function _normalize(def) {
      def = def || {};

      // Default plugin config
      def.config = def.config || {};

      // list of environments to run in, if empty defaults to all
      def.config.envs = def.config.envs || [];

      def.hooks = def.hooks || {};

      return def;
    }
  };
};
