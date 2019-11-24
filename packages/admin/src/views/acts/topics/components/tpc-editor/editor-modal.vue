<template>
  <Modal ref="editorModal" v-model="showModal"
    class-name="tpc-editor-modal" :title="modalTitle" 
    :width="modalWidth" :loading="loading" footer-hide
    @on-visible-change="onVisibleChange">
    <tpc-editor ref="editor"></tpc-editor>
  </Modal>
</template>

<script>
import TpcEditor from './editor'

export default {
  components: {
    TpcEditor
  },

  data () {
    return {
      tpcId: null,
      editMode: 'create',
      showModal: false,
      loading: true,
      formModel: null
    }
  },

  computed: {
    modalTitle () {
      if (this.editMode === 'update') {
        return `编辑话题 (${this.tpcId || ''})`
      }
      return '创建话题'
    },

    modalWidth () {
      return 1024
    }
  },

  methods: {
    onOk () {
      this.$refs.editor.save().then((res) => {
        this.resetLoading()
        
        if (res === false) {
          return
        }

        if (this.editMode === 'create') {
          this.$emit('on-create', res)
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

    create (catId) {
      this.editMode = 'create'

      this.$nextTick(() => {
        this.$refs.editor.create(catId).then(() => {
          this.showModal = true
        })
      })
    },

    update (id, cb) {
      this.editMode = 'update'

      this.$nextTick(() => {
        this.$refs.editor.update(id).then((res) => {
          this.tpcId = res.id
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
