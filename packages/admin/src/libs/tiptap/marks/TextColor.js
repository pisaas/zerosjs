import { Mark } from 'tiptap'
import { removeMark, updateMark } from 'tiptap-commands'

export default class TextColor extends Mark {
  get name () {
    return 'text_color'
  }

  get defaultOptions () {
    return {
      color: ['red'],
    }
  }

  get schema () {
    return {
      attrs: {
        color: {
          default: 'rgba(0,0,0,1)',
        },
      },
      parseDOM: this.options.color.map(color => ({
        tag: `span[style="color:${color}"]`,
        attrs: { color },
      })),
      toDOM:
        node => {
          return ['span', {
            style: `color:${node.attrs.color}`
          }, 0]
        }
    }
  }

  commands ({ type }) {
    return (attrs) =>{
      if (!attrs.color) {
        return removeMark(type, attrs)
      }

      return updateMark(type, attrs)
    }
  }
}