<template>
  <div class="topic-list-pending">
    <Table ref="pgTable" border size="small" :columns="tableColumns" :data="tableItems">
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

    <div class="q-pt-md">
      <Page :total="tableTotal" :current="tableQuery.page" :page-size="tableQuery.size"
        show-total @on-change="onPageChange"></Page>
    </div>
  </div>
</template>

<script>
import { newTopic } from '../../common'

import CatSelector from '../../components/cat-selector'

export default {
  components: {
    CatSelector
  },

  props: {
  },

  data () {
    return {
      catId: null,
      tabName: 'pubed',

      tableColumns: [
        { title: '作者', key: 'author', width: 100, align: 'center' },
        { title: '标题', slot: 'topic', minWidth: 200 },
        { title: '提交时间', key: 'updatedAt', width: 100, align: 'center' },
        { title: '操作', slot: 'ops', width: 120, align: 'center' },
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
  },

  methods: {
    onAdd () {
      let catId = this.catId
      newTopic.call(this, catId)
    },

    onEditorCreate () {
    },

    onEditorUpdate () {
    },

    onCatRefresh () {
      this.loadCatOptions(true)
    },

    onCatChange (val, data) {
    },

    onPageChange () {
    },

    async loadData () {

    }
  }
}
</script>