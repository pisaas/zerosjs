<template>
  <page-section list-section fixed>
    <div class="list-header">
      <div class="body">
        <cat-selector class="list-search"
          v-model="catid" transfer inline
          @change="onCatChange" />

        <Input class="list-search q-ml-md"
          v-model="listQuery.search"
          icon="ios-search" placeholder="主题名称/作者/ID"
          @on-enter="onQuery" />
      </div>

      <div class="tail">
        <list-nav :total="listTotal" :current="listQuery.page" :page-size="listQuery.size"
          @on-change="onPageChange" />
      </div>
    </div>

    <div class="list-body">
      <Table ref="pgTable" class="list-table" border stripe :columns="listColumns" :data="listItems">
        <!-- 不能操作自己 -->
        <div v-if="row.code !== user.code" slot-scope="{ row }" slot="ops" >
          <Button v-if="user.isSuperAdmin" class="text-negative" ghost size="small"
            @click="onStaffRemove(row)">移除</Button>
        </div>
        <div slot-scope="{ row }" slot="avatar" class="q-py-xs">
          <img :src="row.avatar" />
        </div>
        <div slot-scope="{ row }" slot="basic">
          <div><b>编号:</b> {{ row.code }}</div>
          <div v-if="row.username"><b>用户名:</b> {{ row.username }}</div>
          <div v-if="row.nickname"><b>昵称:</b> {{ row.nickname }}</div>
        </div>
        <div slot-scope="{ row }" slot="contact">
          <div v-if="row.mobile"><b>手机号:</b> {{ row.mobile }}</div>
          <div v-if="row.email"><b>邮箱:</b> {{ row.email }}</div>
          <div v-if="row.weixin"><b>微信名:</b> {{ row.weixin }}</div>
        </div>
        <div slot-scope="{ row }" slot="roles">
          <div v-if="row.roleNames">{{ row.roleNames }}</div>
        </div>
        <div slot-scope="{ row }" slot="timestamp">
          <div>{{ $util.date.format(row.updatedAt, 'full') }}</div>
        </div>
      </Table>
    </div>

    <div class="list-footer">
      <Page :total="listTotal" :current="listQuery.page" :page-size="listQuery.size"
        show-total @on-change="onPageChange"></Page>
    </div>
  </page-section>
</template>

<script>
import CatSelector from '../../components/cat-selector'

export default {
  components: {
    CatSelector
  },

  data () {
    return {
      catid: null,

      listColumns: [
        { title: '作者', key: 'author', width: 100, align: 'center' },
        { title: '话题', slot: 'topic', minWidth: 200 },
        { title: '回复', key: 'replies', width: 100, align: 'center' },
        { title: '浏览', key: 'views', width: 100, align: 'center' },
        { title: '活跃', slot: 'timestamp', width: 100, align: 'center' },
        { title: '操作', slot: 'ops', width: 120, align: 'center' },
      ],

      listItems: [],
      listTotal: 0,
      listQuery: {
        search: null,
        page: 1,
        size: 10,
        sort: { id: -1 },
        equalFields: [ 'id' ],
        fuzzyFields: [ 'name', 'uname' ]
      }
    }
  },

  mounted () {
    let { catid } = this.$route.query

    if (catid) {
      this.catid = catid
    }

    this.loadData()
  },

  methods: {
    onCatChange (val, data) {
      this.onQuery()
    },

    onQuery () {
      this.listQuery.page = 1
      this.loadData()
    },

    onPageChange (val) {
      this.listQuery.page = val
      this.loadData()
    },

    async loadData () {
      let query = this.$service.getSearchQuery(this.listQuery)

      query = Object.assign({
        pubed: true,
        frzn: false
      }, query, {
        catid: this.catid
      })

      let result = await this.$service('tpcs').find({ query })
      this.listItems = result.items
      this.listTotal = result.total
    }
  }
}
</script>