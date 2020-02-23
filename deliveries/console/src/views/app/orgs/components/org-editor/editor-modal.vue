<template>
  <Modal ref="editorModal" v-model="showModal"
    class="app-editor-modal" draggable
    :title="modalTitle" :width="600" :loading="loading"
    @on-ok="onOk" @on-visible-change="onVisibleChange">
    <org-editor ref="editor"></org-editor>
  </Modal>
</template>

<script>

import OrgEditor from './editor'

export default {
  components: {
    OrgEditor
  },

  data () {
    return {
      orgId: null,
      editMode: 'create',
      showModal: false,
      loading: true
    }
  },

  computed: {
    modalTitle () {
      if (this.editMode === 'update') {
        return `编辑组织 (${this.orgId || ''})`
      }
      return '新建组织'
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
      let data = this.$refs.editor.formModel

      this.$refs.editor.reset()
      this.$emit('on-close', data)
    },

    create () {
      this.editMode = 'create'
      this.$refs.editor.create().then(() => {
        this.showModal = true
      })
    },

    update (id) {
      this.editMode = 'update'
      this.$refs.editor.update(id).then((res) => {
        this.orgId = res.id
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
