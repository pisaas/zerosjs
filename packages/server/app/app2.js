const path = require('path');
const favicon = require('serve-favicon');
const compress = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const { logger } = require('./common');

const feathers = require('@feathersjs/feathers');

const socketio = require('@zerosjs/socketio');
const socketioRedis = require('socket.io-redis');
const express = require('@zerosjs/express');

const configuration = require('./configuration');
const services = require('./services');
const appHooks = require('./app.hooks');
const channels = require('./channels');

const authentication = require('./authentication');

const data = require('./data');
const apis = require('./apis');

const app = express(feathers());

// Load app configuration
app.configure(configuration());

// Enable security, CORS, compression, favicon and body parsing
app.use(helmet());
app.use(cors());
app.use(compress());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(favicon(path.join(app.get('public'), 'favicon.ico')));
// Host the public folder
app.use('/', express.static(app.get('public')));

// Set up Plugins and providers
app.configure(express.rest());
app.configure(socketio((io) => {
  io.adapter(socketioRedis(app.get('socketio').redis));
}));

app.configure(data);

app.configure(authentication);

// Set up our services (see `services/index.js`)
app.configure(services);

// Set up event channels (see `channels/index.js`)
app.configure(channels);

// Set up apis (see `apis/index.js`)
app.configure(apis);

// Configure a middleware for 404s and the error handler
app.use(express.notFound());
app.use(express.errorHandler({ logger }));

app.hooks(appHooks);

module.exports = app;
