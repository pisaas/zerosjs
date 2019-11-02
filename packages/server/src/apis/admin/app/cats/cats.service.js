const errors = require('@zerojs/errors');
const { ApiService } = require('../../service');

module.exports = function (app) {
  new Service().register(app, 'cats', {
    adapterService: {
      path: 'data/cats'
    }
  });
};

class Service extends ApiService {
  async get (id, params) {
    if (!id) {
      throw new errors.BadRequest('分类不存在。');
    }

    return this.adapterService.get(id, params);
  }

  async find (params) {
    let { query } = params;
    const { pid } = query;

    if (!pid) {
      return {};
    }

    params.query = Object.assign({
      $sort: { sn: 1, id: 1 }
    }, query);

    return this.adapterService.find(params);
  }

  async create (data) {
    let { pid } = data;

    if (!pid) {
      throw new errors.BadRequest('请提供父分类。');
    }

    let regData = Object.assign({}, data);

    let pReg = await this.adapterService.get(pid);

    if (!pReg) {
      throw new errors.BadRequest('未找到对应父节点');
    }
    
    regData.path = `${pReg.path}.${pReg.id}`;

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
