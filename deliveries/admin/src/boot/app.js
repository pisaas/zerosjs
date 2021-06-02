import App from '../App.vue'
import createStore from '../store'
import createRouter from '../router'

export default function (Vue) {
  // create store and router instances
  const store = typeof createStore === 'function'
    ? createStore()
    : createStore

  const router = typeof createRouter === 'function'
    ? createRouter({ store })
    : createRouter

  // make router instance available in store
  store.$router = router

  // Create the app instantiation Object.
  // Here we inject the router, store to all child components,
  // making them available everywhere as `this.$router` and `this.$store`.
  const app = {
    vm: Vue,
    el: '#pi-zeros-app',
    router,
    store,
    render: h => h(App)
  }

  // expose the app, the router and the store.
  // note we are not mounting the app here, since bootstrapping will be
  // different depending on whether we are in a browser or on the server.
  return {
    app,
    store,
    router
  }
}
