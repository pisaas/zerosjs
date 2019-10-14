<template>
  <div class="sys-regs">
    <Tree :data="catData" :load-data="loadData" show-checkbox></Tree>
  </div>
</template>

<script>

export default {
  components: {
  },

  data () {
    return {
      catData: []
    }
  },

  methods: {
    loadData () {
    }
  },

  mounted () {
  }
}

</script>
