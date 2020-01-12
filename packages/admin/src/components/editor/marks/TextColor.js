import { Mark } from 'tiptap'
import { removeMark, updateMark, markInputRule } from 'tiptap-commands'

export default class TextColor extends Mark {
  get name () {
    return 'text_color'
  }

  get schema () {
    return {
      attrs: {
        color: {
          default: '#000000',
        },
      },
			parseDOM: [{
				style: 'color',
				getAttrs: mark => mark.indexOf('rgb') !== -1 ? { color: mark } : ''
			}],
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

  inputRules({ type }) {
    return [
      markInputRule(/(?:\*\*|__)([^*_]+)(?:\*\*|__)$/, type),
    ]
  }
}