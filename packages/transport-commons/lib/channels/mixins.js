const Debug = require('debug');
const { Channel } = require('./channel/base');
const { CombinedChannel } = require('./channel/combined');

const debug = Debug('@zerosjs/transport-commons:channels/mixins');
const PUBLISHERS = Symbol('@zerosjs/transport-commons/publishers');
const CHANNELS = Symbol('@zerosjs/transport-commons/channels');
const ALL_EVENTS = Symbol('@zerosjs/transport-commons/all-events');

const keys = {
  PUBLISHERS: PUBLISHERS,
  CHANNELS: CHANNELS,
  ALL_EVENTS: ALL_EVENTS
}

function channelMixin () {
  const mixin = {
    [CHANNELS]: {},

    channel (...names) {
      debug('Returning channels', names);

      if (names.length === 0) {
        throw new Error('app.channel needs at least one channel name');
      }

      if (names.length === 1) {
        const [ name ] = names;

        if (Array.isArray(name)) {
          return this.channel(...name);
        }

        if (!this[CHANNELS][name]) {
          const channel = new Channel();

          channel.once('empty', () => {
            channel.removeAllListeners();
            delete this[CHANNELS][name];
          });

          this[CHANNELS][name] = channel;
        }

        return this[CHANNELS][name];
      }

      const channels = names.map(name => this.channel(name));

      return new CombinedChannel(channels);
    }
  };

  return mixin;
}

function publishMixin () {
  const result = {
    [PUBLISHERS]: {},

    publish (...args) {
      return this.registerPublisher(...args);
    },

    registerPublisher (event, publisher) {
      debug('Registering publisher', event);

      if (!publisher && typeof event === 'function') {
        publisher = event;
        event = ALL_EVENTS;
      }

      // @ts-ignore
      if (this._serviceEvents && event !== ALL_EVENTS && this._serviceEvents.indexOf(event) === -1) {
        throw new Error(`'${event.toString()}' is not a valid service event`);
      }

      const publishers = this[PUBLISHERS];

      publishers[event] = publisher;

      return this;
    }
  };

  return result;
}

module.exports = {
  keys,
  channelMixin,
  publishMixin
}
