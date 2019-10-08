<template>
  <error-content :code="statusCode" :desc="`~${statusDesc}~`" :src="src"/>
</template>

<script>
import error401 from '@/assets/sad.svg'
import ErrorContent from './error-content.vue'

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
      let { ErrorCodes } = this.$errors
      let statusCode = this.statusCode

      if (!statusCode || !ErrorCodes[statusCode]) {
        statusCode = 404
      }
      let statusData = ErrorCodes[statusCode]
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
