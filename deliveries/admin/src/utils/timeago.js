/**
 * 字符串帮助方法
 */
import { format, render, cancel, register } from 'timeago.js'

export function _format (time) {
  return format(time, 'zh_CN')
}

export function _render (el) {
  return render(el, 'zh_CN')
}

export default {
  format: _format,
  render: _render,
  cancel,
  register
}
