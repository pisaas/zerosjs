<template>
  <div v-show="dataVisiable">
    <span
      class="vjs__tree__node"
      @click.stop="toggleBrackets">
      {{ bracketsFormatter(Array.isArray(data) ? ']' : '}') }}
    </span>
  </div>
</template>

<script>
  import bracketsMixin from '../mixins/brackets-mixin'

  export default {
    mixins: [bracketsMixin]
  }
</script>
