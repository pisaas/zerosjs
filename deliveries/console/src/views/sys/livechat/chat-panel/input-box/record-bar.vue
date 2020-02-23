<template>
  <div class="record-bar fs panel-shadow"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd">
    <div v-if="isRecording" class="btn-record recording fs flex-center">
      <span class="flex-center">松开结束</span>
    </div>
    <div v-else class="btn-record fs flex-center">
      <span class="flex-center">按住录音</span>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      isRecording: false,
      touchStartPos: null
    }
  },

  methods: {
    onTouchStart (e) {
      event.preventDefault()

      if (event.changedTouches.length) {
        let t = event.changedTouches[0]
        this.touchStartPos = { x: t.pageX, y: t.pageY }
      }

      this.isRecording = true
    },

    onTouchEnd (e) {
      event.preventDefault()

      let isCancel = false

      if (event.changedTouches.length) {
        let t = event.changedTouches[0]
        let startPos = this.touchStartPos

        // 上滑取消录音
        if (startPos && (startPos.y - t.pageY) > 60) {
          isCancel = true
        }
      }

      this.touchStartPos = null

      if (isCancel === true) {
        this.isRecording = false
        return
      }

      this.isRecording = false
    }
  }
}
</script>

<style lang="less" scoped>
.record-bar {
  background: white;
  border-radius: 2px;
}

.btn-record {
  &.recording {
    background: @light;
  }
}
</style>
