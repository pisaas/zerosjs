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
