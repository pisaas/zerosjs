<template>
  <Form v-if="formModel" class="video-editor padding" ref="form"
    :model="formModel" :rules="formRules" :label-width="60">
    <FormItem v-if="!modelData || !modelData.id" label="视频" required prop="fname">
      <div class="tip">
        <span>请上传时长小于30分钟的视频，支持 </span>
        <Tooltip placement="bottom" max-width="300" transfer theme="light">
          <span class="text-link">视频格式</span>
          <div slot="content">
            <div>常见在线流媒体格式：mp4、flv、f4v、webm</div>
            <div>移动设备格式：m4v、mov、3gp、3g2</div>
            <div>RealPlayer：rm、rmvb</div>
            <div>微软格式：wmv、avi、asf</div>
            <div>MPEG 视频：mpg、mpeg、mpe、ts</div>
            <div>DV格式：div、dv、divx</div>
            <div>其他格式：vob、dat、mkv、lavf、cpk、dirac、ram、qt、fli、flc、mod</div>
          </div>
        </Tooltip>
      </div>
      <div>
        <resc-uploader ref="uploader"
          :upload-text="uploadText" upload-icon="md-film"
          store-key="app/material" resc-type="video"
          open-file :auto-open-modal="false"
          @selected="onUploadSelected" />
      </div>
      <div v-if="videoFileName">{{ videoFileName }}</div>
      <div v-if="videoErrorMsg" class="tip text-error">
        {{ videoErrorMsg }}
      </div>

      <div v-if="uploadData.uploading" class="uploading">
        <Progress :percent="uploadData.progress" :stroke-width="5" status="active">
          <Icon type="md-close-circle" color="grey" size="18" @click="onUploadCancel" />
        </Progress>
      </div>

      <div v-if="uploadData.errorMsg" class="text-error">
        {{ uploadData.errorMsg }}
      </div>
    </FormItem>
    <FormItem label="封面" required prop="thumb">
      <div class="tip q-mb-sm">视频上传完成后可设置封面图</div>

      <div v-if="videoPath" class="thumb-type-checker q-px-lg">
        <RadioGroup v-model="videoThumbType" class="thumb-type-radio-group"
          @on-change="onThumbTypeChange">
          <Radio label="recmd" class="thumb-type-radio">推荐封面</Radio>
          <Radio label="custom" class="thumb-type-radio">自定义封面</Radio>
        </RadioGroup>
      </div>

      <div v-if="videoPath" class="thumbs-content">
        <div v-if="isRecmdThumb" class="recmd-thumb-box">
          <RadioGroup v-model="videoThumbOffset" class="recmd-thumbs"
            @on-change="onThumbOffsetChange">
            <Radio v-for="(it, idx) in videoThumbOffsets" :key="idx" :label="it" class="thumb-radio">
              <img :src="videoThumbByOffset(it)" />
            </Radio>
          </RadioGroup>
        </div>
        <div v-else class="custom-thumb-box">
          <div v-if="customPreviewVideoThumb" class="custom-thumb" 
            :style="{ 'backgroundImage': `url(${customPreviewVideoThumb})` }" />
          <div v-else class="custom-thumb-holder" />
          <div class="custom-thumb-actions">
            <ButtonGroup vertical>
              <Button icon="md-swap" @click="onCustomThumbSwap"></Button>
              <Button icon="md-crop" @click="onCustomThumbCrop"></Button>
            </ButtonGroup>
          </div>
        </div>
      </div>
      <div v-else class="thumbs-holder tip">请先完成视频上传</div>
    </FormItem>
    <FormItem label="标题" required prop="name">
      <Input v-model="formModel.name" :maxlength="50" placeholder="请输入名称 (100字以内)" />
    </FormItem>
    <FormItem label="视频介绍" prop="desc">
      <Input v-model="formModel.desc" type="textarea" :maxlength="200"
        :autosize="{minRows: 5, maxRows: 10}" placeholder="请输入描述 (200字以内)" />
    </FormItem>

    <FormItem v-if="submitErrorMsg">
      <div class="text-error">{{ submitErrorMsg }}</div>
    </FormItem>

    <image-selector-modal ref="imgSelectorModal" single @selected="onThumbSelected" />
    <image-cropper-modal ref="imgCropperModal"
      :aspect-ratio="1.5" :cropperWidth="300" @cropped="onThumbCropped" />
  </Form>
</template>

<script>
import { rescUpload, checkPersistent, postPersistent } from '@resc-components/utils'
import RescUploader from '@resc-components/uploader'
import { VideoPlayer } from '@resc-components/video/player'
import { ImageSelectorModal } from '@resc-components/image/selector'
import { ImageCropperModal } from '@resc-components/image/cropper'

