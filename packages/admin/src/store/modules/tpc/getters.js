import _ from 'lodash'

export function catItems (state) {
  if (!state.catList) {
    return []
  }
  return state.catList.items || []
}

export function catTree (state) {
  let items = catItems(state)

  if (!items.length) {
    return []
  }

  let srcItems = items.concat()

  let rootItems = _.remove(srcItems, (it) => {
    return it.pid === '0'
  })
  
  setChildren(rootItems, srcItems)

  return rootItems
}

function setChildren (items, srcItems) {
  items.forEach((it) => {
    it.value = it.id
    it.label = it.name

    let children = _.remove(srcItems, (sIt) => {
      return sIt.pid === it.id
    })

    if (!children || !children.length) {
      return
    }

    it.children = children
    
    setChildren(it.children, srcItems)
  })
}