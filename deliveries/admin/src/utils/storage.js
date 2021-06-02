import * as localforage from 'localforage'

let __storage = localforage.createInstance({
  driver: localforage.LOCALSTORAGE,
  name: 'zeros-storage'
})

export default __storage