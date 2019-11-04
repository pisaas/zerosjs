<template>
  <div class="admins-editor">
    <Transfer class="admins-transfer"
      :data="transferData"
      :target-keys="targetKeys"
      :list-style="{ width: '250px', height: '300px' }"
      :render-format="transferRenderer"
      :operations="['移除','添加']"
      @on-change="onTransferChange">
      <div class="footer-container padding-5">
        <div class="search-box">
          <Input v-model="transferQuery.name" @on-enter="onTransferQuery"
            icon="ios-search" placeholder="手机号/名称/编号" />
        </div>
      </div>
    </Transfer>

    <Form ref="transferForm" :model="formModel" :rules="formRules" :label-width="50" class="q-mt-lg">
      <Form-item label="角色" prop="roles">
        <CheckboxGroup v-model="formModel.roles">
          <Checkbox label="operator"><span>运营</span></Checkbox>
        </CheckboxGroup>
      </Form-item>

      <Form-item label="备注" prop="remark">
        <Input v-model="formModel.remark" type="textarea"
          placeholder="请输入..." :autosize="{ minRows: 2, maxRows: 5 }" />
      </Form-item>

      <div class="actions text-right">
        <Button type="text" @click="onCancel">取消</Button>
        <Button type="primary" class="q-ml-md" @click="onConfirm">确定</Button>
      </div>
    </Form>
  </div>
</template>

<script>
export default {
  props: {
  },

  data () {
    return {
      targetKeys: [],
      transferData: [],
      transferQuery: {
        name: null
      },
      formModel: {
        roles: [],
        remark: ''
      },
      formRules: {
        roles: [ { required: true, type: 'array', message: '角色不能为空', trigger: 'blur' } ],
        remark: [ { required: true, message: '备注不能为空', trigger: 'blur' } ]
      }
    }
  },

  computed: {
  },

  methods: {
    onConfirm () {
      let ucodes = this.targetKeys
      if (!ucodes || !ucodes.length) {
        this.$zeros.toast('请选择要添加的用户。')
        return
      }

      this.$refs.transferForm.validate((valid) => {
        if (!valid) {
          return
        }

        let data = Object.assign({ ucodes }, this.formModel)
        this.$emit('on-confirm', data)
      })
    },

    onCancel () {
      this.$emit('on-cancel')
    },

    onTransferQuery () {
      this.getList()
    },

    onTransferChange (newTargetKeys) {
      this.targetKeys = newTargetKeys
    },

    transferRenderer (item) {
      return `<span title="手机号:${(item.mobile || '未提供')}">
          ${item.code}-${(item.username || item.nickname)}</span>`
    },

    reset () {
      this.targetKeys = []
      this.transferData = []
      this.transferQuery = {
        name: null
      }
      this.formModel = {
        roles: [],
        remark: ''
      }
      this.getList()
    },

    getList () {
      let qry = this.transferQuery || {}
      qry.scene = 'trans'
      this.$apis.adm.getAdmins(qry).then(res => {
        this.transferData = res.items.map((it) => {
          it.key = it.code
          return it
        })
      })
    }
  },

  mounted () {
    this.getList()
  }
}

</script>

<style lang="less" scoped>
.admins-editor {
}
</style>

<style lang="less">
.admins-transfer {
  &>.ivu-transfer-list-with-footer {
    padding-bottom: 45px;

    &>.ivu-transfer-list-footer {
      height: 45px;
      padding: 5px;
    }
  }

  &>div:nth-child(3) {
    .footer-container {
      &>.search-box {
        display: none;
      }
    }
  }
}
</style>
