const { get, set, cloneDeep } = require('lodash');
const { protectFields } = require('../../hooks');

exports.protectFields = protectFields;

exports.fuzzySearch = require('../../hooks/fuzzy-search');

exports.genId = function (field) {
  if (!field) {
    field = 'id';
  }

  return async (context) => {
    if (context.type !== 'before') {
      throw new Error('The \'hashPassword\' hook should only be used as a \'before\' hook');
    }

    const { app, data } = context;
    const id = get(data, field);

    if (!data || id) {
      return context;
    }

    const idsService = zero.service('core/ids');
    const newId = await idsService.gen();

    // eslint-disable-next-line require-atomic-updates
    context.data = set(cloneDeep(data), field, newId);

    return context;
  };
};
