<template>
  <div>
    <Button size="large" type="text" @click="backHome">返回首页</Button>
    <Button size="large" type="text">
      <span>返回上一页</span>
      <span v-if="is404">({{ second }}s)</span>
    </Button>
  </div>
</template>

<script>
export default {
  name: 'backBtnGroup',
  props: {
    code: [String, Number],
  },
  data () {
    return {
      second: 5,
      timer: null
    }
  },
  computed: {
    is404 () {
      // eslint-disable-next-line eqeqeq
      return this.code == '404'
    }
  },
  methods: {
    backHome () {
      this.$router.replace({
        name: 'home'
      })
    },
    backPrev () {
      this.$router.go(-1)
    }
  },
  mounted () {
    if (this.is404) {
      this.timer = setInterval(() => {
        if (this.second === 0) this.backPrev()
        else this.second--
      }, 1000)
    }
  },
  beforeDestroy () {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }
}
</script>
