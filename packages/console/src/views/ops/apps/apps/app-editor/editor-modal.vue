<template>
  <Modal ref="editorModal" v-model="showModal"
    class="app-editor-modal" draggable
    :title="modalTitle" :width="modalWidth" :loading="loading"
    @on-ok="onOk" @on-visible-change="onVisibleChange">
    <app-editor ref="editor" :code="userCode"></app-editor>
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
    },

    modalWidth () {
      return (this.editMode === 'update' ? 800 : 700)
    }
  },

  methods: {
    onOk () {
      this.$refs.editor.save().then((res) => {
        this.resetLoading()
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
</style>
