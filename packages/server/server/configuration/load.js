/**
 * Module dependencies.
 */

const path = require('path');
const _ = require('lodash');
const async = require('async');
const includeAll = require('include-all');

const JsFileExts = {
  code: ['js', 'ts'],
  config: ['json']
};

const BasicJsFileExts = JsFileExts.code;
const ConfigJsFileExts = JsFileExts.config.concat(BasicJsFileExts);

module.exports = function(zeros) {
  return function loadConfig(cb) {
    let appPath = zeros.config.appPath ? path.resolve(zeros.config.appPath) : process.cwd();
    let appEnv = zeros.config.environment || process.env.NODE_ENV || 'development';

    let cfgPath = path.resolve(appPath, 'config');
    let pluginsPath = path.resolve(appPath, 'app/plugins');

    let defaults = {
      appPath,
      environment: appEnv,
      paths: {
        config: cfgPath,
        plugins: pluginsPath,
        models: path.resolve(appPath, 'app/models'),
        services: path.resolve(appPath, 'app/services'),
        channels: path.resolve(appPath, 'app/channels'),
        apis: path.resolve(appPath, 'app/apis')
      }
    };

    async.auto({
      'config/*': function loadConfigFiles (cb) {
        includeAll.aggregate({
          dirname   : cfgPath,
          exclude   : ['locales', /local\..+/],
          excludeDirs: /(locales|env)$/,
          filter    : new RegExp('^(.+)\\.(' + ConfigJsFileExts.join('|') + ')$'),
          flatten   : true,
          keepDirectoryPath: true,
          identity  : false
        }, cb);
      },
    
      'config/local' : function loadLocalOverrideFile (cb) {
        includeAll.aggregate({
          dirname   : cfgPath,
          filter    : new RegExp('^local\\.(' + ConfigJsFileExts.join('|') + ')$'),
          identity  : false
        }, cb);
      },
    
      // Load environment-specific config folder, e.g. config/env/development/*
      'config/env/**': ['config/local', function loadEnvConfigFolder (asyncData, cb) {
        // If there's an environment already set in sails.config, then it came from the environment
        // or the command line, so that takes precedence.  Otherwise, check the config/local.js file
        // for an environment setting.  Lastly, default to development.
        var env = appEnv || asyncData['config/local'].environment || 'development';
        includeAll.aggregate({
          dirname   : path.resolve( cfgPath, 'env', env ),
          filter    : new RegExp('^(.+)\\.(' + ConfigJsFileExts.join('|') + ')$'),
          optional  : true,
          flatten   : true,
          keepDirectoryPath: true,
          identity  : false
        }, cb);
      }],
    
      // Load environment-specific config file, e.g. config/env/development.js
      'config/env/*' : ['config/local', function loadEnvConfigFile (asyncData, cb) {
        // If there's an environment already set in sails.config, then it came from the environment
        // or the command line, so that takes precedence.  Otherwise, check the config/local.js file
        // for an environment setting.  Lastly, default to development.
        var env = appEnv || asyncData['config/local'].environment || 'development';
        includeAll.aggregate({
          dirname   : path.resolve( cfgPath, 'env' ),
          filter    : new RegExp('^' + _.escapeRegExp(env) + '\\.(' + ConfigJsFileExts.join('|') + ')$'),
          optional  : true,
          flatten   : true,
          keepDirectoryPath: true,
          identity  : false
        }, cb);
      }]
    }, function (err, asyncData) {
      if (err) { return cb(err); }

      // Merge the configs, with env/*.js files taking precedence over others, and local.js
      // taking precedence over everything.
      var config = _.merge(
        defaults,
        asyncData['config/*'],
        asyncData['config/env/**'],
        asyncData['config/env/*'],
        asyncData['config/local']
      );
  
      // Set the environment, but don't allow env/* files to change it; that'd be weird.
      config.environment = appEnv || asyncData['config/local'].environment || 'development';

      zeros.config = config;

      zeros.emit('configs:loaded', config);
      
      cb();
    });
  };
};
