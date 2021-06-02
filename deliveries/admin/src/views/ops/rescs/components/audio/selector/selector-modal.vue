<template>
  <Modal v-model="showModal"
    class-name="image-selector-modal"
    :title="title" :width="800" footer-hide
    @on-visible-change="onVisibleChange">
    <Tabs ref="tabs" class="no-content" size="small" v-model="tabName">
      <TabPane name="materials" label="素材">
        <audio-selector ref="audioSelector" :single="single"
          @cancel="onClose" @selected="onSelected" />
      </TabPane>

      <TabPane name="link" label="链接">
        
      </TabPane>
    </Tabs>
  </Modal>
</template>

<script>
import AudioSelector from './selector'

export default {
  components: {
    AudioSelector
  },

  props: {
    title: {
      type: String,
      default: '选择音频'
    },

    single: Boolean
  },

  data () {
    return {
      showModal: false,
      tabName: 'materials',
    }
  },

  methods: {
    onCancel (e) {
      this.$emit('cancel', e)
      this.close()
    },

    onSelected (e) {
      this.$emit('selected', e)
      this.close()
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

    onUploadCompleted (items) {
      this.$emit('completed', items)
    },

    open (params) {
      this.$refs.audioSelector.load(params)
      this.showModal = true
    },

    close () {
      this.showModal = false
    },

    reset () {
      this.showModal = false
      this.$refs.audioSelector.reset()
    }
  },

  mounted () {
  }
}
</script>
