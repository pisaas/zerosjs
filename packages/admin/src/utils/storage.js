import * as localforage from 'localforage'

let __storage = localforage.createInstance({
  driver: localforage.LOCALSTORAGE,
  name: 'zero-storage'
})

export default __storage