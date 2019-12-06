<template>
  <Form v-if="formModel" class="audio-editor padding" ref="form"
    :model="formModel" :rules="formRules" :label-width="60">
    <FormItem label="名称" required prop="name">
      <Input v-model="formModel.name" :maxlength="50" placeholder="请输入名称 (100字以内)" />
    </FormItem>
    <FormItem v-show="modelData && modelData.id" label="音频" required prop="fname">
      <div v-if="modelData && modelData.fname">{{ modelData.fname }}</div>
      <div v-if="isCheckingTranscoding" class="transcoding">
        <span>正在转码...</span>
        <Spin class="inline q-ml-md"></Spin>
      </div>
      <audio-player v-show="!isTranscoding && !isCheckingTranscoding" ref="player" />
    </FormItem>
    <FormItem v-if="!rescId" label="音频" required prop="fname">
      <div class="tip">
        {{ `格式支持 ${UploadSpec.supportFormats}，文件大小不超过${UploadSpec.fsizeLimit}M，音频时长不超过${UploadSpec.durationLimit}分钟。` }}
      </div>
      <div>
        <resc-uploader ref="uploader"
          :upload-text="uploadText" upload-icon="md-musical-notes"
          store-key="app/material" resc-type="audio"
          open-file :auto-open-modal="false"
          @selected="onUploadSelected" />
      </div>
      <div v-if="audioFileName">{{ audioFileName }}</div>
      <div v-if="audioErrorMsg" class="tip text-error">
        {{ audioErrorMsg }}
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
    <FormItem label="描述" prop="desc">
      <Input v-model="formModel.desc" type="textarea" :maxlength="200"
        :autosize="{minRows: 2, maxRows: 5}" placeholder="请输入描述 (200字以内)" />
    </FormItem>
  </Form>
</template>

<script>
import { rescUpload, checkPersistent } from '@resc-components/utils'
import RescUploader from '@resc-components/uploader'
import { AudioPlayer } from '@resc-components/audio/player'

const FsizeLimit = 200  // 大小限制：200 MB
const DurationLimit = 60  // 时长限制：60分钟

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
    AudioPlayer
  },

  data () {
    return {
      UploadSpec,
      editMode: 'create', // 编辑模式（update, create）
      rescId: null,
      audioFile: null,
      audioFileMeta: null,
      audioErrorMsg: null,
      uploadData: {},
      modelData: null,
      isCheckingTranscoding: false,
      formModel: {},
      formRules: {
        name: [ { required: true, message: '请输入名称', trigger: 'blur' } ],
        fname: [ { required: true, message: '请选择音频', trigger: 'blur' } ]
      }
    }
  },

  computed: {
    uploadText () {
      if (!this.audioFile) {
        return '选择音频'
      }

      return '重新选择'
    },

    audioFileName () {
      let audioFile = this.audioFile

      if (!this.audioFile) {
        return ''
      }

      return this.audioFile.name
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
    }
  },

  watch: {
    audioFile () {
      this.$set(this.formModel, 'name', this.audioFileName)
      this.$set(this.formModel, 'fname', this.audioFileName)
    }
  },

  mounted () {
  },

  methods: {
    onUploadSelected (file) {
      this.audioErrorMsg = null
      this.audioFile = file

      // 判断音频是否符合规范
      this.validateFile(file).then((vResult) => {
        if (!vResult || !vResult.valid) {
          return
        }

        this.audioFileMeta = vResult.filemeta || {}
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

    reset () {
      this.rescId = null
      this.editMode = 'create'
      this.formModel = {}
      this.uploadData = {}
      this.audioFile = null
      this.audioFileMeta = null
      this.audioErrorMsg = null
      this.modelData = null
      this.isCheckingTranscoding = false

      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }
    },

    async save () {
      let editMode = this.editMode
      let formModel = this.formModel

      if (this.audioErrorMsg) {
        return false
      }

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
      let result = this.$service('rescs').patch(this.rescId, this.formModel)
      this.$emit('update', result)
      return result
    },

    async create () {
      if (this.modelData && this.modelData.id) {
        return false
      }

      return this.uploadFile().then((res) => {
        if (!res.persistentId) {
          return Promise.reject(new Error('文件转码错误，请重试。'))
        }

        let { duration } = this.audioFileMeta || {}

        let extra = {
          duration: parseInt(duration)
        }
        
        let formModel = Object.assign({
          store: 'app/material',
          rtype: 'audio',
          key: res.key,
          pfopid: res.persistentId,
          extra
        }, this.formModel)

        return this.$service('resc').create(formModel).then((res) => {
          this.rescId = res.id
          this.modelData = res

          this.checkTranscoding()

          this.$emit('create', res)
          return res
        })
      }).catch ((err) => {
        let errorMsg = '上传文件错误。'

        if (err.message) {
          errorMsg = err.message
        }
        
        this.resetUploadData({
          uploading: false,
          transcoding: false,
          errorMsg
        })

        return false
      })
    },

    validateForm () {
      return new Promise ((resolve) => {
        if (!this.formModel) {
          return resolve(false)
        }

        this.$refs.form.validate((valid) => {
          resolve(valid)
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
      let file = this.audioFile

      this.resetUploadData({
        uploading: true
      })

      let result = await rescUpload(file, {
        onProgress: this.onUploadProgress.bind(this),
        onUpload: this.onUploadStart.bind(this),
        tokenOptions: { rtype: 'audio' }
      })

      if (result.persistentId === 'null') {
        result.persistentId = null
      }

      this.resetUploadData({
        uploading: false
      })

      return result
    },

    async validateFile (file) {
      if (!file) {
        return false
      }

      this.audioErrorMsg = null

      // 判断音频文件大小及时长
      if (file.size > UploadSpec.fsizeLimitByte) {
        this.audioErrorMsg = `文件大小不能超过${UploadSpec.fsizeLimit}M`
        return false
      }

      let filemeta = null

      try {
        filemeta = await this.$media.getAudioMetadata(file)
      } catch (err) {
        this.audioErrorMsg = `加载文件错误，不支持当前文件格式。`
        return false
      }

      if (!filemeta.duration) {
        this.audioErrorMsg = `获取音频文件信息错误，请重试。`
        return false
      }

      if (filemeta.duration > UploadSpec.durationLimitSecond) {
        this.audioErrorMsg = `音频时长不能超过${UploadSpec.durationLimit}分钟。`
        return false
      }

      return { valid: true, filemeta }
    },

    loadPlayer () {
      let audioPath = this.modelData.path;
      let audioPlayer = this.$refs.player

      if (!this.isPubed || !audioPath) {
        return
      }

      audioPlayer.play({
        src: audioPath,
        autoPlay: false
      })
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

        this.$nextTick(() => {
          this.loadPlayer()
          this.checkTranscoding()
        })

        this.$emit('load', res)
        
        return res
      })
    }
  }
}
</script>
