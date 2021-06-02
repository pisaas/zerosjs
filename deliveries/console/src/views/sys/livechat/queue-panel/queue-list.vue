<template>
  <div class="queue-list">
    <Row class="q-mt-md">
      <Table ref="pgTable" border size="small" :columns="tableColumns" :data="tableItems">
        <!-- 不能操作自己 -->
        <div slot-scope="{ row }" slot="ops" >
          <Button class="text-negative" ghost size="small"
            @click="onReceive(row)">接入</Button>
        </div>
        <div slot-scope="{ row }" slot="avatar" class="q-py-xs">
          <img :src="row.avatar" />
        </div>
        <div slot-scope="{ row }" slot="basic">
          <div><b>编号:</b> {{ row.code }}</div>
          <div v-if="row.username"><b>用户名:</b> {{ row.username }}</div>
          <div v-if="row.nickname"><b>昵称:</b> {{ row.nickname }}</div>
        </div>
        <div slot-scope="{ row }" slot="roles">
          <div v-if="row.roleNames">{{ row.roleNames }}</div>
        </div>
        <div slot-scope="{ row }" slot="timestamp">
          <div>{{ $util.date.format(row.updatedAt, 'full') }}</div>
        </div>
      </Table>
    </Row>
    <Row class="q-mt-md">
      <Page :total="tableTotal" :current="tableQuery.page" :page-size="tableQuery.size"
        show-total @on-change="onPageChange"></Page>
    </Row>
  </div>
</template>

<script>
export default {
  props: {
    status: String
  },

  data () {
    return {
      tableColumns: [
        { title: '操作', slot: 'ops', width: 100, align: 'center' },
        { title: '客户信息', slot: 'basic', minWidth: 200 },
        { title: '消息时间', slot: 'timestamp', width: 170 },
        { title: '上次接待', slot: 'roles', minWidth: 180 }
      ],
      tableItems: [],
      tableTotal: 0,
      tableQuery: {
        name: null,
        page: 1,
        size: 10,
        sorts: 'code DESC'
      }
    }
  },

  mounted () {
    this.getList()
  },

  methods: {
    onReceive () {
    },

    onQuery () {
      this.tableQuery.page = 1
      this.getList()
    },

    onPageChange (val) {
      this.tableQuery.page = val
      this.getList()
    },

    getList () {
      let qry = this.tableQuery || {}
      
      // this.$apis.livechat.getQueues(qry).then((res) => {
      //   this.tableItems = res.items.map((it) => {
      //     it.roleNames = this.userRoleNames(it)
      //     return it
      //   })
      //   this.tableTotal = res.total
      // })
    }
  },
}
</script>

<style lang="less" scoped>
</style>
