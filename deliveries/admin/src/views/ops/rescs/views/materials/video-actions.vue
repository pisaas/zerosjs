<template>
  <div v-show="visible" class="video-actions page-actions">
    <Button type="primary" icon="md-film" @click="onUpload">添加视频</Button>
    
    <video-editor-modal ref='editorModal' @submit="onEditSubmit" />
  </div>
</template>

<script>
import { VideoEditorModal } from '@resc-components/video/editor'

export default {
  components: {
    VideoEditorModal
  },

  props: {
    name: String,
    visible: Boolean
  },

  methods: {
    onUpload () {
      this.$refs.editorModal.openCreate()
    },

    onEditSubmit (e) {
      this.$refs.editorModal.close()
      this.$emit('submit', this.name, e)
    }
  }
}
</script>