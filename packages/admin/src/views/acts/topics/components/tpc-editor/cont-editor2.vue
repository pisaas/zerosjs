<template>
  <div class="tpc-cont-editor tiptap">
    <editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
      <div class="editor-menubar">
        <ButtonGroup>
          <Button :disabled="!isUndo" @click="commands.undo" icon="md-undo" />
          <Button :disabled="!isRedo" @click="commands.redo" icon="md-redo" />
        </ButtonGroup>
        <ButtonGroup class="q-ml-sm">
          <Button class="text-bold" :class="{'active': isActive.bold()}" @click="commands.bold">B</Button>
          <Button :class="{'active': isActive.italic()}" @click="commands.italic"><u>I</u></Button>
          <Button class="text-underline" :class="{'active': isActive.underline()}" @click="commands.underline">U</Button>
          <Button :class="{'active': isActive.strike()}" @click="commands.strike"><s>S</s></Button>
        </ButtonGroup>

        <ButtonGroup class="q-ml-sm">
          <Button :class="{'active': isActive.paragraph()}" @click="commands.paragraph">P</Button>
        </ButtonGroup>

        <Select class="q-ml-sm sel-header" :value="headerLevel" @on-change="onHeaderChange">
          <Option v-for="it in HeaderLevels" :class="`h${it}`" :value="it" :key="it">Header {{ it }}</Option>
          <Option :value="0">Normal</Option>
        </Select>

        <ButtonGroup class="q-ml-sm">
          <Button :class="{'active': isActive.blockquote()}" @click="commands.blockquote" icon="md-quote" />
          <Button :class="{'active': isActive.code_block()}" @click="commands.code_block" icon="md-code-working" />
        </ButtonGroup>

        <ButtonGroup class="q-ml-sm">
          <Button :class="{'active': isActive.bullet_list()}" @click="commands.bullet_list" icon="md-list" />
          <Button :class="{'active': isActive.ordered_list()}" @click="commands.ordered_list" icon="md-reorder" />
        </ButtonGroup>

        <ButtonGroup class="q-ml-sm">
          <Button @click="commands.horizontal_rule" icon="md-remove" />
        </ButtonGroup>

        <ButtonGroup class="q-ml-sm">
          <Button @click="onLinkEdit" icon="md-link" />
          <Button @click="$refs.imageSelectorModal.open()" icon="md-image" />
          <Button @click="$refs.audioSelectorModal.open()" icon="md-musical-notes" />
          <Button @click="$refs.videoSelectorModal.open()" icon="md-film" />
        </ButtonGroup>
      </div>
    </editor-menu-bar>

    <editor-menu-bubble ref="menuBubble" :editor="editor" v-slot="{ commands, isActive, menu }"
      @hide="onMenuBubbleHide">
      <div class="menububble" :class="{ 'active': isMenuBubbleActive }"
        :style="`left: ${menu.left + menuBubblePosAdjust.x}px; bottom: ${menu.bottom}px;`">
        <div v-if="isLinkActive" class="link-editor form-panel">
          <div class="form-label">链接地址:</div>
          <Icon class="form-close" type="md-close" @click="hideMenuBubble" />
          <Input v-model="linkUrl" placeholder="https://" clearable style="width: 200px" />
          <Button class="q-ml-sm" @click="onLinkConfirm">确定</Button>
        </div>
      </div>
    </editor-menu-bubble>

    <editor-content class="editor-content zero-view" :editor="editor" />

    <image-selector-modal ref="imageSelectorModal" single @selected="onImageSelected" />
    <audio-selector-modal ref="audioSelectorModal" single @selected="onAudioSelected" />
    <video-selector-modal ref="videoSelectorModal" single @selected="onVideoSelected" />
  </div>
</template>

<script>
import { findParentNode, findSelectedNodeOfType } from 'prosemirror-utils'
import { Editor, EditorContent, EditorMenuBar, EditorMenuBubble } from 'tiptap'
import {
  Blockquote, CodeBlock, HardBreak, Heading, HorizontalRule,
  OrderedList, BulletList, ListItem, TodoItem, TodoList,
  Bold, Code, Italic, Link, Strike, Underline,
  History, Image
} from 'tiptap-extensions'

import { ImageSelectorModal } from '@resc-components/image/selector'
import { AudioSelectorModal } from '@resc-components/audio/selector'
import { VideoSelectorModal } from '@resc-components/video/selector'

const HeaderLevels = [1, 2, 3]

