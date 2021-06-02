<template>
  <div class="tpc-cont-editor tiptap">
    <editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
      <div class="editor-menubar">
        <div class="q-mb-sm">
          <ButtonGroup class="action-group">
            <Button :disabled="!isUndo" @click="commands.undo" icon="md-undo" />
            <Button :disabled="!isRedo" @click="commands.redo" icon="md-redo" />
          </ButtonGroup>

          <Select class="action-group sel-fontsize" :value="fontSize" @on-change="onFontSizeChange">
            <Option v-for="it in FontSizes" :value="it" :key="it"
              :style="`font-size: ${it} !important;`">{{ it || '14px' }}</Option>
          </Select>

          <!-- <Select class="action-group sel-header" :value="headerLevel" @on-change="onHeaderChange">
            <Option v-for="it in HeaderLevels" :class="`h${it}`" :value="it" :key="it">Header {{ it }}</Option>
            <Option :value="0">Normal</Option>
          </Select> -->

          <ButtonGroup class="action-group">
            <Button class="text-bold" :class="{'active': isActive.bold()}" @click="commands.bold">B</Button>
            <Button :class="{'active': isActive.italic()}" @click="commands.italic"><u>I</u></Button>
            <Button class="text-underline" :class="{'active': isActive.underline()}" @click="commands.underline">U</Button>
            <Button :class="{'active': isActive.strike()}" @click="commands.strike"><s>S</s></Button>
          </ButtonGroup>

          <ButtonGroup class="action-group">
            <Button :class="{'active': isTextAlign('left')}" @click="commands.text_align({ align: 'left' })">L</Button>
            <Button :class="{'active': isTextAlign('center')}" @click="commands.text_align({ align: 'center' })">C</Button>
            <Button :class="{'active': isTextAlign('right')}" @click="commands.text_align({ align: 'right' })">R</Button>
            <!-- <Button :class="{'active': isActive.paragraph()}" @click="commands.paragraph">P</Button> -->
          </ButtonGroup>

          <ButtonGroup class="action-group">
            <Button :class="{'active': isActive.blockquote()}" @click="commands.blockquote" icon="md-quote" />
            <Button :class="{'active': isActive.code_block()}" @click="commands.code_block" icon="md-code-working" />
          </ButtonGroup>

          <ButtonGroup class="action-group">
            <Button :class="{'active': isActive.bullet_list()}" @click="commands.bullet_list" icon="md-list" />
            <Button :class="{'active': isActive.ordered_list()}" @click="commands.ordered_list" icon="md-reorder" />
          </ButtonGroup>

          <ButtonGroup class="action-group relative">
            <Button @click="onColorSelect('text')" icon="md-color-wand" />
            <Button @click="onColorSelect('fill')" icon="md-color-palette" />
            <ColorPicker ref="colorPicker" class="sel-color"
              editable :value="colorValue"
              @on-change="onColorChange" @on-open-change="onColorOpen"/>
          </ButtonGroup>

          <ButtonGroup class="action-group">
            <Button @click="commands.horizontal_rule" icon="md-remove" />
          </ButtonGroup>
        </div>
        
        <div class="q-mb-sm">
          <ButtonGroup class="q-mr-sm">
            <Button @click="onLinkEdit" icon="md-link" />
            <Button @click="$refs.imageSelectorModal.open()" icon="md-image" />
            <Button @click="$refs.audioSelectorModal.open()" icon="md-musical-notes" />
            <Button @click="$refs.videoSelectorModal.open()" icon="md-film" />
          </ButtonGroup>
        </div>
      </div>
    </editor-menu-bar>

    <editor-menu-bubble ref="menuBubble" :editor="editor" v-slot="{ commands, isActive, menu }"
      @hide="onMenuBubbleHide">
      <div class="menububble" :class="{ 'active': (menu.isActive && isMenuBubbleActive) }"
        :style="`left: ${menu.left + menuBubblePosAdjust.x}px; bottom: ${menu.bottom}px;`">
        <div v-if="isLinkActive" class="link-editor form-panel">
          <div class="form-label">链接地址:</div>
          <Icon class="form-close" type="md-close" @click="hideMenuBubble" />
          <Input v-model="linkUrl" placeholder="https://" clearable style="width: 200px" />
          <Button class="q-ml-sm" @click="onLinkConfirm">确定</Button>
        </div>
      </div>
    </editor-menu-bubble>

    <editor-content class="editor zero-view" :editor="editor" />

    <image-selector-modal ref="imageSelectorModal" single @selected="onImageSelected" />
    <audio-selector-modal ref="audioSelectorModal" single @selected="onAudioSelected" />
    <video-selector-modal ref="videoSelectorModal" single @selected="onVideoSelected" />
  </div>
