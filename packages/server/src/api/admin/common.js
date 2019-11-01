// 客户端与服务端之间传递的AppIdKey
const AppIdKey = 'zero-appid';

async function handleAppLoad (app, context) {
  if (!app || !context || !context.params) {
    return context;
  }

  const { params } = context;

  Object.assign(params, { app, apploaded: true });
  
  if (params.connection) {
    Object.assign(params.connection, { app, apploaded: true });
  }

  return context;
}

module.exports = {
  AppIdKey,
  handleAppLoad
};
