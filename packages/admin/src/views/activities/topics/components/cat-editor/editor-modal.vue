<template>
  <Modal ref="editorModal" v-model="showModal"
    class="cat-editor-modal"
    :title="modalTitle" :width="modalWidth" :loading="loading"
    @on-ok="onOk" @on-visible-change="onVisibleChange">
    <cat-editor ref="editor"></cat-editor>
  </Modal>
</template>

<script>
import CatEditor from './editor'

export default {
  components: {
    CatEditor
  },

  data () {
    return {
      catId: null,
      editMode: 'create',
      showModal: false,
      loading: true
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
        this.resetLoading()
        
        if (res === false) {
          return
        }

        let eventName = `on-${this.editMode}`

        this.$emit(eventName, res)
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

    create (id) {
      this.pid = id
      this.editMode = 'create'
      this.$refs.editor.create(id).then(() => {
        this.showModal = true
      })
    },

    update (id) {
      this.editMode = 'update'
      this.$refs.editor.update(id).then((res) => {
        this.catId = res.id
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
