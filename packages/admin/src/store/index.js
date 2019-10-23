import Vue from 'vue'
import Vuex from 'vuex'

import app from './modules/app'
import usr from './modules/usr'
// import msg from './modules/msg'

Vue.use(Vuex)

export default function () {
  const Store = new Vuex.Store({
    plugins: [],
    state: {},
    modules: {
      app,
      usr,
      // msg
    }
  })

  return Store
}
