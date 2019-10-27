<template>
  <Modal ref="editorModal" v-model="showModal" :title="modalTitle"
    class="app-editor-modal" :width="600" :loading="loading"
    @on-ok="onOk" @on-visible-change="onVisibleChange">
    <div class="modal-container">
      <app-editor ref="editor"></app-editor>
    </div>
  </Modal>
</template>

<script>

import AppEditor from './editor'

export default {
  components: {
    AppEditor
  },

  data () {
    return {
      appId: null,
      editMode: 'create',
      showModal: false,
      loading: true
    }
  },

  computed: {
    modalTitle () {
      if (this.editMode === 'edit') {
        return `编辑应用 (${this.appId || ''})`
      }
      return '新建应用'
    }
  },

  methods: {
    onOk () {
      this.$refs.editor.submit().then((res) => {
        this.resetLoading()
        
        if (res === false) {
          return
        }

        this.$emit('submit', res)
      }).catch(() => {
        this.resetLoading()
      })
    },

    onVisibleChange (visible) {
      if (!visible) {
        this.onClose()
      }
    },

    onClose () {
      let formModel = this.$refs.editor.formModel

      this.appId = null
      this.$refs.editor.reset()
      this.$emit('close', formModel)
    },

    open (mode, options) {
      let opts = Object.assign({}, options)

      switch (mode) {
        case 'create':
          this.create()
          break;
        case 'edit':
          this.edit(opts.id)
          break;
      }
    },

    create () {
      this.editMode = 'create'
      this.$refs.editor.create().then(() => {
        this.showModal = true
      })
    },

    edit (appId) {
      this.editMode = 'edit'
      this.$refs.editor.edit(appId).then(() => {
        this.appId = appId
        this.showModal = true
      }).catch(() => {
        this.close()
      })
    },

    close () {
      this.showModal = false
    },

    resetLoading () {
      this.loading = false

      this.$nextTick(() => {
        this.loading = true
      })
    }
  },

  mounted () {
  }
}

</script>

<style lang="less" scoped>
.modal-container {
  display: flex;
  justify-content: center;
}
</style>
