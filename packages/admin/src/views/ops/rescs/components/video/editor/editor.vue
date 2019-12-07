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

      <div v-if="videoPath" class="cover-type-checker q-px-lg">
        <RadioGroup v-model="videoThumbType" class="cover-type-radio-group">
          <Radio label="recmd" class="cover-type-radio">推荐封面</Radio>
          <Radio label="custom" class="cover-type-radio">自定义封面</Radio>
        </RadioGroup>
      </div>

      <div v-if="videoPath" class="covers-content">
        <div v-if="isRecmdCover" class="recmd-cover-box">
          <RadioGroup v-model="videoThumbOffset" class="recmd-covers">
            <Radio v-for="(it, idx) in videoThumbOffsets" :key="idx" :label="it" class="cover-radio">
              <img :src="videoThumbByOffset(it)" />
            </Radio>
          </RadioGroup>
        </div>
        <div v-else class="custom-cover-box">
          <div v-if="customVideoCover" class="custom-cover">
          </div>
          <div v-else class="custom-cover-holder" />
          <div class="custom-cover-actions">
            <ButtonGroup vertical>
              <Button icon="md-crop" @click="onCustomCoverCrop"></Button>
              <Button icon="md-swap" @click="onCustomCoverSwap"></Button>
            </ButtonGroup>
          </div>
        </div>
      </div>
      <div v-else class="covers-holder tip">请先完成视频上传</div>
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
  </Form>
</template>

<script>
import { rescUpload, checkPersistent, postPersistent } from '@resc-components/utils'
import RescUploader from '@resc-components/uploader'
import { VideoPlayer } from '@resc-components/video/player'

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
    VideoPlayer
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
      customVideoCover: null,
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

    isRecmdCover () {
      return this.videoThumbType === 'recmd' && this.videoThumbOffsets.length
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
      if (this.isRecmdCover && !this.modelData) {
        this.videoThumbOffset = 0
      }
    }
  },

  mounted () {
  },

  methods: {
    onCustomCoverCrop () {
    },

    onCustomCoverSwap () {
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

    openCreate () {
      this.reset()
      this.editMode = 'create'

      return Promise.resolve()
    },

    openUpdate (rescId) {
      this.reset()
      this.editMode = 'update'
      this.rescId = rescId

      return this.loadData()
    },

    async save () {
      this.resetErrorMsgs()

      let editMode = this.editMode
      let formModel = this.formModel || {}

      if (this.videoErrorMsg) {
        return false
      }

      this.formModel = Object.assign({}, formModel)

      let valid = await this.validateForm()

      if (!valid) {
        return false
      }

      let result = null

      if (this.editMode === 'update') {
        result = await this.update()
      } else {
        result = await this.create()
      }

      this.$emit('save', result)

      return result
    },

    async update () {
      let formModel = this.formModel
      
      if (this.isRecmdCover) {
        formModel.thumbOffset = this.videoThumbOffset || 0
      }

      let result = await this.$service('rescs').patch(this.rescId, this.formModel)
      this.$emit('update', result)
      return result
    },

    async create () {
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

        let { duration } = this.videoFileMeta || {}

        let extra = {
          duration: parseInt(duration),
          tmpRescKey: uploadData.tmpKey
        }

        if (this.isRecmdCover) {
          extra.thumbOffset = this.videoThumbOffset || 0
        }
        
        let formModel = Object.assign({
          store: 'app/material',
          rtype: 'video',
          key: uploadData.tmpKey,
          pfopid: res.persistentId,
          extra
        }, this.formModel)

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
      this.customVideoCover = null
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

    reloadFormModelThumb () {
      let thumb = this.formModel.thumb
      if (this.isRecmdCover) {
        let thumbOffset = this.videoThumbOffset || 0
        thumb = this.videoThumbByOffset(thumbOffset)
      } else {
        thumb = this.customVideoCover
      }

      this.$set(this.formModel, 'thumb', thumb)
    },

    validateForm () {
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

        checkPersistent(modelData.id).then((res) => {
          this.modelData = res
          checking = false

          setTimeout(check, 3000)
        })
      }).bind(this)

      check()
    },

    onTranscodingChecked () {
      this.isCheckingTranscoding = false

      this.loadPlayer()

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

        this.reloadFormModelThumb()

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

    loadPlayer () {
      let videoPath = this.modelData.path;
      let videoPlayer = this.$refs.player

      if (!this.isPubed || !videoPath) {
        return
      }

      videoPlayer.play({
        src: videoPath,
        autoPlay: false
      })
    },

    videoThumbByOffset (offset) {
      offset = offset || 0
      let videoPath = this.videoPath

      if (!videoPath) {
        return null
      }

      return `${videoPath}?vframe/jpg/offset/${offset}`
    },

    loadData () {
      if (!this.rescId) {
        this.formModel = {}
        this.$refs.form.resetFields()

        return Promise.resolve()
      }

      return this.$service('rescs').get(this.rescId).then((res) => {
        this.modelData = res
        this.formModel = _.pick(res, ['name', 'fname', 'thumb', 'desc'])

        if (res.extra && res.extra.thumbOffset) {
          this.videoThumbType = 'recmd'
          this.videoThumbOffset = res.extra.thumbOffset
        } else if (!res.thumb) {
          this.videoThumbType = 'recmd'
          this.videoThumbOffset = 0
        }

        this.$nextTick(() => {
          this.reloadFormModelThumb()
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
.covers-holder {
  height: 100px;
  width: 100%;
  background: @bg-color;
  display: flex;
  justify-content: center;
  align-items: center;
}

.covers-content {
  background: @bg-color;

  .cover-radio {
    width: 150px;
    padding: 10px;

    img {
      max-width: 100%;
      max-height: 100%;
    }
  }

  .custom-cover {
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
  .covers-content {
    .cover-radio .ivu-radio {
      position: absolute;
      top: 20px;
      left: 20px;
    }
  }
}
</style>
