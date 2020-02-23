import env from '../env'
import apis from '../apis'

/**
 * 实用方法
 */

export default {
  env,
  apis,
  getLatestListField,
  getLatestListId,
  getListPage,
  addItemsToList,
  removeItemFromList,
  filterExistsItems,
  sortBy
}

/**
 * 获取最近list 域
 * @param  {[type]} list [description]
 * @return {[type]}      [description]
 */
export function getLatestListField (list, fieldName) {
  let latest = null

  if (list && list.items && list.items.length) {
    latest = list.items[0][fieldName] || null
  }

  return latest
}

/**
 * 获取最近list id
 * @param  {[type]} list [description]
 * @return {[type]}      [description]
 */
export function getLatestListId (list) {
  let latestId = getLatestListField(list, 'id')
  return latestId
}

/**
 * 获取list页
 * @param  {[type]} list     [description]
 * @param  {[type]} pageSize [description]
 * @return {[type]}          [description]
 */
export function getListPage (list, pageSize) {
  let page = 1

  if (list && list.items) {
    page = (parseInt(list.items.length / pageSize) + 1)
  }

  return page
}

/**
 * 根据指定的key值获取item
 * @param  {[type]} list [description]
 * @param  {[type]} key  [description]
 * @param  {[type]} val  [description]
 * @return {[type]}      [description]
 */
export function getItemFromList (list, key, val) {
  list = list || {}
  let listItems = (list.items || [])

  if (val === undefined) {
    val = key
    key = 'id'
  }

  let item = null

  listItems.forEach((it) => {
    if (it[key] === val) {
      item = it
      return false
    }
  })

  return item
}

/**
 * [addItemsToList description]
 * @param {[type]} list      目标list
 * @param {[type]} newItems 新items
 * @param {[type]} lastPage 是否最后一页
 */
export function addItemsToList (list, newItems, lastPage, sort, existFilter) {
  list = list || {}
  sort = sort || -1
  let listItems = (list.items || [])

  newItems = (newItems || [])
  lastPage = (lastPage || false)

  // 获取所有id
  let newItemIds = newItems.map((it) => { return it.id })

  let filterFn = (it) => {
    return !newItemIds.includes(it.id)
  }

  if (existFilter) {
    filterFn = existFilter(newItems, newItemIds)
  }

  // 过滤掉已存在的项
  listItems = listItems.filter(filterFn).concat(newItems)

  let sortFn = null
  let sortKey = 'id'  // 排列
  let sortOrder = -1  // 倒序

  if (typeof sort === 'function') {
    sortFn = sort
  } else if (typeof sort === 'string') {
    sortKey = sort
  } else if (typeof sort === 'number') {
    sortOrder = sort
  } else if (typeof sort === 'object') {
    sortOrder = (sort.order || sortOrder)
    sortKey = (sort.key || sortKey)
  }

  if (sortFn) {
    // 反向排序
    listItems.sort(sortFn)
  } else {
    listItems = sortBy(listItems, sortKey, sortOrder)
  }

  list.items = listItems
  list.lastPage = lastPage

  return list
}

/**
 * 更新List中的Items, 如果存在则进行更新，不存在则放弃
 * @param {[type]} list      目标list
 * @param {[type]} newItems 需要更新的items
 * @param {[type]} lastPage 是否最后一页
 */
export function updateItemsToList (list, newItems, lastPage, sort) {
  newItems = (newItems || [])

  let listItemIds = (list.items || []).map((it) => {
    return it.id
  })

  newItems = newItems.filter((it) => {
    if (it.id && listItemIds.indexOf(it.id) >= 0) {
      return true
    }
    return false
  })

  addItemsToList(list, newItems, lastPage, sort)
}

/**
 * 移除item
 * @param  {[type]} list [description]
 * @param  {[type]} id [description]
 * @return {[type]}      [description]
 */
export function removeItemFromList (list, id, idKey) {
  idKey = idKey || 'id'

  list = list || {}
  let listItems = (list.items || [])

  listItems = listItems.filter((it) => {
    return id !== it[idKey]
  })

  list.items = listItems

  return list
}

/**
 * 过滤items，去掉在orgItems中已存在的记录
 * @param  {[type]} orgItems [description]
 * @param  {[type]} items    [description]
 * @param  {[type]} idKey  [description]
 * @return {[type]}          [description]
 */
export function filterExistsItems (items, orgItems, idKey) {
  idKey = idKey || 'id'

  if (!orgItems || !items) {
    return items
  }

  let fltItems = items.filter((it) => {
    let idVal = it[idKey]

    if (!idVal) {
      return false
    }

    let exists = orgItems.some((oit) => {
      return oit[idKey] === idVal
    })

    return !exists
  })

  return fltItems
}

export function sortBy (arr, sortKey, sortOrder) {
  if (!arr || !arr.length) {
    return arr
  }

  sortOrder = sortOrder || 1
  arr.sort((a, b) => {
    if (!a || !a[sortKey]) {
      return -1 * sortOrder
    }

    if (!b || !b[sortKey]) {
      return 1 * sortOrder
    }

    if (a[sortKey] === b[sortKey]) {
      return 0
    }

    return ((a[sortKey] > b[sortKey]) ? 1 : -1) * sortOrder
  })

  return arr
}
