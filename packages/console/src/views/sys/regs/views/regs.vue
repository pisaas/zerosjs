<template>
  <div class="page-regs page-view">
    <Split v-model="splitRate" min="200px" max="500px">
      <div slot="left" class="page-left">
        <reg-tree @on-node-select="onNodeSelect" @on-node-change="onNodeChange" />
      </div>
      <div v-if="currentReg" slot="right" class="page-body">
        <div class="body-header flex">
          <div class="header-main flex-main">
            {{ currentReg.sn }} : {{ currentReg.code }} - {{ displayName }}
          </div>

          <div class="header-tail">
            <RadioGroup v-model="viewType">
              <Radio label="reg"><span>配置</span></Radio>
              <Radio v-if="consolePage" label="page"><span>{{ consolePage.title || '管理' }}</span></Radio>
            </RadioGroup>
          </div>
        </div>
        <div class="body-content">
          <div v-if="viewType === 'reg'" class="fh">
            <reg-data-editor-view ref="dataEditor" :reg="currentReg" />
          </div>
          <div v-if="viewType === 'page'" class="fh">
            <reg-data-render :render="pageRender" :reg="currentReg"></reg-data-render>
          </div>
        </div>
      </div>
      <div v-else slot="right" class="page-body-none">
        点击节点编辑注册值
      </div>
    </Split>
  </div>
</template>

<script>
import RegTree from '../components/reg-tree'
import { RegDataEditorView, RegDataRender } from '../components/reg-data'

export default {
  components: {
    RegTree,
    RegDataEditorView,
    RegDataRender
  },

  data () {
    return {
      viewType: 'reg',  // reg, page
      currentReg: null,
      splitRate: 0.2,
    }
  },

  computed: {
    isCtrlLocked () {
      let { ctrls } = this.currentReg || {}
      return (ctrls && ctrls.locked)
    },

    displayName () {
      let { name } = this.currentReg || {}
      name = this.$util.format.truncate(name, 10)
      return name
    },

    consolePage () {
      let { data } = this.currentReg || {}
      if (!data || !data.console || !data.console.page) {
        return
      }

      let page = data.console.page

      if (typeof page === 'string') {
        page = { path: page }
      }

      return page
    }
  },

  mounted () {
  },

  methods: {
    pageRender (h, { reg }) {
      let consolePage = this.consolePage

      if (!consolePage || !consolePage.path) {
        return h('span', {}, ['暂未设置管理页面'])
      }

      let pageCmpt = this.$cmpt.getRouteCmpt(consolePage.path)

      if (!pageCmpt) {
        return h('span', {}, ['管理页面不存在'])
      }

      return h(pageCmpt, {})
    },

    onNodeSelect (reg) {
      this.currentReg = reg
    },

    onNodeChange (reg) {
      this.currentReg = reg
    }
  }
}
</script>

<style lang="less" scoped>
.page-regs {
  height: 100%;
  padding: 0;
}

.page-left {
  padding: 0px 30px 0px 16px;
  height: 100%;
  background: @layout-sider-background;
  overflow: scroll;
}

.page-body {
  height: 100%;
  padding-left:10px;
  min-width: 500px;

  &-none {
    padding: 20px;
  }
}

.body-header {
  line-height: 40px;
  padding: 0 16px;
  border-bottom: 1px solid @border-color;
}

.body-content {
  padding: 10px;
  height: calc(100% - 50px);
  overflow: scroll;
}
</style>
