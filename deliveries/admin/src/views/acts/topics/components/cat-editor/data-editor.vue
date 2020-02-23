<template>
  <div class="cat-data-editor fh">
    <div class="editor-container fh">
      <json-editor ref="jsonEditor"
        class="json-editor fh"
        :showBtns="false"
        :mode="mode"
        :modes="modes" />
    </div>
  </div>
</template>

<script>
import JsonEditor from 'vue-json-editor'

export default {
  components: {
    JsonEditor
  },

  props: {
    cat: Object,
    type: {
      type: String,
      default: 'data0'
    }
  },

  data () {
    return {
      error: false,
      mode: 'code',
      modes: undefined
    }
  },

  computed: {
  },

  watch: {
    cat () {
      this.loadCatData()
    },

    type () {
      this.loadCatData()
    }
  },

  mounted () {
    this.loadCatData()
  },

  methods: {
    getData () {
      let innerEditor = this.$refs.jsonEditor.editor

      let data = null
      
      try {
        data = innerEditor.get()
      } catch (ex) {
        data = null
      }

      return data
    },

    loadCatData () {
      const { cat, type } = this

      let catData = {}
      if (cat && cat[type]) {
        catData = cat[type]
      }
      
      let mode = 'view'
      let modes = ['view', 'text']

      if (type === 'data0') {
        mode = 'code'
        modes = undefined
      }

      let innerEditor = this.$refs.jsonEditor.editor
      innerEditor.set(catData)
      innerEditor.setMode(mode)
      innerEditor.refresh()
    }
  }
}

</script>

<style lang="less" scoped>
</style>

<style lang="less">
.cat-data-editor {
  .jsoneditor-vue {
    height: 100%;
    padding-bottom: 20px;
  }
}
</style>
