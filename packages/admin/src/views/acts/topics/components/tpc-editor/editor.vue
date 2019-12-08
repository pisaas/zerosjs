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
        <Button :disabled="!isAllowed('save')" @click="onSave">保存</Button>
        &nbsp;
        <Button :disabled="!isAllowed('pub')" @click="onPublish">发布</Button>
      </div>
    </div>
    <div class="editor-body">
      <template v-if="catid">
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
import { getTopicCat, getTopicCatPathNames } from '../../common'

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
    catid () {
      if (!this.formModel) {
        return null
      }
      return this.formModel.catid
    },

    catPathNamesStr () {
      let pathNames = getTopicCatPathNames(this.catid)

      if (!pathNames || !pathNames.length) {
        return ''
      }

      return pathNames.join('/')
    }
  },

  mounted () {
  },

  methods: {
    onSave () {
      this.save()
    },

    onPublish () {
      this.$app.confirm({
        title: '发布话题',
        content: `<p>话题将被发布到“${this.catPathNamesStr}”分类下！确认发布？</p>`,
        onOk: () => {
          this.publish()
        }
      })
    },

    onCatChange (val, data) {
    },

    load (tpcid) {
      return this.loadUpdate(tpcid)
    },

    loadCreate (catid) {
      this.reset()
      this.editMode = 'create'

      if (catid) {
        this.$set(this.formModel, 'catid', catid)
      }

      return Promise.resolve()
    },

    loadUpdate (tpcid) {
      this.reset()
      this.editMode = 'update'
      this.tpcid = tpcid

      return this.loadData()
    },

    reset () {
      this.tpcid = null
      this.formModel = {
        name: '标题'
      }

      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }

      if (this.$refs.selCat) {
        this.$refs.selCat.reset()
      }
    },

    async save () {
      let editMode = this.editMode
      let formModel = this.formModel

      let valid = await this.validate()

      if (!valid) {
        return false
      }

      let tpcService = this.$service('tpcs')

      let result = null

      if (editMode === 'create') {
        result = await tpcService.create(formModel)
      } else {
        result = await tpcService.patch(this.tpcid, formModel)
      }

      this.$app.toast('保存成功！', { type: 'success' })

      this.$emit('save', result)
    },

    async publish () {
      let formModel = this.formModel

      let valid = await this.validate({ publish: true })

      if (!valid) {
        return false
      }

      let tpcService = this.$service('tpcs')
      let result = await tpcService.patch(this.tpcid, {
        verb: 'publish',
        data: formModel
      })

      this.$app.toast('发布成功！', { type: 'success' })

      this.$emit('publish', result)

      return result
    },

    async validate (options) {
      options = Object.assign({}, options)

      let formModel = this.formModel

      if (!formModel || !formModel.catid) {
        this.$app.toast('请选择话题分类。')
        return false
      } else if (!formModel.name) {
        this.$app.toast('请提供话题标题。')
        return false
      }

      if (options.publish) {
        if (!formModel.cont || formModel.cont.length < 10) {
          this.$app.toast('话题内容不能少于5字。')
          return false
        }
      }
      
      return true
    },

    isAllowed (action) {
      let formModel = this.formModel || {}

      switch (action) {
        case 'save':
        case 'pub':
          return formModel.name && formModel.catid
      }
      return true
    },

    loadData () {
      if (!this.tpcid) {
        this.reset()

        return Promise.resolve()
      }

      return this.$service('tpcs').get(this.tpcid).then((res) => {
        let formModel = _.pick(res, [
          'id', 'catid', 'name', 'data', 'cont'
        ])

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
      width: 680px;

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
