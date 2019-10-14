<template>
  <div class="chat-panel row fs">
    <div class="panel-left">
      <chat-list />
    </div>
    <div class="panel-main flex-main">

    </div>
  </div>
</template>

<script>
import ChatList from './chat-list'

export default {
  components: {
    ChatList
  }
}
</script>

<style lang="less" scoped>
.chat-panel {
  min-height: 500px;
}
.panel-left {
  width: 250px;
}
.panel-main {
  background: #eaeaea;
}
</style>
