<template>
  <page>
    <page-section title="Title">
      <div slot="header">
        <div class="cat-select">
          <treeselect :options="catOptions" :load-options="loadCatOptions"
            placeholder="请选择话题分类" />
        </div>
      </div>
      
      <div slot="extra">
      </div>

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
    </page-section>

    <page-section>
      <Page :total="tableTotal" :current="tableQuery.page" :page-size="tableQuery.size"
        show-total @on-change="onPageChange"></Page>
    </page-section>
  </page>
</template>

<script>
export default {
  props: {
  },

  data () {
    return {
      currentCat: null,
      catOptions: [],

      tableColumns: [
        { title: '操作', slot: 'ops', width: 100, align: 'center' },
        { title: '头像', slot: 'avatar', width: 100, align: 'center' },
        { title: '基本信息', slot: 'basic', minWidth: 200 },
        { title: '角色信息', slot: 'roles', minWidth: 180 },
        { title: '联系信息', slot: 'contact', minWidth: 200 },
        { title: '更新时间', slot: 'timestamp', width: 170 }
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

  computed: {
    user () {
      return this.$store.getters['usr/basic']
    }
  },

  mounted () {
    this.loadCatOptions()
  },

  methods: {
    onCatChange () {
    },

    onPageChange () {
    },

    loadCatOptions (item, callback) {
      this.catOptions = [
        { id: 'beijing', label: '北京',
          children: [
            { id: 'gugong', label: '故宫' },
            { id: 'tiantan', label: '天坛' },
            { id: 'wangfujing', label: '王府井' }
          ]
        }, {
          id: 'jiangsu', label: '江苏',
          children: [
            { id: 'nanjing', label: '南京',
              children: [
                { id: 'fuzimiao', label: '夫子庙', }
              ]
            },
            { id: 'suzhou', label: '苏州',
              children: [
                { id: 'zhuozhengyuan', label: '拙政园', },
                { id: 'shizilin', label: '狮子林', }
              ]
            }
          ],
        }
      ]
    }
  }
}
</script>

<style lang="less" scoped>
.cat-select {
  width: 240px;
}
</style>