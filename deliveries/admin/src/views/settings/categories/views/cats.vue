<template>
  <page class="page-cats" full-height>
    <Split v-model="splitRate" min="200px">
      <div slot="left" class="page-left">
        <cat-tree @on-node-select="onNodeSelect" @on-node-change="onNodeChange" />
      </div>
      <div v-if="currentCat" slot="right" class="page-body">
        <div class="body-header flex">
          <div class="header-main flex-main">
            {{ currentCat.sn }} : {{ currentCat.code }} - {{ displayName }}
          </div>

          <div class="header-tail">
            <RadioGroup v-model="viewType">
              <Radio label="cat"><span>配置</span></Radio>
              <Radio v-if="consolePage" label="page"><span>{{ consolePage.title || '管理' }}</span></Radio>
            </RadioGroup>
          </div>
        </div>
        <div class="body-content">
          <div v-if="viewType === 'cat'" class="fh">
            <cat-data-editor-view ref="dataEditor" :cat="currentCat" />
          </div>
          <div v-if="viewType === 'page'" class="fh">
            <cat-data-render :render="pageRender" :cat="currentCat"></cat-data-render>
          </div>
        </div>
      </div>
      <div v-else slot="right" class="page-body-none">
        点击节点编辑注册值
      </div>
    </Split>
  </page>
</template>

<script>
import CatTree from '../components/tree'
import { CatDataEditorView, CatDataRender } from '../components/data'

export default {
  components: {
    CatTree,
    CatDataEditorView,
    CatDataRender
  },

  data () {
    return {
      viewType: 'cat',  // cat, page
      currentCat: null,
      splitRate: 0.36,
    }
  },

  computed: {
    isCtrlLocked () {
      let { ctrls } = this.currentCat || {}
      return (ctrls && ctrls.locked)
    },

    displayName () {
      let { name } = this.currentCat || {}
      name = this.$util.format.truncate(name, 10)
      return name
    },

    consolePage () {
      let { data } = this.currentCat || {}
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
    pageRender (h, { cat }) {
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

    onNodeSelect (cat) {
      this.currentCat = cat
    },

    onNodeChange (cat) {
      this.currentCat = cat
    }
  }
}
</script>

<style lang="less" scoped>
.page-left {
  height: 100%;
  overflow: scroll;
  background: white;
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

<style lang="less">
.page {
  &.page-cats .page__bd {
    padding: 0 0 0 5px;
  }
}
</style>
