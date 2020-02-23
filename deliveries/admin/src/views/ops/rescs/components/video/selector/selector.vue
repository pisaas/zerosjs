<template>
  <div class="video-selector page-list" :class="{ 'single-select': single }">
    <page-section list-section fixed>
      <div class="list-header">
        <div class="body">
          <Input class="list-search"
            v-model="listQuery.search"
            icon="ios-search" placeholder="名称/描述/ID"
            @on-enter="onQuery" />
          
          <Button class="q-ml-md" type="primary" icon="md-musical-notes" @click="onUpload">添加视频</Button>
        </div>
        <div class="tail">
          <list-nav :total="listTotal" :current="listQuery.page" :page-size="listQuery.size"
            @on-change="onPageChange" />
        </div>
      </div>
      
      <div class="list-body">
        <div v-if="listItems.length" class="items-checkbox-group">
          <CheckboxGroup v-model="selItemIds" @on-change="onSelectionChange" >
            <Checkbox v-for="it in listItems" :label="it.id" :key="it.id"
              class="video-item-checkbox" :disabled="!it.pubed"
              @click.native="onItemClick(it)">
              <div class="video-item">
                <video-card :video="it" :disabled="!it.pubed" check-transcoding
                  @change="onVideoChange" @play="onPlay" />
              </div>
            </Checkbox>
          </CheckboxGroup>
        </div>
        <div v-else class="no-data">
          <div class="notice">暂无视频</div>
        </div>
      </div>

      <div class="list-footer">
        <Page :total="listTotal" :current="listQuery.page" :page-size="listQuery.size"
          show-total @on-change="onPageChange"></Page>
      </div>
    </page-section>

    <div class="selector-footer">
      <div class="flex-main">
        <span v-if="!single">已选择 {{ selItemIds.length }} 张图片</span>
      </div>
      <div class="tail">
        <Button @click="onCancel">取消</Button>
        <Button type="primary" class="q-ml-md" :disabled="!isSelected"
          @click="onConfirm">确定</Button>
      </div>
    </div>
    
    <video-player-modal ref="playerModal" />
    <video-editor-modal ref='editorModal' @submit="onEditSubmit" />
  </div>
</template>

<script>
import { VideoPlayerModal } from '@resc-components/video/player'
import { VideoEditorModal } from '@resc-components/video/editor'

import VideoCard from '@resc-components/video/card'

export default {
  components: {
    VideoPlayerModal,
    VideoEditorModal,
    VideoCard
  },

  props: {
    single: Boolean
  },

  data () {
    return {
      selItemIds: [], // 多选时生效
      selItem: null,  // 单选时生效

      listItems: [],
      listTotal: 0,
      listQuery: {}
    }
  },

  computed: {
    isSelected () {
      return this.selItemIds.length > 0
    }
  },

  mounted () {
    this.load()
  },

  methods: {
    onPlay (item) {
      this.$refs.playerModal.open(item, {
        autoplay: true
      })
    },

    onSelectionChange (sels, a) {
      if (!this.single) {
        return
      }
      
      this.$nextTick(() => {
        if (this.selItem && this.selItem.pubed) {
          this.selItemIds = [this.selItem.id]
        }
      })
    },

    onVideoChange () {
      this.loadData()
    },

    onItemClick (item) {
      if (!item.pubed) {
        return
      }

      this.selItem = item
    },

    onPageChange (val) {
      this.listQuery.page = val
      this.loadData()
    },

    onUpload () {
      this.$refs.editorModal.openCreate()
    },

    onEditSubmit (e) {
      this.$refs.editorModal.close()
      this.loadData()
    },

    onQuery () {
      this.listQuery.page = 1
      this.loadData()
    },

    onCancel () {
      this.$emit('cancel')
    },

    onConfirm () {
      this.select()
    },

    select () {
      if (this.single) {
        this.$emit('selected', this.selItem)
      } else {
        let selItems = this.getSelItems()
        this.$emit('selected', selItems)
      }
    },

    load () {
      this.reset()
      this.loadData()
    },

    reset () {
      this.selItem = null
      this.selItemIds = []
      this.listItems = []
      this.listTotal = 0
      this.listQuery = {
        search: null,
        page: 1,
        size: 12,
        sort: { id: -1 },
        equalFields: [ 'id' ],
        fuzzyFields: [ 'name', 'uname' ]
      }
    },

    getSelItems () {
      let ids = this.selItemIds || []

      let items = this.listItems.filter((it) => {
        return ids.includes(it.id)
      })

      return items
    },

    async loadData () {
      let query = this.$service.getSearchQuery(this.listQuery)

      query = Object.assign({
        rtype: 'video',
        store: 'app/material',
        frzn: { $ne: true }
      }, query)

      let result = await this.$service('rescs').find({ query })
      this.listItems = result.data || []
      this.listTotal = result.total
    }
  }
}
</script>

<style lang="less" scoped>
.video-selector {
  padding-bottom: 60px;
}

.list-body {
  border-top: 1px solid @light-border-color;
  padding: 10px 15px;
  height: 320px;
}

.video-item {
  padding: 5px;
  opacity: 0.8;

  &-checkbox {
    width: 50%;
  }
}

.selector-footer {
  display: flex;
  padding: 20px;
  margin-top: 10px;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  line-height: 28px;
}
</style>

<style lang="less">
.video-selector {
  .page-section {
    box-shadow: none;
  }

  .video-item-checkbox {
    position: relative;

    .ivu-checkbox {
      position: absolute;
      left: 10px;
      top: 10px;
      z-index: 10;
    }

    &.ivu-checkbox-wrapper {
      margin-right: 0;
    }

    &.ivu-checkbox-wrapper-checked {
      .video-item {
        opacity: 1;

        &>.video-card {
          box-shadow: 0 0 5px @active;
        }
      }
    }
  }

  &.single-select {
    .video-item-checkbox .ivu-checkbox {
      display: none;
    }
  }
}
</style>