const { handleAppLoad } = require('../../common');

exports.handleConnection = () => {
  return async (context) => {
    const { result: app, params } = context;

    const { query } = params;

    // 加载app
    if (query && query.verb === 'load') {
      await handleAppLoad(app, context);
    }

    return context;
  };
};
