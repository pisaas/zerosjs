import Vue from 'vue'

import createApp from './app.js'

// import pValidator from '../plugins/validator.js'
// import pIO        from '../plugins/io.js'
import pApp       from '../plugins/app.js'
import pMedia     from '../plugins/media.js'
import pCmpt      from '../plugins/cmpt.js'
// import pResc      from '../plugins/resc.js'

Vue.config.devtools = true
Vue.config.productionTip = false

const { app, store, router } = createApp()

;[
  // pValidator, pIO,
  pApp,
  pMedia,
  pCmpt,
  // pResc
].forEach(plugin => {
  plugin({
    app,
    router,
    store,
    Vue,
    ssrContext: null
  })
})

app.store.dispatch('app/load', {
  // initialState
}).then(() => {
  app.store.commit('app/setAppInitialized', true)
  new Vue(app)
})
