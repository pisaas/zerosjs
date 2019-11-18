import { addItemsToList, removeItemFromList } from '../../util'

export function setCatList (state, payload) {
  if (!payload) {
    return
  }

  let list = addItemsToList(state.catList, payload.items, false, 'sn')

  state.catList = Object.assign({}, list)
}

export function removeCat (state, payload) {
  if (!payload || !payload.id) {
    return
  }

  let { id } = payload

  let list = removeItemFromList(state.catList, id)

  state.catList = Object.assign({}, list)
}

