const debug = require('debug')('@zerosjs/authentication/hooks/connection');

module.exports = (event) => async (context) => {
  const { app, result, params } = context;

  if (params.provider && result) {
    debug(`Sending authentication event '${event}'`);
    app.emit(event, result, params, context);
  }

  return context;
};
