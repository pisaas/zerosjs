<template>
  <div ref="resizer" class="resizer">
    <drag-resizer v-if="loaded"
      :isActive="loaded"
      :isDraggable="draggable"
      :isResizable="resizable"
      :w="dragWidth"
      :h="dragHeight"
      :x="left"
      :y="top"
      :axis="axis"
      :minw="minWidth"
      :minh="minHeight"
      :parentLimitation="parentLimitation"
      :snapToGrid="snapToGrid"
      :aspectRatio="aspectRatio"
      :z="zIndex"
      :sticks="['br']"
      @activated="onActivated"
      @deactivated="onDeactivated"
      @dragging="onDragging"
      @dragstop="onDraged"
      @resizing="onResizing"
      @resizestop="onResized">
      <div class="filler"></div>
    </drag-resizer>
    <slot />
  </div>
</template>

<script>
import DragResizer from '@/vue-components/drag-resizer'

export default {
  name: 'resizer',

  components: {
    DragResizer
  },

  props: {
    disabled: Boolean,
    draggable: Boolean,
    resizable: { type: Boolean, default: true },
    zIndex: { type: Number, default: 1 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    top: { type: Number, default: 0 },
    left: { type: Number, default: 0 },
    axis: { type: String, default: 'both' },
    minWidth: { type: Number, default: 10 },
    minHeight: { type: Number, default: 10 },
    parentLimitation: Boolean,
    snapToGrid: Boolean,
    aspectRatio: { type: Boolean, default: true },
  },

  data () {
    return {
      disable: false,
      resizerWidth: 0,
      resizerHeight: 0,
      dragWidth: this.width || 100,
      dragHeight: this.height || 100,
      loaded: false
    }
  },

  computed: {
  },

  watch: {
  },

  mounted () {
    window.addEventListener('resize', this.resetResizerSize)
  },

  beforeDestroy () {
    window.removeEventListener('resize', this.resetResizerSize)
  },

  methods: {
    load (flag) {
      if (flag === false) {
        this.loaded = false
        return
      }

      setTimeout(() => {
        this.resetResizerSize()
        this.loaded = true
      }, 200)
    },

    onActivated (e) {
      this.$emit('activated', e)
    },

    onDeactivated (e) {
      this.$emit('deactivated', e)
    },

    onResizing (e) {
      this.$emit('resizing', e)
    },

    onResized (e) {
      this.$emit('resized', e)
    },

    onDragging (e) {
      this.$emit('dragging', e)
    },

    onDraged (e) {
      this.$emit('draged', e)
    },

    resetResizerSize () {
      let pEl = this.$refs.resizer.parentElement

      this.resizerWidth = pEl.clientWidth
      this.resizerHeight = pEl.clientHeight

      if (!this.width && this.resizerWidth) {
        this.dragWidth = this.resizerWidth
      }

      if (!this.height && this.resizerHeight) {
        this.dragHeight = this.resizerHeight
      }
    }
  }
}
</script>

<style lang="less" scoped>
.resizer {
  position: relative;

  .filler {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    display: inline-block;
    background: white;
    opacity: 0.1;
  }
}
</style>