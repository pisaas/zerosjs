import { Node, Plugin } from 'tiptap'
import AudioView from './view'

export default class Audio extends Node {
  get name () {
    return 'audio'
  }

  get schema() {
    return {
      attrs: {
        dataSetup: {}
      },
      group: 'block',
      draggable: true,
      parseDOM: [
        {
          tag: 'audio',
          getAttrs: (dom) => {
            let dataSetupStr = dom.getAttribute('data-setup')
            let src = dom.getAttribute('src')

            let dataSetup = {}
            if (dataSetupStr) {
              dataSetup = JSON.parse(dataSetupStr)
            }

            return { dataSetup }
          },
        }
      ],
      toDOM: node => ['video', {
        'data-setup': JSON.stringify(node.attrs.dataSetup || {}),
        'class': 'video-js'
      }],
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

  // get view () {
  //   return AudioView
  // }

  // stopEvent (event) {
  //   const isMousedown = event.type === 'mousedown'

  //   if (isMousedown) {
  //     return false
  //   }

  //   return true
  // }
}
