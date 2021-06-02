<template>
  <div class="cat-data-viewer">
    <div v-if="isCtrlLocked">
      当前节点不支持配置
    </div>
    <div v-else class="content-editor">
      <div class="editor-header flex q-pa-sm">
        <div class="header-main flex-main">
          <RadioGroup v-model="catDataType">
            <Radio label="data"><span>已发布</span></Radio>
            <Radio label="data0"><span>编辑</span></Radio>
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
        <cat-data-editor ref="dataEditor" :type="catDataType" :cat="currentCat" />
      </div>
    </div>
  </div>
</template>


<script>
import CatDataEditor from './data-editor'

export default {
  components: {
    CatDataEditor
  },

  props: {
    cat: Object
  },

  data () {
    return {
      catDataType: 'data',
      currentCat: this.cat
    }
  },

  watch: {
    cat () {
      this.currentCat = this.cat
    }
  },

  computed: {
    isCtrlLocked () {
      let { ctrls } = this.cat || {}
      return (ctrls && ctrls.locked)
    }
  },

  methods: {
    onDataSave () {
      this.save()
    },

    onDataPub () {
      if (this.catDataType === 'data') {
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
          this.pubCatData().then(() => {
            this.$app.toast('发布成功！', { type: 'success' })
            this.setCatDataType('data')
          })
        }
      })
    },

    isAllowed (op) {
      switch (op) {
        case 'data-save':
        case 'data-pub':
          return (this.catDataType === 'data0' && !this.isCtrlLocked)
      }

      return false
    },

    setCatDataType (type) {
      type = type || 'data'
      
      this.catDataType = type
    },

    async save () {
      let data = this.$refs.dataEditor.getData()

      if (!data) {
        this.$app.toast('数据存在错误，请修正后再保存。')
        return false
      }

      await this.saveCatData0()

      this.$app.toast('保存成功！', {
        type: 'success'
      })
    },

    async pubCatData () {
      let catService = this.$service('cats')
      let { cat } = this.$refs.dataEditor

      let data0 = this.$refs.dataEditor.getData()

      let result = await catService.patch(cat.id, {
        data0
      }, {
        query: { verb: 'pub' }
      })

      this.$set(cat, 'data', result.data)
      this.$set(cat, 'data0', result.data0)
      
      this.$emit('on-data-pub', result)
    },

    async saveCatData0 () {
      let catService = this.$service('cats')
      let { cat } = this.$refs.dataEditor

      let data0 = this.$refs.dataEditor.getData()

      let result = await catService.patch(cat.id, { data0 })

      this.$set(cat, 'data0', result.data0)
      
      this.$emit('on-data-save', result)

      return result
    }
  },

  mounted () {
  }
}
</script>

<style lang="less" scoped>
.cat-data-viewer {
  height: 450px;
  padding: 10px 20px;
}

.editor-header {
  line-height: 25px;
}

.editor-container {
  padding: 0;
  height: 400px;
}
</style>
