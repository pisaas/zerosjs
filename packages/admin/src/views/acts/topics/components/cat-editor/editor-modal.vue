<template>
  <Modal ref="editorModal" v-model="showModal"
    class="cat-editor-modal" :title="modalTitle" 
    :width="modalWidth" :loading="loading"
    @on-ok="onOk" @on-visible-change="onVisibleChange">
    <cat-editor v-if="editMode === 'create'" ref="editor"></cat-editor>
    <Tabs v-else ref="tabs" class="no-content" size="small" v-model="tabName">
      <TabPane name="basic" label="基本信息">
        <cat-editor ref="editor" @load="onEditorLoad"></cat-editor>
      </TabPane>

      <TabPane v-if="formModel" name="data" label="配置">
        <data-viewer ref="viewer" :cat="formModel" />
      </TabPane>
    </Tabs>
  </Modal>
</template>

<script>
import CatEditor from './editor'
import DataViewer from './data-viewer'

export default {
  components: {
    CatEditor,
    DataViewer
  },

  data () {
    return {
      catId: null,
      editMode: 'create',
      showModal: false,
      loading: true,
      tabName: 'basic',
      formModel: null
    }
  },

  computed: {
    modalTitle () {
      if (this.editMode === 'update') {
        return `编辑分类 (${this.catId || ''})`
      }
      return '新建分类'
    },

    modalWidth () {
      return (this.editMode === 'update' ? 800 : 700)
    }
  },

  methods: {
    onOk () {
      this.$refs.editor.save().then((res) => {
        if (this.$refs.viewer) {
          return this.$refs.viewer.save()
        } else {
          return res
        }
      }).then((res) => {
        this.resetLoading()

        if (res === false) {
          return
        }

        if (this.editMode === 'create') {
          this.$emit('on-create', res)

          // this.update(res.id, () => {
          //   this.tabName = 'data'
          //   this.$refs.viewer.setCatDataType('data0')
          // })
        } else {
          let eventName = `on-${this.editMode}`
          this.$emit(eventName, res)
        }

        this.$emit('on-save', res)
      }).catch(() => {
        this.resetLoading()
      })
    },

    onVisibleChange (visible) {
      if (!visible) {
        this.onClose()
      } else {
        if (this.$refs.tabs) {
          this.$refs.tabs.updateBar()
        }
      }
    },

    onClose () {
      let data = this.$refs.editor.formModel

      this.reset()
      this.$emit('on-close', data)
    },

    onEditorLoad (formModel) {
      if (!formModel) {
        return
      }

      this.formModel = formModel
    },

    create (id) {
      this.editMode = 'create'

      this.$nextTick(() => {
        this.$refs.editor.create(id).then(() => {
          this.showModal = true
        })
      })
    },

    update (id, cb) {
      this.editMode = 'update'

      this.$nextTick(() => {
        this.$refs.editor.update(id).then((res) => {
          this.catId = res.id
          this.showModal = true

          if (cb) {
            this.$nextTick(cb)
          }
        }).catch(() => {
          this.close()
        })
      })
    },

    close () {
      this.showModal = false
    },

    reset () {
      this.tabName = 'basic'
      this.formModel = null

      if (this.$refs.editor) {
        this.$refs.editor.reset()
      }
    },

    resetLoading () {
      this.loading = false

      this.$nextTick(() => {
        this.loading = true
      })
    },

    loadData () {
    }
  },

  mounted () {
  }
}

</script>

<style lang="less" scoped>
</style>
