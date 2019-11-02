module.exports = function(zero) {
  /**
   * Module dependencies
   */
  const path = require('path');
  const async = require('async');
  const _ = require('lodash');
  const includeAll = require('include-all');
  const mergeDictionaries = require('merge-dictionaries');
  
  // refer to node package `common-js-file-extensions`
  const COMMON_JS_FILE_EXTENSIONS = {
    code: ['js', 'ts'],
    config: ['json']
  };

  /**
   * Module constants
   */

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Supported file extensions for imperative code files such as hooks:
  //  • 'js' (.js)
  //  • 'ts' (.ts)
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  const BASIC_SUPPORTED_FILE_EXTENSIONS = COMMON_JS_FILE_EXTENSIONS.code;

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Supported file extensions, ONLY for configuration files:
  //  • All of the normal supported extensions like 'js', plus
  //  • 'json' (.json)
  const SUPPORTED_FILE_EXTENSIONS_FOR_CONFIG = COMMON_JS_FILE_EXTENSIONS.config.concat(BASIC_SUPPORTED_FILE_EXTENSIONS);

  /**
   * Module loader
   *
   * Load code files from a Zero app into memory; modules like controllers,
   * models, services, config, etc.
   */
  return {
    defaults: function (config) {
      var localConfig = {
        // The path to the application
        appPath: config.appPath ? path.resolve(config.appPath) : process.cwd(),

        // Paths for application modules and key files
        // If `paths.app` not specified, use process.cwd()
        // (the directory where this Zero process is being initiated from)
        paths: {
          // Configuration
          //
          // For `config` hook
          config: path.resolve(config.appPath, 'config'),

          // Server-Side Code
          //
          // For `models` plugin
          models: path.resolve(config.appPath, 'models'),
          // For `apis` plugin
          apis: path.resolve(config.appPath, 'apis'),
          // For `services` plugin
          services: path.resolve(config.appPath, 'services'),
          // For `helpers` hook
          helpers: path.resolve(config.appPath, 'helpers')
        }
      };

      return localConfig;
    },

    initialize: function(cb) {
      // Expose self as `zero.modules`.
      zero.modules = zero.plugins.moduleloader;

      return cb();
    },

    configure: function() {
      // Default to process.cwd()
      zero.config.appPath = zero.config.appPath ? path.resolve(zero.config.appPath) : process.cwd();
    },

    /**
     * Load config from app
     *
     * @param {Object} options
     * @param {Function} cb
     */
    loadConfig: function (cb) {
      async.auto({
        'config/*': function loadOtherConfigFiles (cb) {
          includeAll.aggregate({
            dirname   : zero.config.paths.config,
            exclude   : ['locales', /local\..+/],
            excludeDirs: /(locales|env)$/,
            filter    : new RegExp('^(.+)\\.(' + SUPPORTED_FILE_EXTENSIONS_FOR_CONFIG.join('|') + ')$'),
            flatten   : true,
            keepDirectoryPath: true,
            identity  : false
          }, cb);
        },

        'config/local' : function loadLocalOverrideFile (cb) {
          includeAll.aggregate({
            dirname   : zero.config.paths.config,
            filter    : new RegExp('^local\\.(' + SUPPORTED_FILE_EXTENSIONS_FOR_CONFIG.join('|') + ')$'),
            identity  : false
          }, cb);
        },

        // Load environment-specific config folder, e.g. config/env/development/*
        'config/env/**': ['config/local', function loadEnvConfigFolder (asyncData, cb) {
          // If there's an environment already set in zero.config, then it came from the environment
          // or the command line, so that takes precedence.  Otherwise, check the config/local.js file
          // for an environment setting.  Lastly, default to development.
          var env = zero.config.environment || asyncData['config/local'].environment || 'development';
          includeAll.aggregate({
            dirname   : path.resolve( zero.config.paths.config, 'env', env ),
            filter    : new RegExp('^(.+)\\.(' + SUPPORTED_FILE_EXTENSIONS_FOR_CONFIG.join('|') + ')$'),
            optional  : true,
            flatten   : true,
            keepDirectoryPath: true,
            identity  : false
          }, cb);
        }],

        // Load environment-specific config file, e.g. config/env/development.js
        'config/env/*' : ['config/local', function loadEnvConfigFile (asyncData, cb) {
          // If there's an environment already set in zero.config, then it came from the environment
          // or the command line, so that takes precedence.  Otherwise, check the config/local.js file
          // for an environment setting.  Lastly, default to development.
          var env = zero.config.environment || asyncData['config/local'].environment || 'development';
          includeAll.aggregate({
            dirname   : path.resolve( zero.config.paths.config, 'env' ),
            filter    : new RegExp('^' + _.escapeRegExp(env) + '\\.(' + SUPPORTED_FILE_EXTENSIONS_FOR_CONFIG.join('|') + ')$'),
            optional  : true,
            flatten   : true,
            keepDirectoryPath: true,
            identity  : false
          }, cb);
        }]
      }, function (err, asyncData) {
        if (err) { return cb(err); }
        // Save the environment override, if any.
        var env = zero.config.environment;
        // Merge the configs, with env/*.js files taking precedence over others, and local.js
        // taking precedence over everything.
        var config = mergeDictionaries(
          asyncData['config/*'],
          asyncData['config/env/**'],
          asyncData['config/env/*'],
          asyncData['config/local']
        );
        // Set the environment, but don't allow env/* files to change it; that'd be weird.
        config.environment = env || asyncData['config/local'].environment || 'development';
        // Return the user config
        cb(undefined, config);
      });
    },

    /**
     * Load app's model definitions
     *
     * @param {Object} options
     * @param {Function} cb
     */
    loadModels: function (cb) {
      // Get the main model files
      includeAll.optional({
        dirname   : zero.config.paths.models,
        filter  :  /(.+model)\.js$/,
        replaceExpr : /^.*\//,
        flatten: true
      }, bindToZero(cb));
    },

    /**
     * Load app services
     *
     * @param {Object} options
     * @param {Function} cb
     */
    loadServices: function (cb) {
      cb();
    },

    /**
     * Load app services
     *
     * @param {Object} options
     * @param {Function} cb
     */
    loadApis: function (cb) {
      cb();
    },

    optional: includeAll.optional,
    required: includeAll.required,
    aggregate: includeAll.aggregate,
    exists: includeAll.exists
  };

  /**
   * Private helper function used above.
   *
   * @param  {Function} cb [description]
   * @return {Function}
   *         @param {Error?} err
   *         @param {Dictionary} modules
   */
  function bindToZero(cb) {
    return function(err, modules) {
      if (err) {return cb(err);}
      _.each(modules, function(moduleDef) {
        // Add a reference to the Zero app that loaded the module
        moduleDef.zero = zero;
        // Bind all methods to the module context
        _.bindAll(moduleDef);
      });
      return cb(undefined, modules);
    };
  }
};
