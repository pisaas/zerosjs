<template>
  <div class="tpc-editor">
    <div class="editor-header flex q-pa-sm">
      <div class="header-main flex-main">
        <div class="title-input">
          <Input v-model="formModel.name"
            :maxlength="100" show-word-limit placeholder="请输入话题的标题" />
        </div>
      </div>
      <div class="header-tail">
        <Button v-if="isAllowed('save')" @click="onSave">保存</Button>
        &nbsp;
        <Button v-if="isAllowed('pub')" @click="onPub">发布</Button>
      </div>
    </div>
    <div class="editor-body">
      <template v-if="topicCat">
        <div class="body-main">
          <cont-editor v-model="formModel.cont" />
        </div>
        <div class="body-right">
          <tpc-previewer :topic="formModel" />
        </div>
      </template>
      <page-result v-else title="请先选择话题类型" icon="ios-alert" />
    </div>
  </div>
</template>

<script>
import { getTopicCat } from '../../common'

import CatSelector from '../cat-selector'
import ContEditor from './cont-editor'
import TpcPreviewer from '../tpc-previewer'

export default {
  components: {
    CatSelector,
    ContEditor,
    TpcPreviewer
  },

  data () {
    return {
      editMode: 'create', // 编辑模式（update, create）
      tabName: 'cont',
      tpcid: null,
      formModel: {},
      formRules: {
        name: [ { required: true, message: '请输入话题名称', trigger: 'blur' } ]
      }
    }
  },

  computed: {
    topicCat () {
      let formModel = this.formModel
      if (!formModel || !formModel.catid) {
        return null
      }

      return getTopicCat(formModel.catid)
    }
  },

  mounted () {
  },

  methods: {
    onSave () {
    },

    onPub () {
    },

    onCatChange (val, data) {
    },

    open (tpcid) {
      return this.openUpdate(tpcid)
    },

    openCreate (catid) {
      this.reset()
      this.editMode = 'create'

      if (catid) {
        this.$set(this.formModel, 'catid', catid)
      }

      return Promise.resolve()
    },

    openUpdate (tpcid) {
      this.reset()
      this.editMode = 'update'
      this.tpcid = tpcid

      return this.loadData()
    },

    reset () {
      this.tpcid = null
      this.formModel = {}

      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }

      if (this.$refs.selCat) {
        this.$refs.selCat.reset()
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

        let tpcService = this.$service('tpcs')

        if (editMode === 'create') {
          return tpcService.create(formModel)
        } else {
          return tpcService.patch(this.tpcid, formModel)
        }
      })
    },

    isAllowed () {
      return true
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

    loadData () {
      if (!this.tpcid) {
        this.reset()

        return Promise.resolve()
      }

      return this.$service('tpcs').get(this.tpcid).then((res) => {
        let formModel = res
        this.formModel = formModel

        this.$emit('load', this.formModel)
        
        return formModel
      })
    }
  }
}

</script>

<style lang="less" scoped>
.tpc-editor {
  height: 650px;
}

.editor-header {
  border-bottom: 1px solid @border-color;
}

.editor-body {
  height: calc(100% - 45px);
  display: flex;

  .body-main {
    flex: 1;
  }

  .body-right {
    background: @bg-color;
    width: 360px;
    height: 100%;
  }
}
</style>

<style lang="less">
.tpc-editor {
  .editor-header {
    .title-input {
      padding-right: 20px;

      .ivu-input-word-count {
        background: @bg-color;
      }

      input {
        border: 0;
        font-size: 16px;
        background: @bg-color;
      }
    }
  }
}
</style>
