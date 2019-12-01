<template>
  <div class="tpc-cont-editor">
    <vue-editor ref="editor" class="zero-view lang-cn icon-md"
      :editor-options="editorOptions"
      v-model="content"></vue-editor>
    <div id="tpc-cont-editor-word-counter"></div>
  </div>
</template>

<script>
const editorToolbar = [
  ["undo", "redo"],
  [{ size: ["12px", false, "15px", "16px", "17px", "18px", "20px", "24px"] }], // 字体大小
  ["bold", "italic", "underline", "strike"], // 加粗 斜体 下划线 删除线
  [{ align: [] }], // 对齐方式
  ["blockquote", 'code-block'], // 引用
  [{ list: "ordered" }, { list: "bullet" }, { list: "check" }], // 有序、无序列表
  [{ indent: "-1" }, { indent: "+1" }], // 缩进
  [{ script: "sub" }, { script: "super" }], // 上标/下标
  [{ color: [] }, { background: [] }], // 字体颜色、字体背景颜色
  ["clean"], // 清除文本格式
  ["link", "image", "video"], // 链接、图片、视频
]

const editorOptions = {
  modules: {
    undoRedo: true,
    wordCounter: {
      container: '#tpc-cont-editor-word-counter',
      maxlength: 1000
    },
    imageResize: {},
    toolbar: {
      container: editorToolbar,
      handlers: {
        undo () { this.quill.history.undo() },
        redo () { this.quill.history.redo() }
      }
    }
  }
}

export default {
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

  mounted () {
    // 重设history
    let editor = this.$refs.editor

    if (editor && editor.quill) {
      this.$nextTick(() => {
        editor.quill.history.clear()
        editor.quill.focus()
      })
    }
  },

  methods: {
    getContentData () {
    }
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