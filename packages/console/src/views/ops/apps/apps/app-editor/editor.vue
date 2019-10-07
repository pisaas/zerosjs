<template>
  <Form v-if="formModel" class="user-editor" ref="form"
    :model="formModel" :rules="formRules" :label-width="80">
    <Row>
      <i-col span="6" class="text-center">
        <div class="avatar-photo flex-center panel-shadow">
          <img v-if="avatarUrl" :src="avatarUrl" @click="onAvatarPreview" />
          <Icon v-else type="md-image" size="120"></Icon>
        </div>
        <div class="avatar-actions q-py-sm">
          <image-upload ref="imgUpload" @image-selected="onAvatarSelected"
             style="display: inline-block;">
            <Button type="primary" size="small">选择</Button>
          </image-upload>
          <Button v-if="avatarUrl" class="q-ml-sm" size="small"
            @click="onAvatarPreview">预览</Button>
          <Button v-if="isAvatarChanged" class="q-ml-sm" size="small"
            @click="onAvatarReset">还原</Button>
        </div>
        <Modal title="头像预览" transfer v-model="isAvatarPreview"
          cancel-text='' :z-index="9000">
          <img :src="avatarUrl" style="width: 100%">
        </Modal>
        <!-- <div>
          <Alert v-if="avatarUpdated" type="success">头像更新成功！</Alert>
          <Progress v-else-if="uploadPercent" :percent="uploadPercent" status="active" />
        </div> -->
      </i-col>
      <i-col span="18">
        <Row>
          <i-col span="12">
            <Form-item label="名称" prop="username">
              <Input v-model="formModel.username" placeholder="请输入应用名称"></Input>
            </Form-item>
          </i-col>
          <i-col span="12">
            <Form-item label="昵称" prop="nickname">
              <Input v-model="formModel.nickname" placeholder="请输入昵称"></Input>
            </Form-item>
          </i-col>
          <i-col span="12">
            <Form-item label="真实姓名" prop="realname">
              <Input v-model="formModel.realname" placeholder="请输入真实姓名"></Input>
            </Form-item>
          </i-col>
          <i-col span="12">
            <Form-item label="手机号" prop="mobile">
              <Input v-model="formModel.mobile" placeholder="请输入手机号"></Input>
            </Form-item>
          </i-col>
          <i-col span="12">
            <Form-item label="邮件" prop="email">
              <Input v-model="formModel.email" placeholder="请输入邮件"></Input>
            </Form-item>
          </i-col>
          <i-col span="12">
            <Form-item label="微信号" prop="weixin">
              <Input v-model="formModel.weixin" placeholder="请输入微信号"></Input>
            </Form-item>
          </i-col>
        </Row>
        <Row v-if="editMode === 'update'">
          <Form-item label="修改密码" prop="password">
            <Button type="text" class="text-link" @click="modifyPassword">修改</Button>
          </Form-item>
        </Row>
        <Row v-if="isModifyPassword && editMode === 'update'">
          <i-col span="12">
            <Form-item label="密码" prop="password">
              <Input type="password" v-model="formModel.password" placeholder="请输入密码"></Input>
            </Form-item>
          </i-col>
          <i-col span="12">
            <Form-item label="确认密码" prop="password2">
              <Input type="password" v-model="formModel.password2" placeholder="请确认密码"></Input>
            </Form-item>
          </i-col>
        </Row>
      </i-col>
    </Row>
  </Form>
</template>

<script>
import ImageUpload from '@/components/upload/image-upload'

