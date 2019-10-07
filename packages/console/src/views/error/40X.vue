<template>
  <error-content :code="statusCode" :desc="`~${statusDesc}~`" :src="src"/>
</template>

<script>
import error401 from '@/assets/sad.svg'
import ErrorContent from './error-content.vue'

const ReqErrorCodes = {
  400: {
    name: '无效请求',
    desc: '无效请求，服务器无法解析当前请求'
  },
  401: {
    name: '未登陆或权限不足',
    desc: '您还没有访问当前页面或接口的权限'
  },
  403: {
    name: '资源不可用',
    desc: '您还没有访问当前页面或接口的权限'
  },
  404: {
    name: '资源不存在',
    desc: '没有找到您访问的页面或接口'
  },
  498: {
    name: '登陆已过期',
    desc: '登陆已过期，请重新登陆'
  },
  500: {
    name: '服务器错误',
    desc: '服务器错误，请联系管理员'
  }
}

export default {
  components: {
    ErrorContent
  },

  data () {
    return {
      src: error401,
      statusCode: 404
    }
  },

  computed: {
    statusData () {
      let reqErrorCodes = ReqErrorCodes
      let statusCode = this.statusCode

      if (!statusCode || !reqErrorCodes[statusCode]) {
        statusCode = 404
      }
      let statusData = reqErrorCodes[statusCode]
      return statusData
    },
    statusName () {
      let statusData = this.statusData
      if (!statusData) {
        return null
      }
      return statusData.name
    },
    statusDesc () {
      let statusData = this.statusData
      if (!statusData) {
        return null
      }
      return statusData.desc
    }
  },

  mounted () {
    let rParams = this.$route.params
    this.statusCode = rParams.code || 404
  }
}
</script>
