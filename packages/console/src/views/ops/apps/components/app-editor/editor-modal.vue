<template>
  <Modal ref="editorModal" v-model="showModal"
    class="app-editor-modal" fullscreen
    :title="modalTitle" :loading="loading"
    @on-ok="onOk" @on-visible-change="onVisibleChange">
    <div class="modal-container">
      <app-editor ref="editor" :code="userCode"></app-editor>
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
      userCode: null,
      editMode: 'create',
      showModal: false,
      loading: true
    }
  },

  computed: {
    modalTitle () {
      if (this.editMode === 'update') {
        return `编辑应用 (${this.userCode || ''})`
      }
      return '新建应用'
    }
  },

  methods: {
    onOk () {
      this.$refs.editor.save().then((res) => {
        this.resetLoading()
        
        if (res === false) {
          return
        }

        this.$emit('on-save', res)
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
      let userData = this.$refs.editor.formModel

      this.userCode = null
      this.$refs.editor.reset()
      this.$emit('on-close', userData)
    },

    create () {
      this.editMode = 'create'
      this.$refs.editor.create().then(() => {
        this.showModal = true
      })
    },

    update (userCode) {
      this.editMode = 'update'
      this.$refs.editor.update(userCode).then(() => {
        this.userCode = userCode
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
