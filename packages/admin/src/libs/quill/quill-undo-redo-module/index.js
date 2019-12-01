import classNames from 'classnames'

// 在toolbar上展示redo undo功能
export default class RedoUndo {
  constructor(quill, options) {
    if (!options) {
      return
    }

    this.quill = quill
    this.options = Object.assign({}, options)

    this.undoEl = document.querySelector(".ql-toolbar .ql-undo")
    this.redoEl = document.querySelector(".ql-toolbar .ql-redo")

    quill.on('editor-change', this.update.bind(this))

    // let toolbarHandleOptions = quill.options.modules.toolbar.handlers

    // if (!toolbarHandleOptions.undo) {
    //   toolbarHandleOptions.undo = this.undo.bind(this)
    // }

    // if (!toolbarHandleOptions.redo) {
    //   toolbarHandleOptions.redo = this.redo.bind(this)
    // }

    this.update()
  }

  update () {
    let quill = this.quill

    let disableUndo = !quill.history.stack.undo.length
    let disableRedo = !quill.history.stack.redo.length

    let baseClass = "ivu-icon ql-icon"

    let undoCls = classNames([baseClass, {
      "ivu-icon-ios-undo": true,
      "ql-icon-undo": true,
      "disabled": disableUndo
    }])

    let redoCls = classNames([baseClass, {
      "ivu-icon-ios-redo": true,
      "ql-icon-redo": true,
      "disabled": disableRedo
    }])

    if (this.undoEl) {
      this.undoEl.innerHTML = `<i class="${undoCls}" />`
    }

    if (this.redoEl) {
      this.redoEl.innerHTML = `<i class="${redoCls}" />`
    }
  }

  undo () {
    console.log('undo ------>')
    this.quill.history.undo()
  }

  redo () {
    console.log('redo ------>')
    this.quill.history.redo()
  }
}