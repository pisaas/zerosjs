<template>
  <Form v-if="formModel" ref="form" class="editor-form padding"
    :model="formModel" :rules="formRules" :label-width="80">
    <FormItem label="应用名称" required prop="name">
      <Input v-model="formModel.name" :maxlength="50" placeholder="请输入应用名称 (50字以内)" />
    </FormItem>
    <FormItem label="应用编号" required prop="code" disabled>
      <Input v-model="formModel.code" :maxlength="20" placeholder="请输入应用编号 (20字以内)"
        :disabled="!isAllowedEdit('code')" />
    </FormItem>
    <FormItem label="应用简介" required prop="desc">
      <Input v-model="formModel.desc" type="textarea" :maxlength="200"
        :autosize="{minRows: 2,maxRows: 5}" placeholder="请输入应用简介 (200字以内)" />
    </FormItem>
    <FormItem label="应用头像" required prop="logo">
      <div class="tip">{{`图片大小不可大于${logoMaxSizeStr}；建议使用png格式图片，以保持最佳效果`}}</div>
      <div class="logo-actions q-py-sm">
        <image-upload ref="logoUploader" @image-selected="onLogoSelected"
          style="display: inline-block;">
          <Button type="primary" size="small">选择图片</Button>
        </image-upload>
        <Button v-if="logoData.file && isLogoChanged" class="q-ml-sm" size="small"
          @click="onLogoReset">取消</Button>
      </div>

      <div v-show="logoData.file" class="cropper">
        <image-cropper ref="logoCropper"
          :aspectRatio="1" :viewMode="1"
          :cropperHeight="240" :cropperWidth="200"
          :previewHeight="220" no-selection />
      </div>

      <div v-if="!isLogoChanged && logoData.url" class="logo-photo flex-center panel-shadow">
        <img :src="logoData.url" @click="onLogoPreview" />
      </div>
      
      <Modal title="预览" transfer v-model="isLogoPreview"
        cancel-text='' :z-index="9000">
        <img :src="logoData.url" style="width: 100%">
      </Modal>
    </FormItem>
  </Form>
</template>

<script>
import ImageUpload from '@components/upload/image-upload'
import { ImageCropper } from '@resc-components/image/cropper'

const LogoSpec = {
  MimeType: 'image/png', // 图片格式
  MaxSize: 500 * 1024, // 最大图片大小 500k
  MaxWidth: 600,   // 最大图片宽度
  MaxHeight: 600,  // 最大图片高度
  Square: true  // 是否正方形
}

