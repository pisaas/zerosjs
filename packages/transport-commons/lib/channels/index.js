const { compact, flattenDeep, noop } = require('lodash');
const { CombinedChannel } = require('./channel/combined');
const { channelMixin, publishMixin, keys } = require('./mixins');

const debug = require('debug')('@zerosjs/transport-commons/channels');
const { CHANNELS } = keys;

function channels () {
  return (app) => {
    if (typeof app.channel === 'function' && typeof app.publish === 'function') {
      return;
    }

    Object.assign(app, channelMixin(), publishMixin());
    Object.defineProperty(app, 'channels', {
      get () {
        return Object.keys(this[CHANNELS]);
      }
    });

    app.mixins.push((service, path) => {
      if (typeof service.publish === 'function' || !service._serviceEvents) {
        return;
      }

      Object.assign(service, publishMixin());

      // @ts-ignore
      service._serviceEvents.forEach((event) => {
        service.on(event, function (data, hook) {
          if (!hook) {
            // Fake hook for custom events
            hook = { path, service, app, result: data };
          }

          debug('Publishing event', event, hook.path);

          const servicePublishers = service[keys.PUBLISHERS];
          const appPublishers = app[keys.PUBLISHERS];
          // This will return the first publisher list that is not empty
          // In the following precedence
          const publisher = (
            // 1. Service publisher for a specific event
            servicePublishers[event] ||
            // 2. Service publisher for all events
            servicePublishers[keys.ALL_EVENTS] ||
            // 3. App publisher for a specific event
            appPublishers[event] ||
            // 4. App publisher for all events
            appPublishers[keys.ALL_EVENTS] ||
            // 5. No publisher
            noop
          );

          Promise.resolve(publisher(data, hook)).then(result => {
            if (!result) {
              return;
            }

            const results = Array.isArray(result) ? compact(flattenDeep(result)) : [result];
            const channel = new CombinedChannel(results);

            if (channel && channel.length > 0) {
              app.emit('publish', event, channel, hook, data);
            } else {
              debug('No connections to publish to');
            }
          });
        });
      });
    });
  };
}

module.exports = {
  keys,
  channels
}