import { Mark } from 'tiptap'
import { removeMark, updateMark, markInputRule } from 'tiptap-commands'

export default class FillColor extends Mark {
  get name() {
    return 'fill_color'
  }

  get schema() {
    return {
      attrs: {
        color: {
          default: '#ffffff',
        },
      },
      parseDOM: [{
        style: 'background-color',
        getAttrs: mark => (mark.indexOf('rgb') !== -1 ? { color: mark } : '')
      }],
      toDOM: mark => ['span', { style: `background-color: ${mark.attrs.color}` }, 0],
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

  inputRules({ type }) {
    return [
      markInputRule(/(?:\*\*|__)([^*_]+)(?:\*\*|__)$/, type),
    ]
  }
}