<template>
  <div class="cont-tpc-previewer fs">
    <div class="default-previewer">
      <div class="title">{{ topic.name }}</div>
      <div class="subtitle">

      </div>
      <div class="body" v-html="topic.cont"></div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    topic: Object
  }
}
</script>

<style lang="less" scoped>
.cont-tpc-previewer {
  padding: 5px;
}

.default-previewer {
  height: 100%;
  background: white;

  &>.title {
    padding: 10px;
    font-size: 18px;
    font-weight: bold;
    line-height: 28px;
  }

  &>.body {
    padding: 10px;
    font-size: 14px;
  }
}
</style>