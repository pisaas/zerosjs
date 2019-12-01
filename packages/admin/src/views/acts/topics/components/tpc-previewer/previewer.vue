<template>
  <div class="cont-tpc-previewer fs">
    <div class="default-previewer zero-view">
      <div class="title">{{ topic.name }}</div>
      <div class="subtitle">
        <div class="avatar">
          <user-avatar :id="topic.uid" />
        </div>
        <div class="detail">
          <div class="uname">{{ topic.uname || 'Unknown' }}</div>
          <div class="ts">{{ $util.date.simple(new Date()) }}</div>
        </div>
      </div>
      <div class="body ql-snow">
        <div class="ql-editor" v-html="topic.cont"></div>
      </div>
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
  padding: 10px;
  color: @dark;
  overflow: scroll;

  &>.title {
    padding: 10px;
    font-size: 18px;
    font-weight: bold;
    line-height: 28px;
  }

  &>.subtitle {
    padding: 5px;
    display: flex;

    .avatar {
      padding: 5px;
    }
    .detail {
      padding: 0 10px;
      opacity: 0.5;
      font-size: 12px;
    }
  }

  &>.body {
    padding: 10px;
    font-size: 14px;
  }
}
</style>