<template>
  <Modal class="app-editor-modal"
    v-model="showModal" :title="modalTitle"
    :width="600" :loading="loading" :mask-closable="false"
    @on-ok="onOk" @on-visible-change="onVisibleChange">
    <app-editor ref="editor"></app-editor>
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
      editMode: 'create',
      showModal: false,
      loading: true
    }
  },

  computed: {
    modalTitle () {
      if (this.editMode === 'update') {
        return `编辑应用`
      }
      return '新建应用'
    }
  },

  mounted () {
  },

  methods: {
    onOk () {
      this.$refs.editor.save().then((res) => {
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

    openCreate () {
      this.editMode = 'create'
      this.$refs.editor.loadCreate().then(() => {
        this.showModal = true
      })
    },

    openUpdate (id, cb) {
      this.editMode = 'update'
      this.$refs.editor.loadUpdate(id).then(() => {
        this.showModal = true
      }).catch(() => {
        this.close()
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
