const { omit } = require('lodash');

module.exports = (event) => async (context) => {
  const { result, params: { connection } } = context;

  if (!connection) {
    return context;
  }

  const service = context.service;

  Object.assign(connection, omit(result, 'accessToken', 'authentication'));

  await service.handleConnection(event, connection, result);

  return context;
};
