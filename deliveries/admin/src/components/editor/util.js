
import { findParentNode, findSelectedNodeOfType } from 'prosemirror-utils'

export function getSelectionNode (editor, type) {
  let nodeType = editor.schema.nodes[type]
  let state = editor.state

  const predicate = node => node.type === nodeType
  const node = findSelectedNodeOfType(type)(state.selection)
    || findParentNode(predicate)(state.selection)

  return node
}