export default {
  components: {
    ImageUpload,
    ImageCropper
  },

  data () {
    return {
      editMode: 'create', // 编辑模式（update, create）
      isLogoPreview: false,
      appId: null,
      modelData: null,
      formModel: {},
      logoData: {},
      formRules: {
        name: [ { required: true, message: '请输入应用名', trigger: 'blur' } ],
        code: [ { required: true, message: '请输入应用编号', trigger: 'blur' } ],
        desc: [ { required: true, message: '请输入应用简介', trigger: 'blur' } ],
        logo: [ { required: true, message: '请选择应用头像', trigger: 'blur' } ]
      }
    }
  },

  computed: {
    isLogoChanged () {
      let logoData = this.logoData || {}
      return !!(logoData.file || logoData.tmpUrl)
    },

    logoMaxSizeStr () {
      return this.$util.filesize(LogoSpec.MaxSize)
    }
  },

  mounted () {
  },

  methods: {
    onLogoSelected (file) {
      if (!file) {
        return
      }

      if (file.size > LogoSpec.MaxSize) {
        this.$app.toast(`文件 ${file.name} 太大，不能超过 ${this.logoMaxSizeStr}。`, {
          type: 'warning'
        })
        return
      }

      this.$media.readFileAsDataUrl(file).then((url) => {
        this.resetLogoData({ file })
        this.$refs.logoCropper.load({ url })
      })
    },

    onLogoPreview () {
      this.isLogoPreview = true
    },

    onLogoReset () {
      this.resetLogo()
    },

    isAllowedEdit (field) {
      if (!field) {
        return true
      }

      let modelData = this.modelData

      switch (field) {
        case 'code':
          return !modelData || !modelData.pubed
      }

      return true
    },

    loadCreate () {
      this.reset()
      this.editMode = 'create'

      return Promise.resolve()
    },

    loadUpdate (appId) {
      this.reset()
      this.editMode = 'update'
      this.appId = appId

      return this.loadData()
    },

    async save () {
      let editMode = this.editMode

      let valid = await this.validateForm()

      if (!valid) {
        return false
      }

      let uploadResult = await this.uploadLogo()

      let formModel = Object.assign({
        tmpLogoUrl: this.logoData.tmpUrl
      }, this.formModel)

      delete formModel.logo

      let result
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

      return this.$service('apps').create(formModel).then((res) => {
        this.appId = res.id
        this.modelData = res

        this.$emit('create', res)
        return res
      })
    },

    async update (formModel) {
      return this.$service('apps').patch(this.appId, formModel).then((res) => {
        this.modelData = res

        this.$emit('update', res)
      })
    },

    reset () {
      this.editMode = 'create'
      this.appId = null
      this.modelData = null
      this.formModel = {}
      this.logoData = {}

      this.resetLogo()

      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }
    },

    resetLogo () {
      let modelData = this.modelData
      this.logoData = {}

      if (modelData) {
        this.resetLogoData({
          url: modelData.logo
        })
      }

      if (this.$refs.logoUploader) {
        this.$refs.logoUploader.reset()
      }

      if (this.$refs.logoCropper) {
        this.$refs.logoCropper.reset()
      }
    },

    validateForm () {
      let { url, tmpUrl, file } = this.logoData
      this.formModel.logo = tmpUrl || url || 'file'

      return new Promise ((resolve) => {
        this.$nextTick(() => {
          this.$refs.form.validate((valid) => {
            resolve(valid)
          })
        })
      })
    },

    resetLogoData (data) {
      this.logoData = Object.assign({
        url: null,
        file: null,
        tmpKey: '',
        tmpUrl: '',
      }, this.logoData, data)
    },

    async uploadLogo () {
      let logoData = this.logoData

      if (!logoData || !logoData.file) {
        return logoData
      }

      // 上传并保存头像文件
      return this.$apis.zeros.uploadFile(logoData.file).then((res) => {
        let tmpKey = res.key
        let tmpUrl = this.$app.tmpRescUrl(tmpKey)

        return this.$refs.logoCropper.getData({
          replaceUrl: tmpUrl
        }).then((cropData) => {
          this.resetLogoData({
            tmpKey,
            tmpUrl: cropData.croppedUrl
          })

          return this.logoData
        })
      }).catch ((err) => {
        let errorMsg = '上传文件错误。'

        if (err.message) {
          errorMsg = err.message
        }

        this.$app.toast(errorMsg)
      })
    },

    loadData () {
      if (!this.appId) {
        this.formModel = {}
        this.$refs.form.resetFields()
        return Promise.resolve()
      }

      return this.$service('apps').get(this.appId).then((res) => {
        this.modelData = res
        this.formModel = _.pick(res, ['name', 'code', 'desc'])

        this.resetLogoData({ url: res.logo })

        this.$emit('load', res)
        
        return res
      })
    }
  }
}

</script>

<style lang="less" scoped>
@logoPhotoSize: 160px;

.editor-form {
  width: 600px;
}

.logo-upload {
  min-width: 150px;
}

.logo-photo {
  height: @logoPhotoSize;
  width: @logoPhotoSize;

  border-radius: 4px;

  &>i {
    opacity: 0.5;
    line-height: @logoPhotoSize - 30;
  }

  &>img {
    border-radius: 4px;
    max-width: @logoPhotoSize - 10;
    max-height: @logoPhotoSize - 10;
  }
}
</style>
