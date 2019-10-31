const { AppIdKey, handleAppLoad } = require('./common');

exports.appLoad = () => {
  return async (context) => {
    const { app, params, service } = context;
    const { user, headers } = params;

    let appService = app.service('api/admin/app');

    // appService下不需要无需load
    if (appService === service) {
      return context;
    }

    if (!user || !headers || !headers[AppIdKey]) {
      return context;
    }
  
    if (params.apploaded === true) {
      return context;
    }

    const appId = headers[AppIdKey];

    if (appId) {
      let loadResult = await appService.get(appId, { user });
      
      handleAppLoad(loadResult, context);
    }

    return context;
  };
};
