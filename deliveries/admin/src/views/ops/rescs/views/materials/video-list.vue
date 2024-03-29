<template>
  <page-section list-section fixed>
    <div class="list-header">
      <div class="body">
        <Input class="list-search"
          v-model="listQuery.search"
          icon="ios-search" placeholder="名称/描述/ID"
          @on-enter="onQuery" />
      </div>
      <div class="tail">
        <list-nav :total="listTotal" :current="listQuery.page" :page-size="listQuery.size"
          @on-change="onPageChange" />
      </div>
    </div>

    <div class="list-body">
      <Table ref="pgTable" class="list-table" border stripe
        :columns="listColumns" :data="listItems"
        @on-selection-change="onSelectionChange">
        <div slot-scope="{ row }" slot="content" class="table-col col-content">
          <div class="video-play" :class="{ disabled: !row.pubed }"
            :style="{ 'backgroundImage': `url(${row.thumb})` }"
            @click="openPlay(row)">
            <div class="play-button">
              <Icon class="icon" type="md-play" color="white" size="15" />
            </div>
          </div>
          <div class="col-detail">
            <div class="col-title video-name">{{ row.name }}</div>
            <div class="col-subtitle">
              <span v-if="row.extra && row.extra.duration">
                时长：{{ $util.format.prettySeconds(row.extra.duration) }}
              </span>
              <span v-if="row.fsize" class="q-ml-md">大小：{{ $util.filesize(row.fsize) }}</span>
            </div>
          </div>

          <list-item-actions @trigger="onItemActionTrigger" :data="row">
            <list-item-action icon="md-open" label="编辑" action="edit" />
            <list-item-action v-if="row.status === 'transcoding'" 
              icon="md-sync" label="检查转码" action="check_transcoding" />
            <list-item-action icon="md-trash" label="删除" action="delete" />
          </list-item-actions>
        </div>
        <div slot-scope="{ row }" slot="ts" class="table-col">
          <div class="col-text">{{ $util.date.format(row.updatedAt) }}</div>
          <div class="col-subtitle">
            <span class="uname">{{ row.uname }}</span>
          </div>
        </div>
      </Table>
    </div>

    <div class="list-footer">
      <Page :total="listTotal" :current="listQuery.page" :page-size="listQuery.size"
        show-total @on-change="onPageChange"></Page>
    </div>

    <video-player-modal ref="playerModal" />
    <video-editor-modal ref='editorModal' @submit="onEditSubmit" />
  </page-section>
</template>

<script>
import { checkPersistent } from '@resc-components/utils'
import { VideoPlayerModal } from '@resc-components/video/player'
import { VideoEditorModal } from '@resc-components/video/editor'

export default {
  components: {
    VideoPlayerModal,
    VideoEditorModal
  },

  data () {
    return {
      listSelection: [],

      listColumns: [
        // { type: 'selection', width: 40, align: 'center' },
        { title: '视频', slot: 'content', minWidth: 300 },
        { title: '状态', key: 'statusName', width: 100 },
        { title: '更新时间', slot: 'ts', width: 150 }
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

  computed: {
    isSelected () {
      let sels = this.listSelection

      if (!sels || !sels.length) {
        return false
      }

      return true
    }
  },

  mounted () {
    this.loadData()
  },

  methods: {
    openPlay (row) {
      if (!row.pubed) {
        return
      }
      
      this.$refs.playerModal.open(row, {
        autoplay: true
      })
    },

    onActionTrigger (name) {
      switch (name) {
        case 'delete':
          this.onDelete()
          break
      }
    },

    onItemActionTrigger (name, data) {
      if (!name || !data) {
        return
      }

      switch (name) {
        case 'edit':
          this.onEdit(data)
          break
        case 'check_transcoding':
          this.onCheckTranscoding(data)
          break
        case 'delete':
          this.onDelete(data)
          break
      }
    },

    onEdit (row) {
      if (!row) {
        row = this.listSelection[0]
      }

      if (!row || !row.id) {
        return
      }

      this.$refs.editorModal.openUpdate(row.id)
    },

    onEditSubmit () {
      this.$refs.editorModal.close()
      this.loadData()
    },

    onDownload (row) {
      let fname = row.fname || row.name
      this.$uni.downloadUrl(row.path, row.name)
    },

    onCheckTranscoding (row) {
      if (!row) {
        row = this.listSelection[0]
      }

      if (!row || !row.id) {
        return
      }

      checkPersistent(row.id).then((res) => {
        if (res.status === row.status) {
          return
        }

        this.loadData()
      })
    },

    onDelete (row) {
      if (!row || !row.id) {
        this.$app.alert('请选择要删除的视频。')
      }

      this.$app.confirm({
        title: '删除视频',
        content: '<p>视频删除后将无法恢复，所有使用该视频的网页中对应的视频都会被删除。确认删除视频？</p>',
        onOk: () => {
          this.doDelete([row.id]).then(() => {
            this.$app.toast('删除成功！', { type: 'success' })
            this.loadData()
          })
        }
      })
    },

    onQuery () {
      this.listQuery.page = 1
      this.loadData()
    },

    onSelectionChange (selection) {
      this.listSelection = selection
    },

    onPageChange (val) {
      this.listQuery.page = val
      this.loadData()
    },

    // 供外部调用
    async reload () {
      this.loadData()
    },

    async doDelete (ids) {
      let results = await this.$service('rescs').remove(null, {
        query: { ids }
      })
    },

    async loadData () {
      let query = this.$service.getSearchQuery(this.listQuery)

      query = Object.assign({
        rtype: 'video',
        store: 'app/material'
      }, query)

      let result = await this.$service('rescs').find({ query })
      this.listItems = result.data
      this.listTotal = result.total
    }
  }
}
</script>

<style lang="less" scoped>
.list-table {
  .col-content {
    .video-play {
      min-width: 100px;
      min-height: 60px;
      max-width: 100px;
      max-height: 60px;
      cursor: pointer;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      display: flex;
      justify-content: center;
      align-items: center;
      color: white;
      border-radius: @border-radius;

      &.disabled {
        opacity: 0.5;
      }

      &:not(.disabled) {
        &:hover {
          box-shadow: @select-shadow;
        }
      }

      .play-button {
        opacity: 0.9;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 50%;
        background: @primary;
        width: 25px;
        height: 25px;

        .icon {
          margin-left: 3px;
        }
      }
    }
  }

  .col-detail {
    max-width: calc(100% - 180px);
  }
}
</style>