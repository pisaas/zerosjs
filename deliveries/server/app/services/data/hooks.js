const { cloneDeep } = require('lodash');

exports.hashPassword = zeros.plugins.auth.hooks.hashPassword;
exports.fuzzySearch = zeros.plugins.orm.hooks.fuzzySearch;

exports.preEntityCreate = function (options) {
  let opts = Object.assign({
    idField: 'id',
    ownerField: 'uid',
    ownerNameField: 'uname',
    autoId: true,
    autoOwner: false
  }, options);

  let { idField, ownerField, ownerNameField, autoId, autoOwner } = opts;

  return async (context) => {
    if (context.type !== 'before') {
      throw new Error('The \'preEntityCreate\' hook should only be used as a \'before\' hook');
    }

    const { data, params } = context;

    let newData = cloneDeep(data);

    if (data && !data[idField] && autoId !== false) {
      const idsService = zeros.service('core/ids');
      const newId = await idsService.gen();
      newData[idField] = newId;
    }

    if (data && !data[ownerField] && params.user && autoOwner === true) {
      newData[ownerField] = params.user.id;
      newData[ownerNameField] = params.user.displayName;
    }

    // eslint-disable-next-line require-atomic-updates
    context.data = newData;

    return context;
  };
};
