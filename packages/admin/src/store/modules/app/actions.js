import uni from '@/utils/uni'
import apis from '@/apis'

export function load ({ commit, state }, payload) {
  let { id } = payload

  return apis.service.loadApp(id).then((res) => {
    if (!res || !res.id) {
      return null
    }

    let data = res
    commit('setBasic', data)

    return data
  })
}

// 重新加载
export async function reload(context, payload) {
  const { commit, getters } = context
  let { id, force } = payload
  id = id || apis.service.getAppId()

  if (!id) {
    id = await uni.getAppId()
  }
  
  let appBasic = getters['basic']

  if (!id) {
    if (force === true) {
      commit('setBasic', null)
      appBasic = null
    }

    return appBasic
  }

  if (force !== true && appBasic && appBasic.id === id) {
    return appBasic
  }

  appBasic = await load(context, { id })
  
  return appBasic
}
