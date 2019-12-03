<template>
  <div class="uploader-panel">
    <div class="panel-body">
      <div v-if="!noItems" class="upload-items">
        <div v-for="(it, key) in items" :key="key"
          class="q-mb-sm">
          <uploader-item :data="it" :no-cancel="!multi"
            @cancel="onItemUploadCancel" @remove="onItemUploadRemove" />
        </div>
      </div>
      <div v-else class="no-data">
        <div class="notice">
          请先选择要上传的文件
        </div>
      </div>
    </div>
    <div class="panel-footer flex">
      <div class="actions flex-main">
        <file-upload ref="fileUpload" :accept="accept" :multi="multi"
          @selected="onFilesSelected">
          <Button v-if="multi" icon="md-add">添加文件</Button>
          <Button v-else icon="md-folder">选择文件</Button>
        </file-upload>
        <Button class="q-ml-md" :disabled="noItems || isAllCompleted"
          type="primary" icon="md-cloud-upload"
          @click="onUploadClick">开始上传</Button>
      </div>
      <div class="status flex-center">
        <span v-if="isAllCanceled">已取消</span>
        <span v-else-if="isAllCompleted" class="text-positive">已完成</span>
        <span v-else-if="isUploading" class="text-active">上传中</span>
      </div>
    </div>
  </div>
</template>

<script>
import FileUpload from '@components/upload/file-upload'
import { isSameFile, getFileThumbnail, rescUpload } from '@resc-components/utils'

import UploaderItem from './uploader-item'

export default {
  components: {
    FileUpload,
    UploaderItem
  },

  data () {
    return {
      multi: false,
      accept: '',
      autoUpload: false,
      onUploaded: null,

      items: {}
    }
  },

  computed: {
    itemsArr () {
      return Object.values(this.items || {})
    },

    noItems () {
      return !this.itemsArr.length
    },

    isAllCanceled () {
      if (this.noItems) {
        return false
      }

      let flag = _.every(this.itemsArr, (it) => {
        return it.canceled
      })

      return flag
    },

    isAllCompleted () {
      if (this.noItems) {
        return false
      }

      let completed = _.every(this.itemsArr, (it) => {
        return it.completed || it.canceled
      })

      return completed
    },

    isUploading () {
      if (this.isAllCompleted) {
        return false
      }

      let uploading = _.some(this.itemsArr, (it) => {
        return it.uploading
      })

      return uploading
    }
  },

  mounted () {
  },

  methods: {
    onUploadClick () {
      this.startUpload()
    },

    onItemUploadCancel (item) {
      if (!item || !item.key) {
        return
      }

      this.cancelUpload(item)
      this.resetItem(item)
    },

    onItemUploadRemove (item) {
      if (!item || !item.key) {
        return
      }

      // 取消上传
      if (item.subscription) {
        item.subscription.unsubscribe()
      }
      
      this.$delete(this.items, item.key)
    },

    onFilesSelected (files) {
      if (!files || !files.length) {
        return
      }

      if (!this.multi) {
        this.reset()
      }
      
      this.addFiles(files)
    },

    set ({ files, multi, accept, autoUpload, onUploaded }) {
      this.multi = (multi === true)
      this.accept = accept || null
      this.autoUpload = (autoUpload === true)

      if (typeof onUploaded === 'function') {
        this.onUploaded = onUploaded
      } else {
        this.onUploaded = null
      }

      this.addFiles(files)
    },

    async addFiles (files) {
      if (!files || !files.length) {
        return
      }

      // 过滤掉已存在的文件
      let items = this.items || {}
      let addFileOps = []

      let uploadParams = {
        existsFiles: 0
      }

      let fileKey = +new Date()

      _.each(files, (file) => {
        fileKey++
        addFileOps.push(this.addFile(items, file, fileKey, uploadParams))
      })

      await Promise.all(addFileOps)

      if (uploadParams.existsFile) {
        this.$app.toast('文件已存在。')
      }

      this.items = Object.assign({}, items)

      if (this.autoUpload) {
        this.startUpload()
      }
    },

    async addFile (items, file, key, params) {
      let itemsArr = Object.values(items)
      let exists = _.some(itemsArr, (it) => { return isSameFile(it.file, file) })

      if (exists) {
        params.existsFile++
        return
      }

      let thumbnail = await getFileThumbnail(file)
      items[key] = { key, file, thumbnail }
    },

    async startUpload () {
      let items = this.items || {}

      let uploadOps = Object.values(items).map((it) => {
        return this.upload(it)
      })

      await Promise.all(uploadOps)
    },

    async upload (item) {
      if (!item || !item.file) {
        return
      }

      if (item.uploading || item.canceled) {
        return
      }

      item.uploading = true

      let result = await rescUpload(item.file, {
        onProgress: this.onUploadProgress(item).bind(this),
        onUpload: this.onUploadStart(item).bind(this)
      }).then((result) => {
        item.progress = 100
        item.uploading = false

        this.$emit('uploaded', item, result)

        if (this.onUploaded) {
          return this.onUploaded(item, result).then((res) => {
            this.onUploadCompleted(item, result)
          })
        } else {
          this.onUploadCompleted(item, result)
        }
      }).catch((error) => {
        item.uploading = false
        item.errorMsg = error.message || '上传错误'

        this.resetItem(item)
      })
    },

    onUploadProgress (item) {
      return (res) => {
        let { total } = res || {}

        if (total) {
          item.progress = parseInt(total.percent)
          this.resetItem(item)
        }
      }
    },

    onUploadStart (item) {
      return ({ subscription }) => {
        if (item && subscription) {
          item.subscription = subscription
        }
      }
    },

    onUploadCompleted (item, result) {
      this.$emit('completed', item, result)

      item.completed = true
      this.resetItem(item)

      if (this.isAllCompleted) {
        this.$emit('all-completed', this.items)
      }
    },

    resetItem (item) {
      if (!item || !item.key) {
        return
      }

      item = Object.assign({}, item)
      this.$set(this.items, item.key, item)
    },

    reset () {
      this.multi = false
      this.accept = ''
      this.autoUpload = false
      this.onUploaded = null

      this.cancelAllUploads()

      this.items = {}
    },

    cancelAllUploads () {
      Object.values(this.items).forEach((it) => {
        this.cancelUpload(it)
      })
    },

    cancelUpload (item) {
      if (!item) {
        return
      }
      
      // 取消上传
      if (item.subscription) {
        item.subscription.unsubscribe()
        item.subscription = null
      }

      item.canceled = true
      item.uploading = false
      item.errorMsg = '已取消上传'
    }
  }
}
</script>

<style lang="less" scoped>
.uploader-panel {
  padding: 10px;
}

.panel-footer {
  padding-top: 10px;
}
</style>
