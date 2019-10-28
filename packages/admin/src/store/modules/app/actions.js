import uni from '@/utils/uni'
import apis from '@/apis'

export function load ({ commit, state }, payload) {
  let { id } = payload

  return apis.service('apps').get(id).then((res) => {
    if (!res || !res.id) {
      return null
    }

    let data = res
    commit('setBasic', data)

    apis.service.setDefAppId(data.id)

    return uni.setDefAppId(data.id).then(() => {
      return data
    })
  }).catch(() => {
    return null
  })
}
