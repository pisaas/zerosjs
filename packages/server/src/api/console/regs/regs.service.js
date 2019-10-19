const errors = require('@zero/errors');
const { ApiService } = require('../service');

module.exports = function (app) {
  new Regs().register(app, 'regs', {
    adapterService: {
      path: 'data/regs',
      methods: 'all'
    }
  });
};

const RootData = [
  { id: 'app', code: 'app', name: '应用', sn: 10, owner: '0', modes: [ 'c' ], ctrls: { locked: true } },
  { id: 'plat', code: 'plat', name: '平台', sn: 20, owner: '0', modes: [ 'c' ], ctrls: { locked: true } },
  { id: 'sys', code: 'sys', name: '系统', sn: 30, owner: '0', modes: [ 'c' ], ctrls: { locked: true } }
];

const RootDataIds = RootData.map(it => it.id);

class Regs extends ApiService {
  async get (id, params) {
    if (!id) {
      throw new errors.BadRequest('请提供节点ID。');
    }

    let result = RootData.find((it) => {
      return (it.id === id);
    });

    if (result) {
      return result;
    }

    return this.adapterService.get(id, params);
  }

  async find (params) {
    let { query } = params;

    const { pid } = query;

    if (!pid || ['0', 'zero', 'root'].includes(pid)) {
      return {
        data: RootData
      };
    }

    params.query = Object.assign({
      $sort: { sn: 1, id: 1 }
    }, query);

    return this.adapterService.find(params);
  }

  async create (data) {
    let { pid } = data;

    if (!pid) {
      throw new errors.BadRequest('请提供父节点。');
    }

    let pReg;
    let regData = Object.assign({}, data);

    if (RootDataIds.includes(pid)) {
      regData.path = pid;
    } else {
      pReg = await this.adapterService.get(pid);

      if (!pReg) {
        throw new errors.BadRequest('未找到对应父节点');
      }

      regData.path = `${pReg.path}.${pReg.id}`;
    }

    if (!data.sn || isNaN(data.sn) || data.sn === '0') {
      regData.sn = 1000;
    } else {
      regData.sn = parseInt(data.sn);
    }

    if (pReg && pReg.leaf) {
      await this.adapterService.patch(pid, { leaf: false });
    }

    let result = await this.adapterService.create(regData);
    return result;
  }

  async patch (id, data, params) {
    let { query } = params;

    let reg = await this.adapterService.get(id);

    if (!reg) {
      throw new errors.BadRequest('未找到对应节点');
    }
    
    let data0 = reg.data0;

    if (data && data.data0) {
      data0 = data.data0;
    }

    if (query.verb === 'pub') {
      return await this.adapterService.patch(id, {
        data0,
        data: data0
      });
    }

    return await this.adapterService.patch(id, data, params);
  }

  async remove (id) {
    let reg = await this.adapterService.get(id);

    if (!reg) {
      throw new errors.BadRequest('未找到对应节点');
    }

    let hasChildren = await this.adapterService.find({
      query: {
        $limit: 1,
        pid: id
      }
    });

    if (hasChildren.length) {
      throw new errors.BadRequest('当前节点包含子节点无法删除。');
    }

    let hasSiblings = await this.adapterService.find({
      query: {
        $limit: 2,
        pid: reg.pid
      }
    });

    let result = await this.adapterService.remove(reg.id);

    // 如果父节点只有1个子节点，则设置leaf为1
    if (hasSiblings.total < 2) {
      await this.adapterService.patch(reg.pid, {
        leaf: true
      });
    }

    return result;
  }
}
