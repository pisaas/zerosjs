import { Node, Plugin } from 'tiptap'
import { nodeInputRule } from 'tiptap-commands'

import ImageView from './view'

export default class Image extends Node {
  get name () {
    return 'image'
  }

  get schema() {
    return {
      attrs: {
        src: { default: 'http://' },
        width: { default: '100%' },
      },
      inline: true,
      group: 'inline',
      draggable: true,
      parseDOM: [
        {
          tag: 'img',
          getAttrs: (dom) => {
            return {
              src: dom.getAttribute('src'),
              width: dom.style.width
            }
          },
        }
      ],
      toDOM: node => ['img', { src: node.attrs.src, style: `width: ${node.attrs.width};` }],
    }
  }

  commands({ type }) {
    return attrs => (state, dispatch) => {
      const { $from } = state.selection
      if (!$from.parent.canReplaceWith($from.index(), $from.index(), type)) {
        return
      }
      dispatch(state.tr.replaceSelectionWith(type.create(attrs)))
    }
  }

  get view () {
    return ImageView
  }

  // get view () {
  //   return {
  //     props: ['node', 'view'],
  //     methods: {
  //     },
  //     render (h) {
  //       return h('div', 'Image')
  //     }
  //   }
  // }

  stopEvent (event) {
    const isMousedown = event.type === 'mousedown'
    const isCopy = event.type === 'copy'
    const isPaste = event.type === 'paste'
    const isCut = event.type === 'cut'
    const isDrag = event.type.startsWith('drag') || event.type === 'drop'

    if (isMousedown || isDrag || isCopy || isPaste || isCut) {
      return false
    }

    return true
  }
}

function getSimpleView () {
  return {
    props: ['node', 'view'],
    methods: {
    },
    render (h) {
      return h('div', 'Image')
    }
  }
}
