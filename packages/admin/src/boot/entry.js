import Vue from 'vue'

import uni from '../utils/uni'
import createZero from './zero'

// import pValidator from '../plugins/validator'
// import pIO        from '../plugins/io'
import pZero         from '../plugins/zero'
import pMedia        from '../plugins/media'
import pCmpt         from '../plugins/cmpt'
// import pResc      from '../plugins/resc'

Vue.config.devtools = true
Vue.config.productionTip = false

const { zero, store, router } = createZero()

;[
  // pValidator, pIO,
  pZero,
  pMedia,
  pCmpt,
  // pResc
].forEach(plugin => {
  plugin({
    zero,
    router,
    store,
    Vue
  })
})

function newVue (config) {
  config = Object.assign(zero, config)
  new Vue(config)
}

store.dispatch('zero/load', {
  silent: true
}).then((res) => {
  let isLogin = store.getters['usr/isLogin']

  if (!isLogin) {
    return newVue()
  }

  return uni.getAppId().then((appId) => {
    if (!appId) {
      return newVue()
    }

    return store.dispatch('app/load', {
      id: appId
    }).then(() => {
      newVue()
    })
  })
}).catch((error) => {
  store.commit('zero/error', error)
  
  newVue()
})
