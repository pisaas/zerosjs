import uni from '@/utils/uni'
import apis from '@/apis'

export async function loadCats ({ commit, state }, payload) {
  let { pid } = payload

  if (!pid) {
    return
  }

  let catService = apis.service('cats')

  // 最多只获取50条记录
  let catRes = await catService.find({
    query: {
      taxid: 'topic',
      pid,
      $limit: 50,
      $sort: { sn: 1, id: 1 }
    }
  })

  let items = catRes.data.map((it) => {
    it.level = (it.path.split('.').length - 1)
    return it
  })

  commit('setCatList', { items })
}

export async function removeCat ({ commit, state }, payload) {
  let { id } = payload

  if (!id) {
    return
  }

  let catService = apis.service('cats')

  await catService.remove(id)

  commit('removeCat', { id })
}
