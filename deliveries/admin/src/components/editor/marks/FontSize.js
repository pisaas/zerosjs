import { Mark } from 'tiptap'
import { updateMark, markInputRule, removeMark, toggleMark } from 'tiptap-commands'

export default class FontSize extends Mark {
  get name() {
    return 'font_size';
  }

  get schema() {
    return {
      attrs: {
        size: {
          default: false,
        },
      },
      parseDOM: [
        {
          style: 'font-size',
          getAttrs: mark => mark.indexOf('px') !== -1 ? { size: mark } : ''
        },
      ],
      toDOM: mark => ['span', { style: `font-size: ${mark.attrs.size};` }, 0],
    };
  }

  commands({ type }) {
    return attrs => {
      if (!attrs.size) {
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