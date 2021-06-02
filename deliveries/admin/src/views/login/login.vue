<template>
  <div class="app-page login-page" @keydown.enter="onSubmit">
    <div class="page-bg-mask" :style="{background: `url(${loginBg})`}"></div>
    <div class="login-panel clearfix">
      <div class="caption">
        <div class="title">{{ title }}</div>
        <div class="logo"><img :src="logoUrl"></div>
      </div>
      <div class="body">
        <div class="caption clearfix">
          <div class="logo"><img :src="logoUrl"></div>
          <div class="title">{{ title }}</div>
        </div>

        <Card :bordered="false">
          <p slot="title">
            <Icon type="log-in"></Icon>
            欢迎登录
          </p>
          <div class="login-form">
            <Form ref="loginForm" :model="form" :rules="rules">
              <FormItem prop="username">
                <Input v-model="form.username" placeholder="请输入用户名">
                  <span slot="prepend">
                    <Icon :size="16" type="person"></Icon>
                  </span>
                <!-- eslint-disable-next-line -->
                </Input>
              </FormItem>
              <FormItem prop="password">
                <Input type="password" v-model="form.password" placeholder="请输入密码">
                  <span slot="prepend">
                    <Icon :size="14" type="locked"></Icon>
                  </span>
                <!-- eslint-disable-next-line -->
                </Input>
              </FormItem>
              <FormItem>
                <Button @click="onSubmit" type="primary" long>登录</Button>
                <div v-if="loginError" class="login-error">{{ loginError }}</div>
              </FormItem>
            </Form>
          </div>

          <!-- <div class="login-footer">
            <p class="login-tip">您也可以使用以下方式登录</p>
            <div class="login-ways">
              <Button class="btn-wechat" type="text" shape="circle"
                icon="ios-chatbubbles" @click="wechatLogin"></Button>
            </div>
          </div> -->
        </Card>
      </div>
    </div>
  </div>
</template>

<script>
import uni from '@/utils/uni'

export default {
  data () {
    return {
      redirect: null,
      form: {
        username: '',
        password: ''
      },
      rules: {
        username: [
          { required: true, message: '账号不能为空', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '密码不能为空', trigger: 'blur' }
        ]
      },
      loginError: null
    }
  },

  computed: {
    title () {
      return this.$app.zerosBasic('name')
    },
    
    logoUrl () {
      return this.$app.zerosBasic('logo')
    },

    loginBg () {
      return this.$app.zerosBasic('loginBg')
    }
  },

  mounted () {
    this.redirect = this.$route.query.redirect
  },

  methods: {
    wechatLogin () {
    },

    onSubmit () {
      let thiz = this

      this.$refs.loginForm.validate((valid) => {
        if (!valid) {
          return
        }

        thiz.login()
      })
    },

    login () {
      this.$store.dispatch('zeros/login', this.form).then((res) => {
        uni.reload('location', this.redirect)
      }).catch((err) => {
        let errorMsg = this.$uni.getReqErrorMessage(err) || '未知登陆错误'
        this.loginError = errorMsg
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login-page {
  width: 100%;
  height: 100%;
  position: relative;
}

.page-bg-mask {
  width: 100%;
  height: 100%;

  background-size: cover !important;
  background-position: center;
  background-repeat: no-repeat;

  opacity: 0.8;
  filter: blur(1px);
}

.login-panel {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 70%;
  max-width: 720px;
  transform: translateX(-50%);

  &>.caption{
    transform: translateY(-60%);
    width: 300px;
    height: 300px;
    float: left;
    text-align: center;

    &>.title {
      font-size: 1.5rem;
      font-weight: bold;
      color: white;
    }

    &>.logo {
      padding: 1rem;

      &>img {
        max-width: 10rem;
        max-height: 10rem;
        background: white;
        border-radius: 10%;
      }
    }
  }

  &>.body{
    transform: translateY(-60%);
    width: 300px;
    float: right;

    &>.caption{
      display: none;
      position: relative;

      &>.logo {
        padding: 0 1rem;
        position: absolute;

        &>img {
          width: 1.5rem;
          height: 1.5rem;
          background: white;
          border-radius: 20%;
          padding:0.1rem;
        }
      }

      &>.title {
        font-size: 1.2rem;
        line-height: 1.5rem;
        font-weight: bold;
        color: white;
        text-align: center;
        padding-bottom: 0.5rem;
      }
    }
  }
}

.login-error{
  color: red;
}

.login-form{
  padding: 10px 0 0;
}

.login-tip{
  font-size: 10px;
}

.login-ways{
  padding: 2px 5px;

  .btn-wechat i {
    color: green;
    font-size: 20px;
  }
}

@media screen and (max-width: @screen-size-sm){
  .login-panel {
    display: flex;
    justify-content: center;

    &>.caption {
      display: none;
    }

    &>.body {
      &>.caption {
        display: block;
      }
    }
  }
}
</style>
