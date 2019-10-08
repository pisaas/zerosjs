<template>
  <div class="ops-app-list">
    <div class="row">
      <div class="flex-main">
        <Button v-if="canCreate" type="primary" icon="md-add" @click="onCreate">新建</Button>
        &nbsp;
      </div>
      <div class="text-right">
        <Input v-model="tableQuery.name" icon="search" placeholder="应用名称/ID"
          @on-enter="onQuery" style="width: 180px" />
      </div>
    </div>
    <Row class="q-mt-md">
      <Table ref="pgTable" border size="small" :columns="tableColumns" :data="tableItems">
        <div slot-scope="{ row }" slot="ops" >
          <Button class="text-link" ghost size="small" @click="onEdit(row)">编辑</Button>
          <Button v-if="!row.freezed" class="text-link" ghost size="small" @click="onFreeze(row)">冻结</Button>
          <Button v-if="row.freezed" class="text-link" ghost size="small" @click="onActivate(row)">激活</Button>
        </div>
        <div slot-scope="{ row }" slot="avatar" class="q-py-xs">
          <img :src="row.avatar" />
        </div>
        <div slot-scope="{ row }" slot="basic">
          <div><b>APPID:</b> {{ row.id }}</div>
          <div v-if="row.name"><b>名称:</b> {{ row.name }}</div>
        </div>
        <div slot-scope="{ row }" slot="contact">
          <div v-if="row.desc"><b>应用描述:</b> {{ row.desc }}</div>
          <div v-if="row.timestamp"><b>更新时间:</b> {{ $util.date.format(row.timestamp, 'full') }}</div>
        </div>
        <div slot-scope="{ row }" slot="status">
          <div>{{ row.statusName }}</div>
          <div v-if="row.freezed">已冻结</div>
        </div>
      </Table>
    </Row>
    <Row class="q-mt-md">
      <Page :total="tableTotal" :current="tableQuery.page" :page-size="tableQuery.size"
        show-total @on-change="onPageChange"></Page>
    </Row>

    <app-editor-modal ref="editorModal" @on-save="onSave" />
  </div>
</template>

<script>
import { AppEditorModal } from '../app-editor'
import AppExpandRow from '../app-expand-row'

export default {
  components: {
    AppEditorModal
  },

  props: {
    status: String
  },

  data () {
    return {
      tableColumns: [
        { type: 'expand',
          width: 50,
          render (h, { row, column, index }) {
            return h(AppExpandRow, { props: { appCode: row.code } })
          }
        },
        { title: '操作', slot: 'ops', width: 100, align: 'center' },
        { title: 'Logo', slot: 'logo', width: 100, align: 'center' },
        { title: '基本信息', slot: 'basic', minWidth: 200 },
        { title: '状态', slot: 'status', width: 100, align: 'center' }
      ],
      tableItems: [],
      tableTotal: 0,
      tableQuery: {
        name: null,
        page: 1,
        size: 10,
        sorts: 'id DESC'
      }
    }
  },

  computed: {
    canCreate () {
      return !this.status || this.status === 'all'
    }
  },

  methods: {
    onCreate () {
      this.$refs.editorModal.create()
    },

    onEdit (row) {
      if (!row || !row.code) {
        return
      }
      this.$refs.editorModal.update(row.code)
    },

    onFreeze (row) {
      if (!row || !row.code) {
        return
      }

      this.$app.confirm({
        title: '冻结应用',
        content: '<p>冻结应用接口将无法调用，请谨慎操作！确认冻结？</p>',
        onOk: () => {
          this.updateStatus('freeze', row.code)
        }
      })
    },

    onActivate (row) {
      if (!row || !row.code) {
        return
      }

      this.$app.confirm({
        title: '激活应用',
        content: '<p>冻结应用将可以被正常调用。确认激活？</p>',
        onOk: () => {
          this.updateStatus('activate', row.code)
        }
      })
    },

    onSave (res) {
      this.$refs.editorModal.close()
      this.getList()
    },

    onQuery () {
      this.tableQuery.page = 1
      this.getList()
    },

    onPageChange (val) {
      this.tableQuery.page = val
      this.getList()
    },

    updateStatus (verb, appCode) {
      return this.$apis.usr.postApp(verb, {
        code: appCode
      }).then(() => {
        return this.getList()
      })
    },

    getList () {
      let qry = this.tableQuery || {}

      if (this.status === 'freezed') {
        qry.scene = 'freezed'
      }

      return this.$service('apps').find(qry).then((res) => {
        this.tableItems = res.items
        this.tableTotal = res.total
      })
    }
  },

  mounted () {
  }
}
</script>
