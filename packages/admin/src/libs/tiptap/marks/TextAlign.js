import { Mark } from 'tiptap'
import { updateMark, markInputRule, removeMark, toggleMark } from 'tiptap-commands'

export default class TextAlign extends Mark {
  get name() {
    return 'text_align';
  }

  get schema() {
    return {
      attrs: {
        align: {
          default: 'left',
        },
      },
      parseDOM: [
        {
          style: 'text-align',
          getAttrs: value => ({ align: value }),
        },
      ],
      toDOM: mark => ['span', { style: `text-align: ${mark.attrs.align};display: block` }, 0],
    };
  }

  commands({ type }) {
    return attrs => {
      if (attrs.align === 'left') {
        return removeMark(type, attrs)
      }

      // return updateMark(type, attrs);
      return toggleMark(type, attrs)
    }
  }

  inputRules({ type }) {
    return [
      markInputRule(/(?:\*\*|__)([^*_]+)(?:\*\*|__)$/, type),
    ];
  }
}