const AvatarImageSpec = {
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
      editMode: 'create', // 编辑模式（update, create）
      maxFileSize: 500, // 单位kb
      isModifyPassword: false, // 是否修改密码
      userCode: null,
      uploadUrl: '',
      isAvatarPreview: false,
      avatarUrl: null,
      formModel: {},
      confirmPassword: null,
      formRules: {
        nickname: [ { required: true, message: '请输入合法的显示名', trigger: 'blur' } ],
        username: [ { required: true, message: '用户名不能为空', trigger: 'blur' } ],
        mobile: [ { message: '请输入合法的手机号', trigger: 'blur' } ],
        email: [ { type: 'email', message: '请输入合法的邮件地址', trigger: 'blur' } ],
        weixin: [ { message: '请输入合法的微信号', trigger: 'blur' } ],
        password: [ { validator: this.validatePassword, trigger: 'blur' } ],
        password2: [ { validator: this.validateConfirmPassword, trigger: 'blur' } ]
      }
    }
  },

  computed: {
    isAvatarChanged () {
      if ((!this.formModel && this.avatarUrl) ||
        (this.formModel.avatar !== this.avatarUrl &&
        this.formModel.avatarOrigin !== this.avatarUrl)) {
        return true
      }
      return false
    }
  },

  mounted () {
  },

  methods: {
    onAvatarSelected (file) {
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

      this.$media.scalePhoto.call(this, file, AvatarImageSpec).then((url) => {
        if (!url) {
          return
        }
        this.avatarUrl = url
      })
    },

    onAvatarPreview () {
      this.isAvatarPreview = true
    },

    onAvatarReset () {
      let formModel = this.formModel
      if (!formModel) {
        this.avatarUrl = null
      } else {
        this.avatarUrl = (formModel.avatarOrigin || formModel.avatar || null)
      }
    },

    create () {
      this.reset()
      this.editMode = 'create'

      return Promise.resolve()
    },

    update (userCode) {
      this.reset()
      this.editMode = 'update'
      this.userCode = userCode

      return this.loadData()
    },

    reset () {
      this.userCode = null
      this.isModifyPassword = false
      this.avatarUrl = null
      this.formModel = {}

      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }

      if (this.$refs.imgUpload) {
        this.$refs.imgUpload.reset()
      }
    },

    save () {
      let formModel = this.formModel
      let editMode = this.editMode

      return new Promise((resolve, reject) => {
        if (!formModel) {
          return resolve(false)
        }
        this.$refs.form.validate((valid) => {
          return resolve(valid)
        })
      }).then((valid) => {
        if (!valid) {
          return
        }

        delete formModel.password2
        return this.uploadAvatar().then((res) => {
          if (res && res.key) {
            formModel.avatar = { key: res.key }
          }
          return this.$apis.usr.postUser(editMode, formModel)
        })
      })
    },

    uploadAvatar () {
      let avatarUrl = this.avatarUrl

      if (!this.$media.isImageDataUrl(avatarUrl)) {
        return Promise.resolve(null)
      }

      let bolb = this.$media.dataURItoBlob(avatarUrl)

      // 上传并保存头像文件
      return this.$apis.app.uploadFile(bolb)
    },

    modifyPassword () {
      this.isModifyPassword = !this.isModifyPassword
    },

    validatePassword (rule, value, callback) {
      if (value && this.formModel.password2) {
        this.$refs.form.validateField('password2')
      }

      return callback()
    },

    validateConfirmPassword (rule, value, callback) {
      if (value && value !== this.formModel.password) {
        return callback(new Error('两次输入密码不一致!'))
      }

      return callback()
    },

    loadData () {
      if (!this.userCode) {
        this.formModel = {}
        this.$refs.form.resetFields()

        return Promise.resolve()
      }

      return this.$apis.usr.getUserBasic(this.userCode).then((res) => {
        let formModel = res.basic
        this.formModel = formModel
        this.avatarUrl = (formModel.avatarOrigin || formModel.avatar || null)
        return formModel
      })
    }
  }
}

</script>

<style lang="less" scoped>
@avatarPhotoSize: 160px;

.avatar-photo {
  height: @avatarPhotoSize;
  border-radius: 4px;

  &>i {
    opacity: 0.5;
    line-height: @avatarPhotoSize - 30;
  }

  &>img {
    border-radius: 4px;
    max-width: @avatarPhotoSize - 10;
    max-height: @avatarPhotoSize - 10;
  }
}

// .avatar-photo {
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
