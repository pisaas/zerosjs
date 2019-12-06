<template>
  <Modal ref="editorModal" v-model="showModal"
    class="audio-editor-modal" :title="modalTitle"
    :width="700" :loading="loading" :mask-closable="false"
    @on-ok="onOk" @on-visible-change="onVisibleChange">
    <audio-editor ref="editor" @trans-checked="onTransChecked"></audio-editor>
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
      let editMode = this.editMode

      this.$refs.editor.save().then((res) => {
        if (!res) {
          this.resetLoading()
          return
        }

        this.$emit(editMode, res)

        if (editMode === 'update') {
          this.resetLoading()
          this.$emit('submit', res)
        }
        
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
      this.$emit('close', data)
    },

    onEditorLoad (formModel) {
      if (!formModel) {
        return
      }

      this.formModel = formModel
    },

    onTransChecked (e) {
      this.$emit('trans-checked', e)

      if (this.editMode === 'create') {
        this.$emit('submit', e)
      }
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
      this.editMode = 'update'

      this.$nextTick(() => {
        this.$refs.editor.openUpdate(id).then((res) => {
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
