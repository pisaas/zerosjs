import Vue from 'vue'

import uni from '../utils/uni'
import createZeros from './zeros'

// import pValidator from '../plugins/validator'
// import pIO        from '../plugins/io'
import pZeros         from '../plugins/zeros'
import pMedia        from '../plugins/media'
import pCmpt         from '../plugins/cmpt'
// import pResc      from '../plugins/resc'

Vue.config.devtools = true
Vue.config.productionTip = false

const { zeros, store, router } = createZeros()

;[
  // pValidator, pIO,
  pZeros,
  pMedia,
  pCmpt,
  // pResc
].forEach(plugin => {
  plugin({
    zeros,
    router,
    store,
    Vue
  })
})

function newVue (config) {
  config = Object.assign(zeros, config)
  new Vue(config)
}

store.dispatch('zeros/load', {
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
  store.commit('zeros/error', error)
  
  newVue()
})
