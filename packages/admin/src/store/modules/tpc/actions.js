import apis from '@/apis'
import { getItemFromList } from '../../util'

export async function loadAllCats ({ commit, state }, payload) {
  let { force } = payload

  let catList = state.catList

  if (!force && catList && catList.all === true) {
    return catList
  }

  let catService = apis.service('cats')

  let catRes = await catService.find({
    query: {
      taxid: 'topic',
      $limit: 1000
    }
  })

  let items = catRes.data.map((it) => {
    it.level = (it.path.split('.').length - 1)
    return it
  })

  if (items && items.length) {
    commit('setAllCatList', { items })
  }

  return state.catList
}

export async function loadCats ({ commit, state }, payload) {
  let { pid, ids } = payload

  if (!pid && (!ids || !ids.length)) {
    return
  }

  let catService = apis.service('cats')

  let $or = []

  if (pid) {
    $or.push({ pid })
  }

  if (ids && ids.length) {
    $or.push({ id: { $in: ids } })
  }

  let query = {
    taxid: 'topic'
  }

  if ($or.length === 1) {
    query = Object.assign(query, $or[0])
  } else {
    query.$or = $or
  }

  // 最多只获取50条记录
  let catRes = await catService.find({ query })

  let items = catRes.data.map((it) => {
    it.level = (it.path.split('.').length - 1)
    return it
  })

  commit('setCatList', { items })
}

export async function removeCat (context, payload) {
  let { id } = payload

  if (!id) {
    return
  }

  let catList = context.state.catList
  let item = getItemFromList(catList, id)

  if (!item) {
    return
  }

  let catService = apis.service('cats')

  await catService.remove(id)

  context.commit('removeCat', { id })

  await loadCats.call(this, context, { pid: item.pid, ids: [ item.pid ] })
}

