<template>
  <Modal ref="editorModal" v-model="showModal"
    class-name="tpc-editor-modal"
    :title="modalTitle" :width="modalWidth"
    :loading="loading" footer-hide
    @on-visible-change="onVisibleChange">
    <new-tpc-editor v-if="editMode === 'create'" ref="editor"
      @cancel="onCancel" @create="onCreate" />
    <tpc-editor v-else ref="editor"
      @save="onSave" @publish="onPublish"></tpc-editor>
  </Modal>
</template>

<script>
import { getTopicCatPathNames } from '../../common'

import NewTpcEditor from './new-editor'
import TpcEditor from './editor'

export default {
  components: {
    NewTpcEditor,
    TpcEditor
  },

  data () {
    return {
      tpcid: null,
      catid: null,
      editMode: 'create',
      showModal: false,
      loading: true
    }
  },

  computed: {
    modalTitle () {
      let title = '创建话题'

      if (this.editMode === 'update') {
        title = '编辑话题'
      }

      let catPathNames = this.catPathNamesStr

      if (catPathNames) {
        title = `${title} - ${catPathNames}`
      }

      return title
    },

    modalWidth () {
      return 1024
    },

    catPathNamesStr () {
      let pathNames = getTopicCatPathNames(this.catid)

      if (!pathNames || !pathNames.length) {
        return ''
      }

      return pathNames.join('/')
    }
  },

  methods: {
    onCancel (e) {
      this.resetLoading()
      this.close()
      
      this.$emit('cancel', e)
    },

    onCreate (e) {
      if (!e || !e.id) {
        return
      }

      this.resetLoading()
      
      this.$emit('create', e)
      this.$emit('submit', e)

      this.openUpdate(e.id)
    },

    onSave (e) {
      this.resetLoading()

      this.$emit('save', e)
      this.$emit('submit', e)
    },

    onPublish (e) {
      this.resetLoading()
      this.close()
      
      this.$emit('publish', e)
      this.$emit('submit', e)
    },

    onVisibleChange (visible) {
      if (!visible) {
        this.onClose()
      }
    },

    onClose () {
      this.reset()
      this.$emit('close')
    },

    openCreate (catid) {
      this.editMode = 'create'

      let editor = this.$refs.editor

      if (editor) {
        this.$nextTick(() => {
          editor.open(catid).then(() => {
            this.showModal = true
          })
        })
      }
    },

    openUpdate (id, cb) {
      this.editMode = 'update'

      this.$nextTick(() => {
        this.$refs.editor.open(id).then((res) => {
          this.tpcid = res.id
          this.catid = res.catid
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
      this.catid = null
      this.tpcid = null

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
