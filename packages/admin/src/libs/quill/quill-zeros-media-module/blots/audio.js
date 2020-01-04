import { Quill } from 'vue2-editor'

const BlockEmbed = Quill.import('blots/block/embed');

export default class AudioBlot extends BlockEmbed {
  static create({ data, options }) {
    debugger
    let node = super.create();
    node.setAttribute('src', data.path);
    // Set non-format related attributes with static values
    node.setAttribute('frameborder', '0');
    node.setAttribute('allowfullscreen', true);

    return node;
  }

  static formats(node) {
    // We still need to report unregistered embed formats
    let format = {};
    if (node.hasAttribute('height')) {
      format.height = node.getAttribute('height');
    }
    if (node.hasAttribute('width')) {
      format.width = node.getAttribute('width');
    }
    return format;
  }

  static value(node) {
    return node.getAttribute('src');
  }

  format(name, value) {
    // Handle unregistered embed formats
    if (name === 'height' || name === 'width') {
      if (value) {
        this.domNode.setAttribute(name, value);
      } else {
        this.domNode.removeAttribute(name, value);
      }
    } else {
      super.format(name, value);
    }
  }
}

AudioBlot.blotName = 'zerosAudio'
AudioBlot.className = 'ql-zeros-audio';
AudioBlot.tagName = 'iframe'
