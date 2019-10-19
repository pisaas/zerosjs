<template>
  <div class="page-regs page-view">
    <Split v-model="splitRate" min="160px">
      <div slot="left" class="page-left">
        <reg-tree @on-node-select="onNodeSelect" @on-node-change="onNodeChange" />
      </div>
      <div v-if="currentReg" slot="right" class="page-body">
        <div class="body-header flex">
          <div class="header-main flex-main">
            {{ currentReg.sn }} : {{ currentReg.code }} - {{ displayName }}
          </div>
        </div>
        <div class="body-content">
          <reg-data-editor-view ref="dataEditor" :reg="currentReg" />
        </div>
      </div>
      <div v-else slot="right" class="page-body-none">
        点击节点编辑注册值
      </div>
    </Split>
  </div>
</template>

<script>
import TreeCell from '../components/tree-cell'
import RegTree from '../components/reg-tree'
import { RegDataEditorView } from '../components/reg-data'

export default {
  components: {
    RegTree,
    RegDataEditorView
  },

  data () {
    return {
      currentReg: null,
      splitRate: 0.3,
    }
  },

  computed: {
    displayName () {
      let { name } = this.currentReg || {}
      name = this.$util.format.truncate(name, 10)
      return name
    }
  },

  mounted () {
  },

  methods: {
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
  padding-top: 0;
  padding-bottom: 0;
}

.page-left {
  padding: 10px 30px 10px 0;
}

.page-body {
  height: 100%;
  padding-left:10px;

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
