<template>
  <div v-show="visible" class="audio-actions page-actions">
    <Button type="primary" icon="md-musical-notes" @click="onUpload">添加音频</Button>
    
    <audio-editor-modal ref='editorModal' />
  </div>
</template>

<script>
import { AudioEditorModal } from '@resc-components/audio/editor'

export default {
  components: {
    AudioEditorModal
  },

  props: {
    name: String,
    visible: Boolean
  },

  methods: {
    onUpload () {
      this.$refs.editorModal.openCreate()
    }
  }
}
</script>