module.exports = function definePlugin(zeros) {
  return {
    initialize: function (next) {
      const socketsCfg = zeros.get('sockets');

      zeros.after(['plugin:http:loaded'], () => {
        if (socketsCfg.type === 'socketio') {
          return initializeScoketIo(zeros, socketsCfg, next);
        } else {
          return next();
        }
      });
    }
  };
};

function initializeScoketIo (zeros, config, cb) {
  const socketio = require('@zerosjs/socketio');

  let options = _.omit(config, ['type', 'adapter', 'url']);

  // if (config.adapter) {
  //   let ioAdapter = require(config.adapter);

  //   options.adapter = ioAdapter({
  //     url: options.url
  //   });
  // }

  // console.log('options -------->', options)

  // zeros.configure(socketio(options));
  
  zeros.configure(socketio());

  cb();
}