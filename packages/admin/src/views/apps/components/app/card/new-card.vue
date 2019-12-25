<template>
  <Card class="app-new-card" :padding="0">
    <div slot="title"><b>新建应用</b></div>
    <div class="card-body flex-center">
      <Button class="text-primary" @click="onCreate">立即创建</Button>
    </div>
  </Card>
</template>

<script>
  export default {
    props: {
      type: String,
      app: Object
    },

    data() {
      return {
      }
    },

    methods: {
      onCreate () {
        this.$emit('create')
      }
    },
  }
</script>

<style lang="less" scoped>
  .app-new-card {
    height: 200px;
  }

  .card-body {
    height: 130px;
  }
</style>