<template>
  <div class="cmpt-editor-view">
    <div v-if="currentReg.desc" class="reg-desc">
      {{ currentReg.desc }}
    </div>
    <div v-if="isCtrlLocked">
      当前节点不支持配置
    </div>
    <div v-else class="content-editor">
      <div class="editor-header flex q-pa-sm">
        <div class="header-main flex-main">
          <RadioGroup v-model="regDataType">
            <Radio label="data"><span>已发布</span></Radio>
            <Radio label="data0"><span>编辑中</span></Radio>
          </RadioGroup>
        </div>
        <div class="header-tail">
          <Button v-if="isAllowed('data-save')" type="info" size="small"
            @click="onDataSave">保存</Button>
          &nbsp;
          <Button v-if="isAllowed('data-pub')" type="success" size="small"
            @click="onDataPub">发布</Button>
        </div>
      </div>
      <div class="editor-container">
        <reg-data-editor ref="dataEditor" :type="regDataType" :reg="currentReg" />
      </div>
    </div>
  </div>
</template>


<script>
import RegDataEditor from './editor'

export default {
  components: {
    RegDataEditor
  },

  props: {
    reg: Object
  },

  data () {
    return {
      regDataType: 'data',
      currentReg: this.reg
    }
  },

  watch: {
    reg () {
      this.currentReg = this.reg
    }
  },

  computed: {
    isCtrlLocked () {
      let { ctrls } = this.reg || {}
      return (ctrls && ctrls.locked)
    }
  },

  methods: {
    onDataSave () {
      let data = this.$refs.dataEditor.getData()

      if (!data) {
        this.$app.toast('数据存在错误，请修正后再保存。')
        return
      }

      this.saveRegData0().then((res) => {
        this.$app.toast('保存成功！', {
          type: 'success'
        })
      })
    },

    onDataPub () {
      if (this.regDataType === 'data') {
        return
      }

      let data = this.$refs.dataEditor.getData()

      if (!data) {
        this.$app.toast('数据存在错误，请修正后再保存。')
        return
      }

      this.$app.confirm({
        title: '发布数据',
        content: '<p>数据发布后将直接生效，请谨慎操作！确认发布？</p>',
        onOk: () => {
          this.pubRegData().then(() => {
            this.$app.toast('发布成功！', { type: 'success' })
            this.regDataType = 'data'
          })
        }
      })
    },

    isAllowed (op) {
      switch (op) {
        case 'data-save':
        case 'data-pub':
          return (this.regDataType === 'data0' && !this.isCtrlLocked)
      }

      return false
    },

    async pubRegData () {
      let regService = this.$service('regs')
      let { reg } = this.$refs.dataEditor

      let data0 = this.$refs.dataEditor.getData()

      let result = await regService.patch(reg.id, {
        data0
      }, {
        query: { verb: 'pub' }
      })

      this.$set(reg, 'data', result.data)
      this.$set(reg, 'data0', result.data0)
      
      this.$emit('on-data-pub', result)
    },

    async saveRegData0 () {
      let regService = this.$service('regs')
      let { reg } = this.$refs.dataEditor

      let data0 = this.$refs.dataEditor.getData()

      let result = await regService.patch(reg.id, { data0 })

      this.$set(reg, 'data0', result.data0)
      
      this.$emit('on-data-save', result)

      return result
    }
  },

  mounted () {
  }
}
</script>

<style lang="less" scoped>
.cmpt-editor-view {
  height: 100%;
}

.editor-container {
  padding: 0;
  height: 420px;
}
</style>
