import { Quill } from 'vue2-editor'

const BlockEmbed = Quill.import('blots/block/embed');

const ATTRIBUTES = ['controls', 'width', 'height'];

export default class AudioBlot extends BlockEmbed {
  static create({ data, options }) {
    let node = super.create()
    node.setAttribute('src', data.path)

    node.setAttribute('frameborder', '0');
    node.setAttribute('allowfullscreen', true);

    return node;
  }

  static formats(domNode) {
    return ATTRIBUTES.reduce((formats, attribute) => {
      if (domNode.hasAttribute(attribute)) {
        formats[attribute] = domNode.getAttribute(attribute);
      }
      return formats;
    }, {});
  }

  static value(node) {
    return node.getAttribute('src')
  }

  format(name, value) {
    if (ATTRIBUTES.indexOf(name) > -1) {
      if (value) {
        this.domNode.setAttribute(name, value);
      } else {
        this.domNode.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }
  }

  html() {
    const { audio } = this.value();
    return `<a href="${audio}">${audio}</a>`;
  }
}

AudioBlot.blotName = 'zerosAudio'
AudioBlot.className = 'ql-zeros-audio';
AudioBlot.tagName = 'iframe'
