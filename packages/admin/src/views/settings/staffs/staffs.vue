<template>
  <div class="page origin-staffs">
    <div class="row">
      <div class="flex-main">
        <Poptip v-if="user.isSuperAdmin" v-model="showPoptip"
          transfer placement="bottom-start" width="620">
          <Button type="primary" icon="md-add">新增</Button>
          <staffs-editor ref="admEditor" slot="content"
            @on-confirm="onEditorConfirm"
            @on-cancel="onEditorCancel" />
        </Poptip>
        &nbsp;
      </div>
      <div class="text-right">
        <Input v-model="tableQuery.name" icon="search" placeholder="用户名/手机号/编号"
          @on-enter="onQuery" style="width: 180px" />
      </div>
    </div>
    <Row class="q-mt-md">
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
    </Row>
    <Row class="q-mt-md">
      <Page :total="tableTotal" :current="tableQuery.page" :page-size="tableQuery.size"
        show-total @on-change="onPageChange"></Page>
    </Row>
  </div>
</template>

<script>
import StaffsEditor from './staffs-editor/staffs-editor'

export default {
  components: {
    StaffsEditor
  },

  props: {
  },

  data () {
    return {
      showPoptip: false,
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
    // this.getList()
  },

  methods: {
    onStaffRemove (row) {
      if (!row || !row.code) {
        return
      }

      this.$zeros.confirm({
        title: '移除用户',
        content: '<p>确认从管理员列表中移除当前用户？</p>',
        onOk: () => {
          this.delStaffs([row.code])
        }
      })
    },

    onEditorConfirm (data) {
      this.addStaffs(data)
    },

    onEditorCancel () {
      this.showPoptip = false
    },

    addStaffs (data) {
      if (!data || !data.ucodes || !data.ucodes.length) {
        return
      }

      return this.$apis.adm.transStaffs('transfer', data.ucodes, {
        roles: data.roles,
        remark: data.remark
      }).then((res) => {
        this.$zeros.toast('添加管理员成功！', {
          type: 'success'
        })

        // 还原数据
        this.$refs.admEditor.reset()
        this.getList()
        this.showPoptip = false
      })
    },

    delStaffs (ucodes) {
      if (!ucodes || !ucodes.length) {
        return
      }

      return this.$apis.adm.transStaffs('revoke', ucodes).then((res) => {
        this.$zeros.toast('移除管理员成功！', {
          type: 'success'
        })

        // 还原数据
        this.$refs.admEditor.reset()
        this.getList()
        this.showPoptip = false
      })
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

      this.$apis.adm.getStaffs(qry).then((res) => {
        this.tableItems = res.items.map((it) => {
          it.roleNames = this.userRoleNames(it)
          return it
        })
        this.tableTotal = res.total
      })
    },

    userRoleNames (user) {
      if (!user || !user.admin || !user.admin.roles) {
        return ''
      }
      const adminRoleNames = this.$apis.adm.AdminRoleNames
      return user.admin.roles.map((r) => {
        return adminRoleNames[r]
      }).join(',')
    }
  }
}

</script>
