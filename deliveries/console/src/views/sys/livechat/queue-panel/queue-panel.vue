<template>
  <div class="queue-panel" :bordered="false">
    <div slot="title" class="panel-header">
      <RadioGroup v-model="statusName" type="button">
        <Radio label="waiting">待接入</Radio>
        <Radio label="expired">已过期</Radio>
      </RadioGroup>
    </div>
    <div class="panel-body">
      <queue-list :status="statusName" />
    </div>
  </div>
</template>

<script>
import QueueList from './queue-list'

export default {
  components: {
    QueueList
  },

  data () {
    return {
      statusName: 'waiting'
    }
  }
}
</script>

<style lang="less" scoped>
.queue-panel {
  min-width: 560px;
  min-height: 500px;
}

.panel-header {
  padding: 0.5rem;
}
</style>
