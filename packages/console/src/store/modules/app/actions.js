import apis from '@/apis'

export function load ({ commit, state }, payload) {
  const { type, initialState } = (payload || { type: 'initial' })

  return apis.service.reAuthenticate().then((res) => {
    let data = res || {}

    if (data.user) {
      this.commit('usr/setUserBasic', data.user)
    }
  })
}

export function login ({ commit, state }, payload) {
  let data = Object.assign({
    strategy: 'local'
  }, payload)

  return apis.service.authenticate(data).then((res) => {
    window.location.reload()
  })
}