const FsizeLimit = 600  // 大小限制：600 MB
const DurationLimit = 30  // 时长限制：30分钟

// For test
// const FsizeLimit = 200  // 大小限制：200 MB
// const DurationLimit = 1  // 时长限制：1分钟

const UploadSpec = {
  supportFormats: ['mp3', 'wav'],
  fsizeLimit: FsizeLimit,
  fsizeLimitByte: (FsizeLimit * 1024 * 1024),
  durationLimit: DurationLimit,
  durationLimitSecond: (DurationLimit * 60)
}

export default {
  components: {
    RescUploader,
    VideoPlayer,
    ImageSelectorModal,
    ImageCropperModal
  },

  data () {
    return {
      UploadSpec,
      editMode: 'create', // 编辑模式（update, create）
      rescId: null,
      videoFile: null,
      videoFileMeta: null,
      videoErrorMsg: null,
      uploadData: {},
      modelData: null,
      videoThumbType: 'recmd',  // 默认使用推荐封面
      videoThumbOffset: 0,
      croppedThumbUrl: null,
      customThumbOrigin: null,
      customThumbUrl: null,
      isCheckingTranscoding: false,
      submitErrorMsg: null,
      formModel: {},
      formRules: {
        name: [ { required: true, message: '请输入标题', trigger: 'blur' } ],
        fname: [ { required: true, message: '请选择视频', trigger: 'blur' } ],
        thumb: [ { required: true, message: '请选择视频封面', trigger: 'blur' } ]
      }
    }
  },

  computed: {
    uploadText () {
      if (!this.videoFile) {
        return '选择视频'
      }

      return '重新选择'
    },

    videoFileName () {
      let videoFile = this.videoFile

      if (!this.videoFile) {
        return ''
      }

      return this.videoFile.name
    },

    isTranscoding () {
      let modelData = this.modelData

      if (!modelData) {
        return false
      }

      return modelData.status === 'transcoding'
    },

    isPubed () {
      let modelData = this.modelData

      if (!modelData) {
        return false
      }

      return modelData.pubed === true
    },

    videoPath () {
      let modelData = this.modelData
      let uploadData = this.uploadData

      if (modelData && modelData.path) {
        return modelData.path
      } else if (uploadData && uploadData.tmpKey) {
        return this.$app.tmpRescUrl(uploadData.tmpKey)
      }

      return null
    },

    videoDuration () {
      let modelData = this.modelData
      let videoFileMeta = this.videoFileMeta

      let videoDuration = null

      if (modelData && modelData.extra && modelData.extra.duration) {
        videoDuration = modelData.extra.duration
      } else if (videoFileMeta && videoFileMeta.duration) {
        videoDuration = videoFileMeta.duration
      }

      return videoDuration
    },

    videoThumbOffsets () {
      if (!this.videoPath || !this.videoDuration) {
        return []
      }

      let duration = parseInt(this.videoDuration)
      let sectionDuration = Math.floor(duration / 5)  // 分为5部分

      let offsets = [0, sectionDuration * 3, sectionDuration * 4]
      return offsets
    },

    isRecmdThumb () {
      return this.videoThumbType === 'recmd'
    },
    
    customPreviewVideoThumb () {
      return this.croppedThumbUrl || this.customThumbUrl
    }
  },

  watch: {
    videoFile () {
      if (!this.formModel.name) {
        this.$set(this.formModel, 'name', this.videoFileName)
      }

      this.$set(this.formModel, 'fname', this.videoFileName)
    },

    videoThumbOffsets () {
      if (this.isRecmdThumb && !this.modelData) {
        this.videoThumbOffset = 0
      }
    }
  },

  mounted () {
  },

  methods: {
    onCustomThumbSwap () {
      this.$refs.imgSelectorModal.open()
    },

    onThumbSelected (item) {
      if (!item || !item.thumb) {
        return
      }

      this.$refs.imgCropperModal.open({
        url: item.thumb
      })
    },

    onCustomThumbCrop () {
      if (!this.customThumbOrigin) {
        this.$app.toast('请先选择图片。')
        return
      }

      this.$refs.imgCropperModal.open({
        url: this.customThumbOrigin
      })
    },

    onThumbCropped (data) {
      if (!data || !data.croppedUrl) {
        return
      }

      this.customThumbOrigin = data.url
      this.croppedThumbUrl = data.croppedUrl

      this.$refs.imgCropperModal.close()
    },

    onThumbTypeChange (name) {
      if (name !== 'custom' || this.customPreviewVideoThumb) {
        return
      }

      this.onCustomThumbSwap()
    },

    onThumbOffsetChange () {
    },

    onUploadSelected (file) {
      this.videoErrorMsg = null
      this.videoFile = file

      // 判断视频是否符合规范
      this.validateFile(file).then((vResult) => {
        if (!vResult || !vResult.valid) {
          return
        }

        this.videoFileMeta = vResult.filemeta || {}

        this.uploadFile()
      })
    },

    onUploadCancel () {
      this.cancelUpload()
    },

    onUploadProgress (res) {
      let { total } = res || {}

      if (!total) {
        return
      }

      this.resetUploadData({
        progress: parseInt(total.percent)
      })
    },

    onUploadStart ({ subscription }) {
      this.resetUploadData({
        subscription
      })
    },

    // 停止上传
    cancelUpload () {
      let { subscription } = this.uploadData

      this.uploadData = {}
      this.$emit('canceled')

      if (!subscription) {
        return
      }
      
      subscription.unsubscribe()
    },

    resetUploadData (data) {
      this.uploadData = Object.assign({}, this.uploadData, data)
    },

    loadCreate () {
      this.reset()
      this.editMode = 'create'

      return Promise.resolve()
    },

    loadUpdate (rescId) {
      this.reset()
      this.editMode = 'update'
      this.rescId = rescId

      return this.loadData()
    },

    async save () {
      this.resetErrorMsgs()

      let editMode = this.editMode

      if (this.videoErrorMsg) {
        return false
      }

      let valid = await this.validateForm()

      if (!valid) {
        return false
      }

      let formModel = Object.assign({}, this.formModel)

      let result = null

      if (this.editMode === 'update') {
        result = await this.update(formModel)
      } else {
        result = await this.create(formModel)
      }

      this.$emit('save', result)

      return result
    },

    async create (formModel) {
      if (this.modelData && this.modelData.id) {
        return false
      }

      let uploadData = this.uploadData

      if (!uploadData || !uploadData.tmpKey) {
        return false
      }

      let { duration } = this.videoFileMeta || {}

      // 提交转码
      return postPersistent(uploadData.tmpKey, 'video').then((res) => {
        if (!res.persistentId) {
          return Promise.reject(new Error('提交文件错误，请重试。'))
        }
        
        formModel = Object.assign({
          store: 'app/material',
          rtype: 'video',
          key: uploadData.tmpKey,
          pfopid: res.persistentId
        }, formModel)

        let { duration } = this.videoFileMeta || {}

        let extra = {
          duration: parseInt(duration),
          thumbType: this.videoThumbType,
          tmpRescKey: uploadData.tmpKey
        }

        if (this.isRecmdThumb) {
          extra.thumbOffset = this.videoThumbOffset || 0
          formModel.thumb = this.videoThumbByOffset(formModel.thumbOffset)
        } else if (this.customThumbOrigin) {
          extra.thumbOrigin = this.customThumbOrigin
        }

        formModel.extra = extra

        return this.$service('resc').create(formModel).then((res) => {
          this.rescId = res.id
          this.modelData = res

          this.$emit('create', res)
          return res
        })
      }).catch ((err) => {
        let errorMsg = '提交文件错误。'

        if (err.message) {
          errorMsg = err.message
        }

        this.submitErrorMsg = errorMsg

        return false
      })
    },

    async update (formModel) {
      if (this.isRecmdThumb) {
        formModel.thumbOffset = this.videoThumbOffset || 0
      } else if (this.customThumbOrigin) {
        formModel.thumbOrigin = this.customThumbOrigin
      }

      formModel.thumbType = this.videoThumbType

      let result = await this.$service('rescs').patch(this.rescId, formModel)
      this.$emit('update', result)
      return result
    },

    reset () {
      this.rescId = null
      this.editMode = 'create'
      this.formModel = {}
      this.uploadData = {}
      this.videoFile = null
      this.videoFileMeta = null
      this.videoErrorMsg = null
      this.submitErrorMsg = null
      this.modelData = null
      this.videoThumbType = 'recmd'
      this.videoThumbOffset = 0
      this.customThumbUrl = null
      this.croppedThumbUrl = null
      this.customThumbOrigin = null
      this.isCheckingTranscoding = false

      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }
    },

    resetErrorMsgs () {
      this.videoErrorMsg = null
      this.submitErrorMsg = null
      if (this.uploadData) {
        this.uploadData.errorMsg = null
      }
    },

    validateForm () {
      this.reloadFormModelThumb()
      
      return new Promise ((resolve) => {
        this.$nextTick(() => {
          if (!this.formModel) {
            return resolve(false)
          }

          this.$refs.form.validate((valid) => {
            resolve(valid)
          })
        })
      })
    },

    reloadFormModelThumb () {
      let thumb = null

      if (this.isRecmdThumb) {
        let thumbOffset = this.videoThumbOffset || 0
        thumb = this.videoThumbByOffset(thumbOffset)
      } else if (this.customPreviewVideoThumb) {
        thumb = this.customPreviewVideoThumb
      }

      this.$set(this.formModel, 'thumb', thumb)
    },
    
    checkTranscoding () {
      if (this.isCheckingTranscoding) {
        return
      }

      let modelData = this.modelData

      if (!modelData || !this.isTranscoding) {
        return
      }

      this.isCheckingTranscoding = true

      let checking = false

      const check = (() => {
        if (checking === true) {
          return
        }

        if (!this.isTranscoding) {
          this.onTranscodingChecked()
          return
        }

        checking = true

        checkPersistent(modelData.id, { silent: true }).then((res) => {
          this.modelData = res
          checking = false

          setTimeout(check, 3000)
        })
      }).bind(this)

      check()
    },

    onTranscodingChecked () {
      this.isCheckingTranscoding = false
      this.$emit('trans-checked', this.modelData)
    },

    async uploadFile () {
      let file = this.videoFile

      this.resetUploadData({
        uploading: true
      })

      try {
        let result = await rescUpload(file, {
          onProgress: this.onUploadProgress.bind(this),
          onUpload: this.onUploadStart.bind(this)
        })

        this.resetUploadData({
          tmpKey: result.key,
          uploading: false
        })

        // 重新验证表单
        this.validateForm()

        return result
      } catch (err) {
        let errorMsg = '上传文件错误'

        if (err.message) {
          errorMsg = err.message
        }

        this.resetUploadData({
          uploading: false,
          errorMsg
        })
      }
    },

    async validateFile (file) {
      if (!file) {
        return false
      }

      this.videoErrorMsg = null

      // 判断视频文件大小及时长
      if (file.size > UploadSpec.fsizeLimitByte) {
        this.videoErrorMsg = `文件大小不能超过${UploadSpec.fsizeLimit}M`
        return false
      }

      let filemeta = null
      try {
        filemeta = await this.$media.getAudioMetadata(file)
      } catch (err) {
        this.videoErrorMsg = `加载文件错误，不支持当前文件格式。`
        return false
      }

      if (!filemeta.duration) {
        this.videoErrorMsg = `获取视频文件信息错误，请重试。`
        return false
      }

      if (filemeta.duration > UploadSpec.durationLimitSecond) {
        this.videoErrorMsg = `视频时长不能超过${UploadSpec.durationLimit}分钟。`
        return false
      }

      return { valid: true, filemeta }
    },

    videoThumbByOffset (offset) {
      offset = offset || 0
      let videoPath = this.videoPath

      if (!videoPath) {
        return null
      }

      return `${videoPath}?vframe/jpg/offset/${offset}/w/600`
    },

    loadData () {
      if (!this.rescId) {
        this.formModel = {}
        this.$refs.form.resetFields()

        return Promise.resolve()
      }

      return this.$service('rescs').get(this.rescId).then((res) => {
        this.modelData = res
        this.formModel = _.pick(res, ['name', 'fname', 'desc'])
        
        if (!res.thumb) {
          this.videoThumbType = 'recmd'
          this.videoThumbOffset = 0
        } else if (res.extra) {
          this.videoThumbType = res.extra.thumbType
          this.videoThumbOffset = res.extra.thumbOffset

          if (this.videoThumbType === 'custom') {
            this.customThumbUrl = res.thumb
            
            if (res.extra.thumbOrigin) {
              this.customThumbOrigin = res.extra.thumbOrigin
            }
          }
        }

        this.$nextTick(() => {
          this.checkTranscoding()
        })

        this.$emit('load', res)
        
        return res
      })
    }
  }
}
</script>

<style lang="less" scoped>
.thumbs-holder {
  height: 100px;
  width: 100%;
  background: @bg-color;
  display: flex;
  justify-content: center;
  align-items: center;
}

.thumbs-content {
  background: @bg-color;

  .thumb-radio {
    width: 150px;
    padding: 10px;

    img {
      max-width: 100%;
      max-height: 100%;

      &:hover {
        box-shadow: @select-shadow;
      }
    }
  }

  .custom-thumb {
    width: 120px;
    height: 90px;
    cursor: pointer;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;

    &-box {
      padding: 10px;
      display: flex;
    }

    &-holder {
      background: darken(@bg-color, 10%);
      width: 120px;
      height: 90px;
    }

    &-actions {
      padding: 10px;
      display: flex;
      align-items: center;
    }
  }
}
</style>

<style lang="less">
.video-editor {
  .thumbs-content {
    .thumb-radio {
      .ivu-radio {
        position: absolute;
        top: 20px;
        left: 20px;
      }

      &.ivu-radio-wrapper-checked {
        img {
          box-shadow: @selected-shadow;
        }
      }
    }
  }
}
</style>
