import Vue from 'vue'
import Vuex from 'vuex'

import zero from './modules/zero'
import app from './modules/app'
import usr from './modules/usr'

Vue.use(Vuex)

export default function () {
  const Store = new Vuex.Store({
    plugins: [],
    state: {},
    modules: { zero, app, usr }
  })

  return Store
}
