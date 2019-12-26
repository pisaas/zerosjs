<template>
  <div class="image-selector page-list" :class="{ 'single-select': single }">
    <page-section list-section fixed>
      <div class="list-header">
        <div class="body">
          <Input class="list-search"
            v-model="listQuery.search"
            icon="ios-search" placeholder="名称/描述/ID"
            @on-enter="onQuery" />

          <resc-uploader ref="uploader"
            class="inline q-ml-md"
            modal-title="图片上传"
            upload-text="上传图片"
            upload-icon="md-image"
            store-key="app/material" resc-type="image"
            open-file close-when-completed multi
            @completed="onUploadCompleted" />
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
              class="image-item-checkbox" @click.native="onItemClick(it)">
              <div class="image-item">
                <div class="thumb" :style="{ 'backgroundImage': `url(${it.thumb})` }" />
                <div class="title text-ellipsis" :title="it.name">{{ it.name }}</div>
              </div>
            </Checkbox>
          </CheckboxGroup>
        </div>
        <div v-else class="no-data">
          <div class="notice">暂无图片</div>
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
  </div>
</template>

<script>
import RescUploader from '@resc-components/uploader'

export default {
  components: {
    RescUploader
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
    onSelectionChange (sels, a) {
      if (!this.single) {
        return
      }
      
      this.$nextTick(() => {
        if (this.selItem) {
          this.selItemIds = [this.selItem.id]
        }
      })
    },

    onItemClick (item) {
      this.selItem = item
    },

    onPageChange (val) {
      this.listQuery.page = val
      this.loadData()
    },

    onUploadCompleted () {
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
        rtype: 'image'
      }, query)

      let result = await this.$service('rescs').find({ query })
      this.listItems = result.data || []
      this.listTotal = result.total
    }
  }
}
</script>

<style lang="less" scoped>
.image-selector {
  padding-bottom: 60px;
}

.list-body {
  border-top: 1px solid @light-border-color;
  padding: 10px 15px;
  height: 320px;
}

.image-item {
  padding: 5px;

  &>.thumb {
    width: 110px;
    height: 110px;
    cursor: pointer;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    opacity: 0.8;
  }

  &>.title {
    text-align: center;
    line-height: 25px;
    width: 100px;
    padding: 0 5px;
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
.image-selector {
  .page-section {
    box-shadow: none;
  }

  .image-item-checkbox {
    position: relative;

    .ivu-checkbox {
      position: absolute;
      left: 10px;
      top: 10px;
      z-index: 10;
    }

    &.ivu-checkbox-wrapper-checked {
      .image-item>.thumb {
        box-shadow: 0 0 5px @active;
        opacity: 1;
      }
    }
  }

  &.single-select {
    .image-item-checkbox .ivu-checkbox {
      display: none;
    }
  }
}
</style>