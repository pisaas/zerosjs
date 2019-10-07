<template>
  <div class="app-expand-row">
    <Row>
      <i-col span="7">
        <Card v-if="appBasic" class="cmpt-section">
          <div slot="title">用户信息</div>
          <div class="flds">
            <div class="fld-item">
              <span class="label">创建时间：</span>
              <span class="data">{{ $util.date.format(appBasic.createdAt, 'datetime') }}</span>
            </div>

            <div v-if="appRoles" class="fld-item">
              <span class="label">用户角色：</span>
              <span class="data">{{ appRoles }}</span>
            </div>

            <div class="fld-item">
              <span class="label">用户状态：</span>
              <span class="data">{{ appBasic.statusName }}</span>
            </div>

            <div v-if="appBasic.freezed" class="fld-item">
              <span class="label">冻结状态：</span>
              <span class="data">已冻结</span>
            </div>
          </div>
        </Card>
      </i-col>
    </Row>
  </div>
</template>

<script>
export default {
  components: {
  },

  props: {
    appCode: String
  },

  data () {
    return {
      appBasic: null,
      appRoles: null
    }
  },

  computed: {

  },

  methods: {
    getData () {
      let appCode = this.appCode

      if (!appCode) {
        return
      }

      this.$apis.usr.getUserProfile(appCode).then((res) => {
        this.appBasic = res.basic
        this.appRoles = res.roles
      })
    }
  },

  mounted () {
    this.getData()
  }
}
</script>

<style lang="less" scoped>
</style>
