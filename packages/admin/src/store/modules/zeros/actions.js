import apis from '@/apis'

export function load ({ commit, state }, payload) {
  const { type } = (payload || { type: 'initial' })
  
  return apis.service.reAuthenticate().then((res) => {
    let data = res || {}
    if (data.user) {
      this.commit('usr/setBasic', data.user)
    }

    commit('setInitialized', true)
  })
}

export function login ({ commit, state }, payload) {
  let data = Object.assign({
    strategy: 'local',
    silentError: true
  }, payload)

  return apis.service.authenticate(data)
}
