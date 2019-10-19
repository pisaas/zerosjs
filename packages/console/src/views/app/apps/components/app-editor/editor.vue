<template>
  <Form v-if="formModel" class="cmpt-app-editor" ref="form"
    :model="formModel" :rules="formRules" :label-width="120">
    <Row>
      <i-col span="12">
        <FormItem label="应用名称" required prop="name">
          <Input v-model="formModel.name" :maxlength="50" placeholder="请输入应用名称 (50字以内)" />
        </FormItem>
      </i-col>
      <i-col span="12">
        <FormItem label="应用编号" required prop="code" disabled>
          <Input v-model="formModel.code" :maxlength="20" placeholder="请输入应用编号 (20字以内)"
            :disabled="!isAllowedEdit('code')" />
        </FormItem>
      </i-col>
    </Row>
    <Row>
      <i-col span="12">
        <FormItem label="所属组织" required prop="oid">
          <Select v-model="formModel.oid"
            :loading="orgLoading" filterable remote :remote-method="onOrgFilter">
            <Option v-for="it in orgData" :value="it.id" :key="it.id">{{ it.name }}</Option>
          </Select>
        </FormItem>
      </i-col>
    </Row>
    <FormItem label="应用简介" required prop="desc">
      <Input v-model="formModel.desc" type="textarea" :maxlength="200"
        :autosize="{minRows: 2,maxRows: 5}" placeholder="请输入应用简介 (200字以内)" />
    </FormItem>
    <FormItem label="应用图标/Logo">
      <Row>
        <i-col span="6" class="text-center">
          <div class="logo-photo flex-center panel-shadow">
            <img v-if="logoUrl" :src="logoUrl" @click="onLogoPreview" />
            <Icon v-else type="md-image" size="120"></Icon>
          </div>
          <div class="logo-actions q-py-sm">
            <image-upload ref="imgUpload" @image-selected="onLogoSelected"
              style="display: inline-block;">
              <Button type="primary" size="small">选择</Button>
            </image-upload>
            <Button v-if="logoUrl" class="q-ml-sm" size="small"
              @click="onLogoPreview">预览</Button>
            <Button v-if="isLogoChanged" class="q-ml-sm" size="small"
              @click="onLogoReset">还原</Button>
          </div>
          <Modal title="预览" transfer v-model="isLogoPreview"
            cancel-text='' :z-index="9000">
            <img :src="logoUrl" style="width: 100%">
          </Modal>
        </i-col>
      </Row>
    </FormItem>
  </Form>
</template>

<script>
import ImageUpload from '@/components/upload/image-upload'

const LogoImageSpec = {
  MimeType: 'image/jpeg', // 图片格式
  MaxSize: 500 * 1024, // 最大图片大小 500k
  MaxWidth: 600,   // 最大图片宽度
  MaxHeight: 600,  // 最大图片高度
  Square: true  // 是否正方形
}

