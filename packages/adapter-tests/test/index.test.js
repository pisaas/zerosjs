const assert = require('assert');

// const memory = require('@zerosjs/adapter-memory');
const errors = require('@zerosjs/errors');
const zeros = require('@zerosjs/zeros');

const adapterTests = require('../lib');
const testSuite = adapterTests([
  '.events',
  '._get',
  '._find',
  '._create',
  '._update',
  '._patch',
  '._remove',
  '.get',
  '.get + $select',
  '.get + id + query',
  '.get + NotFound',
  '.find',
  '.remove',
  '.remove + $select',
  '.remove + id + query',
  '.remove + multi',
  '.update',
  '.update + $select',
  '.update + id + query',
  '.update + NotFound',
  '.patch',
  '.patch + $select',
  '.patch + id + query',
  '.patch multiple',
  '.patch multi query',
  '.patch + NotFound',
  '.create',
  '.create + $select',
  '.create multi',
  'internal .find',
  'internal .get',
  'internal .create',
  'internal .update',
  'internal .patch',
  'internal .remove',
  '.find + equal',
  '.find + equal multiple',
  '.find + $sort',
  '.find + $sort + string',
  '.find + $limit',
  '.find + $limit 0',
  '.find + $skip',
  '.find + $select',
  '.find + $or',
  '.find + $in',
  '.find + $nin',
  '.find + $lt',
  '.find + $lte',
  '.find + $gt',
  '.find + $gte',
  '.find + $ne',
  '.find + $gt + $lt + $sort',
  '.find + $or nested + $sort',
  '.find + paginate',
  '.find + paginate + $limit + $skip',
  '.find + paginate + $limit 0',
  '.find + paginate + params',
  '.get + id + query id',
  '.remove + id + query id',
  '.update + id + query id',
  '.patch + id + query id'
]);

describe('Zeros Memory Service', () => {
  // 由于涉及到循环依赖，这里不作测试
  it('empty test', done => done())

  // const events = [ 'testing' ];
  // const app = zeros()
  //   .use('/people', memory({ events }))
  //   .use('/people-customid', memory({
  //     id: 'customid', events
  //   }));

  // testSuite(app, errors, 'people');
  // testSuite(app, errors, 'people-customid', 'customid');
});