</template>

<script>
import { Editor, EditorContent, EditorMenuBar, EditorMenuBubble } from 'tiptap'
import {
  Blockquote, CodeBlock, HardBreak, Heading, HorizontalRule,
  OrderedList, BulletList, ListItem, TodoItem, TodoList,
  Bold, Code, Italic, Link, Strike, Underline,
  History, TrailingNode, Placeholder, Focus
} from 'tiptap-extensions'
import { TextAlign, TextColor, FontSize, FillColor, Image } from '@/components/editor'
import { getSelectionNode } from '@/components/editor/util'

import { ImageSelectorModal } from '@resc-components/image/selector'
import { AudioSelectorModal } from '@resc-components/audio/selector'
import { VideoSelectorModal } from '@resc-components/video/selector'

const HeaderLevels = [1, 2, 3]
const DefaultFontSize = '14px'
const FontSizes = ['12px', '14px', '15px', '16px', '17px', '18px', '20px', '24px']

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
      FontSizes,
      isMenuBubbleActive: false,
      isLinkActive: false,
      linkUrl: null,
      colorType: '',
      colorValue: '',

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
          new TrailingNode({ node: 'paragraph', notAfter: ['paragraph'], }),
          new Placeholder({
            emptyEditorClass: 'is-editor-empty',
            emptyNodeClass: 'is-empty',
            emptyNodeText: '点击这里开始创作吧 ...',
            showOnlyWhenEditable: true,
            showOnlyCurrent: true,
          }),
          // new Focus ({ className: 'ProseMirror-selectednode' }),
          new TextAlign(),
          new TextColor(),
          new FontSize(),
          new FillColor(),
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
      let node = this.getSelectionNode(this.editor, 'heading')

      if (!node || !node.node || !node.node.attrs) {
        return 0
      }

      return node.node.attrs.level || 0
    },

    fontSize () {
      let attrs = this.editor.getMarkAttrs('font_size')

      if (!attrs) {
        return DefaultFontSize
      }

      return attrs.size || DefaultFontSize
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
      if (level === 0) {
        this.editor.commands.paragraph()
      } else {
        this.editor.commands.heading({ level })
      }
    },

    onFontSizeChange (size) {
      if (size === DefaultFontSize) {
        size = false
      }

      this.editor.commands.font_size({ size })
    },

    onColorSelect (type) {
      this.colorType = type

      let colorPicker = this.$refs.colorPicker
      colorPicker.toggleVisible ()

      if (!colorPicker.visible) {
        this.$nextTick(() => {
          colorPicker.toggleVisible ()
        })
      }
    },

    onColorChange (color) {
      if (this.colorType === 'fill') {
        this.editor.commands.fill_color({ color })
      } else {
        this.editor.commands.text_color({ color })
      }
    },

    onColorOpen (open) {
      if (!open) {
        return
      }

      let attrs

      if (this.colorType === 'fill') {
        attrs = this.editor.getMarkAttrs('fill_color')
      } else {
        attrs = this.editor.getMarkAttrs('text_color')
      }

      if (!attrs) {
        this.colorValue = ''
      }
      
      this.colorValue = attrs.color || ''
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

    isTextAlign (type) {
      let align = this.editor.getMarkAttrs('text_align').align || 'left'
      return align === type
    },

    hideMenuBubble () {
      this.isMenuBubbleActive = false
      const { to } = this.editor.resolveSelection()

      setTimeout(() => {
        this.editor.setSelection(to, to)
      }, 500)
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
  padding: 5px 10px;
  height: 100%;
}

.editor {
  height: calc(100% - 80px);
  overflow: auto;
  padding: 10px;
  border: 1px solid @border-color;
  border-radius: @border-radius;
}

.link-editor {
  width: 250px;
}
</style>

<style lang="less">
.editor-menubar {
  .action-group {
    margin-right: 8px;

    &>button.ivu-btn {
      width: 28px;
      padding: 0;
    }
  }

  .sel-header {
    width: 90px;
    font-weight: bold;

    .h1,.h2,.h3 { font-weight: bold; }

    .h1 { font-size: 2em !important; }
    .h2 { font-size: 1.5em !important; }
    .h3 { font-size: 1.17em !important; }
  }

  .sel-fontsize {
    width: 70px;
  }

  .sel-color {
    position: absolute;
    left: 20px;
    top: 20px;

    .ivu-input {
      display: none;

      &-icon {
        display: none;
      }
    }
  }
}
</style>