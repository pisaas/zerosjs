// 暂时文档字数功能
export default class WordCounter {
  constructor(quill, options) {
    if (!options) {
      return
    }

    this.quill = quill

    this.options = Object.assign({
      label: '字数:'
    }, options)
    
    this.container = document.querySelector(options.container)
    
    quill.on('text-change', this.update.bind(this))

    this.update()
  }

  update () {
    const quill = this.quill

    let length = this.calculate()
    let label = this.options.label
    let maxlength = this.options.maxlength

    let showText = `${label} ${length}`

    if (maxlength) {
      if (length > maxlength) {
        quill.deleteText(maxlength, length)
      }

      length = this.calculate()
      showText = `${label} ${length}/${maxlength}`
    }

    this.container.innerText = showText
  }

  calculate () {
    let length = this.quill.getLength()
    return length
  }
}