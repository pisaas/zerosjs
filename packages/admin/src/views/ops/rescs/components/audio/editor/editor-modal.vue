<template>
  <Modal ref="editorModal" v-model="showModal"
    class="audio-editor-modal" :title="modalTitle"
    :width="700" :loading="loading" :mask-closable="false"
    @on-ok="onOk" @on-visible-change="onVisibleChange">
    <audio-editor ref="editor"></audio-editor>
  </Modal>
</template>

<script>
import AudioEditor from './editor'

export default {
  components: {
    AudioEditor
  },

  data () {
    return {
      editMode: 'create',
      showModal: false,
      loading: true,
      formModel: null
    }
  },

  computed: {
    modalTitle () {
      if (this.editMode === 'update') {
        return `编辑音频`
      }
      return '添加音频'
    }
  },

  methods: {
    onOk () {
      this.$refs.editor.save().then((res) => {
        this.resetLoading()

        if (res === false) {
          return
        }

        let eventName = `on-${this.editMode}`
        this.$emit(eventName, res)

        this.$emit('on-submit', res)
        
        return res
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

    openCreate () {
      this.editMode = 'create'

      this.$nextTick(() => {
        this.$refs.editor.openCreate().then(() => {
          this.showModal = true
        })
      })
    },

    openUpdate (id, cb) {
      debugger
      this.editMode = 'update'

      this.$nextTick(() => {
        this.$refs.editor.open(id).then((res) => {
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
      this.editMode = 'create'
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
    }
  }
}

</script>

<style lang="less" scoped>
</style>
