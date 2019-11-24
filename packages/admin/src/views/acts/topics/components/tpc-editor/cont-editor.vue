<template>
  <div class="tpc-cont-editor">
    <vue-editor class="editor lang-cn icon-md"
      :editor-toolbar="editorToolbar"
      :editor-options="editorOptions"
      v-model="content"></vue-editor>
  </div>
</template>

<script>
const editorToolbar = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }], // 标题
  ["bold", "italic", "underline", "strike"], // 加粗 斜体 下划线 删除线
  [{ align: [] }], // 对齐方式
  ["blockquote"], // 引用
  [{ list: "ordered" }, { list: "bullet" }, { list: "check" }], // 有序、无序列表
  [{ indent: "-1" }, { indent: "+1" }], // 缩进
  [{ script: "sub" }, { script: "super" }], // 上标/下标
  [{ size: ["small", "", false, "large", "huge"] }], // 字体大小
  [{ font: [] }], // 字体种类
  ["link", "image", "video"], // 链接、图片、视频
  [{ color: [] }, { background: [] }], // 字体颜色、字体背景颜色
  ["clean"], // 清除文本格式
]

const editorOptions = {
  modules: {
    imageResize: {}
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
      editorToolbar,
      editorOptions,
      content: this.value
    }
  }
}
</script>

<style lang="less" scoped>
.tpc-cont-editor {
  padding: 10px;
  height: 100%;
}
</style>

<style lang="less">
.tpc-cont-editor {
  padding: 10px;

  .ql-editor {
    height: 500px;
  }
}
</style>