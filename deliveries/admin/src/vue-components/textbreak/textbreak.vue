<template>
  <div v-if="lines" class="textbreak">
    <div v-for="(it, idx) in lines" class="line" :key="idx">{{ it }}</div>
  </div>
</template>

<script>
export default {
  props: {
    text: String
  },

  watch: {
    text () {
      this.loadText()
    }
  },

  data () {
    return {
      lines: []
    }
  },

  mounted () {
    this.loadText()
  },

  methods: {
    loadText () {
      if (!this.text) {
        this.lines = []
        return
      }

      this.lines = this.text.split('\n')
    }
  }
}
</script>

<style lang="css" scoped>
</style>
