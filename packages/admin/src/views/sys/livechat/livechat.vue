<template>
  <div class="ops-livechat flex-center">
    <Tabs class="livechat-tab panel-shadow" :animated="false">
      <TabPane :label="`${waitingUsers}人待回复`" icon="md-chatboxes">
        <chat-panel />
      </TabPane>
      <TabPane :label="`${newUsers}人待接入`" icon="md-time">
        <queue-panel />
      </TabPane>
      <div class="livechat-extra" slot="extra">
        在线状态
      </div>
    </Tabs>
  </div>
</template>

<script>
import ChatPanel from './chat-panel'
import QueuePanel from './queue-panel'

export default {
  components: {
    ChatPanel,
    QueuePanel
  },

  data () {
    return {
    }
  },

  computed: {
    waitingUsers () {
      return 0
    },

    newUsers () {
      return 0
    }
  }
}
</script>

<style lang="less" scoped>
.livechat-tab {
  width: 800px;
  min-height: 500px;
  max-height: 700px;
}

.livechat-extra {
  padding: 8px 16px;
}
</style>

<style lang="less">
.ops-livechat {
  .livechat-tab {
    padding: 0.5rem;
    .ivu-tabs-bar {
      margin-bottom: 0px;
    }
  }
}
</style>
