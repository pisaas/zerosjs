const path = require('path');
const includeAll = require('include-all');
const async = require('async');
const _ = require('lodash');

const COMMON_JS_FILE_EXTENSIONS = {
  code: ['js', 'ts'],
  config: ['json']
};

const BASIC_SUPPORTED_FILE_EXTENSIONS = COMMON_JS_FILE_EXTENSIONS.code;
const SUPPORTED_FILE_EXTENSIONS_FOR_CONFIG = COMMON_JS_FILE_EXTENSIONS.config.concat(BASIC_SUPPORTED_FILE_EXTENSIONS);


describe('\'config\' load', () => {
  it('load config', (done) => {
    loadConfig((err, result) => {
      console.log('load config -------->', result);
      done();
    });
  });
});

function loadConfig (cb) {
  let configPath = path.join(__dirname, '../../../config1');
  // let configEnv = 'production';
  let configEnv = undefined;

  async.auto({
    'config/*': function loadOtherConfigFiles (cb) {
      includeAll.aggregate({
        dirname   : configPath,
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
        dirname   : configPath,
        filter    : new RegExp('^local\\.(' + SUPPORTED_FILE_EXTENSIONS_FOR_CONFIG.join('|') + ')$'),
        identity  : false
      }, cb);
    },
  
    // Load environment-specific config folder, e.g. config/env/development/*
    'config/env/**': ['config/local', function loadEnvConfigFolder (asyncData, cb) {
      // If there's an environment already set in sails.config, then it came from the environment
      // or the command line, so that takes precedence.  Otherwise, check the config/local.js file
      // for an environment setting.  Lastly, default to development.
      var env = configEnv || asyncData['config/local'].environment || 'development';
      includeAll.aggregate({
        dirname   : path.resolve( configPath, 'env', env ),
        filter    : new RegExp('^(.+)\\.(' + SUPPORTED_FILE_EXTENSIONS_FOR_CONFIG.join('|') + ')$'),
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
      var env = configEnv || asyncData['config/local'].environment || 'development';
      includeAll.aggregate({
        dirname   : path.resolve( configPath, 'env' ),
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
    var env = configEnv;
    // Merge the configs, with env/*.js files taking precedence over others, and local.js
    // taking precedence over everything.
    var config = _.merge(
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
}