export default {
  components: {
    ImageUpload
  },

  data () {
    return {
      orgData: {},
      orgLoading: false,
      editMode: 'create', // 编辑模式（update, create）
      maxFileSize: 500, // 单位kb
      appId: null,
      uploadUrl: '',
      isLogoPreview: false,
      logoUrl: null,
      formModel: {},
      confirmPassword: null,
      formRules: {
        name: [ { required: true, message: '请输入应用名', trigger: 'blur' } ],
        code: [ { required: true, message: '请输入应用编号', trigger: 'blur' } ],
        oid: [ { required: true, message: '请选择所属组织', trigger: 'blur' } ],
        desc: [ { required: true, message: '请输入应用简介', trigger: 'blur' } ]
      }
    }
  },

  computed: {
    isLogoChanged () {
      if ((!this.formModel && this.logoUrl) ||
        (this.formModel.logo !== this.logoUrl &&
        this.formModel.logoOrigin !== this.logoUrl)) {
        return true
      }
      return false
    }
  },

  mounted () {
  },

  methods: {
    onOrgFilter (query) {
      setTimeout(() => {
        this.loadOrgData(query)
      }, 1000);
    },

    onLogoSelected (file) {
      if (!file) {
        return
      }

      let fileSize = file.size

      if (fileSize > (this.maxFileSize * 1024)) {
        this.$app.toast(`文件 ${file.name} 太大，不能超过 ${this.maxFileSize}K。`, {
          type: 'warning'
        })
        return
      }

      this.$media.scalePhoto.call(this, file, LogoImageSpec).then((url) => {
        if (!url) {
          return
        }
        this.logoUrl = url
      })
    },

    onLogoPreview () {
      this.isLogoPreview = true
    },

    onLogoReset () {
      let formModel = this.formModel

      if (this.$refs.imgUpload) {
        this.$refs.imgUpload.reset()
      }

      if (!formModel) {
        this.logoUrl = null
      } else {
        this.logoUrl = (formModel.logoOrigin || formModel.logo || null)
      }
    },

    create () {
      this.reset()
      this.editMode = 'create'

      return Promise.resolve()
    },

    update (appId) {
      this.reset()
      this.editMode = 'update'
      this.appId = appId

      return this.loadData()
    },

    reset () {
      this.appId = null
      this.logoUrl = null
      this.formModel = {}

      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }

      if (this.$refs.imgUpload) {
        this.$refs.imgUpload.reset()
      }
    },

    save () {
      let editMode = this.editMode
      let formModel = this.formModel

      return new Promise((resolve, reject) => {
        if (!formModel) {
          return resolve(false)
        }
        this.$refs.form.validate((valid) => {
          return resolve(valid)
        })
      }).then((valid) => {
        if (!valid) {
          return false
        }

        let orgItem = this.orgData[formModel.oid]

        if (orgItem) {
          formModel.ocode = orgItem.code
        }

        let appService = this.$service('apps')

        if (editMode === 'create') {
          return appService.create(formModel)
        } else {
          return appService.update(this.appId, formModel)
        }
        
        // return this.uploadLogo().then((res) => {
        //   if (res && res.key) {
        //     formModel.logo = { key: res.key }
        //   }
        //   return this.$apis.usr.postUser(editMode, formModel)
        // })
      })
    },

    uploadLogo () {
      let logoUrl = this.logoUrl

      if (!this.$media.isImageDataUrl(logoUrl)) {
        return Promise.resolve(null)
      }

      let bolb = this.$media.dataURItoBlob(logoUrl)

      // 上传并保存头像文件
      return this.$apis.app.uploadFile(bolb)
    },

    isAllowedEdit (field) {
      if (!field) {
        return true
      }

      switch (field) {
        case 'code':
          return !this.formModel.pubed
      }

      return true
    },

    loadOrgData (text) {
      let appService = this.$service('orgs')

      if (!text) {
        return
      }

      return appService.find({
        query: {
          pubed: true,
          frzn: false,
          $or: [
            { id: text },
            { code: { $search: text } },
            { name: { $search: text } },
          ],
          $sort: { id: -1 }
        }
      }).then((res) => {
        this.orgData = this.$util.lodash.keyBy(res.data, 'id')
        this.orgLoading = false
      }).catch(() => {
        this.orgLoading = false
      })
    },

    loadData () {
      if (!this.appId) {
        this.formModel = {}
        this.$refs.form.resetFields()

        return Promise.resolve()
      }

      return this.$service('apps').get(this.appId).then((res) => {
        let formModel = res

        return this.loadOrgData(formModel.oid).then(() => {
          this.formModel = formModel
          this.logoUrl = (formModel.logoOrigin || formModel.logo || null)

          return formModel
        })
      })
    }
  }
}

</script>

<style lang="less" scoped>
@logoPhotoSize: 160px;

.app-editor {
  width: 800px;
}

.logo-photo {
  height: @logoPhotoSize;
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

// .logo-photo {
//   width: 150px;
//   height: 150px;
//
//   display: flex;
//   justify-content: center;
//   align-items: center;
//
//   &>img {
//     max-width: 150px;
//     max-height: 150px;
//   }
//
//   &>i {
//     line-height: 150px;
//     color: #dcdee2;
//   }
// }
</style>
