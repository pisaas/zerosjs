<template>
  <ButtonGroup>
    <Button icon="ios-arrow-back" :disabled="isFirst" @click="onBackward"></Button>
    <Button icon="ios-arrow-forward" :disabled="isLast" @click="onForward"></Button>
  </ButtonGroup>
</template>

<script>
export default {
  name: 'list-nav',

  props: {
    total: {
      type: Number,
      default: 0
    },
    current: {
      type: Number,
      default: 1
    },
    pageSize: {
      type: Number,
      default: 10
    }
  },

  watch: {
    current () {
      this.currentPage = this.current
    }
  },

  computed: {
    totalPage () {
      const totalPage = Math.ceil(this.total / this.pageSize);
      return (totalPage === 0) ? 1 : totalPage;
    },

    isFirst () {
      return this.currentPage <= 1
    },

    isLast () {
      return this.currentPage == this.totalPage
    }
  },

  data () {
    return {
      currentPage: this.current
    }
  },

  methods: {
    onBackward () {
      if (this.isFirst) {
        return
      }

      this.currentPage--
      this.onChange()
    },

    onForward () {
      if (this.isLast) {
        return
      }

      this.currentPage++
      this.onChange()
    },

    onChange () {
      this.$emit('on-change', this.currentPage)
    }
  }
}
</script>
