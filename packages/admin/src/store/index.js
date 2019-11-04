import Vue from 'vue'
import Vuex from 'vuex'

import zeros from './modules/zeros'
import app from './modules/app'
import usr from './modules/usr'

Vue.use(Vuex)

export default function () {
  const Store = new Vuex.Store({
    plugins: [],
    state: {},
    modules: { zeros, app, usr }
  })

  return Store
}