export default {
  components: {
    EditorContent,
    EditorMenuBar,
    EditorMenuBubble,
    ImageSelectorModal,
    AudioSelectorModal,
    VideoSelectorModal
  },

  props: {
    value: [ Object, String ]
  },

  data () {
    return {
      HeaderLevels,
      isMenuBubbleActive: false,
      isLinkActive: false,
      linkUrl: null,

      content: this.value,
      editor: new Editor({
        extensions: [
          new Blockquote(),
          new BulletList(),
          new CodeBlock(),
          new HardBreak(),
          new Heading({ levels: HeaderLevels }),
          new HorizontalRule(),
          new ListItem(),
          new OrderedList(),
          new TodoItem(),
          new TodoList(),
          new Link(),
          new Bold(),
          new Code(),
          new Italic(),
          new Strike(),
          new Underline(),
          new History(),
          new Image(),
        ],
        content: this.value,
        onUpdate: ({ getHTML }) => {
          this.content = getHTML()
        }
      })
    }
  },

  computed: {
    editorState () {
      return this.editor.state
    },

    historyState () {
      return this.editorState.history$
    },

    selectionState () {
      return this.editorState.selection
    },

    isUndo () {
      return this.historyState.done.eventCount > 0
    },

    isRedo () {
      return this.historyState.undone.eventCount > 0
    },

    headerLevel () {
      let node = this.getSelectionNode('heading')

      if (!node || !node.node || !node.node.attrs) {
        return 0
      }

      return node.node.attrs.level || 0
    },

    menuBubblePosAdjust () {
      let x = 0, y = 0;

      if (this.isLinkActive) {
        x = 95;
        y = 0;
      }

      return { x, y }
    }
  },

  watch: {
    value (val) {
      if (val === this.content) {
        return
      }
      
      this.content = val
    },

    content () {
      this.$emit('input', this.content);
    }
  },

  mounted () {
  },

  beforeDestroy () {
    this.editor.destroy()
  },

  methods: {
    onMenuBubbleHide () {
      this.isMenuBubbleActive = false

      if (this.isLinkActive) {
        this.resetLink()
      }
    },

    onHeaderChange (level) {
      this.editor.commands.heading({ level })
    },

    onLinkEdit () {
      this.isLinkActive = true
      this.isMenuBubbleActive = true

      let attrs = this.editor.getMarkAttrs('link')

      if (!attrs) {
        return
      }

      this.linkUrl = attrs.href || null
    },

    onLinkConfirm () {
      this.editor.commands.link({ href: this.linkUrl })

      this.hideMenuBubble()
    },

    resetLink () {
      this.isLinkActive = false
      this.linkUrl = null
    },
    
    onImageSelected (e) {
      this.editor.commands.image({ src: e.thumb })
    },

    onAudioSelected (e) {
      this.insertMedia('zerosAudio', { data: e })
    },

    onVideoSelected (e) {
      this.insertMedia('zerosVideo', { data: e })
    },

    insertMedia (type, attrs) {
    },

    hideMenuBubble () {
      this.isMenuBubbleActive = false
      const { to } = this.editor.resolveSelection()

      setTimeout(() => {
        this.editor.setSelection(to, to)
      }, 500)
    },

    getSelectionNode (type) {
      let nodeType = this.editor.schema.nodes[type]
      let state = this.editor.state

      const predicate = node => node.type === nodeType
      const node = findSelectedNodeOfType(type)(state.selection)
        || findParentNode(predicate)(state.selection)

      return node
    },

    getPlugin (name) {
      let plugins = this.editorState.plugins.filter(plugin => !plugin.key.startsWith(`${name}$`))

      if (!plugins || !plugins.length) {
        return null
      }

      return plugins[0]
    }
  }
}
</script>

<style lang="less" scoped>
.tpc-cont-editor {
  position: relative;
  padding: 10px;
  height: 100%;
}

.editor-menubar {
  padding-bottom: 10px;
}

.editor-content {
  height: calc(100% - 40px);
  overflow: scroll;
  padding: 10px;
  border: 1px solid @border-color;
  border-radius: @border-radius;
}
</style>

<style lang="less">
.editor-menubar {
  button.ivu-btn {
    width: 28px;
    padding: 0;
  }

  .sel-header {
    width: 90px;
    font-weight: bold;

    .h1,.h2,.h3 { font-weight: bold; }

    .h1 { font-size: 2em !important; }
    .h2 { font-size: 1.5em !important; }
    .h3 { font-size: 1.17em !important; }
  }
}
</style>