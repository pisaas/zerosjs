<template>
  <div class="tpc-cont-editor">
    <vue-editor ref="editor" class="zero-view lang-cn icon-md"
      :editor-options="editorOptions"
      v-model="content"></vue-editor>
    <div id="tpc-cont-editor-word-counter"></div>

    <image-selector-modal ref="imageSelectorModal" single @selected="onImageSelected" />
    <audio-selector-modal ref="audioSelectorModal" single @selected="onAudioSelected" />
    <video-selector-modal ref="videoSelectorModal" single @selected="onVideoSelected" />
  </div>
</template>

<script>
import { ImageSelectorModal } from '@resc-components/image/selector'
import { AudioSelectorModal } from '@resc-components/audio/selector'
import { VideoSelectorModal } from '@resc-components/video/selector'

const editorToolbar = [
  ["undo", "redo"],
  [{ size: ["12px", false, "15px", "16px", "17px", "18px", "20px", "24px"] }], // 字体大小
  ["bold", "italic", "underline", "strike"], // 加粗 斜体 下划线 删除线
  [{ align: '' }, { align: 'center' }, { align: 'right' }], // 对齐方式
  ["blockquote", 'code-block'], // 引用
  [{ list: "ordered" }, { list: "bullet" }, { list: "check" }], // 有序、无序列表
  [{ indent: "-1" }, { indent: "+1" }], // 缩进
  [{ script: "sub" }, { script: "super" }], // 上标/下标
  [{ color: [] }, { background: [] }], // 字体颜色、字体背景颜色
  ["clean"], // 清除文本格式
  ["link", "image", "audio", "video"], // 链接、图片、视频
]

const editorOptions = {
  modules: {
    undoRedo: true,
    wordCounter: {
      container: '#tpc-cont-editor-word-counter',
      maxlength: 1000
    },
    imageResize: {},
    zerosMedia: true,
    toolbar: {
      container: editorToolbar,
      handlers: {
        undo () { this.quill.history.undo() },
        redo () { this.quill.history.redo() },
        image () { vmEditor.$refs.imageSelectorModal.open() },
        audio () { vmEditor.$refs.audioSelectorModal.open() },
        video () { vmEditor.$refs.videoSelectorModal.open() }
      }
    }
  }
}

let vmEditor;

export default {
  components: {
    ImageSelectorModal,
    AudioSelectorModal,
    VideoSelectorModal
  },

  props: {
    value: [ Object, String ]
  },

  watch: {
    value (val) {
      if (val === this.content) {
        return
      }
      
      this.content = val
    },

    content () {
      this.$emit('input', this.content);
    }
  },

  data () {
    return {
      editorOptions,
      content: this.value
    }
  },

  computed: {
    quill () {
      let editor = this.$refs.editor

      if (!editor || !editor.quill) {
        return null
      }
      return editor.quill
    }
  },

  mounted () {
    vmEditor = this

    // 重设history
    const quill = this.quill

    if (quill) {
      this.$nextTick(() => {
        quill.history.clear()
        quill.focus()
      })
    }
  },

  beforeDestroy () {
    vmEditor = null
  },

  methods: {
    onImageSelected (e) {
      this.insertMedia('image', e.thumb)
    },

    onAudioSelected (e) {
      this.insertMedia('zerosAudio', { data: e })
    },

    onVideoSelected (e) {
      this.insertMedia('zerosVideo', { data: e })
    },

    insertAudio (url) {
    },

    insertMedia (type, attrs) {
      let quill = this.quill

      let range = quill.getSelection(true)

      if (!range) {
        return
      }

      let pos = range.index
      quill.insertText(range.index, '\n')
      quill.insertEmbed(pos + 1, type, attrs)
      quill.setSelection(pos + 2)
    },

    getContentData () {
    },
  }
}
</script>

<style lang="less" scoped>
.tpc-cont-editor {
  position: relative;
  padding: 10px;
  height: 100%;
}
</style>

<style lang="less">
.tpc-cont-editor {
  .ql-editor {
    height: 500px;
  }
}

#tpc-cont-editor-word-counter {
  position: absolute;
  right: 20px;
  bottom: 20px;
}
</style>