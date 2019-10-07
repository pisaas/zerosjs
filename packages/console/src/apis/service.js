import io from 'socket.io-client'
import feathers from '@feathersjs/client'

// for rest api
// const feathers = require('@feathersjs/feathers')
// const rest = require('@feathersjs/rest-client')
import { apiDomain } from '../env'

const socket = io(`${apiDomain}`)

const client = feathers()

client.configure(feathers.socketio(socket))
client.configure(feathers.authentication({
  storageKey: 'zero-token'
}))

function clientService(path) {
  return client.service(`api/console/${path}`)
}

Object.assign(clientService, client)

// for rest api
// const client = feathers();
// const restClient = rest('/api')
// client.configure(restClient.fetch(window.fetch));

// client.service('users').get('101').then((res) => {
//   console.log("service('users') get ------->", res)
// })

export default clientService
