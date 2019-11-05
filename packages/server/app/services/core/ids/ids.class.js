const cluster   = require('cluster');

const FlakeId   = require('flake-idgen');
const intformat = require('biguint-format2');

const { CoreService } = require('../service');

let __flakeIdInstance = null;

exports.Ids = class Ids extends CoreService {
  async gen () {
    return genFlakeId(__flakeIdInstance);
  }

  _setup (app) {
    this.app = app;

    if (!__flakeIdInstance) {
      initFlakeIdInstance(app);
    }
  }
};

/**
 * 初始化FlaskId
 * @param {Application} app 
 */
function initFlakeIdInstance (app) {
  let nodeEnv = app.get('nodeEnv');

  let hostId = parseInt(nodeEnv.hostId) || 0;
  let insId  = parseInt(nodeEnv.instanceId) || 0;

  let cWorkerId = 0;
  if (cluster.worker) {
    cWorkerId = cluster.worker.id;
  }

  // 计算workerId(防止flakeId出现重复)
  let workerId = parseInt(insId.toString(2) + cWorkerId.toString(2), 2);

  __flakeIdInstance = new FlakeId({
    datacenter: hostId,
    worker: workerId,
    // epoch: +new Date("2019-01-01")
    epoch: 1546300800000,  // 'Id生成基础时间，默认: 2019-01-01'
  });
}

/**
 * 生成flakeId
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
function genFlakeId(flakeIdInstance, options) {
  const opts = Object.assign({
    amount: 0,
    scene: 'id'
  }, options);

  let base   = opts.base;
  let amount = opts.amount;
  let scene  = opts.scene;

  if (scene === 'sn') {
    base = base || 'dec';
  } else {
    base = base || 'b32';
  }

  const idAmount = amount || 1;

  let ids = [];

  let i = 0;

  while (i++ < idAmount) {
    let id = intformat(flakeIdInstance.next(), base);

    if (base === 'dec') {
      ids.push(parseInt(id));
    } else {
      ids.push(id);
    }
  }

  if (!amount) {
    return ids[0];
  }

  return ids;
}
